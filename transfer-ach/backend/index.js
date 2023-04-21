const express = require("express");
const app=express();
const bodyParser=require("body-parser")
const cors = require("cors");
const mysql=require("mysql2")
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Db connection to AWS
const db=mysql.createPool({
    host: "ach-database.cpza8rgbmeji.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "Data&$eP4s3",
    database:"achdatabase"
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
const jwt = require('jsonwebtoken');
// Define the encryption key -- store in env
const MFSEncryptionKey = crypto.randomBytes(32);
// Generate a random initialization vector (IV)
const iv = crypto.randomBytes(16); // must store in ENV 

//----------- DUMMY TEST 
const MFASecret = speakeasy.generateSecret({ length: 32 });

const cipher = crypto.createCipheriv('aes-256-cbc', MFSEncryptionKey, iv);

let encryptedSecretFromDB = cipher.update(MFASecret.base32, 'utf8', 'hex');

encryptedSecretFromDB += cipher.final('hex'); // <- would be queried in the sendOTP. this is unique per user 

// Set up email transporter
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'dharmatejak73@gmail.com',
	  pass: 'mbbqyqwjjswydmsd'
	}
  });
  

// Maybe create a scheduler to rotate the keys for MFA and JWT for users
/* cron.schedule('* * * * *', () => {
	// Log the start of the cleanup task
	console.log('Running cleanup task...');
  
	// SQL query to delete expired records from the MFA_Authentication table
	const sqlMFACleanup = 'DELETE FROM MFA_Authentication WHERE expire_time < CURRENT_TIMESTAMP;';
  
	// SQL query to delete expired records from the JWT_Sessions table
	const sqlJWTCleanup = 'DELETE FROM JWT_Sessions WHERE expire_time < CURRENT_TIMESTAMP;';
  
	// Execute the SQL query to delete expired records from the MFA_Authentication table
	db.query(sqlMFACleanup, (error, result) => {
		if (error) {
			console.error('Error executing the MFA cleanup query:', error);
		} else {
			console.log(`Deleted ${result.affectedRows} expired MFA records.`);
		}
	});
  
	// Execute the SQL query to delete expired records from the JWT_Sessions table
	db.query(sqlJWTCleanup, (error, result) => {
		if (error) {
			console.error('Error executing the JWT cleanup query:', error);
		} else {
			console.log(`Deleted ${result.affectedRows} expired JWT records.`);
		}
	});
 }); */

 // Generate and send OTP to user's email
app.post('/api/mfa/sendOTP', async (req, res) => {
	const { email } = req.body;
	console.log("2222")
	// Generate secret key and OTP
	// Sercret should be encrypted and store in DB and assoicted with user. shouldnt have to 

	// Decrypt the secret key
	const decipher = crypto.createDecipheriv('aes-256-cbc', MFSEncryptionKey, iv);

	let decryptedSecret = decipher.update(encryptedSecretFromDB, 'hex', 'utf8');

	decryptedSecret += decipher.final('utf8');

	const token = speakeasy.totp({ secret: decryptedSecret.base32, encoding: 'base32' });

	// Create email message
	const message = {
		from: 'dharmatejak73@gmail.com',
		to: 'dumasjean94@outlook.com',
		subject: 'Your OTP for MFA',
		text: `Your OTP is ${token}`
	};

	// Send email
	transporter.sendMail(message, (error, info) => {
		if (error) 
		{
			console.log('Failed to send OTP');
			res.status(500).send('Failed to send OTP');
		} 
		else 
		{
			console.log(info);
			res.status(200)
		}
	});
  });
  

// registration end point
app.post("/api/register", async (req, res) => {
    const { first_name, last_name, email, password, phone_number, address } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with salt rounds of 10

	// Create MFA Session key to insert into the table
	const MFASecret = speakeasy.generateSecret({ length: 32 });

	const cipher = crypto.createCipheriv('aes-256-cbc', MFSEncryptionKey, iv);

	let encryptedSecret = cipher.update(MFASecret.base32, 'utf8', 'hex');

	encryptedSecret += cipher.final('hex');

	// store encryptedSecret in DB
	// We should manage the MFA encrypted secret storage in the future

	const sqlInsert = `
	INSERT INTO User(first_name, last_name, email, password, phone_number, address, created_at, updated_at)
	VALUES (?,?,?,?,?,?,NOW(),NOW())`;

	db.query(sqlInsert, [first_name, last_name, email, hashedPassword, phone_number, address], (error, result) => {
		if (error) {
			res.status(500).send('Internal server error');
		}
		else if (result.affectedRows == 1)
		{
			res.status(200)
		}
		else
		{
			res.status(500).send('User could not be inserted into database')
		}
	});

});

// Verify OTP entered by user
app.post('/api/mfa/verifyOTP', (req, res) => {
	const { token } = req.body;

	// Decrypt the secret key
	const decipher = crypto.createDecipheriv('aes-256-cbc', MFSEncryptionKey, iv);

	let decryptedSecret = decipher.update(encryptedSecretFromDB, 'hex', 'utf8');

	decryptedSecret += decipher.final('utf8');
	// Verify OTP
	const verified = speakeasy.totp.verify({
		secret: decryptedSecret,
		encoding: 'base32',
		token: token,
		window: 1
	});

	if (verified) 
	{
		res.status(200).send('OTP verified');
	} 
	else 
	{
		res.status(401).send('Invalid OTP');
	}
});

