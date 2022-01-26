const express = require("express");
const app = express();
const PORT = 8080;

//using cookie parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//setting the view engine to ejs
app.set('view engine', 'ejs');

// using body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// generates the shortURL
const generateRandomString = () => {
  let newString = [];
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
  res.send(`Hello`);
});

//login
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})

//register for an account
app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies.username, }
  res.render("register", templateVars)
});

app.post('/register', (req, res) => {


});

// list of URLs and their corresponding shortURLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username,};
  res.render("urls_index", templateVars);
});

//path to the form to create a new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username, }
  res.render("urls_new", templateVars);
});

// lists the particulars of one longURL/shortURL pair
app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies.username, };
  res.render("urls_show", templateVars);
});

// handles the POST request from the urls/new form
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  if (!urlDatabase.shortURL) {
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         // Respond to user: redirecting to their new entry
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//handling the delete button for an entry
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//handling the edit button for an entry
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
 res.redirect(`/urls/${shortURL}`);
});

//updating a URL entry
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = `http://${req.body.longURL}`
  res.redirect(`/urls/${shortURL}`);
});

//setting the port & message
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
