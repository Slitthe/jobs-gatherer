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


// Splits the data by category and city
/* 
return FORMAT:  >>
            type: {
               filterType: {
                  city: [item1, item2 ....],
                  ...
               }....
            }
*/
var dataSplitter = function(items) {

   let types = {
      deleted: {},
      saved: {},
      default: {}
   };
   let typesKeys = Object.keys(types);

   items.forEach(function(item) {
      types[item.filterCat] = types[item.filterCat] || [];
      types[item.filterCat][item.city] = types[item.filterCat][item.city] || [];
      types[item.filterCat][item.city].push(item);
   });
   return types;
};


// Removes every item in the DB (except the filterCat === 'saved' items) if they have passed an expiry date (7 days from update)
var removeExpired = function(models, sites) {

   sites.forEach(function(site) {

      models[site].find({}, function(err, results) {
         if(!err) {
            var l = 0;
            results.forEach(function(result) {
               if(result.filterCat !== 'saved') {
                  l++;
                  if (Date.now() >= result.updateDate.getTime() + 604800000) {
                     result.remove();
                     result.save();
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