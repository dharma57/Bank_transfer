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

app.listen(3001, ()=>{
    console.log("Server is running on port 3001");
})