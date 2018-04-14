// Dependencies
   // Packages
const express = require('express'),
		app = express(),
		mongoose = require('mongoose'),
		methodOverride = require('method-override'),
      ejs = require('ejs'),
      bodyParser = require('body-parser'),
      ssePusher = require('sse-pusher');
   // Own modules files
const helpers = require('./helpers'),
      data = require('./data'),
      models = require('./models'),
      routes = require('./routes');
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

   // start the search service
helpers.starter(data, models, helpers.infiniteRepeat, push);