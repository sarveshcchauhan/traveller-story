const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const connectDB = require("./config/connect");
const exphbs = require("express-handlebars");
const session = require("express-session");
//prevent users to logout after restarting the server by saving the session in DB
//use session middleware
const MongoStore = require("connect-mongo");
const passport = require("passport");
const news = require("./routes/index");
const auth = require("./routes/auth");
//used to override method if want to use method such as PUT, DELETE, PATCH
const methodOverride = require('method-override')


//handlebar helper
const { formatDate, truncate, stripTags, editIcon, select } = require("./helper/hbs");

//Load DOT ENV
dotenv.config({ path: "./config/config.env" });

//load passport config
require("./config/passport")(passport);

//connect the database
connectDB();

//initialize express
const app = express();

//body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//logging
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

//Override method
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

//adding template engine middleware Handlebars
//load the helper if created
app.engine(
  ".hbs",
  exphbs({ helpers: { formatDate, truncate, stripTags, editIcon, select }, defaultLayout: "main", extname: ".hbs" })
);
app.set("view engine", ".hbs");

//Session initialization
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      //storing logged in user in session to mongodb so if the server restarts the user will intact
      mongoUrl: process.env.MONGO_URI,
      autoRemove: "interval",
      autoRemoveInterval: 10,
    }),
  })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());


//assign local user using middleware
app.use(function (req, res, next){
  res.locals.user = req.user || null
  next()
})

//set the static path for assets
app.use(express.static(path.join(__dirname, "public")));

//changing the end point name
app.use("/", news);
app.use("/auth", auth);




//port
const PORT = process.env.PORT || 5000;

//listen the server
app.listen(
  PORT,
  console.log(
    `Server up and running in ${process.env.NODE_ENV} on PORT ${PORT}`
  )
);
