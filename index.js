var jsonHash = require('json-hash');
var EventGatewayClient = require("./service/alexa-event-gateway-client");
var MQTTClient = require("./mqtt/mqtt-client");

var FUNCTION_TIMEOUT = 10000;

var Logger = {
    logDebug: function(msg){
        console.log(msg);
    },
    logError: function(err){
        console.error(err);
    }
};

var join = function(status, expected){
    var temp = {};
    Object.keys(status).forEach(function(k){
        if( expected.hasOwnProperty(k) ){
            temp[k] = status[k];
        }
    });
    return temp;
};

var getObjectHash = function(obj){
	return jsonHash.digest(obj);
};

exports.handler = function(event, context, callback){
    event = JSON.parse(event.Records[0].Sns.Message);
    Logger.logDebug("Event: "+JSON.stringify(event));
    Logger.logDebug(event.endpointId);
    var timeout = 0;
    MQTTClient.subscribe(
        "rampiot/"+event.endpointId+"/event", 
        event.userToken, 
        function(e, message){
            clearTimeout(timeout);
            if( e ){
                Logger.logError(e);
                context.succeed(e);
                return;
            }
            Logger.logDebug(JSON.stringify(message));            
            var st = join(message.status, event.expected);                
            EventGatewayClient.sendMessage(
                event.token,
                getObjectHash(st) === getObjectHash(event.expected) ? event.success : event.error
            ).then(function(resp){
                Logger.logDebug(JSON.stringify(resp));
                context.succeed(resp);
            }).
            fail(function(error){
                Logger.logError(error);
                context.succeed(error);
            });
    });    
    timeout = setTimeout(function(){
        MQTTClient.disconnect();
        EventGatewayClient.sendMessage(
            event.token,
            event.error
        ).then(function(resp){
            Logger.logDebug(JSON.stringify(resp));
            context.succeed(resp);
        }).
        fail(function(error){
            Logger.logError(error);
            context.succeed(error);
        });        
    }, FUNCTION_TIMEOUT);
};