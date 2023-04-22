
const express = require("express");
const app=express();
const bodyParser=require("body-parser")
const cors = require("cors");
const mysql=require("mysql2")
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
require('dotenv').config();

// DB Endpoint Access 
const db=mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const secretKeyJWT =  process.env.JWT_SECRET_KEY;
const secretKeyMFA = Buffer.from(process.env.MFA_SECRET_KEY, 'hex');
const iv = Buffer.from(process.env.IV, 'hex');

// Create the Email trainsporter 
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'dharmatejak73@gmail.com',
	  pass: 'mbbqyqwjjswydmsd'
	}
});
  
  
// registration end point
app.post("/api/register", async (req, res) => {

    const { first_name, last_name, email, password, phone_number, address } = req.body;
	
	const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with salt rounds of 10

	// Create MFA Session key to insert into the table
	const MFASecret = speakeasy.generateSecret({ length: 32 });

	const cipher = crypto.createCipheriv('aes-256-cbc', secretKeyMFA, iv);

	let encryptedSecret = cipher.update(MFASecret.base32, 'utf8', 'hex');

	encryptedSecret += cipher.final('hex');
	const sqlInsert = `
		INSERT INTO User(first_name, last_name, email, password, phone_number, address, mfa_key)
		VALUES (?,?,?,?,?,?,?);`;

	db.query(sqlInsert, [first_name, last_name, email, hashedPassword, phone_number, address, encryptedSecret], (error, result) => {
		if (error) {
			res.status(500).send('Internal server error');
		}
		else if (result.affectedRows == 1) 
		{
			res.status(200).send('SUCCESS')
		}
		else
		{
			res.status(500).send('User could not be inserted into database')
		}
	});
	console.log("EXIT")

});

 // Generate and send OTP to user's email WORKING
 app.post('/api/mfa/sendOTP', async (req, res) => {
	const { email } = req.body;

	const decipher = crypto.createDecipheriv('aes-256-cbc', secretKeyMFA, iv);

	const result = await getMFACode(email)

	const encryptedSecret = result[0].mfa_key

	let decryptedSecret = decipher.update(encryptedSecret, 'hex', 'utf8');

	decryptedSecret += decipher.final('utf8');

	const token = speakeasy.totp({ secret: decryptedSecret, encoding: 'base32',step: 30 });

	// Create email message
	const message = {
		from: 'dharmatejak73@gmail.com',
		to: email,
		subject: 'Your OTP for MFA',
		text: `Your OTP is ${token}`
	};

	// Send email
	transporter.sendMail(message, (error, info) => {
		if (error) 
		{
			('Failed to send OTP');
			res.status(500).send('Failed to send OTP');
		} 
		else 
		{
			(info);
			res.status(200)
		}
	});
});

function getMFACode(email) {

	return new Promise((resolve, reject) => {
		const query = `
			SELECT mfa_key,user_id
			FROM User
			WHERE email = ?;
		`;

	  db.query(query, [email], (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
	  });
	});
  }

// Verify OTP entered by user - WORKING
app.post('/api/mfa/verifyOTP', async (req, res) => {
	const { code, email } = req.body;

	// Decrypt the secret key
	const decipher = crypto.createDecipheriv('aes-256-cbc', secretKeyMFA, iv);

	const result = await getMFACode(email)

	const encryptedSecret = result[0].mfa_key

	const user_id = result[0].user_id

	let decryptedSecret = decipher.update(encryptedSecret, 'hex', 'utf8');

	decryptedSecret += decipher.final('utf8');

	// Verify OTP
	const verified = speakeasy.totp.verify({
		secret: decryptedSecret,
		encoding: 'base32',
		token: code,
		window: 2,
		step: 30
	});

	if (verified) 
	{
		const token = jwt.sign({ user_id: user_id }, secretKeyJWT);

		res.status(200).send({ token });
	} 
	else 
	{	
		res.status(500).send('Invalid OTP');
	}
});


app.post('/api/login', (req, res) => {

  	const { email, password } = req.body;
	
	db.query('SELECT * FROM User WHERE email = ?', [email], (error, results) => 
	{
		if (error) 
		{
			console.log(error);
			res.status(500).send('Internal server error');
		} 
		else if (results.length === 0) 
		{
			res.status(401).send('Invalid login credentials');
		} 
		else 
		{
			const user = results[0];

			bcrypt.compare(password, user.password, (error, result) => 
			{
				if (error) 
				{
					res.status(500).send('Internal server error');
				}
				else if (result === false) 
				{
					res.status(401).send('Invalid login credentials');
				} else 
				{
					res.status(200).send();
				}
			});
		}
	});
});


function getBankInfo(user_id) {
	console.log(user_id)
	return new Promise((resolve, reject) => {
		const senderQuery = `
		SELECT bank_account_id, balance
		FROM Bank_Account
		WHERE user_id = ?;
		`;

	  db.query(senderQuery, [user_id], (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
	  });
	});
  }

