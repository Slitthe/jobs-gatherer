const models = require('./models'),
      modelsKeys = Object.keys(models);
      


var deleteEntities = function(modelName, idsList) {
   console.log(modelName, idsList);
   // DB delete promise
   return new Promise(function(res, rej) {
      if (modelsKeys.indexOf(modelName) !== -1 && Array.isArray(idsList)) {
         idsList.forEach(function(id) {
            models[modelName].findByIdAndRemove(id, function(err, data){
               if(!err) res();
               else rej();
            });
         });
      } 
      else rej(); 
   });
};

// splits a site list of DB results by their locations
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
   deleteEntities: deleteEntities,
   locationSplit: locationSplit
};