var parse = function () {
   var expressions = {
      removeWs: /\n|\r/gim,
      ejobs: {
         href: /href="(.*?)"/gi,
         name: />(.*?)<\/a>/gi,
         items: /dataLayerItemLink.*?<\/a>/gi
      },
      bestjobs: {
         href: /href="(.*?)\?/gi,
         name: /<strong.*?>(.*?)<\/strong>/gi,
         items: /job-title.*?<\/a>/gi
      }
   }

   // DOESN'T WORK
   var parseData = function (data) {
      var htmlString = data.str;
      var site = data.site;

      // Expressions
      htmlString = htmlString.replace(expressions.removeWs, ' ');
      var exp = expressions[site];
      console.log(exp);

      // remove whitespace
      htmlString = htmlString.replace(/\n|\r/gim, ' ');

      // Search for jobs posts
      items = htmlString.match(exp.items);

      if (items) {
         items = items.map(function (curr) {
            var href = curr.match(exp.href)[0];
            href = href.replace(exp.href, '$1')
            var name = curr.match(exp.name)[0];
            name = name.replace(exp.name, '$1');
            return { title: name, url: href };
         });
      }

      return items;
   };

   return parseData;
}();

module.exports = parse;