var request = require('request');
var cheerio = require('cheerio');
var columnify = require('columnify');

function qualify(path) {
	var rootUrl = 'https://www.beeminder.com';
	return rootUrl + path;
}

function fetchOneGoal(url, callback) {

	return new Promise((resolve, reject) => {

		request(url, (error, response, html) => {
			var $ = cheerio.load(html);
			$('li.ratesum').each((index, item) => {
				if (index == 0) return;
				var key = url.replace(/^(.*\/)*/g, '');
				var value = $(item).text().split('\n')[1].trim();
				var object = {};
				object[key] = value;
				resolve(object);
			});
		});
	});
}

function fetchGoals(urls) {

	return new Promise((resolve, reject) => {

		var promisedGoals = urls.map(item => fetchOneGoal(item));

		Promise.all(promisedGoals).then(goals => {
			var displayableGoals = {};
			goals.forEach(function (item) {
				Object.assign(displayableGoals, item);
			});
			resolve(displayableGoals);
		})
	});
}

function scrapPaths(html) {

	var $ = cheerio.load(html);

	var paths = [];
	$('.slug').each((index, item) => {
		var path = $(item).attr('href');
		var qualified = qualify(path);
		paths.push(qualified);
	});

	return paths;
}

request(qualify('/chrp'), (error, response, html) => {
	if (error) console.log(error);

	var paths = scrapPaths(html);

	fetchGoals(paths).then(result =>
		console.log(columnify(result, {columns: ['Goal', 'Weekly']})));
});
