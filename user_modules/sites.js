const colors = require('colors'),
      sls = require('single-line-string');


// Contains any unique data needed to add a new site (parser, URL constructor and its name)

let exportData = {};
// The sites to search in, needs to match all the other variable/prop names where they are also used
exportData.sites = [
   'ejobs',
   'bestjobs',
   'hipo',
   'olx'
];

// sites-specific HTML string response parsers
exportData.parse = function () {
   // expressions used for parsing as a private variables in a function closure
   var expressions = function(query)
   {
     var exps = {
         removeWs: /\n|\r?\n|\r/g, // remove whitespace so the RegExp won't need multi-line input
         ejobs: {
            items: /dataLayerItemLink.*?<\/a>/gi, // find the job results, the RegExp which captures each href and name for a job listing
            href: /href="(.*?)"/gi, // find the link of that job result
            name: />(.*?)<\/a>/gi // name of the job ad title
         },
         bestjobs: {
            items: /job-title.*?<\/a>/gi,
            href: /href="(.*?)\"/gi,
            name: /<strong.*?>(.*?)<\/strong>/gi
         },
         hipo: {
            items: /itemtype=\"http:\/\/schema.org\/JobPosting\".*?<\/span>/gi,
            href: /href=\"(.*?)\"/gi,
            name: /itemprop=\"title\">(.*?)</gi,
         },
         olx: {
            items: /<td class=\"offer.*?<h3 class="title".*?<\/h3>/gi,
            href: /href="(.*?)"/gi,
            name: /<strong>(.*?)<\/strong>/gi,
            wrappers: [
               // 'class="breadcrumb.*?h1 class="small.*?ANUNTURI LOCURI DE MUNCA.*?' + query +'.*<\/h1>.*?<\/html>'
               new RegExp('class="breadcrumb.*?h1 class="small.*?ANUNTURI LOCURI DE MUNCA.*?' + query + '.*<\/h1>.*?<\/html>', 'gi'),
               /summary="anunturi\".*?<\/table>/gi
            ]
         }
      };

      return exps;
   };

   var parseData = function (data, baseUrls, query) {
      var htmlString = data.str; // the response HTML (as a string)
      var site = data.site, // what site this HTML came from
      items;


      htmlString = sls`${htmlString}?`; // remove white space (to not need to work multi-line in RegExp)

     var exp = expressions(query)[site]; // get the expressions object for the input site
      
      // Uses the 'items' expression to determine how many results are on the page
      if(exp.hasOwnProperty('wrappers')) { // for sites where the actual relevant results are in a specific wrapper
         exp.wrappers.forEach(function(wrapperExp) {
            // console.log('\n\n\n\n\n\n\n\n');
            let currentMatch = htmlString.match(wrapperExp);
            htmlString = currentMatch ? currentMatch[0] : '';
            // console.log(currentMatch);
         });
      }
      
      items = htmlString.match(exp.items);
      if (items) {
         // if results were found, replace each member of the 'items' array with {title: String, url: String} type of results
         items = items.map(function (curr) {
            var href = curr.match(exp.href); // get the part which contains the url
            var name = curr.match(exp.name);
            if(href === null || name === null) {
               console.log(colors.red.bold('One of the parsers for the site: ' + colors.underline(site) + ' is broken'.toUpperCase()));
            }
            
            href = href[0].replace(exp.href, '$1'); // actually extract the url with RegExp capture groups and .replace()
            href = href.substring(0, 4) !== 'http' ? baseUrls[site] + href : href; // relative --> absolute link converter
            name = name[0].replace(exp.name, '$1');

            return { title: name, url: href };
         });
      }

      
      return items;
   };
   return parseData;
}();


// endpoint URL request creator given the: QUERY, LOCATION and PAGE for a site
exportData.getUrls = function (baseUrls) {
   // base urls
   var urls = {
      ejobs: 'https://www.ejobs.ro',
      bestjobs: 'https://www.bestjobs.eu/ro',
      hipo: 'https://www.hipo.ro',
      olx: 'https://www.olx.ro'
   };
   // final URL constructed
   var reqUrls = function (page, query, location, site) {
      site = site.toLowerCase();
      query = encodeURI(query); // make the query URL-friendly
      var siteUrls = { // URL constructors for each site
         ejobs: urls.ejobs + '/locuri-de-munca/' + location + '/' + query + '/page' + page + '/',
         bestjobs: urls.bestjobs + '/locuri-de-munca/relevant/' + page + '?keyword=' + query + '&location=' + location,
         hipo: urls.hipo + '/locuri-de-munca/cautajob/Toate-Domeniile/' + query + '/' + location + '/' + page,
         olx: urls.olx + '/locuri-de-munca/' + location + '/q-' + query + '?page=' + page
      };
      return siteUrls[site]; // result of the constructor for the input 'site'
   };

   return {
      reqUrls: reqUrls,
      baseUrls: urls
   };
}();

module.exports = exportData;