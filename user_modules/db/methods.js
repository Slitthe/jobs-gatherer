var dataModule = require('../data');

// Adds results from parsed HTML string response to the DB or update their expiry date if they already exist
var addResults = function (argObj) {
   var dbQuery = argObj.models[argObj.site].find({}).exec();
   dbQuery.then(function (dbRes) {
      argObj.parsed.forEach(function (current) {
         // checks each result for duplication
         if (!argObj.duplicateChecker(current, dbRes, 'url')) {
            // duplicate found --> create new DB entity
            argObj.models[argObj.site].create({
               url: current.url,
               title: current.title,
               location: argObj.location
            });
         } else {
            // no duplicate --> update existing entry (expiry date)
            argObj.models[argObj.site].findOne({ url: current.url }, function (err, dbRes) {
               if (!err && dbRes) {
                  dbRes.updateDate = Date.now();
                  dbRes.save();
               }
            });
         }
      });
   });
};

// removed expiry items from the DB
var removeExpired = function (models, sites) {
   sites.forEach(function (site) {

      // find all db results for the given site
      models[site].find({}, function (err, dbResults) {
         if (!err) { // check for DB communication error
            dbResults.forEach(function (result) {
               // ignore 'saved' items and then check for expiriy date, if it is expired, then deleted that entry
               if (result.filterCat !== 'saved' && (Date.now() >= result.updateDate.getTime() + 604800000)) {
                  result.remove();
                  result.save();
               }
            });
         }
      });

   });
};

// save the current search parameters values to the DB
var saveValues = function (saveObj, models) {
   // get the right site database values entry
   models.value.findOne({ site: saveObj.site }, function (err, dbData) {
      if (!err && dbData) {
         // update search parameters
         dbData.query = saveObj.queries.getValue();
         dbData.location = saveObj.locations.getValue();
         dbData.page = saveObj.page;
         // & save
         dbData.save();
      } else {
         // create new entry if it does not exist
         models.value.create({ site: saveObj.site });
      }
   });
};

// add/remove search parameters list from the DB
var updateValues = function (argObj) {
   let valueObj = argObj.valueObj;
   
   if (!argObj.run.isRunning) { // only modify when the app isn't running
      Object.keys(valueObj).forEach(function (type) { // loop trough the data sent in the POST request
         if ((type === 'queries' || type === 'locations') && Array.isArray(valueObj[type])) { // only take into consideration the two types and that they are arrays
            valueObj[type] = valueObj[type].filter(function (currentItem) { // only keep short (<= 60 length) strings
               return typeof currentItem === 'string' && currentItem.length <= 60 && currentItem;
            });
            valueObj[type] = valueObj[type].map(function (item) { // string lowercaser (after only strings were kept)
               return item.toLowerCase();
            });

            argObj.models.searchData.findOne({ type: type }, function (err, dbRes) { // access the DB search parameters data
               if (!err && dbRes) { // check for errors
                  valueObj[type].forEach(function (item) { // loop through the items in the POST request
                     if (argObj.add) { // add functionality
                        if (dbRes.list.indexOf(item) === -1) { // check for duplicates
                           dbRes.list.push(item.toLowerCase());
                        }
                     } else { // remove functionality
                        var index = dbRes.list.indexOf(item); // find the index of the item to be removed
                        if (index !== -1) { // remove if if it does exist
                           dbRes.list.splice(index, 1);
                        }
                     }

                  });
                  dbRes.save(); // saves the DB entry
                  argObj.data[type] = dbRes.list; // syncronized DB and memory values
               }
            });

         }
      });
   }
};

var collectionGetAll = function(collectionName, models) {
   return new Promise(function(res, rej) {
      try {
         models[collectionName];
         models[collectionName].find({}, function (err, data) {
            if (!err && data) {
               res({name: collectionName, data:data});
            } else {
               rej();
            }
         });
      } catch(err) {
         rej();
      }
   });
};


module.exports = {
   addResults: addResults,
   removeExpired: removeExpired,
   saveValues: saveValues,
   updateValues: updateValues,
   collectionGetAll: collectionGetAll
};