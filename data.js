// default keywords list (in case no results in the DB)
var exportData = {};
exportData.keywords = [
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
// Defualt cities list
exportData.cities = [
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



exportData.getData = function(argObj) {
   // argObj
   var resData = {
      keywords: exportData.keywords,
      cities: exportData.cities
   };
   argObj.models.searchData.find({}, function(err, dbResults) {
      if(!err && dbResults) {
         for(let i = 0; i < dbResults.length; i++) {
            resData[dbResults[i].type] = dbResults[i].list;
         }
         exportData.keywords = resData.keywords;
         exportData.cities = resData.cities;
         argObj.callback(exportData);
         
         if(!dbResults.length) {
            
            Object.keys(resData).forEach(function(resDataKey) {
               argObj.models.searchData.create({
                  list: exportData[resDataKey],
                  type: resDataKey
               });
            });
         }
      }
      else {
         exportData.keywords = resData.keywords;
         exportData.cities = resData.cities;
         argObj.callback(exportData);
      }
   }); 
};





module.exports = {
   getData: exportData.getData,
   cities: exportData.cities,
   keywords: exportData.keywords,
   sites: exportData.sites,
   types: exportData.types
};