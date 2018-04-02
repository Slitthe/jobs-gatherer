const models = require('./models');
      data = require('./data'),
      helpers = require('./helpers');

var routes = function(app) {

   // HOME ROUTE
	app.get('/' ,function(req, res) {
		res.render('home', {data: data});
	});

   // 'site' INDEX PAGE
	app.get('/:site', function(req, res) {
      var site = req.params.site;
      
		if(models[site]) {
         // Gets results for this site from the DB
			models[site].find({}, function(err, results) {
				if(!err) { // communication succesful with the DB
					if(results) {
                  // category and city data splitter
                  var splitData = helpers.dataSplitter(results);
                  // index template render
						res.render('index', {results: splitData, site: site, data: data});
					} else {
                  // 0 results in the DB
						res.send('<p style="text-align: center;">No Results</p>')
					}
				} else { // Communication to DB error
               res.send('<p style="text-align: center;">Error communicating with the Database</p>');
				}
			});
		} else { // wrong URL
         res.send('<p style="text-align: center;">The site: <strong>' + site + '</strong> does not exist in the application\'s records');
		}
   });
   

   // Category modifier (saved, default or deleted)
	app.put('/:site', function(req, res) { 
		let 	types = ['deleted', 'default', 'saved'];
				site = req.params.site,
				type = req.body.type.toLowerCase(),
            id = req.body.id;

		if(models[site] && types.indexOf(req.body.type) > -1) { // update if type is valid and a model for that site exists
			models[site].findByIdAndUpdate(id, {
            $set: {
            filterCat: type
         }
      }, function(err, data) { // handle errors and respond to the request so the Front End AJAX can handle changes
            if(!err) {
               console.log('Updated ' + Date.now());
               res.send('Updated')
            } else {
               res.status(401);
            }
         });
		}
	});

};

module.exports = routes;