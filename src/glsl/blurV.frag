uniform sampler2D tDiffuse;
uniform float uOffset;
uniform float uBlurZ;
uniform vec2 uResolution;
varying vec2 vUv;

const float EPS = 0.01;

void main() {

    vec4 sum = vec4( 0.0 );

    vec4 center = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * uOffset ) ) * 0.051;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * uOffset ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * uOffset ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * uOffset ) ) * 0.1531;
    sum += center * 0.1633;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * uOffset ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * uOffset ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * uOffset ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * uOffset ) ) * 0.051;

    center.xy = sum.xy;
    center.z = mix(center.z, sum.z, step(EPS, center.w) * uBlurZ);

    gl_FragColor = center;

}
