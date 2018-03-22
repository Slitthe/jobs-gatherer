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
   }
   return {
      reqUrls: reqUrls
   }
}();

request('https://www.ejobs.ro/locuri-de-munca/bucuresti/web%20dev/page1/', function(err, res, data) {
   data = data;
   var hrefExp = /href=('|")(.*?)('|")/gi;
   var nameExp = />(.*?)(<\/a>)/gi;
   var items = data.match(/datalayeritemlink.*?>(.*?)(<\/a>)/gi);
   items = items.map(function(curr) {
      curr.replace();
      var href = curr.match(hrefExp)[0];
      href = href.replace(hrefExp, '$2')
      var name = curr.match(nameExp)[0];
      name = name.replace(nameExp, '$1');
      return {name: name, href: href};
   });
});



// Routes
app.get('/', function(req, res) {
   // the list of jobs should appear here
});

// express listening start
app.listen(3000, function() {
   console.log('The app has started');
});