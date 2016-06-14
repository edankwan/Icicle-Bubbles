var parse = require('mout/queryString/parse');
var keys = require('mout/object/keys');
var query = exports.query = parse(window.location.href.replace('#','?'));

exports.useStats = false;

var amountMap = {
    '4k' : [64, 64],
    '8k' : [128, 64],
    '16k' : [128, 128],
    '32k' : [256, 128],
    '65k' : [256, 256],
    '131k' : [512, 256],
    '252k' : [512, 512],
    '524k' : [1024, 512],
    '1m' : [1024, 1024]
};

exports.amountList = keys(amountMap);
query.amount = amountMap[query.amount] ? query.amount : '16k';
var amountInfo = amountMap[query.amount];
exports.simulatorTextureWidth = amountInfo[0];
exports.simulatorTextureHeight = amountInfo[1];

exports.speed = 1;
exports.curlSize = 0.02;
exports.dieSpeed = 0.015;
exports.radius = 0.5;
exports.attraction = -0.5;
exports.blur = 1;
exports.insetExtra = 0;
exports.inset = 0.5;
exports.washout = 0.7;
exports.brightness = 0.3;
exports.blurZ = 0.8;
exports.dof = 1;
exports.dofMouse = true;
exports.fxaa = true;
exports.particleSize = 21;


var motionBlurQualityMap = exports.motionBlurQualityMap = {
    best: 1,
    high: 0.5,
    medium: 1 / 3,
    low: 0.25
};
exports.motionBlurQualityList = keys(motionBlurQualityMap);
query.motionBlurQuality = motionBlurQualityMap[query.motionBlurQuality] ? query.motionBlurQuality : 'medium';
exports.motionBlur = true;
exports.motionBlurPause = false;

exports.bloom = false;
exports.vignette = true;
exports.vignetteMultiplier = 0.8;

exports.bgColor = '#3c4a4a';

exports.bgm = true;
exports.matcap = 'metal';
