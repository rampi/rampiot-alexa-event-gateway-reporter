var request = require('request');
var Q = require('q');

exports.sendMessage = function(token, jsonMessage, callback){
    var deferred = Q.defer();
    var options = {
        uri: process.env.US_ENDPOINT,
        method: 'POST',
        headers:{
            'Authorization': "Bearer "+token,            
            'Content-Type': "application/json"
        },
        body: JSON.stringify(jsonMessage)
    };
    request(options, function (error, response, body) {
        var jsonBody = JSON.parse(body);
        if( error ){
            deferred.reject(error);
        }
        else if(response.statusCode === 200 ){
            deferred.resolve(jsonBody);
        }else{
            deferred.reject(jsonBody);
        }
    });
    return deferred.promise.nodeify(callback);
};