// Dependencies
   // Packages
const express = require('express'),
		app = express(),
		mongoose = require('mongoose'),
		methodOverride = require('method-override'),
      ejs = require('ejs'),
      bodyParser = require('body-parser'),
      ssePusher = require('sse-pusher'),
      request = require('request');
   // Own modules files
const helpers = require('./user_modules/helpers'),
      data = require('./user_modules/data'),
      models = require('./user_modules/db/models'),
      routes = require('./user_modules/routes'),
      db =  {
         methods: require('./user_modules/db/methods')
      },
      search = require('./user_modules/search');

const push = ssePusher();

// EXPRESS
   // EXPRESS settings
app.use( '/ssedemo', push.handler() ); // see initialization
app.set('view engine', 'ejs'); // default templating engine
app.use( express.static(__dirname + '/public') ); // public directory
app.use( methodOverride('_method') );
app.use( bodyParser.urlencoded({extended: true}) );


routes(app, push); // routes

// EXPRESS start
var portNumber = 3000;
app.listen(portNumber, function() {
	console.log('EXPRESS started listening on PORT: ' + portNumber);
});


search.starter({
   data: data,
   models: models,
   runFunc: search.infiniteRepeat,
   push: push,
   request: request,
   parse: search.parse,
   dbAdd: db.methods.dbAdd,
   repeat: search.repeat,
   duplicateChecker: helpers.duplicateChecker,
   removeExpired: db.methods.removeExpired,
   saveValues: db.methods.saveValues,
   randomRange: helpers.randomRange,
   run: search.run
});