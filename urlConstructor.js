var getUrls = function () {
   var urls = {
      ejobs: 'https://www.ejobs.ro/locuri-de-munca/',
      // https://www.ejobs.ro/locuri-de-munca/brasov/web%20developer/page2/
      bestjobs: 'https://www.bestjobs.eu/ro/locuri-de-munca/relevant/',
      // https://www.bestjobs.eu/ro/locuri-de-munca/relevant/3?keyword=web%20developer&location=brasov
   }
   var reqUrls = function (page, query, city, site) {
      var url = '';

      site = site.toLowerCase();
      query = encodeURI(query);

      if (site === 'ejobs') {
         url = urls.ejobs + city + '/' + query + '/page' + page + '/';
      } else {
         url = urls.bestjobs + page + '?keyword=' + query + '&location=' + city;
      }
      return url;
   };

   return reqUrls;
}();

module.exports = getUrls;