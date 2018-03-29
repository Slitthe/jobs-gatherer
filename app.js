const   express = require('express'),
		app = express(),
		mongoose = require('mongoose'),
		request = require('request'),
		helpers = require('./helpers'),
		parse = require('./parser'),
		getUrls = require('./urlConstructor'),
		models = require('./models'),
		data = require('./data');



mongoose.connect('mongodb://localhost/jobs_crawler');




	

// App logic











// Acts like 2 nested for loops but with DELAY and with REPEAT
// Will refractor it later so it won't look so spaghetiiy
function infiniteRepeat(site, places, queries,i , j, page) {
	var increment = function () {
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
	console.log(places[j], queries[i], page);

	let url = getUrls(page, queries[i], places[j], site);


	request(url, function(err, response, body) {
		if(!err && response.statusCode === 200) { //no error 
			let parsed = parse({
				str: body,
				site: site
			});

			

			if(parsed) { // results found
				models[site].find({}, function(err, data) {
					console.log(data.length, parsed.length);
					if(!err) {
						
						parsed.forEach(function (current) {
							
							if (!helpers.duplicateChecker(current, data, 'url') ) {
								models[site].create({
									url: current.url,
									title: current.title,
									city: places[i]
								}, function (err, data) {
								});
							}
						});						
					}

				})



				console.log('Results found');
				page++;
				setTimeout(function () {
					infiniteRepeat(site, places, queries, i, j, page);
				}, 7000);
			} else { // no results found
				console.log('No results found', queries[i]);

				increment();
				setTimeout(function () {
					infiniteRepeat(site, places, queries, i, j, 1);
				}, helpers.randomRange(400000, 800000));
			}

		} else { // request error
			console.log('request error');
			increment();
			setTimeout(function () {
				infiniteRepeat(site, places, queries, i, j);
			}, helpers.randomRange(400000, 800000));
		}
	});

}

infiniteRepeat('bestjobs', data.cities, data.keywords, 0, 0, 1);

models['bestjobs'].find({}, function(err, data) {
	console.log(data.length);
	for(let i = 0; i < data.length - 1; i ++) {
		for(let j = i + 1; j < data.length; j++) {
			if(data[i].url === data[j].url) {
				console.log('duplicate found');
				break;
			}
		}
	}
});



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