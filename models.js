const data = require('./data'),
      mongoose = require('mongoose');

var jobSchema = new mongoose.Schema({
   url: String,
   title: String,
   city: String
});

function createModels(sites, schema) {
   var models = {};
   for (let i = 0; i < sites.length; i++) {
      let modelName = sites[i][0].toUpperCase() + sites[i].substring(1);
      models[sites[i]] = mongoose.model(modelName, schema);
   }
   return models;
}
var models = createModels(data.sites, jobSchema);

module.exports = models;