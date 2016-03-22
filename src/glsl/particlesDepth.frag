varying float vDepth;
varying float vHalfSize;

const float EPS = 0.001;

void main() {

    vec2 toCenter = (gl_PointCoord.xy - 0.5) * 2.0;
    float isVisible = step(-1.0 + EPS, -length(toCenter));
    if(isVisible < 0.5) discard;
    gl_FragColor = vec4(vDepth, 1.0, 0.0, 1.0);
    // gl_FragColor = vec4(vDepth, smoothstep(vHalfSize - 6.0, vHalfSize, d * vHalfSize), 0.0, 1.0);

}
