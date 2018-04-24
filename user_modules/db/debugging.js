const data = require('../data'),
      methods = require('./methods'),
      models = require('./models');

let modelsKeys = Object.keys(models);
      
var deleteAll = function() {
   modelsKeys.forEach(function(model) {
      models[model].remove({}, function(err, data){});
   });
};

var deleteCollection = function(modelName) {
   if(modelsKeys.indexOf(modelName) !== -1) {
      models[modelName].remove({}, function(err, data) {});
   }
};

var deleteEntities = function(modelName, idsList) {
   return new Promise(function(res, rej) {
      if (modelsKeys.indexOf(modelName) !== -1 && Array.isArray(idsList)) {
         idsList.forEach(function(id) {
            models[modelName].findByIdAndRemove(id, function(err, data){
               if(!err) {
                  res();
               } else {
                  rej();
               }
            });
         });
      } else {
         rej();
      }
   });
};

var locationSplit = function (dataList, sites) {
   let splitByLocation = function(results) {
      var categorized = {};
      results.forEach(function (result) {
         if (!categorized.hasOwnProperty(result.location)) {
            categorized[result.location] = [];
         };
         categorized[result.location].push(result);
      });
      return categorized;
   };
   dataList.sites = [];

   
   Object.keys(dataList).forEach(function(currentKey) {
      if(sites.indexOf(dataList[currentKey].name) !== - 1) {
         dataList[currentKey].data = splitByLocation(dataList[currentKey].data);
      }
   });

   return dataList;
};

module.exports = {
   deleteAll: deleteAll,
   deleteCollection: deleteCollection,
   deleteEntities: deleteEntities,
   locationSplit: locationSplit
};