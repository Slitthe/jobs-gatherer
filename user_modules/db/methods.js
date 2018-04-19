var dataModule = require('../data');
// add results to the DB
var dbAdd = function (argObj) {
   var dbQuery = argObj.models[argObj.site].find({}).exec();
   dbQuery.then(function (dbRes) {
      // Gets dbRes about the listings in the DB to compare duplication
      if (dbRes) {
         argObj.parsed.forEach(function (current) {
            if (!argObj.duplicateChecker(current, dbRes, 'url')) { // duplicate found --> create new entry
               argObj.models[argObj.site].create({
                  url: current.url,
                  title: current.title,
                  location: argObj.location
               });
            } else { // no duplicates --> update existing entry & save
               argObj.models[argObj.site].findOne({ url: current.url }, function (err, dbRes) {
                  if (!err && dbRes) {
                     dbRes.updateDate = Date.now();
                     dbRes.save();
                  }
               });
            }
         });
      }
   });
};

// Removes every item in the DB (except the filterCat === 'saved' items) if they have passed an expiry date (7 days from update)
var removeExpired = function (models, sites) {
   sites.forEach(function (site) {
      models[site].find({}, function (err, results) { // find all the results for this given site

         if (!err) { // check for DB communication error
            results.forEach(function (result) {
               if (result.filterCat !== 'saved' && (Date.now() >= result.updateDate.getTime() + 604800000)) { // ignore 'saved' items
                  result.remove();
                  result.save();
               }
            });

         }
      });
   });
};

// save the current search location values to the DB
var saveValues = function (saveObj, models) {
   models.value.findOne({ site: saveObj.site }, function (err, data) {
      if (!err && data) {
         data.query = saveObj.queries.values[saveObj.queries.index];
         data.location = saveObj.locations.values[saveObj.locations.index];
         data.page = saveObj.page;
         data.save();
      } else {
         models.value.create({ site: saveObj.site });
      }
   });
};

// add/remove data items from the DB
var updateValues = function (argObj) {
   let valueObj = argObj.valueObj;
   // obj, models, add, run
   if (!argObj.run.isRunning) { // only modify when the app isn't running
      Object.keys(valueObj).forEach(function (type) { // loop trough the data sent in the POST request
         if ((type === 'queries' || type === 'locations') && Array.isArray(valueObj[type])) { // only take into consideration the two types
            valueObj[type] = valueObj[type].filter(function (currentItem) { // data sanitizer
               return typeof currentItem === 'string' && currentItem.length <= 60 && currentItem;
            });
            valueObj[type] = valueObj[type].map(function (item) { // string lowercaser (after only strings were kept)
               return item.toLowerCase();
            });

            argObj.models.searchData.findOne({ type: type }, function (err, dbRes) { // access the DB data
               if (!err && dbRes) { // check for errors
                  valueObj[type].forEach(function (item) { // loop through the items in the POST request
                     if (argObj.add) { // add functionality
                        if (dbRes.list.indexOf(item) === -1) { // check for duplicates
                           dbRes.list.push(item.toLowerCase());
                        }
                     } else { // remove functionality
                        var index = dbRes.list.indexOf(item); // find the index of the item to be removed
                        if (index !== -1) { // if index === -1, then the item doesn't exist
                           dbRes.list.splice(index, 1);
                        }
                     }

                  });
                  argObj.data[type] = dbRes.list; // synchronizes the values in the memory and the DB
                  dbRes.save(); // saves the DB entry
               }
            });

         }
      });
   }
};


module.exports = {
   dbAdd: dbAdd,
   removeExpired: removeExpired,
   saveValues: saveValues,
   updateValues: updateValues
};