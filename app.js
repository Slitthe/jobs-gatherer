// Dependencies
   // Packages
const express = require('express'),
		app = express(),
		mongoose = require('mongoose'),
		request = require('request'),
		methodOverride = require('method-override'),
      ejs = require('ejs'),
      bodyParser = require('body-parser');
   // Own modules files
const helpers = require('./helpers'),
      data = require('./data'),
      parse = require('./parser'),
      getUrls = require('./urlConstructor'),
      models = require('./models'),
      routes = require('./routes');

// EXPRESS
   // EXPRESS settings
app.set('view engine', 'ejs');
app.use( express.static(__dirname + '/public') );
app.use( methodOverride('_method') );
app.use( bodyParser.urlencoded({extended: true}) );


routes(app); // routes
// EXPRESS start
app.listen(3000, function() {
	console.log('EXPRESS started listening');
});



// Main app function (delayed infinite loop through 2 arrays: keywords and locations)








helpers.starter(data, models, helpers.infiniteRepeat);




// // ejobs --> city: indexNumber, keyword: indexNumber, pageNumber: number
// data.getData(models, function(dataRes) {
//    data.sites.forEach(function (site) {
//       models.value.findOne({ site: site }, function (err, values) {
//          if (!err && values) {
//             infiniteRepeat({
//                site: site,
//                queries: { values: dataRes.keywords, index: values.keyword },
//                places: { values: dataRes.cities, index: values.city },
//                page: values.page,
//                tryCount: 1
//             }, data);

//          } else {
//             infiniteRepeat({
//                site: site,
//                queries: { values: dataRes.keywords, index: 0 },
//                places: { values: dataRes.cities, index: 0 },
//                page: 1,
//                tryCount: 1
//             }, data);
//          }
//       });
//    });
// });
// data.sites.forEach(function(site) {
//    models.value.findOne({site: site}, function(err, values) {
//       console.log(values);
      
//       if(!err && values) {
//          infiniteRepeat({
//             site: site,
//             queries: { values: data.keywords, index: values.keyword },
//             places: { values: data.cities, index: values.city },
//             page: values.page,
//             tryCount: 1
//          }, data);
      
//       } else {
//          infiniteRepeat({
//             site: site,
//             queries: { values: data.keywords, index: 0 },
//             places: { values: data.cities, index: 0 },
//             page: 1,
//             tryCount: 1
//          }, data);
//       }
//    });
// });
