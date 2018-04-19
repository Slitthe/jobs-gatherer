// Dependencies
   // Packages
const express = require('express'),
		methodOverride = require('method-override'),
      bodyParser = require('body-parser'),
      ssePusher = require('sse-pusher'),
      request = require('request');

   // Own modules files
const helpers = require('./user_modules/helpers'),
      data = require('./user_modules/data'),
      routes = require('./user_modules/routes'),
      db =  {
         methods: require('./user_modules/db/methods'),
         models: require('./user_modules/db/models')
      },
      search = require('./user_modules/search');

   // Dependencies initialization
const push = ssePusher(),
      app = express();

// EXPRESS
   // EXPRESS settings
app.use( '/settings_sse', push.handler() ); // see initialization
app.set('view engine', 'ejs'); // default templating engine
app.use( express.static(__dirname + '/public') ); // public directory
app.use( methodOverride('_method') );
app.use( bodyParser.urlencoded({extended: true}) );

// Routes
routes(app, push);

// EXPRESS start
const portNumber = 3000;
app.listen(portNumber, function() {
	console.log('EXPRESS started listening on PORT: ' + portNumber);
});

// Search functionality start
search.starter({
   search: search,
   db: db,
   helpers: helpers,
   data: data,
   push: push,
   request: request
});