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

app.listen(3000, function() {
	console.log('EXPRESS started listening');
});



mongoose.connect('mongodb://localhost/jobs_crawler');


function infiniteRepeat(site, places, queries,i , j, page, tryCount) {
	
	tryCount = tryCount || 1;
	console.log('------------- |||   ' + 'Website: ' + site, '|||  City: ' + places[j], '|||   Keywords : ' + queries[i], '|||  Page: :' + page, '||||   Try count: ' + tryCount);				
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
   
   models.value.findOne({site: site}, function(err, data) {
      if(!err) {
         data.keyword = i;
         data.city = j;
         data.page = page;
         data.save();
      } else {

      }
   })

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
										city: places[i]
									});
								} else {
                           models[site].findOne({url: current.url}, function(err, data) {
                              if(!err) {
                                 data.expiryDate = Date.now();
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
				}, helpers.randomRange(300000, 500000));
			} else { 
				// ================
				// NO RESULTS FOUND
				// ================
				console.log('No results found');

				increment(); // tries another query and/or location
				setTimeout(function () {
					infiniteRepeat(site, places, queries, i, j, 1);
				}, helpers.randomRange(300000, 500000));
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
			}, helpers.randomRange(300000, 500000));
		}
	});

}
// Separate function calls are required for different sites
// Would be ineffective to loop through the sites as well, and too compicated to add the logic to run in parallel when the alternative is just calling the function again with different values
infiniteRepeat('ejobs', data.cities, data.keywords, 0, 0, 1);
infiniteRepeat('bestjobs', data.cities, data.keywords, 0, 0, 1);


// ejobs --> city: indexNumber, keyword: indexNumber, pageNumber: number

/* models['ejobs'].findOne({}, function(err, data) {
      if(!err) {
         infiniteRepeat('ejobs', data.cities[data.city], data.keywords[data.keyword], data.pageNumber);
      } else {
         infiniteRepeat('ejobs', data.cities, data.keywords, 0, 0, 1);
      }
}); */


























// // DUPLICATE CHECKER
// models['bestjobs'].find({}, function(err, data) {
// 	console.log(data.length);
// 	for(let i = 0; i < data.length - 1; i ++) {
// 		for(let j = i + 1; j < data.length; j++) {
// 			if(data[i].url === data[j].url) {
// 				console.log('duplicate found');
// 				break;
// 			}
// 		}
// 	}
// });



// Routes
// app.get('/', function(req, res) {
// 	// the list of jobs should appear here
// });

// // express listening start
// app.listen(3000, function() {
// 	console.log('The app has started');
// });

/* 
	How the APP should work:

	Run functions in parallel based on the jobs (so they won't kick you out for making too many requests)

	These functions should loop through the city --> keywords, the other city --> the same keywords
		This should happen indefintely
			The requests should be, of coruse, delayed (significantly) as to not overflow the server with requests

		Relating to pages
			Each search query can have multiple pages
			The function should attempt to requets another page unless the results count for the current page is 0 (meaning that there is no other page to display)

		There are bound to be errors in the requests, or (even though less common) in the saving on the DB itself, they should be handled somehow

		Assuming you make a request for a site, search query, page and you get some results back, you should SAVE them in a db

		BUT, you need to check so that you don't add dudplicates, so you only add those who are not alread in the DB

		Of course, a "deleted", "saved" and "current" area should be in the DB, and if a job ad already exists in either of these areas, it should NOT be added

		Each of the sites should have a different collection in the DB
*/