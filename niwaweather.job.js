var http = require('http');

// Set the name of your location here
var location = 'Auckland';

var moment = require('moment');

var codes = {
	tornado: '0',
	tropicalstorm: '1',
	hurricane: '2',
	severethunderstorms: '3',
	thunderstorms: '4',
	mixedrainandsnow: '5',
	mixedrainandsleet: '6',
	mixedsnowandsleet: '7',
	freezingdrizzle: '8',
	drizzle: '9',
	freezingrain: '10',
	showers: '11',
	/*showers: '12',*/
	snowflurries: '13',
	lightsnowshowers: '14',
	blowingsnow: '15',
	snow: '16',
	hail: '17',
	sleet: '18',
	dust: '19',
	foggy: '20',
	haze: '21',
	smoky: '22',
	blustery: '23',
	windy: '24',
	cold: '25',
	cloudy: '26',
	mostlycloudy: '27',
	/*mostlycloudy(day): '28',*/
	/*partlycloudy(night): '29',
	partlycloudy(day): '30',*/
	clear: '31',
	sunny: '32',
	fair: '33',
	/*fair(day): '34',*/
	mixedrainandhail: '35',
	hot: '36',
	isolatedthunderstorms: '37',
	scatteredthunderstorms: '38',
	/*scatteredthunderstorms: '39',*/
	scatteredshowers: '40',
	heavysnow: '41',
	scatteredsnowshowers: '42',
	/*heavysnow: '43',*/
	partlycloudy: '44',
	thundershowers: '45',
	snowshowers: '46',
	isolatedthundershowers: '47'
}

function getCode(cloud) {
	if (codes[cloud]) {
		return codes[cloud];
	}
	return 3200;
}

function fetchWeather() {
  http.get('http://weather.niwa.co.nz/data/hourly/' + location, function(res) {
    if (res.statusCode == 200) {
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        body = JSON.parse(body);
        var results = body.data;
        if (results) {
        	for (var i = 0; i < results.length; ++i) {
        		var result = results[i];
        		var now = moment().utc();
        		var other = moment(result.utc.substring(0, result.utc.length-1), moment.ISO_8601);

        		if (now.year() == other.year() &&
        			now.month() == other.month() &&
        			now.day() == other.day() &&
        			now.hour() == other.hour()) {

        			var code = getCode(result.cloud);

        			var payload = {
        				utc: result.utc,
        				wind_speed: result.wind_speed,
        				wind_from_direction: result.wind_from_direction,
        				temperature: Math.round(result.air_temperature),
        				relative_humidity: result.relative_humidity,
        				cloud_cover: result.cloud_cover,
        				precipitation_amount: result.precipitation_amount,
        				duration: result.duration,
        				precipitation: result.precipitation,
        				cloud: result.cloud,
        				phase: result.phase,
        				label: result.label,
        				location: location,
        				code: code,
        				format: 'c'
        			};
        			console.log(payload);
        			send_event('niwaweather', payload);
        		}
        	}
        }
      });
    } else {
      console.log('NIWA Weather status code: ' + res.statusCode);
    }
  }).on('error', function(err) {
    console.log('Error reading from NIWA Weather: ', err);
  });
}

setInterval(fetchWeather, 15 * 60 * 1000);
fetchWeather();


