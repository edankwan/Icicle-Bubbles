uniform sampler2D uTexturePosition;
uniform vec3 uCameraPosition;

varying float vHalfSize;
varying float vLife;
varying float vDepth;

void main() {

    vec4 positionInfo = texture2D( uTexturePosition, position.xy );

    vec4 worldPosition = modelMatrix * vec4( positionInfo.xyz, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    vDepth = length(uCameraPosition - worldPosition.xyz);
    gl_PointSize = position.z / length( mvPosition.xyz ) * smoothstep(0.0, 0.2, positionInfo.w);
    vHalfSize = gl_PointSize * 0.5;
    vLife = positionInfo.w;

    gl_Position = projectionMatrix * mvPosition;

}
