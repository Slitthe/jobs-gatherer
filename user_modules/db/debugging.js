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
   console.log(modelName, idsList, Array.isArray(idsList));
   if (modelsKeys.indexOf(modelName) !== -1 && Array.isArray(idsList)) {
      idsList.forEach(function(id) {
         models[modelName].findByIdAndRemove(id, function(err, data){
            console.log(data);
         });
      });
   }
};

module.exports = {
   deleteAll: deleteAll,
   deleteOne: deleteOne,
   deleteEntities: deleteEntities
};