// Endpoint creator given the: query, city and page for a site
var getUrls = function () {
   // base urls
   var urls = {
      ejobs: 'https://www.ejobs.ro/locuri-de-munca/',
      // Example: https://www.ejobs.ro/locuri-de-munca/brasov/web%20developer/page2/
      bestjobs: 'https://www.bestjobs.eu/ro/locuri-de-munca/relevant/',
      // Example: https://www.bestjobs.eu/ro/locuri-de-munca/relevant/3?keyword=web%20developer&location=brasov
   }
   var reqUrls = function (page, query, city, site) {
      var url = '';

      site = site.toLowerCase();
      query = encodeURI(query); // make the keyword URL-friendly
      var siteUrls = { // URL constructors for each site
         ejobs: function(){
            return urls.ejobs + city + '/' + query + '/page' + page + '/';
         },
         bestjobs: function(){
            return urls.bestjobs + page + '?keyword=' + query + '&location=' + city;
         }
      }
      return siteUrls[site](); // result of the constructor for the input 'site'
   };

   return reqUrls;
}();

module.exports = getUrls;