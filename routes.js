const 
      data = require('./data'),
      helpers = require('./helpers'),
      bodyParser = require('body-parser');

var models = require('./models');
console.log('route ' + !!models.searchData);

var routes = function(app, push) {

   // HOME ROUTE
	app.get('/' ,function(req, res) {
		res.render('home', {data: data});
   });

   // setInterval(function() {
   //    var randomGen = function(arr) {
   //       return Math.floor(Math.random() * arr.length);
   //    }
   //    push( 'keywords', data.keywords[randomGen(data.keywords)] );
   //    push( 'cities', data.cities[randomGen(data.cities)] );
   // }, 3000);
   
   app.get('/settings', function(req, res) {
      res.render('settings', {data: data, runState: data.runData.isRunning});
   });

   app.post('/start', function(req, res) { 
      data.runData.start(helpers.starter, [data, models, helpers.infiniteRepeat, push]);
      res.send('The route for starting the runner');
   });

   app.post('/stop', function(req, res) {
      console.log(!!push)
      data.runData.cancel(push);
      res.send('The route for stopping the runner');
   });

   // app.put('/update', function(req, res) {
   //    var data = req.body.data ? req.body.data : null;
   //    if(data && typeof data.updateValue === 'string' && )
   // });

   app.get('/status', function (req, res) {

      res.send(data.runData.isRunning);
   });
   app.put('/update', function (req, res) {
      console.log(req.body, req.query);
      var add = req.query.add === 'false' || req.query.add === 'true' ? req.query.add : null;
      if(add) {
         let returnObj = req.body || null;
         if(!data.runData.isRunning) {
            console.log('1');
            data.updateValues(returnObj, models, JSON.parse(add));
            res.send('success');
         }
         else {
            console.log('2');
            res.status(400);
            res.send('alredyRunning');
         }
      } else {
         console.log('3');
         res.status(400);
         res.redirect('wrongRequest');
      }

         
      //    res.send('Correct');
      // } else {
      //    res.status(400);
      //    res.send('Incorrect request made');
      // }
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
						res.render('index', {results: splitData, site: site, data: data, btnGroups: helpers.btnGroups});
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
            id = req.body._id || req.body.id;

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