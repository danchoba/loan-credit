const express = require('express');
const axios = require('axios'); // Import the axios library
const bodyParser = require('body-parser'); // Import bodyParser to parse form data
const app = express();
const apiKey = 'VmQUomyZ9membhLVi6T9DMrCNRW2cUEd';
// Use bodyParser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('html'));




app.get('/', (req, res) => {
  // Serve your HTML file here
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit-form', async (req, res) => {
  try {
    // Extract user inputs from the form
    const userInputs = req.body;

    const data= [{
      "person_age": parseInt(userInputs.personAge),
      "person_income": parseInt(userInputs.income),
      "person_home_ownership": userInputs.homeOwner,
      "person_emp_length": parseFloat(userInputs.employmentLength),
      "loan_intent": userInputs.loanIntent,
      "loan_grade": userInputs.loanGrade,
      "loan_amnt": parseInt(userInputs.loanAmount),
      "loan_int_rate": parseFloat(userInputs.interestRate),
      "loan_status": 0, 
      "loan_percent_income": parseFloat(userInputs.loanPercentIncome),
      "cb_person_default_on_file": userInputs.cbPersonDefaultOnFile === 'true',
      "cb_person_cred_hist_length": parseInt(userInputs.cbPersonCredHistLength)
    }];

    // Make an HTTP POST request to your machine learning model's scoring endpoint
    const mlModelResponse = await axios.post(
      'http://20.242.146.109:80/api/v1/service/loandesignermodel/score',
       data , 
      {
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers required for authentication or authorization
        },
      }
    );
 
    // Handle the response from the machine learning model
    const predictionsString = mlModelResponse.data;
    const response = JSON.parse(predictionsString);
    const predictions = response.result[0];

    const loanStatus = predictions[12] === 1 ? "You qualify" : "You don't qualify";
   
    const predictioonScore = [predictions[13]];
    
    console.log(predictions)
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Loan Prediction</title>
    </head>
    <body>
      <h1>Loan Prediction Results</h1>
      <p>Predicted Loan Status: ${loanStatus}</p>
      <p>Predicted Accuracy Score: ${predictioonScore}</p>
      <!-- Include other HTML content as needed -->
    </body>
    </html>
  `;

  res.send(html);

  } catch (error) {
    console.error('Error making ML model request:', error);
    res.status(500).json({ error: 'An error occurred while making the request to the ML model.' });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
