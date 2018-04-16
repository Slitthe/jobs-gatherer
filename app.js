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
      models = require('./models'),
      routes = require('./routes'),
      parser = require('./parser');
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
// helpers.starter(data, models, helpers.infiniteRepeat, push, request, parser, helpers.dbAdd, helpers.repeat);
helpers.starter({
   data: data,
   models: models,
   runFunc: helpers.infiniteRepeat,
   push: push,
   request: request,
   parse: parser,
   dbAdd: helpers.dbAdd,
   repeat: helpers.repeat
});

// data, models, runFunc, push, request, parse, dbAdd, repeat

/* 

ar starter = function (data, models, runFunc, push, request, parse, dbAdd, repeat) {
   data.getData(models, function (dataRes) {
      data.sites.forEach(function (site) {
         models.value.findOne({ site: site }, function (err, values) {
            if (!err && values) {
               let cityIndex = dataRes.cities.indexOf(values.city);
               cityIndex = cityIndex !== -1 ? cityIndex : 0;
               let keywordIndex = dataRes.keywords.indexOf(values.keyword);
               keywordIndex = keywordIndex !== -1 ? keywordIndex : 0;
               runFunc({
                  site: site,
                  queries: { values: dataRes.keywords, index: keywordIndex },
                  places: { values: dataRes.cities, index: cityIndex },
                  page: values.page,
                  tryCount: 1,
                  push: push
               }, data, models, request, parse, dbAdd, repeat);
               // (obj, data, models, request, parse, dbAdd, repeat)

*/