// Contains any unique data needed to add a new site (parser, URL constructor and its name)

let exportData = {};
// The sites to search in, needs to match all the other variable/prop names where they are also used
exportData.sites = [
   'ejobs',
   'bestjobs'
];

// sites-specific HTML string response parsers
exportData.parse = function () {
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


// endpoint URL request creator given the: QUERY, LOCATION and PAGE for a site
exportData.getUrls = function () {
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

module.exports = exportData;