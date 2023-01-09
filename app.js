//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const app = express();

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/blogDB");

let errorMessage = "";

const blogSchema = new mongoose.Schema({
  posterName: String,
  time: String,
  title: String,
  content: String,
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  facebookId: String,
  googleId: String,
  blogStories: [blogSchema],
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Blog = mongoose.model("blog", blogSchema);
const User = mongoose.model("User", userSchema);

// For local authentication
passport.use(User.createStrategy());

// Use the google strategy to implement login with google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/blogpost",
    },
    function (accessToken, refreshToken, profile, cb) {
      const { id, name } = profile;
      User.findOrCreate(
        {
          firstName: name.familyName,
          lastName: name.givenName,
          username: name.givenName,
          googleId: id,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

// Use the facebook strategy to implement login with facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/blogpost",
    },
    function (accessToken, refreshToken, profile, cb) {
      const { id, displayName } = profile;
      const [fName, lName] = displayName.split(" ");
      User.findOrCreate(
        { firstName: fName, lastName: lName, username: lName, facebookId: id },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

app.get("/", (req, res) => {
  // Finds all blog and renders the home page with all posted stories
  Blog.find({}, (err, foundPosts) => {
    if (!err) {
      res.render("home", {
        firstParagraph: homeStartingContent,
        posts: foundPosts,
      });
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    firstParagraph: aboutContent,
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    firstParagraph: contactContent,
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/blogpost",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/compose");
  }
);
app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/blogpost",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/compose");
  }
);

app.get("/compose", (req, res) => {
  // If the request is authenticated
  // The isAuthenticated() method is provided by passport to check if a request is authenticated
  // i.e if an authenticated user made the request
  if (req.isAuthenticated()) {
    setTimeout(() => (errorMessage = ""), 200);
    res.render("compose", {
      errorMessage: errorMessage,
    });
  } else {
    // If req is not authenticated redirect to login so user would login and authenticate
    res.redirect("/login");
  }
});

app.get("/posts/:postId", (req, res) => {
  const requestedTitle = _.lowerCase(req.params.postId);

  // Finds all posts
  Blog.find({}, (err, foundPosts) => {
    if (!err) {
      foundPosts.forEach((post) => {
        // Check if the requested id is the post id and renders the post page if true
        if (requestedTitle === _.lowerCase(post._id)) {
          res.render("post", {
            poster: post.posterName,
            postDate: post.time,
            postTitle: post.title,
            postBody: post.content,
          });
        }
      });
    }
  });
});

app.post("/signup", (req, res) => {
  // The User.register() method is provided by passport-local-mongoose on the user object
  User.register(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
    },
    req.body.password,
    (err) => {
      if (err) {
        // If error on registration, log the eroor and redirect back to signup
        console.log(err);
        res.redirect("/signup");
      } else {
        // If successfully registered, authenticate with passport
        passport.authenticate("local")(req, res, () => {
          res.redirect("/compose");
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  // Authenticate user using passport
  passport.authenticate("local")(req, res, () => {
    res.redirect("/compose");
  });
});

app.post("/compose", (req, res) => {
  const { id: userId } = req.user; // Provided by passport after authentication
  const blogTitle = req.body.postTitle;
  const blogBody = req.body.postBody;
  const dateOfPost = new Date();
  let hours = dateOfPost.getHours().toString();
  let minutes = dateOfPost.getMinutes().toString();

  if (hours.length === 1) {
    hours = "0" + hours;
  }

  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }

  const timeOfPost = `${dateOfPost.toDateString()} ${hours}:${minutes}`;

  // Finds user using the userId
  User.findById(userId, (err, user) => {
    if (!err) {
      // Check if user already has stories posted
      // If user has stories, checks if any of the story title matches the new story title and throws an error is true
      if (user.blogStories.length != 0) {
        user.blogStories.forEach(({ title }) => {
          if (title.toLowerCase() === blogTitle.toLowerCase()) {
            errorMessage = "Error: you already have a post with that title";
          }
        });
      }

      // If no error is thrown
      if (errorMessage.length === 0) {
        // Creates post and push to users posts is there wasnt an error
        const newBlog = new Blog({
          posterName: `${user.firstName} ${user.lastName}`,
          time: timeOfPost,
          title: blogTitle,
          content: blogBody,
        });
        user.blogStories.push(newBlog);

        // Save user and if no error, save post and the redirects home
        user.save((err) => {
          if (!err) {
            newBlog.save((err) => {
              if (!err) {
                res.redirect("/");
              }
            });
          }
        });
      } else {
        // If error, redirect to compose
        res.redirect("/compose");
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
