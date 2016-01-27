var settings = require('../core/settings');
var THREE = require('three');
var shaderParse = require('../helpers/shaderParse');
var glslify = require('glslify');
var simulator = require('./simulator');
var postprocessing = require('./postprocessing');

var undef;

var mesh = exports.mesh = undef;
exports.init = init;
exports.resize = resize;
exports.preRender = preRender;
exports.update = update;

var _renderer;
var _particleGeometry;

var _quadScene;
var _quadCamera;

var _particles;
var _particlesMaterial;
var _particlesScene;
var _depthRenderTarget;
var _additiveRenderTarget;

var _blurHMaterial;
var _blurVMaterial;
var _blurRenderTarget;

var _resolution;
var _width;
var _height;

var TEXTURE_WIDTH = settings.simulatorTextureWidth;
var TEXTURE_HEIGHT = settings.simulatorTextureHeight;
var AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

function init(renderer, camera) {

    _quadCamera = new THREE.Camera();
    _quadCamera.position.z = 1;
    _particlesScene = new THREE.Scene();
    _quadScene = new THREE.Scene();
    _camera = camera;
    _renderer = renderer;
    _resolution = new THREE.Vector2();

    _initGeometry();
    _initDepthRenderTarget();
    _initAdditiveRenderTarget();
    _initBlurRenderTarget();

    _particles = new THREE.Points(_particleGeometry, _additiveRenderTarget.material);
    _particles.frustumCulled = false;
    _particlesScene.add(_particles);

    var geomtry =  new THREE.PlaneBufferGeometry( 2, 2 );
    _particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uDepth : {type: 't', value: _depthRenderTarget},
            uInset: {type: 'f', value: 0},
            uWashout: {type: 'f', value: 0},
            uAdditive : {type: 't', value: _additiveRenderTarget},
            uSphereMap : {type: 't', value: new THREE.Texture(settings.sphereMap)},
            uResolution : {type: 'v2', value: _resolution},
            uFogColor: {type: 'c', value: new THREE.Color()}
        },
        transparent: true,
        depthWrite: false,
        vertexShader: shaderParse(glslify('../glsl/particles.vert')),
        fragmentShader: shaderParse(glslify('../glsl/particles.frag'))
    });
    _particlesMaterial.uniforms.uSphereMap.value.anisotropy = 32;
    _particlesMaterial.uniforms.uSphereMap.value.needsUpdate = true;
    _particlesMaterial.uniforms.uSphereMap.value.flipY = false;

    mesh = exports.mesh = new THREE.Mesh(geomtry, _particlesMaterial);
    _quadScene.add(mesh);
}

function _initGeometry() {

    var position = new Float32Array(AMOUNT * 3);
    var i3;
    for(var i = 0; i < AMOUNT; i++ ) {
        i3 = i * 3;
        position[i3 + 0] = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
        position[i3 + 1] = ~~(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
        position[i3 + 2] = 800 + Math.pow(Math.random(), 5) * 36000; // size
    }
    _particleGeometry = new THREE.BufferGeometry();
    _particleGeometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ));

}

function _initDepthRenderTarget() {
    var material = new THREE.ShaderMaterial({
        uniforms: {
            uTexturePosition: {type: 't', value: null},
            uCameraPosition: {type: 'v3', value: _camera.position}
        },
        vertexShader: shaderParse(glslify('../glsl/particlesDepth.vert')),
        fragmentShader: shaderParse(glslify('../glsl/particlesDepth.frag')),
        blending: THREE.NoBlending
    });

    _depthRenderTarget = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        transparent: true
    });
    _depthRenderTarget.material = material;
}

function _initAdditiveRenderTarget() {
    var material = new THREE.ShaderMaterial({
        uniforms: {
            uTexturePosition: {type: 't', value: null},
            uDepth: {type: 't', value: _depthRenderTarget},
            uInset: {type: 'f', value: 0},
            uResolution: {type: 'v2', value: _resolution},
            uCameraPosition: {type: 'v3', value: _camera.position}
        },
        vertexShader: shaderParse(glslify('../glsl/particlesAdditive.vert')),
        fragmentShader: shaderParse(glslify('../glsl/particlesAdditive.frag')),

        blending : THREE.CustomBlending,
        blendEquation : THREE.AddEquation,
        blendSrc : THREE.OneFactor,
        blendDst : THREE.OneFactor ,
        blendEquationAlpha : THREE.MinEquation,
        blendSrcAlpha : THREE.OneFactor,
        blendDstAlpha : THREE.OneFactor,
        transparent: true
    });

    _additiveRenderTarget = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
    });
    _additiveRenderTarget.material = material;
}

