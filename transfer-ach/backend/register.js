const express = require('express');

const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


// Create MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhostach-database.cpza8rgbmeji.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'Data&$eP4s3',
  database: 'ach'
});

// Define endpoint for user registration
app.post('/register', (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, address } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error connecting to database' });
      return;
    }

    const query = 'INSERT INTO users (firstname, lastname, email, password, phone_number, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())';
    const values = [firstName, lastName, email, password, phoneNumber, address];

    connection.query(query, values, (error, results, fields) => {
      connection.release();

      if (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
        return;
      }

      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Start the server
app.listen(3001, () => {
  console.log('Server started on port 3001');
});
