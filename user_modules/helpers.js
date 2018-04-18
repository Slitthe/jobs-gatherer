
                     /* ================================================================ */
                     /* ====================GENERAL HELPER FUNCTIONS==================== */
                     /* ================================================================ */


// Simple pseudo-random numbers range generator [start, finish] (includes extremities)
var randomRange = function (start, finish) {
   let difference = finish - start;
   return Math.round(Math.random() * difference) + start;
};

// checks an array of objects for the existance of a property
var duplicateChecker = function(source, targets, property) {
   /* 
      Input: source--> the source object
             targets --> the targets object
             property --> the property of the source ( source[property] ) that the targets are checked against for duplicity
   */
   var   value = source[property],
         isDuplicate = false,
         l = targets.length;
      
   for(let i = 0; i < l; i++) {
      if (value === targets[i][property]) {
         isDuplicate = true;
         break;
      }
   }

   // if any one of the targets contain a target[property] === source[property], then the boolean return is true
   return isDuplicate; // true if there IS a duplicate
};





// Splits the data by category and city, used for front end display of items in the right container
/* 
return FORMAT:  >>
            type: {
               filterType: {
                  city: [item1, item2 ....],
                  ...
               }....
            }
*/
var dataSplitter = function(items, dataTypes) {
   var types = {};
   dataTypes.forEach(function(type) {
      types[type] = {};
   })
   var typesKeys = Object.keys(types);

   items.forEach(function(item) {
      types[item.filterCat] = types[item.filterCat] || [];
      types[item.filterCat][item.city] = types[item.filterCat][item.city] || [];
      types[item.filterCat][item.city].push(item);
   });
   return types;
};



// appropiated buttons depending on the item's category ('saved', 'default', 'deleted')
var btnGroups = function (type) {
   var buttonCreators = function (type, cls, iType, title) {
      var buttonHtml = '<button type="button" class="px-3 btn btn-' + type + ' ' + cls;
      buttonHtml += '" title="' + title + '"> <i class="fa fa-' + iType + '"></i></button>';
   
      return buttonHtml;
   };

   var titles = {
      trash: 'Move this result to the trash area.',
      save: 'Move this result to the saved area.',
      restore: 'Remove this result from the deleted area'
   };
   return {
      saved: (function () {
         return buttonCreators('danger', 'delete-btn', 'trash', titles.trash);
      })(),
      default: (function () {
         return buttonCreators('success', 'save-btn', 'floppy-o', titles.save) + buttonCreators('danger', 'delete-btn', 'trash', titles.trash);
      })(),
      deleted: (function () {
         return buttonCreators('success', 'save-btn', 'floppy-o', titles.save) + buttonCreators('secondary', 'restore-btn', 'undo', titles.restore);
      })()
   };
}();




module.exports = {
   duplicateChecker: duplicateChecker,
   randomRange: randomRange,
   dataSplitter: dataSplitter,
   btnGroups: btnGroups,
};