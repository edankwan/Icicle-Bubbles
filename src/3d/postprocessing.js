var settings = require('../core/settings');
var THREE = require('three');
var shaderParse = require('../helpers/shaderParse');
var glslify = require('glslify');

var undef;

exports.init = init;
exports.resize = resize;
exports.render = render;
exports.renderFxaa = renderFxaa;
exports.renderVignette = renderVignette;
exports.renderDof = renderDof;
exports.renderMaterial = renderMaterial;

var vs = exports.vs = undef;

var _to;
var _from;
var _renderer;

var _fxaaMaterial;
var _vignetteMaterial;
var _dofMaterial;

var _depth1Material;
var _depth1;
var _depth1Buffer;

var _mesh;
var _scene;
var _camera;

function init(renderer) {

    _to = _createRenderTarget();
    _from = _createRenderTarget();
    _depth1 = _createRenderTarget(true, true);

    _renderer = renderer;
    _scene = new THREE.Scene();
    _camera = new THREE.Camera();
    _mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), undef );
    _scene.add( _mesh );

    var rawShaderPrefix = 'precision ' + renderer.capabilities.precision + ' float;\n';
    vs = exports.vs =  rawShaderPrefix + shaderParse(glslify('../glsl/quad.vert'));

    _fxaaMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            uResolution: { type: 'v2', value: new THREE.Vector2( 1, 1 ) },
            uDistance: { type: 't', value: undef },
            uDiffuse: { type: 't', value: undef },
            uAmount: { type: 'f', value: undef }
        },
        vertexShader: vs,
        fragmentShader: rawShaderPrefix + shaderParse(glslify('../glsl/fxaa.frag'))
    });

    _vignetteMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            uResolution: { type: 'v2', value: new THREE.Vector2( 1, 1 ) },
            uDiffuse: { type: 't', value: undef },
            uReduction: { type: 'f', value: 2 },
            uBoost: { type: 'f', value: 2 }
        },
        vertexShader: vs,
        fragmentShader: rawShaderPrefix + shaderParse(glslify('../glsl/vignette.frag'))
    });

    _dofMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            uResolution: { type: 'v2', value: new THREE.Vector2( 1, 1 ) },
            uDiffuse: { type: 't', value: undef },
            uDistance: { type: 't', value: undef },
            uDofDistance: { type: 'f', value: 0 },
            uDelta: { type: 'v2', value: new THREE.Vector2() },
            uMouse: { type: 'v2', value: settings.mouse },
            uAmount: { type: 'f', value: 1 }
        },
        vertexShader: vs,
        fragmentShader: rawShaderPrefix + shaderParse(glslify('../glsl/dof.frag'))
    });

    _depth1Buffer = new Float32Array(4);
    _depth1Material = new THREE.RawShaderMaterial({
        uniforms: {
            uResolution: { type: 'v2', value: new THREE.Vector2( 1, 1 ) },
            uDistance: { type: 't', value: undef },
            uMouse: { type: 'v2', value: settings.mouse }
        },
        vertexShader: vs,
        transparent: true,
        blending: THREE.NoBlending,
        fragmentShader: rawShaderPrefix + shaderParse(glslify('../glsl/depth1.frag'))
    });
}

function _createRenderTarget(isRGBA, isFloat) {
    return new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: isRGBA ? THREE.RGBAFormat : THREE.RGBFormat,
        type: isFloat ? THREE.FloatType : THREE.UnsignedByteType
    });
}

function renderFxaa(toScreen) {
    _fxaaMaterial.uniforms.uDiffuse.value = _from;
    _fxaaMaterial.uniforms.uDistance.value = settings.distanceMap;
    _fxaaMaterial.uniforms.uAmount.value = settings.aa;
    renderMaterial(_fxaaMaterial, toScreen);
}

function renderVignette(toScreen) {
    var uniforms = _vignetteMaterial.uniforms;
    uniforms.uDiffuse.value = _from;
    var reduction = (1.5 + settings.brightness * 1.5) * settings.vignetteMultiplier;
    var boost = 0.8 + settings.brightness * 0.55;
    uniforms.uReduction.value += (reduction - uniforms.uReduction.value) * 0.05;
    uniforms.uBoost.value += (boost - uniforms.uBoost.value) * 0.05;
    renderMaterial(_vignetteMaterial, toScreen);
}

function renderDof(toScreen) {

    var cameraDistance = settings.camera.position.length();
    var distance = cameraDistance;

    if(settings.dofMouse) {
        _mesh.material = _depth1Material;
        _depth1Material.uniforms.uDistance.value = settings.distanceMap;
        _renderer.render( _scene, _camera, _depth1 );
        _renderer.readRenderTargetPixels ( _depth1, 0, 0, 1, 1, _depth1Buffer );
        distance = _depth1Buffer[0] || distance;
    }

    var uniforms = _dofMaterial.uniforms;
    var prevDistance = uniforms.uDofDistance.value;
    uniforms.uDofDistance.value += (distance - prevDistance) * 0.1;

    uniforms.uDiffuse.value = _from;
    uniforms.uAmount.value = settings.dof;
    uniforms.uDistance.value = settings.distanceMap;
    uniforms.uDelta.value.set(1, 0);
    renderMaterial(_dofMaterial);
    uniforms.uDiffuse.value = _from;
    uniforms.uDelta.value.set(0, 1);
    renderMaterial(_dofMaterial, toScreen);
}

function resize(width, height) {
    _to.setSize(width, height);
    _from.setSize(width, height);

    _fxaaMaterial.uniforms.uResolution.value.set(width, height);
    _vignetteMaterial.uniforms.uResolution.value.set(width, height);
    _dofMaterial.uniforms.uResolution.value.set(width, height);
}

function render(scene, camera, toScreen) {
    if(toScreen) {
        _renderer.render( scene, camera );
    } else {
        _renderer.render( scene, camera, _to );
    }
    var tmp = _to;
    _to = _from;
    _from = tmp;
    return _from;
}

function renderMaterial(material, toScreen) {
    _mesh.material = material;
    render(_scene, _camera, toScreen);
}
