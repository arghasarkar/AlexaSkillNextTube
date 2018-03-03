exports.handler = (event, context, callback) => {
    const https = require("https");

    const plurals = require("./utils/lang/plurals");

    const Warbands = require('./subskills/Runescape/Warbands');

    const API_HOST = "api.tfl.gov.uk";
    const STATION_RAYNERS_LANE = "940GZZLURYL";
    const API_PATH = "/StopPoint/" + STATION_RAYNERS_LANE + "/arrivals";

    const TUBE_LINE = "Piccadilly";

    var dataLoadedCallback = function(data) {

        var traintimesByDirection = parseTrainTimesByDirection(data);

        var phraseText = nextTubePhraseBuilder(traintimesByDirection);
        console.log(phraseText);
        return phraseText;
    };

    function loadHttps(apiHost, path, _callback) {
        return https.get({
            host: apiHost,
            path: path
        }, function (response) {
            // Continuously update stream with data
            var body = '';
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {
                _callback(JSON.parse(body));
            });
        });
    }

    /**
     * Fetches the tube times data for Rayners lane and creates the speechlet for Alexa. Called when the "NextTube"
     * intent is triggered.
     */
    function tubeTimeIntent() {
        loadHttps(API_HOST, API_PATH, function(data) {

            var traintimesByDirection = parseTrainTimesByDirection(data);
            var phraseText = nextTubePhraseBuilder(traintimesByDirection);

            context.succeed(
                generateResponse(
                    buildSpeechletResponse(phraseText, true),
                    {}
                )
            );
        });
    }



    /**
     * Parses the train times json to get the eastbound and the west bound Piccadilly line services
     * @param trainTimesJson
     * @param direction
     * @param lineName
     */
    function parseTrainTimesByDirection(trainTimesJson, direction, lineName) {
        if (typeof direction === "undefined") { direction = "Eastbound"; }
        if (typeof lineName === "undefined") { lineName = TUBE_LINE; }

        const EASTBOUND = "Eastbound";
        const WESTBOUND = "Westbound";

        var eastboundTrains = [];
        var westboundTrains = [];

        trainTimesJson.sort(function(a, b) {
            return parseInt(a.timeToStation) - parseInt(b.timeToStation);
        });

        for (var i = 0; i < trainTimesJson.length; i++) {
            if (trainTimesJson[i].platformName.includes(EASTBOUND)) {
                eastboundTrains.push({
                    "timeToStation": convertSecondsToText(trainTimesJson[i].timeToStation),
                    "towards": trainTimesJson[i].towards,
                    "currentLocation": trainTimesJson[i].currentLocation
                });
            } else {
                westboundTrains.push({
                    "timeToStation": convertSecondsToText(trainTimesJson[i].timeToStation),
                    "towards": trainTimesJson[i].towards,
                    "currentLocation": trainTimesJson[i].currentLocation
                });
            }
        }

        var returnData = {
            eastboundTrains, westboundTrains
        };

        console.log(returnData);

        //console.log(JSON.stringify(returnData));
        return returnData;
    }

    /**
     * Converts the time in seconds to a text representation in minutes and seconds
     * @param seconds
     * @returns {string}
     */
    function convertSecondsToText(seconds) {
        var minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        var spokenPhrase = "";

        if (minutes > 0) {
            spokenPhrase += minutes + " minutes ";
        }
        if (seconds > 0) {
            spokenPhrase += seconds + " seconds";
        }

        return spokenPhrase;
    }

    function nextTubePhraseBuilder(parsedTubeData, direction, line) {
        if (typeof direction === "undefined") { direction = "Eastbound"; }
        if (typeof lineName === "undefined") { lineName = TUBE_LINE; }

        const numOfTrains = parsedTubeData.eastboundTrains.length;

        const NUM_TRAINS = "There " + plurals.plural("is", numOfTrains) + " currently "
            + numOfTrains + " " + plurals.plural("train", numOfTrains) + " going in the " + direction + " direction.\n";

        const TIME_TILL_NEXT_TRAIN = "Your next train is in ";
        const AFTER_NEXT_TRAINS = plurals.plural("Train", numOfTrains, 2) +  " after your next one"  + " "
            + plurals.plural("is", numOfTrains, 2) + " in ";

        var phraseText = NUM_TRAINS;
        if (parsedTubeData.eastboundTrains.length > 0) {
            phraseText += TIME_TILL_NEXT_TRAIN + parsedTubeData.eastboundTrains[0].timeToStation + ". \n";
        }
        if (parsedTubeData.eastboundTrains.length > 1) {
            phraseText += AFTER_NEXT_TRAINS + parsedTubeData.eastboundTrains[1].timeToStation;
        }
        for (var i = 2; i < parsedTubeData.eastboundTrains.length; i++) {
            phraseText += " and " + parsedTubeData.eastboundTrains[i].timeToStation + ". \n";
        }

        return phraseText;
    }

    /**
     * MAIN
     * This is where a request comes in from AlexaSkillService to be parsed.
     * App launcher and all INTENT requests are handled here.
     */
    try {

        if (event.session.new) {
            // New session
            console.log("New session");
        }

        switch (event.request.type) {
            case "LaunchRequest": {
                // Launch request
                console.log("Launch request");
                tubeTimeIntent();
                break;
            }

            case "IntentRequest": {
                // Intent reqeust
                console.log("Intent request");
                console.log(event.request.intent.name);

                switch (event.request.intent.name) {
                    case "NextTube": {
                        tubeTimeIntent();
                        break;
                    }
                    case "WarbandsTime": {
                        context.succeed(
                             generateResponse(
                                 buildSpeechletResponse(Warbands.timeToNextWarbands(), true),
                                 {}
                             )
                         );
                        break;
                    }
                    default: {
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Failed intent", true),
                                {}
                            )
                        );
                    }
                }

                break;
            }

            case "SessionEndRequest": {
                // Session end request
                console.log("Session end request");

                break;
            }

            default: {
                context.fail("This is a default response. Some error has occurred.");
            }
        }

    } catch(error) {
        context.fail("Failed due to some unknown error");
    }
};

// Helper functions
buildSpeechletResponse = (outputText, shouldEndSession) => {
    return {
        outputSpeech: {
            type: "PlainText",
            text: outputText
        },
        shouldEndSession: shouldEndSession
    }
};

generateResponse = (speechletResponse, sessionAttributes) => {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
};