// -----------------------------------routes dependencies-----------------------------------
const colors = require('colors'),
      request = require('request');

const search = require('./search'),
      helpers = require('./helpers'),
      db = {
         methods: require('./db/methods'),
         models: require('./db/models'),
         debugging: require('./db/debugging')
      },
      data = require('./data'),
      sitesInfo = require('./sites');


    

// ------------------------------------routes functions------------------------------------
var funcs = {};

// pause or resume the search functionality
funcs.runAction = function(req, res, push) {
   let action = req.body.action || null;
   if (action === 'stop' || action === 'start') { // simple route data input checker
      // resume the serach
      if (action === 'start') {
         search.run.start({
            runner: search.starter,
            args: {
               search: search,
               db: db,
               helpers: helpers,
               data: data,
               push: push,
               request: request,
               sitesInfo: sitesInfo
            },
            push: push,
            sendPush: true
         });
      } else { // cancel the search
         search.run.cancel(push);
      }
      res.send(''); // send a blank susscesful response
   } else { // only accepts 'stop' or 'start' actions, anything else is invalid request
      res.status(400);
      res.send('');
   }
};


// add or remove search parameters items
funcs.update = function(req, res) {
   // input data checker
   var add = req.query.add === 'false' || req.query.add === 'true' ? req.query.add : null;
   var   correctData = req.body && req.body.hasOwnProperty('type') && typeof req.body.type === 'string';
         correctData = correctData && req.body.hasOwnProperty('value') && typeof req.body.value === 'string';

   // only proceeds if the data is correct
   if (add && correctData) {
      let   type = req.body.type,
            value = req.body.value;

      // doesn't modify if the search service is running
      if (!search.run.isRunning) {
         // length checkers
         let   dataLength = data[type] ? data[type].length : 0,
               valueLength = value.length;

         if (valueLength > 60 || valueLength === 0) { // too long data or inexistent (0 length)
            res.status(400);
            res.send('wrongLength');
         }
         else if (add === 'true' || (add === 'false' && dataLength > 1)) {
            // every piece of data was the correct format/length
            let returnObj = {};
            returnObj[type] = [value];
            // add/remove that search parameter value from the DB
            db.methods.updateValues(
               {
                  valueObj: returnObj,
                  models: db.models,
                  add: JSON.parse(add),
                  run: search.run,
                  data: data,
               }
            );
            res.send('success');
         } else { // doesn't allow for the deletion of the last item in the category
            res.status(400);
            res.send('lastItem');
         }
      }
      else { // disallowing modifying search parameters if the search is alreadey running
         res.status(400);
         res.send('alredyRunning');
      }
   } else {
      res.status(400); // the request was made in an incorrect format
      res.redirect('wrongRequest');
   }
};

// update the category that a single job results belong in, site specific
funcs.catUpdate = function (req, res) {
   let   types = data.types,
         site = req.params.site,
         type = req.body.type.toLowerCase(),
         id = req.params.id;

   // update if type is valid and a model for that site exists
   if (db.models[site] && types.indexOf(req.body.type) > -1) { 
      db.models[site].findByIdAndUpdate(id, { // update that entry with the new category
         $set: {
            filterCat: type
         }
      }, function (err, data) { // handle errors and respond to the request so that the front end is notified of changes
         if (!err) {
            console.log('Updated: ' + colors.bold(data.title) + ' |=| New Category: ' + colors.bold(type));
            res.send('Updated');
         } else {
            res.status(401);
            res.send('');
         }
      });
   }
};

// displays the index page for a specific site
funcs.index = function(req, res) {
   var site = req.params.site;

   if (db.models[site]) {
      // Gets results for this site from the DB
      db.models[site].find({}, function (err, results) {
         if (!err) { // communication succesful with the DB
            if (results) {
               // category and location data splitter
               var splitData = helpers.dataSplitter(results, data.types);
               // index template render
               res.render('index', { results: splitData, site: site, data: data, btnGroups: helpers.btnGroups });
            }
         } else { // Communication to DB error
            res.send('<p style="text-align: center;">Error fetching the results</p>');
         }
      });
   } else { // wrong URL
      res.render('404');
   }
};

funcs.startPage = function(req, res) {
   if (!data.appRunning.getValue()) {
      // res.send('Select the sites to start the app');
      res.render('start', { sites: sitesInfo.sites, error: false });
   } else {
      res.render('app-running');
   }
};

funcs.startAction = function(req, res, push) {
   inputSites = req.body.sites || null;
   if (!data.appRunning.getValue()) {
      if (inputSites) {
         inputSites = typeof inputSites === 'string' ? [inputSites] : inputSites;
         inputSites = Array.isArray(inputSites) ? inputSites : null;
         if (helpers.isPartOfTheOther(inputSites, sitesInfo.sites)) {
            sitesInfo.sites = inputSites;
            data.appRunning.turnOn({
               runner: search.starter,
               args: {
                  search: search,
                  db: db,
                  helpers: helpers,
                  data: data,
                  push: push,
                  request: request,
                  sitesInfo: sitesInfo
               },
               push: push,
               sendPush: true
            }, search);
            res.send('success');
         } else {
            res.status(400);
            res.send('error');
         }
      } else {
         res.status(500);
         res.send('error');
      }
   } else {
      res.status(500);
      res.send('error');
   }
};

function appRunningResponse(req, res, func, args) {
   if(!data.appRunning.getValue()) {
      res.redirect('/start')
   } else {
      func.apply(this, args); 
   }
}


      
// -----------------------------------app -> express; push -> server sent events-----------------------------------
var routes = function(app, push) {


   // Home
	app.get('/' ,function(req, res) {
      appRunningResponse(req, res, function () {
         res.render('home', { sites: sitesInfo.sites });
      }, []);
   });
   app.get('/start', function(req, res) {
      funcs.startPage(req, res);
   });

   app.post('/start', function(req, res) {
     funcs.startAction(req, res, push);
   });

   // Settings
   app.get('/settings', function(req, res) {
      appRunningResponse(req, res, function () {
         res.render('settings', { data: data, runState: search.run.isRunning, sites: sitesInfo.sites});
      }, []);
   });
   // stop/start the search
   app.post('/runAction', function(req, res) {
      appRunningResponse(req, res, funcs.runAction, [req, res, push]);
   });

   // add/remove a value
   app.put('/update', function (req, res) {
      appRunningResponse(req, res, funcs.update, [req, res]);      
   });

   app.get('/debugging', function(req, res) {
      db.debugging.deleteEntities('searchData', ['5addf0397718eb215d0ddaf0', '5addf0397718eb215d0ddaf1']);
      res.render('debugging');
   });


   // update the category of a rersult
   app.put('/:site/:id', function(req, res) { 
      appRunningResponse(req, res, funcs.catUpdate, [req, res]);            
   });

   // index page for the results, site specific
	app.get('/:site', function(req, res) {
      appRunningResponse(req, res, funcs.index, [req, res]);                  
   });

   // generic 404 page
   app.get('*', function(req, res) {
      appRunningResponse(req, res, function () {
         res.status(404);
         res.render('404');
      }, []);
   });
};

module.exports = routes;