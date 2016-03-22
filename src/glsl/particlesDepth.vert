uniform sampler2D uTexturePosition;
uniform vec3 uCameraPosition;
uniform float uParticleSize;

varying float vHalfSize;
varying float vDepth;

void main() {

    vec4 positionInfo = texture2D( uTexturePosition, position.xy );

    vec4 worldPosition = modelMatrix * vec4( positionInfo.xyz, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    vDepth = -mvPosition.z;
    gl_PointSize = position.z / length( mvPosition.xyz ) * smoothstep(0.0, 0.2, positionInfo.w) * uParticleSize;
    vHalfSize = gl_PointSize * 0.5;
    gl_Position = projectionMatrix * mvPosition;

    gl_Position.y += step(200.0, gl_PointSize) * 8192.0;

}
