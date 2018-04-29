const mongoose = require('mongoose');
      data = require('../data'),
      sitesInfo = require('../sites');

mongoose.connect('mongodb://localhost/jobs_gatherer');

var models = function() {
   // Mongoose Schemas
   var schemas = {
      job: new mongoose.Schema({
         url: String,
         title: String,
         location: String,
         filterCat: {
            type: String,
            default: 'default'
            // other possible values: 'saved', 'deleted', affectes front end visibility only
         },
         updateDate: {
            type: Date,
            default: new Date
         }
      }),
      value: new mongoose.Schema({
         location: {
            type: String,
            default: data.locations[0]
         },
         query: {
            type: String,
            default: data.queries[0]
         },
         page: {
            type: Number,
            default: 1
         },
         site: String
      }),
      searchData: new mongoose.Schema({
         list: [String],
         type: String
      })
   };

   // Mongoose models, based on the previous schema
   var models = {
      searchData: mongoose.model('searchData', schemas.searchData),
      value:  mongoose.model('Value', schemas.value)
   }

   // make a model for each site
   for (let i = 0; i < sitesInfo.sites.length; i++) {
      let modelName = sitesInfo.sites[i][0].toUpperCase() + sitesInfo.sites[i].substring(1); // uppercases the first letter of the site
      models[sitesInfo.sites[i]] = mongoose.model(modelName, schemas.job);
   }

   return models; // only return the models
}();

module.exports = models;
