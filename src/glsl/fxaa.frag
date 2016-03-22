uniform vec2 uResolution;
uniform sampler2D uDiffuse;
uniform sampler2D uDistance;
uniform float uAmount;

#pragma glslify: fxaa = require(glsl-fxaa)

void main() {
    gl_FragColor = fxaa(uDiffuse, gl_FragCoord.xy, uResolution);
}
