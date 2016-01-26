var settings = require('../core/settings');
var THREE = require('three');

var undef;

var mesh = exports.mesh = undef;
var pointLight = exports.pointLight = undef;
exports.init = init;
exports.update = update;

var _moveTime = 0;

function init() {

    mesh = exports.mesh = new THREE.Object3D();
    mesh.position.set(0, 500, 0);

    var ambient = new THREE.AmbientLight( 0x333333 );
    mesh.add( ambient );

    pointLight = exports.pointLight = new THREE.PointLight( 0xffffff, 1, 800 );
    // pointLight.castShadow = true;
    // pointLight.shadowCameraNear = 10;
    // pointLight.shadowCameraFar = 700;
    // // pointLight.shadowCameraFov = 90;
    // pointLight.shadowBias = 0.1;
    // pointLight.shadowDarkness = 0.5;
    // pointLight.shadowMapWidth = 4096;
    // pointLight.shadowMapHeight = 2048;
    mesh.add( pointLight );

}

function update(dt, camera) {
    _moveTime += dt * 1.0;
    var angle = _moveTime * 0.0005 - 0.2;

}
