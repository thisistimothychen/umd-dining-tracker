/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
// const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const multer = require('multer');
const request = require('request');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * jQuery
*/
require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }

    var $ = require("jquery")(window);
});

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');
const cas_loginController = require('./controllers/cas_login');
const userProfileController = require('./controllers/users.profile.server.controller');
const fitbitController = require('./controllers/fitbit.server.controller');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/umd-dining-tracker');
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressStatusMonitor());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  cookieName: 'session',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,   // Prevents browser JavaScript from accessing cookies
  secure: true,     // Ensures cookies are only used over HTTPS
  ephemeral: true,  // Deletes the cookie when the browser is closed
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use((req, res, next) => {
//   if (req.path === '/api/upload') {
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
// app.use(lusca.xframe('SAMEORIGIN'));
// app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// Moment.js
var moment = require('moment');
moment().format();



// Initialize database paths
let User = require(path.resolve('./models/User'));

app.get('/cas_login', cas_loginController.cas_login);
app.get('/logout', cas_loginController.cas_logout);
// use res.render to load up an ejs view file



/**
 * Call to check authentication and permissions/user roles
 *
 * @param {Function} callback
 *      Callback function that takes in JSON object (parameters to pass to view)
 * @param {Array} roles
 *      Empty array for universally accessible page
 *      String array for roles allowed to access the pageToRender
 */
let checkPermissionsWithCallback = function(req, res, callback, needLogin) {
  if (!needLogin) {
    if (req.session.cas_username == null) {
      // Not logged in
      // Universally accessible page; don't need permissions
      callback();
    } else {
      // Logged in
      User.findOne({username: req.session.cas_username}, function(err, user) {
        console.log("Finding user");

        if (!user) {
          // First time login; CREATE NEW USER AT PROFILE PAGE
          userProfileController.create(req, res);
        } else {
          console.log("Found user");
          callback({user: user, username: user.username});
        }
      });
    }
  } else {
    console.log("Checking permissions");

    // Check if session exists
    if (req.session && req.session.cas_username) {
      User.findOne({username: req.session.cas_username}, function(err, user) {
        console.log("Finding user");

        if (!user) {
          // First time login; CREATE NEW USER AT PROFILE PAGE
          userProfileController.create(req, res);
        } else {
          console.log("Found user");
          callback({user: user, username: user.username});
        }
      });
    } else {
      res.redirect('/cas_login');
    }
  }
}



// index page
app.get('/', function(req, res) {
  checkPermissionsWithCallback(req, res, function(params) {
    res.render('index.ejs', params);
  }, false);
});

// profile page
app.get('/profile', function(req, res) {
  checkPermissionsWithCallback(req, res, function(params) {
    res.render('profile.ejs', params);
  }, true);
});

// update existing user
app.post('/profile', function(req, res) {
  checkPermissionsWithCallback(req, res, function(params) {
    console.log("Updating user " + req.session.cas_username);
    userProfileController.update(req, res);
  }, true);
});

// fitbit test page
app.get('/fitbitTest', function(req, res) {
  checkPermissionsWithCallback(req, res, function(params) {
    fitbitController.fitbit(req, res, params);
  }, true);
});

//Full Menu
app.get('/QRscanTest', (req, res) => {
  checkPermissionsWithCallback(req, res, (params) => {
    res.render('qrscantest.ejs', params);
    // res.sendFile(path.join(__dirname+'/views/qrscantest.html'));
  }, true);
});

app.get('/full_menu', (req, res) => {
  checkPermissionsWithCallback(req, res, (params) => {
    request(); // TODO later: call get_full_menu
    res.render('menu.ejs', params);
  }, true);
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
