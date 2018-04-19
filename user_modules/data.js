var exportData = {};
// default queries list (in case no results in the DB)
exportData.queries = [
   'web developer',
   'front end',
   'front end developer',
   'css',
   'css3',
   'html',
   'html5',
   'bootstrap',
   'jquery',
   'javascript',
   'js',
   'software developer',
   'javascript developer',
   'developer',
   'programmer',
   'programator',
   'it'
];
// Defualt locations list
exportData.locations = [
   'brasov',
   'cluj-napoca'
];

// The sites to search in
exportData.sites = [
   'ejobs',
   'bestjobs'
];

// in what category types the results can be put in
exportData.types = [
   'saved',
   'default',
   'deleted'
];

const colors = require('colors');

exportData.getData = function(argObj) {
   // argObj
   var types = ['queries', 'locations'];
   argObj.models.searchData.find({}, function(err, dbResults) {
      if(!err && dbResults) {
         for(let i = 0; i < dbResults.length; i++) {
            exportData[dbResults[i].type] = dbResults[i].list;
         }
         argObj.callback(exportData);
         
         if(!dbResults.length) {
            types.forEach(function(type) {
               argObj.models.searchData.create({
                  list: exportData[type],
                  type: type
               });
            });

         }
      }
      else {
         argObj.callback(exportData);
      }
   }); 

};








module.exports = exportData;