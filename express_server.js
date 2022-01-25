const express = require("express");
const app = express();
const PORT = 8080;

//setting the view engine to ejs
app.set('view engine', 'ejs');

// using body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateRandomString = () => {
  newString = [];
  for (let i = 0; i < 6; i++) {
    let indexNum = Math.floor(Math.random() * charSet.length);
    newString.push(charSet.charAt(indexNum));
  }
  return newString.join("");
};

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
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render("urls_show", templateVars)
});

// handles the POST request from the urls/new form
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // if (!urlDatabase.shortURL) {
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  // };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         // Respond to user: redirecting to their new entry
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//setting the port & message
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
