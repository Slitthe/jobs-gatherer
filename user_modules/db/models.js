const mongoose = require('mongoose');
      data = require('../data');

mongoose.connect('mongodb://localhost/jobs_gatherer_demo');

var models = function() {
   var schemas = {
      job: new mongoose.Schema({
         url: String,
         title: String,
         location: String,
         filterCat: {
            type: String,
            default: 'default'
            // other possible values: 'saved', 'deleted', affected front end visibility only
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

   var models = {
      searchData: mongoose.model('searchData', schemas.searchData),
      value:  mongoose.model('Value', schemas.value)
   }

  
   for (let i = 0; i < data.sites.length; i++) {
      let modelName = data.sites[i][0].toUpperCase() + data.sites[i].substring(1); // uppercases the first letter of the site
      models[data.sites[i]] = mongoose.model(modelName, schemas.job);
   }

   return models;
}();

module.exports = models;
