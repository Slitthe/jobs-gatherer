var exportData = {};

// default queries list
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



// items categorization types
exportData.types = [
   'saved',
   'default',
   'deleted'
];


// call a function with either the DB data or the default data (fallback for inexistent DB or error)
exportData.getData = function(argObj) {
   exportData.sites = argObj.sitesInfo.sites;
   var types = ['queries', 'locations'];
   argObj.models.searchData.find({}, function(err, dbResults) {
      if(!err && dbResults) {
         for(let i = 0; i < dbResults.length; i++) { 
            // sync the memory data with the DB data
            exportData[dbResults[i].type] = dbResults[i].list;
         }
         // call the callback function with the database data
         argObj.callback(exportData);
         
         if(!dbResults.length) { // create the DB entity if there are no results
            types.forEach(function(type) {
               argObj.models.searchData.create({
                  list: exportData[type],
                  type: type
               });
            });
         }
      }
      else { // call the callback function with the default data
         argObj.callback(exportData);
      }
   }); 

};








module.exports = exportData;