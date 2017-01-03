exports.plural = function(singular, numberCount, greaterThanLimit) {

    var EXCEPTIONS = [];
    EXCEPTIONS["is"] = "are";

    if (typeof greaterThanLimit === "undefined") { greaterThanLimit = 1; }

    if (numberCount > greaterThanLimit) {
        if (typeof EXCEPTIONS[singular] === "undefined") {
            return pluralVersion(singular);
        } else {
            return EXCEPTIONS[singular];
        }
    }

    return singular;
};

function pluralVersion(word) {

    var ENDINGS = [];
    ENDINGS["e"] = "es";
    ENDINGS["y"] = "ies";

    // Head
    var head = word.substring(0, word.length - 1);
    // Tail
    var tail = word.substring(word.length - 1, word.length);

    if (typeof ENDINGS[tail] === "undefined") {
        return word +  "s";
    } else {
        return head + ENDINGS[tail];
    }
}