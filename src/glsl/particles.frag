uniform vec2 uResolution;
uniform vec3 uFogColor;
uniform float uInset;
uniform float uWashout;

uniform sampler2D uDepth;
uniform sampler2D uAdditive;
uniform sampler2D uSphereMap;
varying vec2 vUv;

#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )
#define LOG2 1.442695

vec3 blendOverlay(vec3 base, vec3 blend) {
    return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));
}

void main() {

    vec4 merged = texture2D( uAdditive, vUv );

    float alpha = smoothstep(0.0, 1.0, merged.w);

    if(alpha < 0.001) discard;

    vec4 outer = merged;

    merged.xy /= merged.z;
    merged.z = sqrt(1.0 - merged.x * merged.x - merged.y * merged.y);

    vec4 color =  texture2D( uSphereMap, merged.xy * 0.5 + 0.5 );

    outer.xy /= -outer.z * (1.0 + uInset);
    outer.z = sqrt(1.0 - outer.x * outer.x - outer.y * outer.y);
    outer.xyz = normalize(outer.xyz);
    vec4 blend =  texture2D( uSphereMap, outer.xy * 0.5 + 0.5 );

    vec2 centers = texture2D( uDepth, gl_FragCoord.xy  / uResolution ).xy;
    float centerZ = centers.r;
    centerZ = max(0.0, centerZ - 120.0);

    float fogFactor = whiteCompliment( exp2( - 0.002  * 0.002     * centerZ *centerZ * LOG2 ) );

    color.xyz = min(vec3(1.0), mix(blendOverlay(color.xyz,  blend.xyz), max(color.xyz,  blend.xyz), uWashout));
    // color.xyz = mix(min(vec3(1.0), color.xyz), uFogColor , fogFactor);

    // alpha *=  1.0 - centers.y;

    gl_FragColor = min(vec4(1.0), vec4(color.xyz, alpha * (1.0 - fogFactor )));

}

