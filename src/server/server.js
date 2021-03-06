const express = require("express");
const mongoose = require("mongoose");
require("express-async-errors");
const Item = require("../models/itemModel");
const User = require("../models/userModel");
const error = require("./error");
const passport = require("passport");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { ensureAutenticated } = require("../config/auth");

const app = express();

require("../config/passport")(passport);

mongoose
  .connect(
    "mongodb://localhost:27017/item_list",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "lost&found",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Async Error Handle
app.use(error);

app.post("/register", (req, res) => {
  const { email, password, password2 } = req.body;
  let errors = [];

  if (!email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.send({
      error: errors,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        // User exists
        errors.push({ msg: "Email is already registered" });
        res.send({
          error: errors,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // Save user
            newUser.save().then(user => {
              res.send({
                error: 0,
                message: "You are now registered and can log in"
              });
            });
          })
        );
      }
    });
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: `/userList/${req.body.email}`,
    failureRedirect: "/loginFailed"
  })(req, res, next);
});

app.get("/userList/:email", ensureAutenticated, async (req, res) => {
  if (req.params.email) {
    User.findOne({ email: req.params.email }, (err, user) => {
      if (err) res.send(err);
      res.send({error: 0, user: user });
    })
  }
})

app.get("/loginFailed", (req, res) => {
  res.send({ error: 1000, message: "Login failed!"})
})

app.get('/logout', (req, res) => {
  req.logout();
  res.send({error: 0, message: "You are loged out"});
})

app.get("/", (req, res) => {
  res.json({ info: "lost&found version1.0" });
});

app.post("/addItem", ensureAutenticated, async (req, res) => {
  let newItem = new Item(req.body);
  await newItem.save(err => {
    if (err) return res.send(err);
    return res.send({ error: 0, message: "New item added", newItem });
  });
});

app.get("/itemList", async (req, res) => {
  await Item.find({}, (err, list) => {
    if (err) return res.send(err);
    return res.send({ error: 0, message: "respond with item list", list });
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`app listening on port ${port}...`));
