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


module.exports = {
   duplicateChecker: duplicateChecker,
   randomRange: randomRange
};