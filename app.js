// Dependencies
   // Node NPM Packages
const express = require('express'),
		methodOverride = require('method-override'),
      bodyParser = require('body-parser'),
      ssePusher = require('sse-pusher');

   // Own modules files
const routes = require('./user_modules/routes');

   // Dependencies initialization
const push = ssePusher(),
      app = express();

// EXPRESS
   // EXPRESS settings
app.use( '/settings_sse', push.handler() ); // SSE initialization
app.set('view engine', 'ejs'); // default templating engine
app.use( express.static(__dirname + '/public') ); //public directory
app.use( methodOverride('_method') ); // make other types of HTTP requests by using POST and "_method=METHOD" URL query argument
app.use( bodyParser.urlencoded({extended: true}) ); // form data parsing



// EXPRESS start
const portNumber = 3000;
app.listen(portNumber, function() {
   console.log('EXPRESS started listening on PORT: ' + portNumber);
});

// Routes
routes(app, push);