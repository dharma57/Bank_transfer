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
    const { first_name, last_name, email, password, phone_number, address, created_at, updated_at } = req.body;
    const user_id = Math.floor(Math.random() * 1000000000);
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with salt rounds of 10

	// Create MFA Session key to insert into the table 
	const MFASecret = speakeasy.generateSecret({ length: 32 });

	const cipher = crypto.createCipheriv('aes-256-cbc', MFSEncryptionKey, iv);

	let encryptedSecret = cipher.update(MFASecret.base32, 'utf8', 'hex');
	
	encryptedSecret += cipher.final('hex');

	// store encryptedSecret in DB

    const sqlInsert = "INSERT INTO achdatabase.User(user_id, first_name, last_name, email, password, phone_number, address, created_at, updated_at) VALUES (?,?,?,?,?,?,?,NOW(),NOW())";
    db.query(sqlInsert, [user_id, first_name, last_name, email, hashedPassword, phone_number, address, created_at, updated_at], (error, result) => {
      if (error) {
        console.log(error);
      }
    })
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
app.post("api/transfer", (req, res) => {
	const {toEmail, fromUsername, amount} = req.body;
		
	// Get recieving user bank account
	var query = "SELECT * FROM Bank_Account WHERE user_id = (SELECT user_id from User WHERE email = ?)";
	db.query(query, [toUsername], async (error, results, fields) => {
		if (error) {
			console.log(error);
			res.status(500).send("Error fetching recieving user bank account from database");
		} 
		else if (results.length === 0) {
			res.status(401).send("Recieving user does not have an attached bank account");
		} 
		else {
			var toUser = results[0];
		}
		
		// Get sending user bank account
		db.query(query, [fromUsername], async (error, results, fields) => {
			if (error) {
				console.log(error);
				res.status(500).send("Error fetching sending user bank account from database");
			} 
			else if (results.length === 0) {
				res.status(401).send("Sending user does not have an attached bank account");
			} 
			else {
				var fromUser = results[0];
				
				// Check that sending user has funds
				if (fromUserBalance >= amount) {
					
					// Math
					toUser.balance = toUser.balance + amount;
					fromUser.balance = fromUser.balance - amount;
					query = "UPDATE Bank_Account (SET balance = ?, updated_at = NOW()) WHERE bank_account_id = ?";
					
					// Update recieving user account.
					db.query(query, [toUser.balance, toUser.bank_account_id], async (error, results) => {
						if (error) {
							console.log(error);
							res.status(500).send("Error updating recieving user bank account");
						} 
						else {
							
							// Update sending user account
							db.query(query, [fromUser.balance, fromUser.bank_account_id], async (error, results) => {
								if (error) {
									console.log(error);
									res.status(500).send("Error updating recieving user bank account");
								} 
								else {
									
									// Update ACH_Transaction table
									query = "INSERT INTO ACH_Transaction (origin_bank_account_id, destinatio_bank_account_id, amount, description, transaction_date, transaction_type, transaction_status_id, created_at, updated_at) VALUES (?, ?, ?, \'description\', NOW(), 0, 0, NOW(), NOW())";
									db.query(query, [fromUser.user_id, toUser.user_id, amount], async (error, results) => {
										if (error) {
											console.log(error);
											res.status(500).send("Error updating recieving user bank account");
										} 
										else {
											console.log("Transaction successful.");
										}
									});
								}
							});
						}
					});
				}
				else {
					res.status(401).send("Sending user does not have the funds to transfer the specified amount");
				}
			}
		});
	});
});

// Get all transactions of user
app.post("api/transactions", (req, res) => {
	const {token} = req.body;

	// We must cover the token using JWT and then 
	// get the user ID

	const sqlQuery = `
		SELECT
			ACH_Transaction.*,
			Transaction_Status.status_name,
			Transaction_Status.description AS status_description,
			Origin_User.user_id AS origin_user_id,
			Origin_User.first_name AS origin_first_name,
			Origin_User.last_name AS origin_last_name,
			Origin_Account.bank_name AS origin_bank_name,
			Origin_Account.account_number AS origin_account_number,
			Destination_User.user_id AS destination_user_id,
			Destination_User.first_name AS destination_first_name,
			Destination_User.last_name AS destination_last_name,
			Destination_Account.bank_name AS destination_bank_name,
			Destination_Account.account_number AS destination_account_number
		FROM
			ACH_Transaction
			INNER JOIN Transaction_Status ON ACH_Transaction.transaction_status_id = Transaction_Status.transaction_status_id
			INNER JOIN Bank_Account AS Origin_Account ON ACH_Transaction.origin_bank_account_id = Origin_Account.bank_account_id
			INNER JOIN Bank_Account AS Destination_Account ON ACH_Transaction.destination_bank_account_id = Destination_Account.bank_account_id
			INNER JOIN User AS Origin_User ON Origin_Account.user_id = Origin_User.user_id
			INNER JOIN User AS Dest  ination_User ON Destination_Account.user_id = Destination_User.user_id
		WHERE
			Origin_User.user_id = ? OR Destination_User.user_id = ?
		ORDER BY
			ACH_Transaction.transaction_date DESC;
	`
	
	db.query(query, [token.user_id, token.user_id], async (error, results) => {
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

	db.query(sqlQuery, [token.user_id], async (error, results, fields) =>
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
		to: 'tejanaidu527@gmail.com',
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