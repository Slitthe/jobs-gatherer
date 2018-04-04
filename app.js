// Dependencies
   // Packages
const express = require('express'),
		app = express(),
		mongoose = require('mongoose'),
		request = require('request'),
		methodOverride = require('method-override'),
		bodyParser = require('body-parser'),
      ejs = require('ejs');
   // Own modules files
const helpers = require('./helpers'),
		parse = require('./parser'),
		getUrls = require('./urlConstructor'),
		models = require('./models'),
		data = require('./data'),
		routes = require('./routes');

// EXPRESS
   // EXPRESS settings
app.set('view engine', 'ejs');
app.use( express.static(__dirname + '/public') );
app.use( methodOverride('_method') );
app.use( bodyParser.urlencoded({extended: true}) );


routes(app); // routes
// EXPRESS start
app.listen(5555, function() {
	console.log('EXPRESS started listening');
});




// Main app function (delayed infinite loop through 2 arrays: keywords and locations)

function infiniteRepeat(obj, data) {
   helpers.removeExpired(models, data.sites);
   
   /* 
   helpers.addValues(obj)
   */
   // helpers.saveValues(obj);
   models.value.findOne({site: obj.site}, function(err, data) { // add values
      if(!err && data) {
         data.keyword = obj.queries.index;
         data.city = obj.places.index;
         data.page = obj.page;
         data.save();
      } else {
         models.value.create({site: obj.site});
      }
   });

   let url = getUrls(obj.page, obj.queries.values[obj.queries.index], obj.places.values[obj.places.index], obj.site); // req URL

	request(url, function(err, response, body) {
      console.log('Request attempt made: , tryCount: ' + obj.tryCount, url);
      
      if(!err && response.statusCode === 200) { // successful request
         obj.tryCount = 1;
			let parsed = parse({
				str: body,
				site: obj.site
         }); // parsed HTML request to extract the jobs listing (if any)
         if(parsed) { // 1 or more results (otherwise parsed is null)
            console.log('Results found, number: ' + parsed.length)
            helpers.dbAdd(obj.site, obj.places.values[obj.places.index], parsed);

				obj.page++; // increment the page
            helpers.repeat(obj, data, false, infiniteRepeat); // but DO NOT increment queries/places
			} else { 
            // no results found
				console.log('No results found');

            obj.page = 1; // reset the page
            console.log(obj);
            
            helpers.repeat(obj, data, true, infiniteRepeat); // increment the queries/places when there are no results for the current page
			}

		} else {
			// request error
			if(obj.tryCount < 3) { // try again for a maximum of 'n' times (curent: 3)
            obj.tryCount++;
            helpers.repeat(obj, data, false, infiniteRepeat);
			} else { // skip for the next item in the location/keywords when too many attempted tries failed
				obj.tryCount = 1;
            helpers.repeat(obj, data, true, infiniteRepeat);
			}
		}
	});

}








// ejobs --> city: indexNumber, keyword: indexNumber, pageNumber: number
data.sites.forEach(function(site) {
   models[site].findOne({site: site}, function(err, values) {
      if(!err && values) {
         infiniteRepeat({
            site: site,
            queries: { values: data.keywords, index: values.keyword },
            places: { values: data.cities, index: values.city },
            page: values.page,
            tryCount: 1
         }, data);
      
      } else {
         infiniteRepeat({
            site: site,
            queries: { values: data.keywords, index: 0 },
            places: { values: data.cities, index: 0 },
            page: 1,
            tryCount: 1
         }, data);
      }
   })
});

// infiniteRepeat({
//    site: 'ejobs',
//    queries: {values: data.keywords, index: 0},
//    places: {values: data.cities, index: 0},
//    page: 1,
//    tryCount: 1
// }, data);