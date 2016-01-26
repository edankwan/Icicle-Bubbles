varying float vHalfSize;
varying float vDepth;
varying float vLife;

uniform float uInset;
uniform vec2 uResolution;
uniform sampler2D uDepth;

float unpack1K ( vec4 color ) {
   const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
   return dot( color, bitSh ) * 1000.0;
}

const float EPS = 0.001;

void main() {

    vec2 toCenter = (gl_PointCoord.xy - 0.5) * 2.0;
    float isVisible = step(-1.0 + EPS, -length(toCenter));
    if(isVisible < 0.5) discard;

    float centerZ = unpack1K(texture2D( uDepth, gl_FragCoord.xy  / uResolution ));
    float z = centerZ - vDepth + sqrt(1.0 - toCenter.x * toCenter.x - toCenter.y * toCenter.y) * vHalfSize;

    isVisible *= step(0.0, z);
    toCenter.xy *= z * (1.0 + uInset * vLife);
    gl_FragColor = vec4(toCenter, z, centerZ - z - 1000.0 ) * isVisible;

}


