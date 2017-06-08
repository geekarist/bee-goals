var request = require('request');
var cheerio = require('cheerio');

function qualify(path) {
	var rootUrl = 'https://www.beeminder.com';
	return rootUrl + path;
}

function displayGoal(url) {
	request(url, function (error, response, html) {
		var $ = cheerio.load(html);
		$('li.ratesum').each(function (index, item) {
			if (index == 0) return;
			console.log(url + ': ' + $(item).text().split('\n').join(': '));
		});
	});
}

request(qualify('/chrp'), function (error, response, html) {
	if (error) console.log(error);

	var $ = cheerio.load(html);

	$('.slug').each(function (index, item) {
		var path = $(item).attr('href');
		var qualified = qualify(path);
		displayGoal(qualified);
	});
});
