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
   'ejobs'
   // 'bestjobs'
];


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
   runTimeout: null,
   cancel:  function() {
      this.continue = false;
      if(this.runTimeout) {
         clearTimeout(this.runTimeout);
      }
      this.runTimeout = null;
      console.log(this.continue, this.runTimeout)
   },
   start: function(runner, args) {
      if(this.isRunning) {
         this.continue = true;
         runner.apply(this, args);
      } else {
         console.log('The search is already running')
      }
   },
   get isRunning() {
      return !!(this.continue && this.runTimeout);
   }
};

exportData.updateValues = function (obj, models) {
   if(!this.runData.isRunning) {
      Object.keys(obj).forEach(function(type) {
         if( (type === 'keywords' || type === 'cities') && Array.isArray(obj[type])) {
            obj[type] = obj[type].filter(function(currentItem) {
               return typeof currentItem === 'string' && currentItem.length <= 60 && currentItem;
            });
            
            // models.searchData.findOneAndUpdate({type: type}, {$set: {list: obj[type]}},function(err, data) {
            //    if(!err && data) {
            //       obj[type].forEach(function(item) {
            //          exportData[type].push(item);
            //       });
            //    }
            // });

            models.searchData.findOne({type: type}, function(err, dbRes) {
               if (!err && dbRes) {
                  console.log(colors.yellow('------------------------------'), obj);
                  
                  obj[type].forEach(function (item) {
                     // if(dbRes.indexOf(item) > -1) {
                        dbRes.list.push(item.toLowerCase());
                     // }
                  });
                  exportData[type] = dbRes.list;
                  dbRes.save();
               }
            });
         }
      });
   }
}

module.exports = exportData;