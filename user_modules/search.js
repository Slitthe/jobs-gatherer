const colors = require('colors'); // package to easily use terminal colors for console.log(s)

// endpoint URL request creator given the: QUERY, LOCATION and PAGE for a site
var getUrls = function () {
   // base urls
   var urls = {
      ejobs: 'https://www.ejobs.ro/locuri-de-munca/',
      bestjobs: 'https://www.bestjobs.eu/ro/locuri-de-munca/relevant/',
   };
   // final URL constructed
   var reqUrls = function (page, query, location, site) {
      site = site.toLowerCase();
      query = encodeURI(query); // make the query URL-friendly
      var siteUrls = { // URL constructors for each site
         ejobs: urls.ejobs + location + '/' + query + '/page' + page + '/',
         bestjobs: urls.bestjobs + page + '?keyword=' + query + '&location=' + location
      };
      return siteUrls[site]; // result of the constructor for the input 'site'
   };
   
   return reqUrls;
}();

// sites-specific HTML string response parsers
var parse = function () {
   // expressions used for parsing as a private variables in a function closure
   var expressions = {
      removeWs: /\n|\r/gim, // remove whitespace so the RegExp won't need multi-line input
      ejobs: {
         items: /dataLayerItemLink.*?<\/a>/gi, // find the job results, the RegExp which captures each href and name for a job listing
         href: /href="(.*?)"/gi, // find the link of that job result
         name: />(.*?)<\/a>/gi // name of the job ad title
      },
      bestjobs: {
         items: /job-title.*?<\/a>/gi,
         href: /href="(.*?)\?/gi,
         name: /<strong.*?>(.*?)<\/strong>/gi
      }
   };

   var parseData = function (data) {
      var htmlString = data.str; // the response HTML (as a string)
      var site = data.site; // what site this HTML came from


      htmlString = htmlString.replace(expressions.removeWs, ' '); // remove white space (to not need to work multi-line in RegExp)
      var exp = expressions[site]; // get the expressions object for the input site

      // Uses the 'items' expression to determine how many results are on the page
      items = htmlString.match(exp.items);

      if (items) {
         // if results were found, replace each member of the 'items' array with {title: String, url: String} type of results
         items = items.map(function (curr) {
            var href = curr.match(exp.href)[0]; // get the part which contains the url
            href = href.replace(exp.href, '$1'); // actually extract the url with RegExp capture groups and .replace()

            var name = curr.match(exp.name)[0];
            name = name.replace(exp.name, '$1');

            return { title: name, url: href };
         });
      }

      return items;
   };

   return parseData;
}();


// invokes the necessary functions needed to start the search feature with the right values
var starter = function (argObj) {
   let valuesList = function(values) {
      this.index = 0;
      this.values = values;
   };
   valuesList.prototype.getValue = function() {
      return this.values[this.index];
   };
   argObj.data.getData(
      {
         models: argObj.db.models,
         callback: function (dataRes) {
            dataRes.sites.forEach(function (site) {
               argObj.db.models.value.findOne({ site: site }, function (err, dbValues) {
                  let searchParams = { // create a default values for the search parameters
                     site: site,
                     tryCount: 1,
                     queries: new valuesList(dataRes.queries),
                     locations: new valuesList(dataRes.locations),
                     page: 1,
                     push: argObj.push
                  };

                  if (!err && dbValues) { // update the search parameters if there are DB results for it
                     // in case the stored DB value is an inexistent item (deleted), then default that index to 0
                     let   locationIndex = dataRes.locations.indexOf(dbValues.location);
                           searchParams.locations.index = locationIndex !== -1 ? locationIndex : 0;

                     let   queryIndex = dataRes.queries.indexOf(dbValues.query);
                           searchParams.queries.index = queryIndex !== -1 ? queryIndex : 0;

                     searchParams.page = queryIndex !== -1 ? dbValues.page : 1;
                  }
                  // call the repeater search function with the appropiate values (default ones or DB)
                  argObj.search.infiniteRepeat({
                     searchParams: searchParams,
                     data: dataRes,
                     models: argObj.db.models,
                     request: argObj.request,
                     parse: argObj.search.parse,
                     addResults: argObj.db.methods.addResults,
                     repeat: argObj.search.repeat,
                     duplicateChecker: argObj.helpers.duplicateChecker,
                     removeExpired: argObj.db.methods.removeExpired,
                     saveValues: argObj.db.methods.saveValues,
                     randomRange: argObj.helpers.randomRange,
                     run: argObj.search.run
                  });

               }); // models values find
            }); // sites loop
         } // callback
      } // getData obj argument


   ); // getData end
};

