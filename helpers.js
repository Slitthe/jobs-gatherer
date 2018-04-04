var models = require('./models');
// checks an array of objects for the existance of a property
var duplicateChecker = function(source, targets, property) {
   /* 
      Input: source--> the source object
             targets --> the target object
             property --> the property of the source ( source[property] ) that the targets are checked against for duplicity
   */
   let value = source[property],
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


// Simple pseudo-random numbers range generator [start, finish] (includes extremities)
var randomRange = function (start, finish) {
   const difference = finish - start;
   return Math.round(Math.random() * difference) + start;
};

var dbAdd = function (site, place, parsed) {
   models[site].find({}, function (err, dbRes) {
      // Gets dbRes about the listings in the DB to compare duplication
      if (dbRes) {
         parsed.forEach(function (current) {
            if (!helpers.duplicateChecker(current, dbRes, 'url')) { // doesn't add the listing if it already exists in the DB
               models[site].create({
                  url: current.url,
                  title: current.title,
                  city: place
               });
            } else { // if it already exists, just 
               models[site].findOne({ url: current.url }, function (err, dbRes) {
                  if (!err && dbRes) {
                     dbRes.updateDate = Date.now();
                     dbRes.save();
                  }
               })
            }
         });
      }
   });
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
      models[site].find({}, function(err, results) { // find all the results for this given site
         if(!err) { // check for DB communication error
            results.forEach(function(result) {
               if(result.filterCat !== 'saved') { // ignore 'saved' items
                  if (Date.now() >= result.updateDate.getTime() + 604800000) { // check for expiry date
                     // remove & save
                     result.remove();
                     result.save();
                  }
               }
            });
         }

      });
   });
};

var repeat = function (obj, data, toIncrement, func) {
   if (toIncrement) {
      if (obj.queries.index < obj.queries.values.length - 1) {
         obj.queries.index++
      } else {
         if (obj.places.index < obj.places.values.length - 1) {
            obj.places.index++;
         } else {
            obj.places.index = 0;
         }
         obj.queries.index = 0;
      }
   };
   

   setTimeout(function () {
      func(obj, data);
   }, helpers.randomRange(50000, 50000));
   // setTimeout(function () {
   //    func(obj, data);
   // }, helpers.randomRange(230000, 380000));
};

var saveValues = function(saveObj) {
   models.value.findOne({ site: saveObj.site }, function (err, data) { // add values
      if (!err && data) {
         data.keyword = saveObj.queries.index;
         data.city = saveObj.places.index;
         data.page = saveObj.page;
         data.save();
      } else {
         models.value.create({ site: saveObj.site });
      }
   });
};


module.exports = {
   duplicateChecker: duplicateChecker,
   randomRange: randomRange,
   dataSplitter: dataSplitter,
   removeExpired: removeExpired,
   repeat: repeat,
   dbAdd: dbAdd,
   saveValues: saveValues
};