const express = require("express");
const bcrypt = require('bcryptjs');
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

//imported functions
const getUserByEmail = require('./helpers');

// middleware setup
const salt = bcrypt.genSaltSync(10);
app.use(cookieSession({
  name: 'session',
  keys: ["4b1f6da9-5554-4c3a-95e9-b5c3e5181894", "766f917e-54f8-4517-9943-5360c8baf46f"],
}));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));


//objects
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "320943",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user1ID",
  }
};

const users = {
  "user1ID": {
    id: "user1ID",
    email: "user@example.com",
    password: bcrypt.hashSync("password", salt),
  },
  "320943": {
    id: "320943",
    email: "sawrrawr@gmail.com",
    password: bcrypt.hashSync("123", salt),
  },
};

//functions
//generate random ID for short URL
const charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const generateRandomString = () => {
  let newString = [];
  for (let i = 0; i < 6; i++) {
    let indexNum = Math.floor(Math.random() * charSet.length);
    newString.push(charSet.charAt(indexNum));
  }
  return newString.join("");
};

//Authentication function
const authorizeLogin = (emailAddress, pwd) => {
  const listOfUsers = Object.values(users);
  let result;
  for (const user of listOfUsers) {
    if (user.email === emailAddress  && bcrypt.compareSync(pwd, user.password) === true) {
      return result = 'success';
    }
    if (user.email === emailAddress  && bcrypt.compareSync(pwd, user.password) === false) {
      return result = 'failedPwd';
    }
    if (user.email !== emailAddress) {
      return result = 'failedEmail';
    }
  }
  return result;
};

// get list of URLs belonging to user
const urlsForUser = (id) => {
  const userURLS = {};
  const listOfURLS = Object.keys(urlDatabase);
  for (const entry of listOfURLS) {
    if (urlDatabase[entry].userID === id) {
      userURLS[entry] = urlDatabase[entry];
    }
  }
  return userURLS;
};

// ROUTES //

// home page
app.get("/", (req, res) => {
  const templateVars = { user: users[req.session.user_id], };
  res.render("home", templateVars);
});

//login page
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id], };
  res.render("login", templateVars);
});

//login requst
app.post('/login', (req, res) => {
  const listOfUsers = Object.values(users);
  const user_email = req.body.email;
  const user_pw = req.body.password;
  let user_id;
  const loginAttempt = authorizeLogin(user_email, user_pw);
  if (loginAttempt === 'success') {
    for (const user of listOfUsers) {
      if (user.email === user_email) {
        user_id = user.id;
      }
    }
    req.session['user_id'] = user_id;
    res.redirect('/urls');
  } else if (loginAttempt === 'failedEmail') {
    res.status(403).send(`Invalid Email - Have you registered an account yet? Go back and click 'Register'!`);
  } else if (loginAttempt === 'failedPwd') {
    res.status(403).send(`Invalid Password`);
  }
});

//logout request
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/');
});

//registration page
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id], };
  res.render("register", templateVars);
});

// register for new account
app.post('/register', (req, res) => {
  const user_email = req.body.email;
  const newUserId = generateRandomString();
  if (!user_email) {
    res.status(400).send(`Please enter an email address`);
  }
  if (!user_email) {
    res.status(400).send(`Please enter a password`);
  }
  const emailCheck = getUserByEmail(user_email, users);
  if (emailCheck === undefined) {
    users[newUserId] = {
      "id": newUserId,
      "email": req.body.email,
      "password": bcrypt.hashSync(req.body.password, salt),
    };
    req.session['user_id'] = newUserId;
    res.redirect('/urls');
  } else {
    res.status(400).send(`An account with this email already exists`);
  }
});

// list of URLs and their corresponding shortURLS
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id],};
    res.render("urls_index", templateVars);
  } else if (req.session.user_id === 'undefined' || !req.session.user_id) {
    res.status(403).send(`Please register or login to access your URLs!`);
  }
});

// lists the particulars of one longURL/shortURL pair
app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id], };
  res.render("urls_show", templateVars);
});

//page to create a new longURL/shortURL pair
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id], };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else if (req.session.user_id === 'undefined' || !req.session.user_id) {
    res.redirect('/urls');
  }
});

// creates a new shortURL/longURL pair
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  if (!urlDatabase[shortURL]) {
    if (req.body.longURL.includes('://')) {
      newUrlEntry = {
        "longURL": req.body.longURL,
        "userID": req.session.user_id,
      }
      urlDatabase[shortURL] = newUrlEntry;
    } else {
      newUrlEntry = {
        "longURL": `http://${req.body.longURL}`,
        "userID": req.session.user_id,
      }
      urlDatabase[shortURL] = newUrlEntry;
    }
  };
  // Redirects to the new entry
  res.redirect(`/urls/${shortURL}`);         
});


//redirects to the longURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(403).send('That URL does not exist');
  } else {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  }
});

//handling the delete button for an entry
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (urlDatabase[shortURL]["userID"] === userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send(`You do not have permission to delete this URL entry!`);
  }
});

//ensures URL belongs to user in order to navigate to its page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (urlDatabase[shortURL]["userID"] === userID) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send(`You do not have permission to edit this URL entry!`);
  }
});


//handling the edit button for an entry
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (urlDatabase[shortURL]["userID"] === userID) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send(`You do not have permission to edit this URL entry!`);
  }
});

//updating(editing) a URL entry
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (urlDatabase[shortURL]["userID"] === userID) {
    if (urlDatabase[shortURL]["longURL"].includes('://')) {
      urlDatabase[shortURL]["longURL"] = req.body.longURL;
    } else {
      urlDatabase[shortURL]["longURL"] = `http://${req.body.longURL}`;
    }
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send(`You do not have permission to edit this URL entry!`);
  }
});

//setting the port & message
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

