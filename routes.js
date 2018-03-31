const models = require('./models');
      data = require('./data');

var routes = function(app) {
   app.get('/' ,function(req, res) {
     res.render('home', {data: data});
   });

   app.get('/:site', function(req, res) {
      const site = req.params.site;
      if(models[site]) {
         models[site].find({}, function(err, results) {
           if(!err) {
             if(data) {
               res.render('index', {results: results, site: site});
              } else {
                res.send('<h1>No Results</h1>')
              }
           } else {
             res.send('Error communicating with the DB');
           }
         });
      } else {
         res.send('<p>The site: <strong>' + site + '</strong> does not exist in the application\'s records');
      }

  //  });
  });

  app.put('/:site', function(req, res) {
    console.log(req.body);

    let site = req.params.site;
    if(models[site]) {
      console.log('site exists')
    }
  });
}

module.exports = routes;