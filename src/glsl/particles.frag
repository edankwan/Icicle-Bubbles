uniform vec2 uResolution;
uniform vec3 uFogColor;
uniform float uInset;
uniform float uWashout;

uniform sampler2D uDepth;
uniform sampler2D uAdditive;
uniform sampler2D uSphereMap;
varying vec2 vUv;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#pragma glslify: toLinear = require('glsl-gamma/in')
#pragma glslify: toGamma  = require('glsl-gamma/out')


#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )
#define LOG2 1.442695

vec3 blendOverlay(vec3 base, vec3 blend) {
    return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));
}

void main() {
    vec2 screenOffset = (vUv - vec2(0.5)) * 2.0;

    vec4 merged = texture2D( uAdditive, vUv );
    vec4 outer = merged;

    float alpha = smoothstep(0.0, 0.01, merged.z);
    merged.xy /= merged.z;
    merged.z = sqrt(1.0 - merged.x * merged.x - merged.y * merged.y);
    merged.xyz = normalize(merged.xyz);

    vec2 uv = (merged.xy + 1.0 + screenOffset * 0.3 ) * 0.5;
    vec4 color = toLinear(texture2D( uSphereMap, uv ));

    outer.xy /= -outer.z * (1.0 + uInset);
    outer.z = sqrt(1.0 - outer.x * outer.x - outer.y * outer.y);
    outer.xyz = normalize(outer.xyz);

    uv = (outer.xy + 1.0 + screenOffset * 0.3) * 0.5;
    vec4 blend = toLinear(texture2D( uSphereMap, uv ));

    float fogFactor = whiteCompliment( exp2( - 0.002 * 0.002 * pow(merged.w + 1000.0, 2.0) * LOG2 ) );

    color.xyz = mix(blendOverlay(color.xyz,  blend.xyz), max(color.xyz,  blend.xyz), uWashout);
    color.xyz = mix(color.xyz, uFogColor, 0.3 + fogFactor * 0.7);

    gl_FragColor = vec4(toGamma(color.xyz), alpha);

}

