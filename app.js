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
const helpers = require('./helpers'),
      data = require('./data'),
      models = require('./db/models'),
      routes = require('./routes'),
      db =  {
         methods: require('./db/methods')
      },
      search = require('./search');
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
app.listen(3000, function() {
	console.log('EXPRESS started listening');
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


