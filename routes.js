const data = require('./data'),
      helpers = require('./helpers'),
      models = require('./models');

var routes = function(app, push) {

   // Home
	app.get('/' ,function(req, res) {
		res.render('home', {sites: data.sites});
   });

   // Settings
   app.get('/settings', function(req, res) {
      res.render('settings', {data: data, runState: data.runData.isRunning});
   });

   app.post('/runAction', function(req, res) {
      console.log(req.body);

      let action = req.body.action || null;
      if(action === 'stop' || action === 'start') {
         if(action === 'start') {
            data.runData.start(helpers.starter, [data, models, helpers.infiniteRepeat, push]);
         } else {
            data.runData.cancel(push);
         }
         res.send('');
      } else { // action is any other string other than 'stop' or 'start' or simply doesn't exist
         res.status(400);
         res.send('');
      }
   });

   // add/remove a value
   app.put('/update', function (req, res) {
      // data format corectness checker
      var add = req.query.add === 'false' || req.query.add === 'true' ? req.query.add : null;
      var correctData = req.body && req.body.hasOwnProperty('type') && typeof req.body.type === 'string';
      correctData = correctData && req.body.hasOwnProperty('value') && typeof req.body.value === 'string';

      // only proceeds if the data is correct
      if(add && correctData) {
         let type = req.body.type;
         let value = req.body.value;

         // doesn't modify if the search service is running
         if(!data.runData.isRunning) {
            let dataLength = data[type] ? data[type].length : 0; 
            let valueLength = value.length;
            if (valueLength > 60 || valueLength === 0) { // too long data or inexistent (0 length)
               res.status(400);
               res.send('wrongLength');
            }
            else if (add === 'true' || (add === 'false' && dataLength > 1) ) {
               // every piece of data was the correct format/length
               let returnObj = {};
               returnObj[type] = [value];
               data.updateValues(returnObj, models, JSON.parse(add));
               res.send('success');
            } else { // doesn't allow for the deletion of the last item in the category
               res.status(400);
               res.send('lastItem');
            }
         }
         else {
            res.status(400);
            res.send('alredyRunning');
         }
      } else {
         res.status(400);
         res.redirect('wrongRequest');
      }
   });

   // update the category of a rersult
   app.put('/:site/:id', function(req, res) { 
      let 	types = ['deleted', 'default', 'saved'];
            site = req.params.site,
            type = req.body.type.toLowerCase(),
            id = req.params.id;

      if(models[site] && types.indexOf(req.body.type) > -1) { // update if type is valid and a model for that site exists
         models[site].findByIdAndUpdate(id, { // update that entry with the new category
            $set: {
            filterCat: type
         }
      }, function(err, data) { // handle errors and respond to the request so the Front End AJAX can handle changes
            if(!err) {
               console.log('Updated ' + Date.now()); // update the expiry date
               res.send('Updated')
            } else {
               res.status(401);
               res.send('');
            }
         });
      }
   });

   // index page for the results, site specific
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
					}
				} else { // Communication to DB error
               res.send('<p style="text-align: center;">Error fetching the results</p>');
				}
			});
		} else { // wrong URL
         res.send('<p style="text-align: center;">The site: <strong>' + site + '</strong> does not exist in the application\'s records');
		}
   });
   

   // Category modifier (saved, default or deleted)

};

module.exports = routes;