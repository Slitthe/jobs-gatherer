// sites-specific HTML string parsers
var parse = function () {
   var expressions = {
      removeWs: /\n|\r/gim, // remove whitespace so the RegExp won't need multi-line input
      ejobs: {
         items: /dataLayerItemLink.*?<\/a>/gi, // find the job results
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


      htmlString = htmlString.replace(expressions.removeWs, ' '); // remove White space
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

            return { title: name, url: href }; // returns the captured title and href
         });
      }

      return items;
   };

   return parseData;
}();

module.exports = parse;