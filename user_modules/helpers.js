//                      |||||                                        |||||                    //
// =====================|||||        General HELPER functions        |||||=====================
//                      |||||                                        |||||                    //


// Simple pseudo-random numbers range generator [start, finish] (includes extremities)
var randomRange = function (start, finish) {
   let difference = finish - start;
   return Math.round(Math.random() * difference) + start;
};

// checks an array of objects for a property/value that is found in a single source object
var duplicateChecker = function(source, targets, property) {
   /* 
      Input: source--> the source object
             targets --> the targets array
             property --> the property of the source ( source[property] ), that each target is checked against for duplicity
   */
   var   value = source[property],
         isDuplicate = false,
         l = targets.length;
      
   for(let i = 0; i < l; i++) {
      if (value === targets[i][property]) {
         // 1 value is enough for duplication check
         isDuplicate = true;
         break;
      }
   }

   return isDuplicate;
};





// Splits the data by category and location, used for front end display of items in the right container
/* 
return FORMAT >>
            type: {
                  location: [item1, item2 ....],..
               }
            },..
*/
var dataSplitter = function(items, dataTypes) {
   var types = {};
   dataTypes.forEach(function(type) {
      types[type] = {};
   });
   var typesKeys = Object.keys(types);

   items.forEach(function(item) {
      // creates empty arrays for type/location unless that already exists
      types[item.filterCat] = types[item.filterCat] || [];
      types[item.filterCat][item.location] = types[item.filterCat][item.location] || [];
      // for given type/location, pushes that item who matches it
      types[item.filterCat][item.location].push(item);
   });
   return types;
};



// creates appropiate buttons depending on the item's category ('saved', 'default', 'deleted'), EJS usage
var btnGroups = function (type) {
   // single button 'template'
   var buttonCreators = function (type, cls, iType, title) {
      var   buttonHtml = '<button type="button" class="px-3 btn btn-' + type + ' ' + cls;
            buttonHtml += '" title="' + title + '"> <i class="fa fa-' + iType + '"></i></button>';
   
      return buttonHtml;
   };

   // HTML 'title' attributes
   var titles = {
      trash: 'Move this result to the trash area.',
      save: 'Move this result to the saved area.',
      restore: 'Remove this result from the deleted area'
   };

   // combine the above variables to create the inner contents of a button group
   return {
      saved: buttonCreators('danger', 'delete-btn', 'trash', titles.trash),
      default: buttonCreators('success', 'save-btn', 'floppy-o', titles.save) + buttonCreators('danger', 'delete-btn', 'trash', titles.trash),
      deleted: buttonCreators('success', 'save-btn', 'floppy-o', titles.save) + buttonCreators('secondary', 'restore-btn', 'undo', titles.restore)
   };
}();


module.exports = {
   duplicateChecker: duplicateChecker,
   randomRange: randomRange,
   dataSplitter: dataSplitter,
   btnGroups: btnGroups,
};