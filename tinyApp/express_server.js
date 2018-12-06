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

app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

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
  res.render("urls_new");
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

