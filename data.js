const colors = require('colors');
// what keywords to use
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
// The cities to search in
exportData.cities = [
   'brasov',
   'cluj-napoca'
];

// The sites to search in
exportData.sites = [
   'ejobs',
   'bestjobs'
];

exportData.sitesColors = {
   ejobs: 'rgba(63, 110, 227, 0.5)',
   bestjobs: 'rgba(202, 143, 44, 0.5)',
};

exportData.types = [
   'saved',
   'default',
   'deleted'
];



exportData.getData = function(models, callback) {
   var resData = {
      keywords: exportData.keywords,
      cities: exportData.cities
   };
   models.searchData.find({}, function(err, dbResults) {
      
      if(!err && dbResults) {
         for(let i = 0; i < dbResults.length; i++) {
            resData[dbResults[i].type] = dbResults[i].list;
         }
         exportData.keywords = resData.keywords;
         exportData.cities = resData.cities;
         callback(exportData);
        
         if(!dbResults.length) {
            console.log(resData);
            
            Object.keys(resData).forEach(function(resDataKey) {
               models.searchData.create({
                  list: exportData[resDataKey],
                  type: resDataKey
               });
            });
         }
      }
      else {
         exportData.keywords = resData.keywords;
         exportData.cities = resData.cities;
         callback(exportData);
      }
   });
};




exportData.runData = {
   continue: true,
   runTimeout: [],
   cancel:  function(push) {
      this.continue = false;
      if(this.runTimeout.length) {
         this.runTimeout.forEach(function(crTimeout) {
            clearTimeout(crTimeout);
         });
      }
      this.runTimeout = [];
      if(push) {
         push('stoppedStatus', 'true');
      }
   },
   start: function(runner, args) {
      if(!this.isRunning) {
         this.continue = true;
         runner.apply(this, args);
         if (args[3]) {
            args[3]('stoppedStatus', 'false');
         }
      } else {
         console.log('The search is already running');
      }
   },
   get isRunning() {
      return !!(this.continue && this.runTimeout);
   }
};

exportData.updateValues = function (obj, models, add) {
   console.log('Run state: :--> ' + this.runData.isRunning); 
   console.log(colors.cyan(add));
   console.log(obj, add);
   if(!this.runData.isRunning) { // only modify when the 'requester' isn't running
      Object.keys(obj).forEach(function(type) { // 'obj' is the data object of the POST request
         if( (type === 'keywords' || type === 'cities') && Array.isArray(obj[type])) { // only take into consideration the two types
            obj[type] = obj[type].filter(function(currentItem) {
               return typeof currentItem === 'string' && currentItem.length <= 60 && currentItem; // simple data sanitizer
            });
            obj[type] = obj[type].map(function(item) { // string lowercaser (after only strings were kept)
               return item.toLowerCase();
            });
            
            models.searchData.findOne({type: type}, function(err, dbRes) { // access the DB data
               if (!err && dbRes) { // check for errors
                  obj[type].forEach(function (item) {
                     console.log(typeof add);
                     if(add) {
                        if(dbRes.list.indexOf(item) === -1) {
                           dbRes.list.push(item.toLowerCase());
                        }                        
                     } else {
                        var index = dbRes.list.indexOf(item);
                        if(index !== -1) {
                           dbRes.list.splice(index, 1);
                        }  
                     }

                  });
                  console.log(colors.cyan('THIS IS THE DBRES LIST:-->>'), dbRes.list);
                  exportData[type] = dbRes.list;
                  dbRes.save();
               }
            });
      
         }
      });
   }
};



module.exports = exportData;