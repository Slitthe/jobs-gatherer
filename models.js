const data = require('./data'),
      mongoose = require('mongoose');



var jobSchema = new mongoose.Schema({
   url: String,
   title: String,
   city: String,
   filterCat: {
         type: String,
         default: 'default'
         // other possible values: 'saved', 'deleted', affected front end visibility only
   },
   updateDate: {
      type: Date,
      default: new Date
   }
});

var valueSchema = new mongoose.Schema({
   city: {
      type: Number,
      default: 0
   },
   keyword: {
      type: Number,
      default: 0
   },
   page: {
      type: Number,
      default: 1
   },
   site: String
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
models.value = mongoose.model('Value', valueSchema);


data.sites.forEach(function(site) {
   models.value.findOne({site: site}, function(err, data) {
      if(!err){
         models.value.create({ site: site });
      } else {
         console.log('Initial values failed')
      }
   })
});


module.exports = models;