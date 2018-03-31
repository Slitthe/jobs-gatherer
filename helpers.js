// checks an array of objects for the existance of a property
var duplicateChecker = function(from, checked, property) {
   let value = from[property],
       isDuplicate = false,
       l = checked.length;
      
   for(let i = 0; i < l; i++) {
      if (value === checked[i][property]) {
         isDuplicate = true;
         break;
      }
   }

   return isDuplicate; // true if there IS a duplicate
};


// Simple pseudo-random numbers range generator [start, finish] (includes extremities)
var randomRange = function (start, finish) {
   const difference = finish - start;
   return Math.round(Math.random() * difference) + start;
};

// Splits the DB data by their type: 'default', 'saved' or 'deleted'
var dataSplitter = function(items) {
   let types = {
      deleted: [],
      saved: [],
      default: []
   };
   let typesKeys = Object.keys(types);

   items.forEach(function(item) {
      types[item.filterCat].push(item);
   });
   return types;
};

var removeExpired = function(models, sites) {
   sites.forEach(function(site) {
      console.log(site);
      models[site].find({}, function(err, results) {
         console.log(results.length);
         if(!err) {
            results.forEach(function(result) {
               if(results.filterCat !== 'saved') {
                  console.log(result.updateDate.getTime());
                  
                  if (Date.now() >= result.updateDate.getTime() + 36000) {
                     console.log(result._id);
                     models[site].findByIdAndRemove(result._id);
                     console.log('Expired item removed');
                  }
               }
            });
         }
      });
   });
};


module.exports = {
   duplicateChecker: duplicateChecker,
   randomRange: randomRange,
   dataSplitter: dataSplitter,
   removeExpired: removeExpired
};