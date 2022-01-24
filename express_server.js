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
  res.write(`Hello`);
});

// list of URLs and their corresponding shortURLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//path to the form to create a new shortURL
app.get("/urls/new", (req, res) => {
  // const templateVars = 
  res.render("urls_new")
});

// lists the particulars of one longURL/shortURL pair
app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  res.render("urls_show", templateVars)
});

//setting the port & message
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);