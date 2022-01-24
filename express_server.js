const express = require("express");
const app = express();
const PORT = 8080;

//setting the view engine to ejs
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// index page
app.get("/", (req, res) => {
  // res.render('pages/index');
});

app.get("/urls.json", (req, res) => {
  // res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  // res.send(`<html><body>Hello <b>World</b></body></html>\n`);
});

//setting the port & message
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);