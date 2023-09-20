const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();

// Database configuration
const config = {
  user: 'your_username',
  password: 'your_password',
  server: 'your_server_name.database.windows.net',
  database: 'your_database_name',
  options: {
    encrypt: true, // Use this for Azure SQL Database
  },
};

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  // Serve your HTML file here
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit-form', (req, res) => {
  const { firstName, lastName, email, phoneNumber /* other form fields */ } = req.body;

  const query = `
    INSERT INTO YourTableName (FirstName, LastName, Email, PhoneNumber, /* other columns */)
    VALUES (@firstName, @lastName, @email, @phoneNumber, /* other values */);
  `;

  sql.connect(config)
    .then((pool) => {
      return pool.request()
        .input('firstName', sql.NVarChar, firstName)
        .input('lastName', sql.NVarChar, lastName)
        .input('email', sql.NVarChar, email)
        .input('phoneNumber', sql.NVarChar, phoneNumber)
        /* Add inputs for other form fields */
        .query(query);
    })
    .then(() => {
      res.send('Form data saved successfully.');
    })
    .catch((err) => {
      console.error('Error saving form data:', err);
      res.status(500).send('Error saving form data.');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
