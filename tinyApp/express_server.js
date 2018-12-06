var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
const alphaNum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateRandomString(chars) {
  var result = '';
  for(var i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function checkDupEmail(email) {
  console.log("checking to see if this is a dupe:", email);
  for (let userId in users) {
    if (users[userId]["email"] === email) {
      console.log("Duplicate email");
      return true;
    }
  }
  console.log("no dups");
  return false;
}

app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "michael-chunk"
  }
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.post("/login", (req, res) => {
  console.log("we are receiving data like: ",req.body.username);
  //sets the cookie res.cookies to the username provided in the text field
  res.cookie("username", req.body.username);

  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let randomId = generateRandomString(alphaNum);

  res.cookie("userId", randomId);

  if(!email || !password) {
    res.sendStatus(400);
  } else if(checkDupEmail(email)) {
    res.sendStatus(400);
  } else {
    res.redirect("/register");
  }

  users[randomId] = { id: randomId,
                      email: email,
                      password: password };

  console.log(users[randomId]);

});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       username: req.cookies["username"] };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       username: req.cookies["username"] };

  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  let longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

app.post("/urls", (req, res) => {

  let shortURL = generateRandomString(alphaNum);
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
    res.clearCookie('username');
    res.redirect('/urls');
});
//Delete - Step 1
app.post('/urls/:id/delete', (req, res) => {
  let idVal = req.params.id;

  delete urlDatabase[idVal];

  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  // pluck out the id so u know which part of urldatabase to update
  let selectedURL = req.params.id;

  // pluck out the form tect field (newURL req.body.newURL)
  let updatedURL = req.body.newURL;

  // after update redirect to /urls
  urlDatabase[selectedURL] = updatedURL;

  res.redirect('/urls');
});

//Show - Step 2
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       longURL: urlDatabase[req.params.id],
                       username: req.cookies["username"] };

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

