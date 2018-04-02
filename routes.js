const models = require('./models');
      data = require('./data'),
      helpers = require('./helpers');

var routes = function(app) {
	app.get('/' ,function(req, res) {
		res.render('home', {data: data});
	});

	app.get('/:site', function(req, res) {
		const site = req.params.site;
		if(models[site]) {
			models[site].find({}, function(err, results) {
				if(!err) {
					if(data) {
                  var splitData = helpers.dataSplitter(results);
						res.render('index', {results: splitData, site: site});
					} else {
						res.send('<h1>No Results</h1>')
					}
				} else {
					res.send('Error communicating with the DB');
				}
			});
		} else {
			res.send('<p>The site: <strong>' + site + '</strong> does not exist in the application\'s records');
		}

		//  });
   });
   
   app.post('/removeExpired', function(req, res) {
      console.log('Route reached');
      
      helpers.removeExpired(models, data.sites);
   })

	app.put('/:site', function(req, res) {
		let 	types = ['deleted', 'default', 'saved'];
				site = req.params.site,
				type = req.body.type.toLowerCase(),
				id = req.body.id;
		if(models[site] && types.indexOf(req.body.type) > -1) {
			models[site].findByIdAndUpdate(id, {
            $set: {
            filterCat: type
         }
      }, function(err, data) {
            if(!err) {
               console.log('Updated ' + Date.now());
               res.send('Updated')
            } else {
               res.status(401);
               res.send('Nope');
            }
         });
		}
	});

};

module.exports = routes;