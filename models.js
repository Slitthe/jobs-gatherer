/* Mongoose related data (schemas and models) */
const data = require('./data'),
      mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/jobs_gatherer');


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
      type: String,
      default: data.keywords[0]
   },
   keyword: {
      type: String,
      default: data.cities[0]
   },
   page: {
      type: Number,
      default: 1
   },
   site: String
});



var searchDataSchema = new mongoose.Schema({
   list: [String],
   type: String
});

var SearchData = mongoose.model('searchData', searchDataSchema);
// SearchData.create({
//    type: 'keywords',
//    list: ['web developer',
//       'front end',
//       'front end developer',
//       'css',
//       'css3',
//       'html',
//       'html5',
//       'bootstrap',
//       'jquery',
//       'javascript',
//       'js',
//       'software developer',
//       'javascript developer',
//       'developer',
//       'programmer',
//       'programator',
//       'it',]
// });
// SearchData.create({
//    type: 'cities',
//    list: ['brasov', 'cluj-napoca']
// });



function createModels(sites, schema) { // creates a model for each site, following the 'siteSchema' schema 
   var models = {};
   for (let i = 0; i < sites.length; i++) {
      let modelName = sites[i][0].toUpperCase() + sites[i].substring(1); // uppercases the first letter of the site
      models[sites[i]] = mongoose.model(modelName, schema);
   }
   return models;
}
var models = createModels(data.sites, jobSchema);
models.searchData = SearchData;
models.value = mongoose.model('Value', valueSchema);



module.exports = models;