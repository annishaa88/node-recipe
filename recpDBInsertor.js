/**
 * Created by Anna on 8/8/2015.
 */

var dbLayer = require('./routes/dbLayer')();

Array.prototype.chunk = function (chunkSize) {
    var R = [];
    for (var i = 0; i < this.length; i += chunkSize)
        R.push(this.slice(i, i + chunkSize));
    return R;
};

String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

dbLayer.insertRecpToDB();