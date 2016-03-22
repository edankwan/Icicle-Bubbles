for(var id in Math) {
    exports[id] = Math[id];
}

exports.step = step;
exports.smoothstep = smoothstep;
exports.clamp = clamp;
exports.mix = exports.lerp = mix;
exports.unMix = exports.unLerp = unMix;
exports.unClampedMix = exports.unClampedLerp = unClampedMix;
exports.upClampedUnMix = exports.unClampedUnLerp = upClampedUnMix;
exports.fract = fract;
exports.hash = hash;
exports.hash2 = hash2;
exports.sign = sign;
exports.isPowerOfTwo = isPowerOfTwo;
exports.powerTwoCeiling = powerTwoCeiling;
exports.latLngBearing = latLngBearing;
exports.distanceTo = distanceTo;
exports.distanceSqrTo = distanceSqrTo;
exports.latLngDistance = latLngDistance;

var PI = Math.PI;
var TAU = exports.TAU = PI * 2;

function step ( edge, val ) {
    return val < edge ? 0 : 1;
}

function smoothstep ( edge0, edge1, val ) {
    val = unMix( edge0, edge1, val );
    return val * val ( 3 - val * 2 );
}

function clamp ( val, min, max ) {
    return val < min ? min : val > max ? max : val;
}

function mix ( min, max, val ) {
    return val <= 0 ? min : val >= 1 ? max : min + ( max - min ) * val;
}

function unMix ( min, max, val ) {
    return val <= min ? 0 : val >= max ? 1 : ( val - min ) / ( max - min );
}

function unClampedMix ( min, max, val ) {
    return min + ( max - min ) * val;
}

function upClampedUnMix ( min, max, val ) {
    return ( val - min ) / ( max - min );
}

function fract ( val ) {
    return val - Math.floor( val );
}

function hash (val) {
    return fract( Math.sin( val ) * 43758.5453123 );
}

function hash2 (val1, val2) {
    return fract( Math.sin( val1 * 12.9898 + val2 * 4.1414 ) * 43758.5453 );
}

function sign (val) {
    return val ? val < 0 ? - 1 : 1 : 0;
}

function isPowerOfTwo( value ) {
    return ( (value & -value) == value );
}

function powerTwoCeiling(val) {
    if( isPowerOfTwo( val ) )return val;
    val = Math.pow(2, Math.ceil(Math.log(Math.sqrt(val)) / Math.LN2 ));
    return val * val;
}

function latLngBearing(lat1, lng1, lat2, lng2) {
    //http://www.movable-type.co.uk/scripts/latlong.html
    var y = Math.sin(lng2-lng1) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1);
    return Math.atan2(y, x);
}

function distanceTo(dX, dY) {
    return Math.sqrt(dX * dX + dY * dY);
}

function distanceSqrTo(dX, dY) {
    return dX * dX + dY * dY;
}

//http://www.movable-type.co.uk/scripts/latlong.html
function latLngDistance(lat1, lng1, lat2, lng2) {
    var R = 6371; // km
    var PI = Math.PI;
    var p1 = lat1 * PI / 180;
    var p2 = lat2 * PI / 180;
    var tp = (lat2-lat1) * PI / 180;
    var td = (lng2-lng1) * PI / 180;

    var a = Math.sin(tp/2) * Math.sin(tp/2) +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(td/2) * Math.sin(td/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
