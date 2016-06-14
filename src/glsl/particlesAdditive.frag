varying float vHalfSize;
varying float vDepth;
varying float vLife;

uniform float uInset;
uniform vec2 uResolution;
uniform sampler2D uDepth;

const float EPS = 0.001;

void main() {

    vec2 toCenter = (gl_PointCoord.xy - 0.5) * 2.0;
    float isVisible = step(-1.0 + EPS, -length(toCenter));
    if(isVisible < 0.5) discard;

    float centerZ = texture2D( uDepth, gl_FragCoord.xy  / uResolution ).a;
    float zLength = sqrt(1.0 - toCenter.x * toCenter.x - toCenter.y * toCenter.y) * vHalfSize;
    float z = centerZ - vDepth + zLength;

    isVisible *= step(EPS, z);
    toCenter.xy *= z * (1.0 + uInset * vLife);
    gl_FragColor = vec4(toCenter, z, z / zLength ) * isVisible;

}