function _initBlurRenderTarget() {

    _blurHMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse : {type: 't', value: _additiveRenderTarget},
            uResolution : {type: 'v2', value: _resolution},
            uOffset : {type: 'f', value: 0},
            uEdgeFix : {type: 'f', value: 0.1}
        },
        vertexShader: shaderParse(glslify('../glsl/particles.vert')),
        fragmentShader: shaderParse(glslify('../glsl/blurH.frag')),
        transparent: true,
        blending: THREE.NoBlending
    });

    _blurRenderTarget = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false
    });

    _blurVMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse : {type: 't', value: _blurRenderTarget},
            uResolution : {type: 'v2', value: _resolution},
            uOffset : {type: 'f', value: 0},
            uEdgeFix : {type: 'f', value: 0.1}
        },
        vertexShader: shaderParse(glslify('../glsl/particles.vert')),
        fragmentShader: shaderParse(glslify('../glsl/blurV.frag')),
        transparent: true,
        blending: THREE.NoBlending
    });
}

function resize(width, height) {
    _width = width;
    _height = height;
    _resolution.set(width, height);

    _depthRenderTarget.setSize(width, height);
    _additiveRenderTarget.setSize(width, height);
    _blurRenderTarget.setSize(width, height);
}

function preRender() {
    var autoClearColor = _renderer.autoClearColor;
    var clearColor = _renderer.getClearColor().getHex();
    var clearAlpha = _renderer.getClearAlpha();

    _renderer.setClearColor(0, 0);
    _renderer.clearTarget(_depthRenderTarget, true, true, true);
    _particles.material = _depthRenderTarget.material;
    _depthRenderTarget.material.uniforms.uTexturePosition.value = simulator.positionRenderTarget;
    _renderer.render( _particlesScene, _camera, _depthRenderTarget );

    _additiveRenderTarget.material.uniforms.uInset.value += (settings.inset - _additiveRenderTarget.material.uniforms.uInset.value) * 0.05;
    _renderer.setClearColor(0, 0);
    _renderer.clearTarget(_additiveRenderTarget, true, true, true);
    _particles.material = _additiveRenderTarget.material;
    _additiveRenderTarget.material.uniforms.uTexturePosition.value = simulator.positionRenderTarget;
    _renderer.render( _particlesScene, _camera, _additiveRenderTarget );
    // _renderer.render( _particlesScene, _camera );

    var blurRadius = settings.blur;

    if(blurRadius) {
        var uniforms = _blurHMaterial.uniforms;
        uniforms.uOffset.value += (blurRadius / _width - uniforms.uOffset.value) * 0.05;
        uniforms.uEdgeFix.value += (settings.edgeFix - uniforms.uEdgeFix.value) * 0.05;

        var uniforms = _blurVMaterial.uniforms;
        uniforms.uOffset.value += (blurRadius / _height - uniforms.uOffset.value) * 0.05;
        uniforms.uEdgeFix.value += (settings.edgeFix - uniforms.uEdgeFix.value) * 0.05;

        _renderer.clearTarget(_blurRenderTarget, true, true, true);
        mesh.material = _blurHMaterial;
        _renderer.render( _quadScene, _quadCamera, _blurRenderTarget );

        _renderer.clearTarget(_additiveRenderTarget, true, true, true);
        mesh.material = _blurVMaterial;
        _renderer.render( _quadScene, _quadCamera, _additiveRenderTarget );
        mesh.material = _particlesMaterial;
    }

    _renderer.setClearColor(clearColor, clearAlpha);
    _renderer.autoClearColor = autoClearColor;
    _renderer.setViewport(0, 0, _width, _height);

}

function update(renderTarget, dt) {
    var autoClearColor = _renderer.autoClearColor;
    var clearColor = _renderer.getClearColor().getHex();
    var clearAlpha = _renderer.getClearAlpha();
    _renderer.autoClearColor = false;

    var uniforms = _particlesMaterial.uniforms;
    uniforms.uInset.value = _additiveRenderTarget.material.uniforms.uInset.value;
    uniforms.uWashout.value += (settings.washout - uniforms.uWashout.value) * 0.05;
    _renderer.render( _quadScene, _quadCamera, renderTarget );

    _renderer.setClearColor(clearColor, clearAlpha);
    _renderer.autoClearColor = autoClearColor;
}
