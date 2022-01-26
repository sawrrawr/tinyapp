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

const users = {
  "user1ID": {
    id: "user1ID",
    email: "user@example.com",
    password: "password",
  },
  "320943": {
    id: "320943",
    email: "sawrrawr@gmail.com",
    password: "123",
  },

}

//Authentication functoin
const auth = (emailAddress, pwd) => {
  const listOfUsers = Object.values(users);
  let result;
  for (const user of listOfUsers) {
    if (user.email === emailAddress  && user.password === pwd) {
      return result = 'success';
    }
    if (user.email === emailAddress  && user.password !== pwd) {
      return result = 'failedPwd';
    }
    if (user.email !== emailAddress) {
      return result = 'failedEmail';
    }
  }
  return result
}

//email address lookup
const emailAlreadyExists = (emailAddress) => {
  const listOfUsers = Object.values(users);
  for (let user of listOfUsers) {
    if (user.email !== emailAddress) {
      //email doesn't already exist
      return false;
    }
    //email already exists
    return true;
  }
};


// index page
app.get("/", (req, res) => {
  res.send(`Hello`);
});

//login page
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], }
  res.render("login", templateVars)
});

//login
app.post('/login', (req, res) => {
  const listOfUsers = Object.values(users)
  const user_email = req.body.email;
  const user_pw = req.body.password;
  let user_id;
  const loginAttempt = auth(user_email, user_pw);
  console.log(loginAttempt)
  if (loginAttempt === 'success') {
    for (const user of listOfUsers) {
      if (user.email === user_email) {
        user_id = user.id;
      }
    }
    console.log(`user id set to ${user_id}`)
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  } else if (loginAttempt === 'failedEmail') {
    res.status(400).send(`Invalid Email`);
  } else if (loginAttempt === 'failedPwd') {
    res.status(400).send(`Invalid Password`);
  }
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
})

//register for an account
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], }
  res.render("register", templateVars)
});

app.post('/register', (req, res) => {
  newUserId = generateRandomString();
  if (!req.body.email) {
    res.status(400).send(`Please enter an email address`)
  }
  if (!req.body.password) {
    res.status(400).send(`Please enter a password`);
  }
  const emailCheck = emailAlreadyExists(req.body.email)
  if (emailCheck === true) {
    res.status(400).send(`An account with this email already exists`);
  }
  if (emailCheck === false) {
    users[newUserId] = {
      "id": newUserId,
      "email": req.body.email,
      "password": req.body.password,
    }
    console.log(users);
    res.cookie('user_id', newUserId)
  }
  res.redirect('/urls')
});

// list of URLs and their corresponding shortURLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id],};
  res.render("urls_index", templateVars);
});

//path to the form to create a new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], }
  res.render("urls_new", templateVars);
});

// lists the particulars of one longURL/shortURL pair
app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.user_id], };
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