// incrementor and repeater for the search
var repeat = function (argObj, func, increment) {
   let params = argObj.searchParams;
   // works like the incrementor functionality in a 2 tier nested for loops, goes goes back to the front when it reaches the end
   if (increment) {
      if (params.queries.index < params.queries.values.length - 1) {
         params.queries.index++;
      } else {
         if (params.locations.index < params.locations.values.length - 1) {
            params.locations.index++;
         } else {
            params.locations.index = 0;
         }
         params.queries.index = 0;
      }
   }

   // delayed search caller
   argObj.run.runTimeout.push(setTimeout(function () { // saves this timeout so it can be cancelled if the search is stopped
      func(argObj);
   }, argObj.randomRange(10000, 10000))); //230000, 380000
};


// performs the actual search and calls the 'repeat' with the appropiate arguments
function infiniteRepeat(argObj) {
   let params = argObj.searchParams;
   if (argObj.run.continue) { // prevents running if serach is stopped
      argObj.removeExpired(argObj.models, argObj.data.sites); // remove any expired DB entries
      argObj.saveValues(params, argObj.models); // save indices of the search paramaters & current page to DB

      var url = getUrls(params.page, params.queries.getValue(), params.locations.getValue(), params.site); // create req URL

      console.log(colors.cyan.bold('QUERY: ') + colors.underline(params.queries.getValue()) + colors.cyan.bold('   LOCATION: ') + colors.underline(params.locations.getValue()) + colors.cyan.bold('   PAGE:') + colors.underline(params.page));

      argObj.request(url, function (err, response, body) { // makes the request

         if (!err && response.statusCode === 200) { // successful request
            params.tryCount = 1;
            let   parsed = argObj.parse({ str: body, site: params.site }); // parsed HTML response to extract the jobs listing (if any)
            if (parsed) { // 1 or more results (otherwise parsed is null)
               argObj.addResults(
                  {
                     site: params.site,
                     location: params.locations.getValue(),
                     parsed: parsed,
                     models: argObj.models,
                     duplicateChecker: argObj.duplicateChecker
                  }
               );
               params.page++; // increment the page
               argObj.repeat(argObj, infiniteRepeat, false); // but DO NOT increment queries/locations
            } else {
               // no results found
               params.page = 1; // reset the page
               argObj.repeat(argObj, infiniteRepeat, true); // increment the queries/locations when there are no results for the current page
            }
            params.push('update', { // send a SSE for status update on the front-end
               query: params.queries.getValue(),
               location: params.locations.getValue(),
               page: params.page,
               site: params.site
            });


         } else {
            // request error
            if (params.tryCount < 3) { // try again for a maximum of 'n' times (curent: 3)
               params.tryCount++;
               argObj.repeat(argObj, infiniteRepeat, false);
            } else { // skip for the next item in the queries/locations when too many attempted tries failed
               params.tryCount = 1;
               argObj.repeat(argObj, infiniteRepeat, true);
            }
         }
      });
   }
}

// search run info and actions related start/stop actions
var run = {
   continue: true,
   runTimeout: [], 
   cancel: function (push) { // cancels the search and notifies the front end via SSE
      this.continue = false;
      if (this.runTimeout.length) {
         this.runTimeout.forEach(function (crTimeout) {
            clearTimeout(crTimeout);
         });
      }
      this.runTimeout = [];
      if (push) {
         push('stoppedStatus', 'true');
      }
   },
   start: function (argsObj) { // starts the search and notifies the front end via SSE
      if (!this.isRunning) {
         this.continue = true;
         argsObj.runner(argsObj.args);
         if (argsObj.hasOwnProperty('push')) {
            argsObj.push('stoppedStatus', 'false');
         }
      } else {
      }
   },
   get isRunning() { // get running state information
      return !!(this.continue && this.runTimeout);
   }
};

module.exports = {
   infiniteRepeat: infiniteRepeat,
   repeat: repeat,
   starter: starter,
   getUrls: getUrls,
   parse: parse,
   run: run
};