var mqtt = require('mqtt');
var config = require("./../config/configuration.json");
var client = {};

exports.subscribe = function(topic, token, callback){	
	client  = mqtt.connect({
		host: config.mqttHost,
		port: config.mqttPort,
		username: token
	});
	client.on('connect', function () {
		client.subscribe(topic, {qos: 2},
		function(e,r){	
            if( e ){
                callback(e,r);
            }			
		});
	}).
	on('error', function (err) {
		callback(err);
    }).
    on("message", function (topic, payload) {
        callback(null, JSON.parse(payload.toString()));
        client.end();
    });
};

exports.disconnect = function(){
	if( client ){
		client.end();
	}
};