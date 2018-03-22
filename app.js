var   express = require('express'),
      app = express();
      mongoose = require('mongoose');
      request = require('request');

   

// App logic
var getUrls = function() {
   var urls = {
      ejobs: 'https://www.ejobs.ro/locuri-de-munca/',
      bestjobs: 'https://www.bestjobs.eu/ro/locuri-de-munca/relevant/',
   }
   var reqUrls = function(page, query, city, site) {
      var url = '';
      query = encodeURI(query);
      if(site === 'ejobs') {
         url = urls.bestjobs + page + '?keyword=' + query + '&location=' + city;
      } else {
         url = urls.ejobs + city + '/' + query + '/page' + page + '/'  
      }
      return url;
   };

   return {
      reqUrls: reqUrls
   }
}();

var parsers = function() {
   var ejobs = function(htmlString) {
      var hrefExp = /href=('|")(.*?)('|")/gi;
      var nameExp = />(.*?)(<\/a>)/gi;
      var items = htmlString.match(/datalayeritemlink.*?>(.*?)(<\/a>)/gi);
      items = items.map(function (curr) {
         curr.replace();
         var href = curr.match(hrefExp)[0];
         href = href.replace(hrefExp, '$2')
         var name = curr.match(nameExp)[0];
         name = name.replace(nameExp, '$1');
         return { name: name, href: href };
      });
      return items;
   };

   var bestjobs = function(htmlString) {
      htmlString = data.replace(/(\n|\r)/gim, ' ');

      var hrefExp = /href=('|")(.*?)\?/gi;
      var nameExp = /<strong>(.*?)(<\/strong>)/gi;

      var items = data.match(/job-title.*?(<\/a>)/gim);
      items = items.map(function (curr) {
         var href = curr.match(hrefExp)[0];
         href = href.replace(hrefExp, '$2')
         var name = curr.match(nameExp)[0];
         name = name.replace(nameExp, '$1');
         return { name: name, href: href };
      });
      return items;
   };

   var parse = function(htmlStr) {
      // Gets rid of new lines to 'match' properly
      htmlStr = htmlStr.replace(/(\n|\r)/gim, ' ');
   }
}





// Routes
app.get('/', function(req, res) {
   // the list of jobs should appear here
});

// express listening start
app.listen(3000, function() {
   console.log('The app has started');
});



