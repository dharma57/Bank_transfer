const express = require("express");
const app=express();
const bodyParser=require("body-parser")
const cors = require("cors");
const mysql=require("mysql2")
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

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

// registration end point
app.post("/api/register", async (req, res) => {
    const { first_name, last_name, email, password, phone_number, address, created_at, updated_at } = req.body;
    const user_id = Math.floor(Math.random() * 1000000000);
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with salt rounds of 10
    const sqlInsert = "INSERT INTO achdatabase.User(user_id, first_name, last_name, email, password, phone_number, address, created_at, updated_at) VALUES (?,?,?,?,?,?,?,NOW(),NOW())";
    db.query(sqlInsert, [user_id, first_name, last_name, email, hashedPassword, phone_number, address, created_at, updated_at], (error, result) => {
      if (error) {
        console.log(error);
      }
    })
});

app.post("/api/mfa_gen", async (req, res) => {
    const { email } = req.body;
	const code = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
    const sqlInsert = `
		INSERT INTO MFA_Authenitication (user_id, code, expire_time) 
		SELECT user_id, ?, INTERVAL 5 MINUTE) 
		FROM User WHERE email = ?;`;
	console.log("Trying")
    db.query(sqlInsert, [code,email], (error, result) => {
		if (error) {
			res.status(500).json({ error: 'Error executing the query' });
		}
		else
		{
			if (result.affectedRows == 1)
			{
				// Attempt to send email or sms
				res.status(200).json({
					message: 'MFA code generated and stored',
					email: email,
					code: code,
				});
			}
			else 
			{
				res.status(500).json({ error: 'Error creating MFA' });
			}
		}
    })
});

app.post("/api/mfa_verify", async (req, res) => {
    const { code, email } = req.body;
    const sqlDeleteMfaTuple = `
  		DELETE FROM MFA_Authenitication
  		WHERE user_id = (SELECT user_id FROM User WHERE email = ?) AND 
		code = ? AND expire_time > NOW();`;

	db.query(sqlDeleteMfaTuple, [email, code], (error, result) => {
		if (error) {
			res.status(500).json({ error: 'Error executing the query' });
		} else {
			if ( result.affectedRows == 1)
			{
				res.status(200).json({ message: 'Success' });
			}
			else
			{
				res.status(500).json({ error: 'Incorrect Code entered or time expired' });
			}
		}
	});
});



// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

	db.query('SELECT * FROM User WHERE email = ?', [username], (error, results) => {
		if (error) {
			console.log(error);
			res.status(500).send('Internal server error');
		} else if (results.length === 0) {
			res.status(401).send('Invalid login credentials');
		} else {
			const user = results[0];
			bcrypt.compare(password, user.password, (error, result) => {
				if (error) {
					console.log(error);
					res.status(500).send('Internal server error');
				} else if (result === false) {
					res.status(401).send('Invalid login credentials');
				} else {
					const token = jwt.sign({ user_id: user.user_id }, secretKey);
					res.status(200).send({ token });
				}
			});
		}
	});
});
  
// Transfer money
app.post("api/transfer", (req, res) => {
	const {toUsername, fromUsername, amount} = req.body;
		
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
	const {username} = req.body;
	
	// 	SELECT SubT.origin_email, User.email AS destination_email, SubT.amount, 
	// 	SubT.transaction_date, SubT.transaction_type
	// 
	// 	FROM User, 
	// 
	// 	(
	// 		SELECT User.email AS origin_email, U
	// 		T.destination_bank_account_id AS destination_bank_account_id, 
	// 		UT.amount AS amount, UT.transaction_date AS transaction_date, 
	// 		UT.transaction_type AS transaction_type
	// 
	// 		From User, 
	// 
	// 		(
	// 			SELECT origin_bank_account_id, destinatio_bank_account_id, amount, 
	// 			transaction_date, transaction_type
	// 
	// 			FROM ACH_Transaction
	// 
	// 			WHERE origin_bank_account_id = 
	// 				(SELECT user_id FROM User WHERE email = ?)
	// 
	// 			OR 
	// 			destination_bank_account_id = 
	// 				(SELECT user_id FROM User WHERE email = ?)
	// 		) UT
	// 
	// 		WHERE
	// 		User.user_id = UT.origin_bank_account_id
	// 	) SubT
	// 
	// 	WHERE
	// 	SubT.destination_bank_account_id = User.id
	//	
	// 	FOR JSON AUTO
	
	// Get transactions
	var query = "SELECT SubT.origin_email, User.email AS destination_email, SubT.amount, SubT.transaction_date, SubT.transaction_type FROM User, (SELECT User.email AS origin_email, UT.destination_bank_account_id AS destination_bank_account_id, UT.amount AS amount, UT.transaction_date AS transaction_date, UT.transaction_type AS transaction_type From User, (SELECT origin_bank_account_id, destinatio_bank_account_id, amount, transaction_date, transaction_type FROM ACH_Transaction WHERE origin_bank_account_id =  (SELECT user_id FROM User WHERE email = ?) OR destination_bank_account_id = (SELECT user_id FROM User WHERE email = ?)) UT WHERE User.user_id = UT.origin_bank_account_id ) SubT WHERE SubT.destination_bank_account_id = User.id FOR JSON AUTO";
	db.query(query, [username, username], async (error, results, fields) => {
		if (error) {
			console.log(error);
			res.status(500).send("Error retrieving transactions for user");
		} 
		else 
		{
			
			// Get users
			query = "SELECT user_id, email FROM USER";
			db.query(query, async (error, results2, fields) => {
				if (error) {
					console.log(error);
					res.status(500).send("Error retrieving transactions for user");
				} 
				else {
					res.status(200).send(results);
				}
			});
		}
	});
});

// Get balance of account
app.post("api/balance", (req, res) => {
	const {username} = req.body;
	db.query("SELECT balance FROM Bank_Account WHERE user_id = (SELECT user_id FROM User WHERE email = ?);", [username], async (error, results, fields) => {
		if (error) {
			console.log(error);
			res.status(500).send("Error retrieving balance for user");
		} 
		else {
			res.status(200).send(results);
		}
});

// MFA endpoint

// Set up email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dharmatejak73@gmail.com',
    pass: 'Boogeyman@1997'
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
  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Failed to send OTP');
    } else {
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

  if (verified) {
    res.status(200).send('OTP verified');
  } else {
    res.status(401).send('Invalid OTP');
  }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});