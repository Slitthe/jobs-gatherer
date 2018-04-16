var models = require('./models');
var data = require('./data');
var parse = require('./parser');
var request = require('request');
var colors = require('colors');
// Simple pseudo-random numbers range generator [start, finish] (includes extremities)
var randomRange = function (start, finish) {
   const difference = finish - start;
   return Math.round(Math.random() * difference) + start;
};

// checks an array of objects for the existance of a property
var duplicateChecker = function(source, targets, property) {
   /* 
      Input: source--> the source object
             targets --> the targets object
             property --> the property of the source ( source[property] ) that the targets are checked against for duplicity
   */
   var value = source[property],
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



// add results to the DB
var dbAdd = function (argObj) {
   // site, place, parsed, models
   argObj.models[argObj.site].find({}, function (err, dbRes) {
      // Gets dbRes about the listings in the DB to compare duplication
      if (dbRes) {
         argObj.parsed.forEach(function (current) {
            if (!duplicateChecker(current, dbRes, 'url')) { // doesn't add the listing if it already exists in the DB
               argObj.models[argObj.site].create({
                  url: current.url,
                  title: current.title,
                  city: argObj.place
               });
            } else { // if it already exists, just 
               argObj.models[argObj.site].findOne({ url: current.url }, function (err, dbRes) {
                  if (!err && dbRes) {
                     dbRes.updateDate = Date.now();
                     dbRes.save();
                  }
               });
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


// Removes every item in the DB (except the filterCat === 'saved' items) if they have passed an expiry date (7 days from update)
var removeExpired = function(models, sites) {
   sites.forEach(function(site) {
      models[site].find({}, function(err, results) { // find all the results for this given site
         if(!err) { // check for DB communication error
            results.forEach(function(result) {
               if(result.filterCat !== 'saved') { // ignore 'saved' items
                  if (Date.now() >= result.updateDate.getTime() + 604800000) { // 604800000
                     result.remove();
                     result.save();
                  }
               }
            });
         }

      });
   });
};

var repeat = function (argObj, func, increment) {
   // console.log(args);
   let params = argObj.searchParams;
   if (increment) {
      if (params.queries.index < params.queries.values.length - 1) {
         params.queries.index++;
      } else {
         if (params.places.index < params.places.values.length - 1) {
            params.places.index++;
         } else {
            params.places.index = 0;
         }
         params.queries.index = 0;
      }
   }

   

   argObj.data.run.runTimeout.push( setTimeout(function () {
      func(argObj);
   }, randomRange(10000, 10000)) ); //230000, 380000
};

// save the current search location values to the DB
var saveValues = function(saveObj, models) {
   models.value.findOne({ site: saveObj.site }, function (err, data) {
      if (!err && data) {
         data.keyword = saveObj.queries.values[saveObj.queries.index];
         data.city = saveObj.places.values[saveObj.places.index];
         data.page = saveObj.page;
         data.save();
      } else {
         models.value.create({ site: saveObj.site });
      }
   });
};

var buttonCreators = function (type, cls, iType, title) {
   var buttonHtml = '<button type="button" class="px-3 btn btn-' + type + ' ' + cls;
   buttonHtml += '" title="' + title + '"> <i class="fa fa-' + iType + '"></i></button>';

   return buttonHtml;
};

var btnGroups = function (type) {
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


var starter = function (argObj) {
   // var starter = function (data, models, runFunc, push, request, parse, dbAdd, repeat) {
   argObj.data.getData(
      {
         models: argObj.models,
         keywords: argObj.data.keywords,
         cities: argObj.data.cities,
         callback: function (dataRes) {
            argObj.data.sites.forEach(function (site) {
               models.value.findOne({ site: site }, function (err, values) {
                  let searchParams = { // create a default values for the search parameters
                     site: site,
                     tryCount: 1,
                     queries: {
                        values: dataRes.keywords,
                        index: 0
                     },
                     places: {
                        values: dataRes.cities,
                        index: 0
                     },
                     page: 1,
                     push: argObj.push
                  };
                  if (!err && values) {
                     let cityIndex = dataRes.cities.indexOf(values.city);
                     cityIndex = cityIndex !== -1 ? cityIndex : 0;
                     let keywordIndex = dataRes.keywords.indexOf(values.keyword);
                     keywordIndex = keywordIndex !== -1 ? keywordIndex : 0;

                     searchParams.queries.index = keywordIndex;
                     searchParams.places.index = cityIndex;
                     searchParams.page = values.page;
                  }
                  // argObj.runFunc(searchParams, argObj.data, argObj.models, argObj.request, argObj.parse, argObj.dbAdd, argObj.repeat);
                  argObj.runFunc({
                     searchParams: searchParams,
                     data: argObj.data,
                     models: argObj.models,
                     request: argObj.request,
                     parse: argObj.parse,
                     dbAdd: argObj.dbAdd,
                     repeat: argObj.repeat
                  });
                  
               }); // models values find
            }); // sites loop
         } // callback
      } // getData obj argument


   ); // getData end
};

// Endpoint creator given the: query, city and page for a site
var getUrls = function() {
   // base urls
   var urls = {
      ejobs: 'https://www.ejobs.ro/locuri-de-munca/',
      // Example: https://www.ejobs.ro/locuri-de-munca/brasov/web%20developer/page2/
      bestjobs: 'https://www.bestjobs.eu/ro/locuri-de-munca/relevant/',
      // Example: https://www.bestjobs.eu/ro/locuri-de-munca/relevant/3?keyword=web%20developer&location=brasov
   };
   var reqUrls = function (page, query, city, site) {
      var url = '';

      site = site.toLowerCase();
      query = encodeURI(query); // make the keyword URL-friendly
      var siteUrls = { // URL constructors for each site
         ejobs: function () {
            return urls.ejobs + city + '/' + query + '/page' + page + '/';
         },
         bestjobs: function () {
            return urls.bestjobs + page + '?keyword=' + query + '&location=' + city;
         }
      };
      return siteUrls[site](); // result of the constructor for the input 'site'
   };

   return reqUrls;
}();

function infiniteRepeat(argObj) {
   let params = argObj.searchParams;
// function infiniteRepeat(obj, data, models, request, parse, dbAdd, repeat) {
   /*                  data: data,
                  models: models,
                  runFunc: helpers.infiniteRepeat,
                  push: push,
                  parse: parser,
                  request: request,
                  dbAdd: data.dbAdd,
                  repeat: helpers.repeat */

   if (argObj.data.run.continue) {
      removeExpired(models, data.sites); // remove any expired DB entries
      saveValues(params, models); // save indices & page to DB
      
      var url = getUrls(params.page, params.queries.values[params.queries.index], params.places.values[params.places.index], params.site); // req URL
      
      argObj.request(url, function (err, response, body) {

         if (!err && response.statusCode === 200) { // successful request
            params.tryCount = 1;
            let parsed = argObj.parse({
               str: body,
               site: params.site
            }); // parsed HTML request to extract the jobs listing (if any)
            if (parsed) { // 1 or more results (otherwise parsed is null)
               argObj.dbAdd(
                  {
                     site: params.site,
                     places: params.places.values[params.places.index],
                     parsed: parsed,
                     models: models
                  }
               );
               // dbAdd(obj.site, obj.places.values[obj.places.index], parsed, models);

               // obj.push('cities', obj.places.values[obj.places.index]);

               params.page++; // increment the page
               argObj.repeat(argObj, infiniteRepeat, false); // but DO NOT increment queries/places
            } else {
               // no results found

               params.page = 1; // reset the page

               argObj.repeat(argObj, infiniteRepeat, true); // increment the queries/places when there are no results for the current page
            }
            params.push('update', {
               query: params.queries.values[params.queries.index],
               place: params.places.values[params.places.index],
               page:params.page,
               site: params.site
            });
            

         } else {
            // request error
            if (params.tryCount < 3) { // try again for a maximum of 'n' times (curent: 3)
               params.tryCount++;
               argObj.repeat(argObj, infiniteRepeat, false);
            } else { // skip for the next item in the location/keywords when too many attempted tries failed
               params.tryCount = 1;
               argObj.repeat(argObj, infiniteRepeat, true);
            }
         }
      });
   }
}





module.exports = {
   duplicateChecker: duplicateChecker,
   randomRange: randomRange,
   dataSplitter: dataSplitter,
   removeExpired: removeExpired,
   repeat: repeat,
   dbAdd: dbAdd,
   saveValues: saveValues,
   btnGroups: btnGroups,
   starter: starter,
   infiniteRepeat: infiniteRepeat,
   getUrls: getUrls
};