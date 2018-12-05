var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const alphaNum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateRandomString(chars) {
  var result = '';
  for(var i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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
  let templateVars = { urls: urlDatabase };
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

  // console.log(`${shortURL} - ${longURL}`);

  urlDatabase[shortURL] = longURL;

  let redirect = `http://localhost:8080/u/${shortURL}`;

  res.redirect(redirect);
});

//Delete - Step 1
app.post('/urls/:id/delete', (req, res) => {
  let idVal = req.params.id;

  delete urlDatabase[idVal];

  res.redirect('/urls');
});

//Show - Step 2
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

