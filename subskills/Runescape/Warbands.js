"use strict";

exports.timeToNextWarbands = function() {

    var nextWarbandsTime = new Date();
    var timeDifference = [];

    if (anyMoreWarbandsLeftToday()) {
        nextWarbandsTime = new Date().setUTCHours(getHourOfNextWarbandsToday(), 0, 0, 0);

    } else {
        const allWarbandsTomorrow = WARBANDS_TIMES[(getDayOfTheWeek() + 1) % DAYS_PER_WEEK];

        // This is the time for the next warbands
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setUTCHours(allWarbandsTomorrow[0], 0, 0, 0);

        nextWarbandsTime = tomorrow;
    }
    timeDifference = computeDateTimeDifference(nextWarbandsTime);

    return convertTimeToText(timeDifference.hrs, timeDifference.mins, timeDifference.secs);

};

const plurals = require('../../utils/lang/plurals');

const WARBANDS_TIMES = [
    [5, 12, 19],
    [2, 9, 16, 23],
    [6, 13, 20],
    [3, 10, 17],
    [0, 7, 14, 21],
    [4, 11, 18],
    [1, 8, 15, 22]
];
const WARBAND_INTERVAL = 7;
const DAYS_PER_WEEK = 7;

function computeDateTimeDifference(future, now) {
    if (typeof now === "undefined") {
        now = new Date();
    }

    let timeDifferenceMs = future - now;
    let timeDifferenceSeconds = Math.round(timeDifferenceMs / 1000);
    let timeDifferenceHours = Math.floor(timeDifferenceSeconds / 3600);
    let timeDifferenceMinutes = Math.round((timeDifferenceSeconds - (timeDifferenceHours * 3600)) / 60);
    timeDifferenceSeconds = Math.floor(timeDifferenceSeconds - (timeDifferenceHours * 3600) - timeDifferenceMinutes * 60);

    let timeDifference = [];
    timeDifference.hrs = timeDifferenceHours;
    timeDifference.mins = timeDifferenceMinutes;
    timeDifference.secs = timeDifferenceSeconds;

    return timeDifference;
}

/**
 * Takes the hours, minutes and seconds as input and gives out the text pronunciation as the output.
 * @param hours
 * @param minutes
 * @param seconds
 * @returns {string}
 */
function convertTimeToText(hours, minutes, seconds) {

    var statement = "The next warbands is in ";

    if (hours > 0) {
        statement += hours + " " + plurals.plural("hour", hours, 1) + " ";
        if (minutes > 0) {
            statement += "and ";
        }
    }

    if (minutes > 0) {
        statement += minutes + " " + plurals.plural("minute", minutes, 1) + ".";
    }

    return statement;
}

/**
 * Gets the hour for the next warbands. For example, if the time is now 9pm on a Monday, the next warbands is at
 * 11pm. Therefore 23 is returned. If there are no warbands left today (eg 9pm on a Sunday), then -1 is returned.
 * @returns { int }
 */
function getHourOfNextWarbandsToday() {
    var warbandsToday = WARBANDS_TIMES[getDayOfTheWeek()];
    var lastWarbandToday = warbandsToday[warbandsToday.length - 1];
    var hourOfNextWarband = warbandsToday[Math.floor(warbandsToday.length -  (lastWarbandToday - getHourOfTheDay()) / WARBAND_INTERVAL)];

    if (typeof hourOfNextWarband === "undefined") {
        return -1;
    }

    return hourOfNextWarband;
}

/**
 * Returns a boolean value indicating if there are any worldbands left today.
 * @returns {boolean}
 */
function anyMoreWarbandsLeftToday() {
    var lastWarbandToday = WARBANDS_TIMES[getDayOfTheWeek()];
    lastWarbandToday = lastWarbandToday[lastWarbandToday.length - 1];

   return lastWarbandToday > getHourOfTheDay();
}

function getMinutesOfTheHour() {
    return new Date().getUTCMinutes();
}
function getHourOfTheDay() {
    return new Date().getUTCHours();
}
function getDayOfTheWeek() {
    return new Date().getDay();
}