var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session')

const alphaNum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const bcrypt = require('bcrypt');

function generateRandomString(chars) {
  var result = '';
  for(var i = 6; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function checkDupEmail(email) {
  for (let userId in users) {
    if (users[userId]["email"] === email) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  let db = {};

  for(let x in urlDatabase) {
   if(urlDatabase[x].owner === id) {
    db[x] = urlDatabase[x];
  }
}
return db;
}

app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  maxAge: 24 * 60 * 60 * 1000
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "b@b",
    password: "b"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "c@c",
    password: "c"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "a@a",
    password: "a"
  }
}

var urlDatabase = {
  "b2xVn2": {
    longUrl: "http://www.lighthouselabs.ca",
    owner: "userRandomID"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    owner: "user3RandomID"
  },
  "f4xTn5": {
    longUrl: "http://www.yahoo.com",
    owner: "user3RandomID"
  }
}

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls", (req, res) => {

  let fetchUser;
  let filteredDb = urlDatabase;
  if(req.session['userId']) {
    fetchUser = users[req.session['userId']];
    filteredDb = urlsForUser(req.session['userId']);
  }

  let templateVars = { urls: filteredDb,
   /* username: req.cookies["username"] */
   user: fetchUser };

   res.render("urls_index", templateVars);
 });

app.post("/login", (req, res) => {
  let usersArray = Object.values(users);
  let email = req.body.email;
  let password = req.body.password;

  let targetUser = usersArray.find(function(users) {
    return users.email === email;
  });

  if(!targetUser) {
    res.sendStatus(403);
  } else if(!password || !bcrypt.compareSync(password, bcrypt.hashSync(targetUser.password, 10))) {
    res.sendStatus(403);
  } else {
    //sets the cookie res.cookies to the username provided in the text field
    req.session['userId'] = targetUser.id;
    res.redirect('/urls');
  }
});

  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.post("/register", (req, res) => {
    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.password, 10);
    let randomId = generateRandomString(alphaNum);

    req.session['userId'] = randomId;

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

  app.get("/urls/new", (req, res) => {
    let fetchUser;

    if(req.session['userId']) {
      fetchUser = users[req.session['userId']];

      let templateVars = { urls: urlDatabase,
       /*username: req.cookies["username"]*/
       user: fetchUser };

       res.render("urls_new", templateVars);

     } else {
      res.redirect("/urls");
    }

  });

  app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  let longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

  app.post("/urls", (req, res) => {

    let shortURL = generateRandomString(alphaNum);
    let longURL = req.body.longURL;

    let userId = req.session['userId'];

  urlDatabase[shortURL] = {
    longUrl: longURL,
    owner: userId
  };

  res.redirect(`/urls`);
});

  app.post("/logout", (req, res) => {
    req.session['userId'] = undefined;
    res.redirect('/urls');
  });

app.post('/urls/:id/delete', (req, res) => {
  let idVal = req.params.id;

  if(req.session['userId'] === urlDatabase[idVal].owner) {
    delete urlDatabase[idVal];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

app.post("/urls/:id/update", (req, res) => {
  // pluck out the id so u know which part of urldatabase to update
  let selectedURL = req.params.id;
  // pluck out the form tect field (newURL req.body.newURL)
  let updatedURL = req.body.newURL;
  // after update redirect to /urls
  urlDatabase[selectedURL]['longUrl'] = updatedURL;

  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let idVal = req.params.id;

    let fetchUser;

    if(req.session['userId']) {
      fetchUser = users[req.session['userId']];
    }

    let templateVars = { shortURL: req.params.id,
     urls: urlDatabase,
     longURL: urlDatabase[req.params.id],
     user: fetchUser };

     res.render("urls_show", templateVars);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

