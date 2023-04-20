const express = require("express");
const app=express();
const bodyParser=require("body-parser")
const cors = require("cors");
const mysql=require("mysql2")

const db=mysql.createPool({
    host: "ach-database.cpza8rgbmeji.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "Data&$eP4s3",
    database:"achdatabase"
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');

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

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
  
    db.query('SELECT * FROM User WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error fetching user from database');
      } else if (results.length === 0) {
        res.status(401).send('Incorrect email or password');
      } else {
        const user = results[0];
  
        try {
          if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ user_id: user.user_id }, 'secret_key');
            res.json({ token });
          } else {
            res.status(401).send('Incorrect email or password');
          }
        } catch (error) {
          console.log(error);
          res.status(500).send('Error authenticating user');
        }
      }
    });
  });
  
// Transfer money
app.post('api/transfer', (req, res) => {
	const {toUsername, fromUsername, amount} = req.body;
		
	// Get recieving user bank account
	var query = 'SELECT * FROM Bank_Account WHERE user_id = (SELECT user_id from User WHERE email = ?)';
	db.query(query, [toUsername], async (error, results) => {
		if (error) {
			console.log(error);
			res.status(500).send('Error fetching recieving user bank account from database');
		} 
		else if (results.length === 0) {
			res.status(401).send('Recieving user does not have an attached bank account');
		} 
		else {
			var toUser = results[0];
		}
		
		// Get sending user bank account
		db.query(query, [fromUsername], async (error, results) => {
			if (error) {
				console.log(error);
				res.status(500).send('Error fetching sending user bank account from database');
			} 
			else if (results.length === 0) {
				res.status(401).send('Sending user does not have an attached bank account');
			} 
			else {
				var fromUser = results[0];
				
				// Check that sending user has funds
				if (fromUserBalance >= amount) {
					
					// Math
					toUser.balance = toUser.balance + amount;
					fromUser.balance = fromUser.balance - amount;
					query = 'UPDATE Bank_Account (SET balance = ?, updated_at = NOW()) WHERE bank_account_id = ?';
					
					// Update recieving user account.
					db.query(query, [toUser.balance, toUser.bank_account_id], async (error, results) => {
						if (error) {
							console.log(error);
							res.status(500).send('Error updating recieving user bank account');
						} 
						else {
							
							// Update sending user account
							db.query(query, [fromUser.balance, fromUser.bank_account_id], async (error, results) => {
								if (error) {
									console.log(error);
									res.status(500).send('Error updating recieving user bank account');
								} 
								else {
									
									// Update ACH_Transaction table
									query = 'INSERT INTO ACH_Transaction (origin_bank_account_id, destinatio_bank_account_id, amount, description, transaction_date, transaction_type, transaction_status_id, created_at, updated_at) VALUES (?, ?, ?, \'description\', NOW(), 0, 0, NOW(), NOW())';
									db.query(query, [fromUser.user_id, toUser.user_id, amount], async (error, results) => {
										if (error) {
											console.log(error);
											res.status(500).send('Error updating recieving user bank account');
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
					res.status(401).send('Sending user does not have the funds to transfer the specified amount');
				}
			}
		});
	});
}

app.listen(3001, ()=>{
    console.log("Server is running on port 3001");
})