function getBankInfoByEmail(email) {
	console.log(email)
	return new Promise((resolve, reject) => {
		const receiverQuery = `
			SELECT bank_account_id
			FROM Bank_Account
			INNER JOIN User ON Bank_Account.user_id = User.user_id
			WHERE User.email = ?;
		`;

		db.query(receiverQuery, [email], (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

function createTransaction(senderBankAccountId,receiverBankAccountId,amount) {
	return new Promise((resolve, reject) => {
		
		const insertTransactionQuery = `
			INSERT INTO ACH_Transaction (
				origin_bank_account_id,
				destination_bank_account_id,
				amount) 
			VALUES (?, ?, ?);
		`;

		db.query(insertTransactionQuery, [senderBankAccountId,receiverBankAccountId,amount], (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result.affectedRows);
			}
		});
	});
}


function modifySenderBalance(amount,senderBankAccountId) {
	return new Promise((resolve, reject) => {
		
		const updateSenderBalanceQuery = `
			UPDATE Bank_Account
			SET balance = balance - ?
			WHERE bank_account_id = ?;
		`;

		db.query(updateSenderBalanceQuery, [amount,senderBankAccountId], (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result.affectedRows);
			}
		});
	});
}

  function modifyReceiverBalance(amount,receiverBankAccountId) {
	return new Promise((resolve, reject) => {
		
		const updateReceiverBalanceQuery = `
			UPDATE Bank_Account
			SET balance = balance + ?
			WHERE bank_account_id = ?;
		`;

		db.query(updateReceiverBalanceQuery, [amount,receiverBankAccountId], (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result.affectedRows);
			}
		});
	});
  }
  
  
// Transfer money
app.post("/api/transfer", async (req, res) => {

	const { token, toEmail, amount } = req.body;

	try {

		// Verify the JWT token and fetch the user_id of the sender
		const decodedToken = jwt.verify(token, secretKeyJWT);

		const senderUserId = decodedToken.user_id;

		// Check the balance of the sender and get their bank account ID
		senderResult = await getBankInfo(senderUserId)
	
		if (!senderResult || senderResult.balance < amount || amount < 0) 
		{
			console.log("step 1")
			return res.status(400).json({ error: 'Insufficient balance' });
		}

		const senderBankAccountId = senderResult[0].bank_account_id;

		console.log(senderResult[0])

		const receiverResult = await getBankInfoByEmail(toEmail)

		console.log(receiverResult)
		console.log("NONE")

		if (!receiverResult) 
		{
			console.log("step 2")
			return res.status(400).json({ error: 'Receiver does not have a bank account' });
		}

		const receiverBankAccountId = receiverResult[0].bank_account_id;

		await createTransaction(senderBankAccountId,receiverBankAccountId,amount)

		// Update the balances of both the sender and the receiver
		await modifySenderBalance(amount,senderBankAccountId)

		await modifyReceiverBalance(amount,receiverBankAccountId)
	
		res.status(200).json({ success: 'Transaction completed' });

		console.log("DONE") 
	} 
	catch (error) 
	{
		console.log("ERRRR")
		console.log(error);
		res.status(500).json({ error: 'An error occurred while processing the transaction' });
	}

});

// Get all transactions of user
app.post("/api/transactions", (req, res) => {
	const {token} = req.body;

	const decodedToken = jwt.verify(token, secretKeyJWT);
	
	const userId = decodedToken.user_id;

	const sqlQuery = `
	SELECT
		ACH_Transaction.amount AS amount,
		Origin_User.first_name AS origin_first_name,
		Origin_User.last_name AS origin_last_name,
		Destination_User.first_name AS destination_first_name,
		Destination_User.last_name AS destination_last_name,
		IF(Origin_User.user_id = ?, 0, 1) AS direction
	FROM
		ACH_Transaction
		INNER JOIN Bank_Account AS Origin_Account ON ACH_Transaction.origin_bank_account_id = Origin_Account.bank_account_id
		INNER JOIN Bank_Account AS Destination_Account ON ACH_Transaction.destination_bank_account_id = Destination_Account.bank_account_id
		INNER JOIN User AS Origin_User ON Origin_Account.user_id = Origin_User.user_id
		INNER JOIN User AS Destination_User ON Destination_Account.user_id = Destination_User.user_id
	WHERE
		Origin_User.user_id = ? OR Destination_User.user_id = ?
	ORDER BY
		ACH_Transaction.transaction_date DESC;
	`
	
	db.query(sqlQuery, [userId, userId,userId], async (error, results) => {
		if (error) 
		{
			console.log(error);
			res.status(500).json("Error retrieving transactions for user");
		} 
		else 
		{
			res.status(200).json({transactions:results})
		}
	});
});

// Get balance of account
app.post("/api/balance", async (req, res) => {
	

	try {
		const {token} = req.body;

		const decodedToken = jwt.verify(token, secretKeyJWT);
		
		const userId = decodedToken.user_id;

		// We must cover the token using JWT and then 
		// get the user ID
		const sqlQuery = `
			SELECT
				balance
			FROM
				Bank_Account
			WHERE
				user_id = ?;
		`

		db.query(sqlQuery, [userId], async (error, results) =>
		{
			if (error) 
			{
				console.log(error);
				res.status(401).send("Error retrieving balance for user");
			} 
			else 
			{
				res.status(200).send({amount:results});
			}
		});
		
	} catch (error) {
		res.status(500).send("Error retrieving balance for user");
	}
	
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});