// Login endpoint
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
					const token = jwt.sign({ user_id: user.user_id }, secretKey);
					res.status(200).send({ token });
				}
			});
		}
	});
});
  
// Transfer money
app.post("api/transfer", async (req, res) => {

	const { token, toEmail, amount } = req.body;

	try {
		// Verify the JWT token and fetch the user_id of the sender
		const decodedToken = jwt.verify(token, secretKey);
		const senderUserId = decodedToken.user_id;

		// Check the balance of the sender and get their bank account ID
		const senderQuery = `
			SELECT bank_account_id, balance
			FROM Bank_Account
			WHERE user_id = ?;
		`;

		const [senderResult] = await db.query(senderQuery, [senderUserId]);

		if (!senderResult || senderResult.balance < amount) 
		{
			return res.status(400).json({ error: 'Insufficient balance' });
		}

		const senderBankAccountId = senderResult.bank_account_id;

		// Verify that the receiving person has a bank account and get their bank account ID
		const receiverQuery = `
			SELECT bank_account_id
			FROM Bank_Account
			INNER JOIN User ON Bank_Account.user_id = User.user_id
			WHERE User.email = ?;
		`;

		const [receiverResult] = await db.query(receiverQuery, [toEmail]);

		if (!receiverResult) 
		{
			return res.status(400).json({ error: 'Receiver does not have a bank account' });
		}

		const receiverBankAccountId = receiverResult.bank_account_id;

		// Insert the transaction into the ACH_Transaction table
		const insertTransactionQuery = `
			INSERT INTO ACH_Transaction (
				origin_bank_account_id,
				destination_bank_account_id,
				amount,
				transaction_type,
				transaction_status_id) 
			VALUES (?, ?, ?, ?, ?);
		`;

		// If this fails then a error will eccur and the catch will be called
		db.query(insertTransactionQuery, [
			senderBankAccountId,
			receiverBankAccountId,
			amount,
			'Debit',
			0, // Replace with the appropriate maybe remove this
		]);

		// Update the balances of both the sender and the receiver
		const updateSenderBalanceQuery = `
			UPDATE Bank_Account
			SET balance = balance - ?
			WHERE bank_account_id = ?;
		`;

		db.query(updateSenderBalanceQuery, [amount, senderBankAccountId]);

		const updateReceiverBalanceQuery = `
			UPDATE Bank_Account
			SET balance = balance + ?
			WHERE bank_account_id = ?;
		`;

		db.query(updateReceiverBalanceQuery, [amount, receiverBankAccountId]);

		res.status(200).json({ success: 'Transaction completed' });
	} 
	catch (error) 
	{
		console.log(error);
		res.status(500).json({ error: 'An error occurred while processing the transaction' });
	}

});

// Get all transactions of user
app.post("api/transactions", (req, res) => {
	const {token} = req.body;

	const decodedToken = jwt.verify(token, secretKey);
	
	const userId = decodedToken.user_id;

	const sqlQuery = `
	SELECT
		ACH_Transaction.amount,
		Origin_User.first_name AS origin_first_name,
		Origin_User.last_name AS origin_last_name,
		Destination_User.first_name AS destination_first_name,
		Destination_User.last_name AS destination_last_name,
		IF(Origin_User.user_id = ?, 'From', 'To') AS direction
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
	
	db.query(query, [userId, userId], async (error, results) => {
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
app.post("api/balance", (req, res) => {
	const {token} = req.body;

	const decodedToken = jwt.verify(token, secretKey);
	
	const userId = decodedToken.user_id;
	// We must cover the token using JWT and then 
	// get the user ID
	const sqlQuery = `
		SELECT
			bank_account_id,
			user_id,
			bank_name,
			account_number,
			account_type,
			balance
		FROM
			Bank_Account
		WHERE
			user_id = ?;
	`

	db.query(sqlQuery, [userId], async (error, results, fields) =>
	{
		if (error) 
		{
			console.log(error);
			res.status(500).send("Error retrieving balance for user");
		} 
		else 
		{
			res.status(200).send({amount:results});
		}
	});
});


// Generate and send OTP to user's email
app.post('/api/mfa/sendOTP', (req, res) => {
	const { email } = req.body;

	// Generate secret key and OTP
	const secret = speakeasy.generateSecret({ length: 20 });

	const token = speakeasy.totp({ secret: secret.base32, encoding: 'base32' });

	// Create email message
	const message = {
		from: 'dharmatejak73@gmail.com',
		to: 'tejanaidu527@gmail.com', // replace with email
		subject: 'Your OTP for MFA',
		text: `Your OTP is ${token}`
	};

	// Send email
	transporter.sendMail(message, (error, info) => 
	{
		if (error) 
		{
			console.log(error);
			res.status(500).send('Failed to send OTP');
		} 
		else 
		{
			console.log(info);
			res.status(200).send({ secret: secret.base32 });
		}
	});
});

// Verify OTP entered by user
app.post('/api/mfa/verifyOTP', (req, res) => {
	
	const { secret, token } = req.body;

	// Verify OTP
	const verified = speakeasy.totp.verify({
		secret: secret,
		encoding: 'base32',
		token: token,
		window: 1
	});

	if (verified) 
	{
		res.status(200).send('OTP verified');
	} 
	else 
	{
		res.status(401).send('Invalid OTP');
	}
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});