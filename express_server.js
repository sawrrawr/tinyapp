const express = require("express");
const app = express();
const PORT = 8080;

//hashing module
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

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

}

//Authentication functoin
const auth = (emailAddress, pwd) => {
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
  return result
}

// get URLs for user
const urlsForUser = (id) => {
  const userURLS = {};
  const listOfURLS = Object.keys(urlDatabase)
  console.log('list of urls', listOfURLS);
for (const entry of listOfURLS) {
  if (urlDatabase[entry].userID === id) {
    userURLS[entry] = urlDatabase[entry]
  }
}
console.log(`url object from function: ${userURLS}`)
return userURLS;
}

//email address lookup
const emailAlreadyExists = (emailAddress) => {
  const listOfUsers = Object.values(users);
  for (const user of listOfUsers) {
    if (user["email"] === emailAddress) {
      //email already exists
      return true;
    }
    //email doesn't already exist
    return false;
  }
};


// home page
app.get("/", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], }
  res.render("home", templateVars);
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
  if (loginAttempt === 'success') {
    for (const user of listOfUsers) {
      if (user.email === user_email) {
        user_id = user.id;
      }
    }
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  } else if (loginAttempt === 'failedEmail') {
    res.status(403).send(`Invalid Email`);
  } else if (loginAttempt === 'failedPwd') {
    res.status(403).send(`Invalid Password`);
  }
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/');
})

//registration page
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], }
  res.render("register", templateVars)
});

// register for new account
app.post('/register', (req, res) => {
  const user_email = req.body.email
  newUserId = generateRandomString();
  if (!user_email) {
    res.status(400).send(`Please enter an email address`)
  }
  if (!user_email) {
    res.status(400).send(`Please enter a password`);
  }
  const emailCheck = emailAlreadyExists(user_email)
  if (emailCheck === true) {
    res.status(400).send(`An account with this email already exists`);
  }
  if (emailCheck === false) {
    users[newUserId] = {
      "id": newUserId,
      "email": req.body.email,
      "password": bcrypt.hashSync(req.body.password, salt),
    }
    res.cookie('user_id', newUserId)
    res.redirect('/urls')
  }
  console.log(users);
});

// list of URLs and their corresponding shortURLS
app.get("/urls", (req, res) => {
  if (req.cookies.user_id) {
  //  userURLS = urlsForUser(req.cookies.user_id);
  //  console.log(userURLS);
    const templateVars = { urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id],};
    res.render("urls_index", templateVars);
  } else if (req.cookies.user_id === 'undefined' || !req.cookies.user_id) {
    res.status(403).send(`Please register or login to access your URLs!`);
  }
});

//page to create a new shortURL
app.get("/urls/new", (req, res) => {
    const templateVars = { user: users[req.cookies.user_id], }
    if (req.cookies.user_id) {
    res.render("urls_new", templateVars);
  } else if (req.cookies.user_id === 'undefined' || !req.cookies.user_id) {
    res.redirect('/urls');
  }
});

// lists the particulars of one longURL/shortURL pair
app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies.user_id], };
  res.render("urls_show", templateVars);
});

// handles the POST request from the urls/new form
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  if (!urlDatabase.shortURL) {
    if(urlDatabase[shortURL]["longURL"].includes('://')) {
      urlDatabase[shortURL]["longURL"] = req.body.longURL
    }
  urlDatabase[shortURL]["longURL"] = `http://${req.body.longURL}`;
  };
  console.log(urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`);         // Respond to user: redirecting to their new entry
});

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
  const shortURL = req.params.shortURL
  const userID = req.cookies.user_id
  if (urlDatabase[shortURL]["userID"] === userID) {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  } else {
  res.status(403).send(`You do not have permission to delete this URL entry!`)
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;
  console.log(`the shortURL is ${shortURL}`);
  console.log(`the userID is ${userID}`);
  console.log(`the id of this URL is: ${urlDatabase[shortURL]["userID"]}`);
  if (urlDatabase[shortURL]["userID"] === userID) {
  res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send(`You do not have permission to edit this URL entry!`)
  }
});


//handling the edit button for an entry
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;
  console.log(`the shortURL is ${shortURL}`);
  console.log(`the userID is ${userID}`);
  console.log(`the id of this URL is: ${urlDatabase[shortURL]["userID"]}`);
  if (urlDatabase[shortURL]["userID"] === userID) {
  res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send(`You do not have permission to edit this URL entry!`)
  }
});

//updating a URL entry
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id
  if (urlDatabase[shortURL]["userID"] === userID) {
    if(urlDatabase[shortURL]["longURL"].includes('://')) {
      urlDatabase[shortURL]["longURL"] = req.body.longURL
    } else {
      urlDatabase[shortURL]["longURL"] = `http://${req.body.longURL}`;
    }
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send(`You do not have permission to edit this URL entry!`)
    }
});

//setting the port & message
app.listen(PORT);
console.log(`Server is listening on port ${PORT}`);
