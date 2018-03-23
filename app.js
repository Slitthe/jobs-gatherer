var   express = require('express'),
		app = express();
		mongoose = require('mongoose');
		request = require('request');

	

// App logic
var getUrls = function() {
	var urls = {
		ejobs: 'https://www.ejobs.ro/locuri-de-munca/',
		// https://www.ejobs.ro/locuri-de-munca/brasov/web%20developer/page2/
		bestjobs: 'https://www.bestjasdasobs.eu/ro/locuri-de-munca/relevant/',
		// https://www.bestjobs.eu/ro/locuri-de-munca/relevant/3?keyword=web%20developer&location=brasov
	}
	var reqUrls = function(page, query, city, site) {
		var url = '';

		site = site.toLowerCase();
		query = encodeURI(query);

		if(site === 'ejobs') {
			url = urls.ejobs + city + '/' + query + '/page' + page + '/';
		} else {
			url = urls.bestjobs + page + '?keyword=' + query + '&location=' + city;
		}
		return url;
	};

	return reqUrls;
}();

var parse = function() {
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
	var parseData = function(data) {
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
							return { name: name, href: href };
					});
			}

			return items;
	};

	return parseData;
}();

request(getUrls(1, 'web developer', 'brasov', 'bestjobs'), function(err, data) {
	if(!err) {
			console.log(getUrls(1, 'web developer', 'brasov', 'bestjobs'));
		
		console.log(parse({
			str: data.body,
			site: 'bestjobs'
		}));

	}
})





// Routes
app.get('/', function(req, res) {
	// the list of jobs should appear here
});

// express listening start
app.listen(3000, function() {
	console.log('The app has started');
});



