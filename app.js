const   express = require('express'),
		app = express(),
		mongoose = require('mongoose'),
		request = require('request'),
		methodOverride = require('method-override'),
		bodyParser = require('body-parser'),
		ejs = require('ejs'),
		helpers = require('./helpers'),
		parse = require('./parser'),
		getUrls = require('./urlConstructor'),
		models = require('./models'),
		data = require('./data'),
		routes = require('./routes');

app.set('view engine', 'ejs');
app.use( express.static(__dirname + '/public') );
app.use( methodOverride('_method') );
app.use( bodyParser.urlencoded({extended: true}) );


routes(app);

app.listen(3333, function() {
	console.log('EXPRESS started listening');
});



mongoose.connect('mongodb://localhost/jobs_crawler');


function infiniteRepeat(site, places, queries,i , j, page, tryCount) {
	tryCount = tryCount || 1;
	console.log(site, '-->  ' + places[j], ' --> ' + queries[i], ' --> (page): ' + page, ' -->Retry Count: ' + tryCount);				
	var increment = function () {
		// Analogous to one iteration of a nested 'for' loop
		if (i < queries.length - 1) {
			i++
		} else {
			if (j < places.length - 1) {
				j++;
			} else {
				j = 0;
			}
			i = 0;
      }
   };
   helpers.removeExpired(models, data.sites);
   models.value.findOne({site: site}, function(err, data) {
      if(!err && data) {
         data.keyword = i;
         data.city = j;
         data.page = page;
         data.save();
      } else {
         models.value.create({site: site});
      }
   });

   let url = getUrls(page, queries[i], places[j], site); // req URL
   


	request(url, function(err, response, body) {
		if(!err && response.statusCode === 200) {
			// =================
			// SUCCESFUL REQ
			// =================
			let parsed = parse({
				str: body,
				site: site
         }); // parsed HTML request to extract the jobs listing (if any)
         

			

			if(parsed) { // if no jobs listing, parsed will be null ( it used String.prototype.match method )
				// =====================
				// SUCCESFUL REQ & 1 >= RESULTS
				// =====================
				models[site].find({}, function(err, data) {
					// Gets data about the listings in the DB to compare duplication
						if(data){
							parsed.forEach(function (current) {
								if (!helpers.duplicateChecker(current, data, 'url') ) { // doesn't add the listing if it already exists in the DB
									models[site].create({
										url: current.url,
										title: current.title,
										city: places[j]
									});
								} else { // if it already exists, just 
                           models[site].findOne({url: current.url}, function(err, data) {
                              if(!err && data) {
                                 data.updateDate = Date.now();
                                 data.save();
                              }
                           })
                        }
                        
                        
                        
                        
							});						
					}
				});



				page++; // increments the page if results were found
				setTimeout(function () {
					infiniteRepeat(site, places, queries, i, j, page);
            }, helpers.randomRange(230000, 380000));
			} else { 
				// ================
				// NO RESULTS FOUND
				// ================
				console.log('No results found');

				increment(); // tries another query and/or location
				setTimeout(function () {
					infiniteRepeat(site, places, queries, i, j, 1);
            }, helpers.randomRange(230000, 380000));
			}

		} else {
			// ================
			// REQUEST ERROR
			// ================

			// SHOULD add a sort of ('if there was a request error, try again at least 3 more times, and only then increment the values)

			console.log('request error');
			if(tryCount < 3) {
				tryCount++;
			} else {
				tryCount = 1;
				increment();
			}
			setTimeout(function () {
				infiniteRepeat(site, places, queries, i, j, 1, tryCount);
         }, helpers.randomRange(230000, 380000));
		}
	});

}



// ejobs --> city: indexNumber, keyword: indexNumber, pageNumber: number
// data.sites.forEach(function(site) {
//    models[site].findOne({site: site}, function(err, values) {
//       if(!err && values) {
//          infiniteRepeat(site, data.cities, data.keywords, values.keyword, values.city, values.page);
      
//       } else {
//          infiniteRepeat(site, data.cities, data.keywords, 0, 0, 1);
//       }
//    })
// });