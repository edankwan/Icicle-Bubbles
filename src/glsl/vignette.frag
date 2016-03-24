uniform sampler2D uDiffuse;
uniform vec2 uResolution;

uniform float uReduction;
uniform float uBoost;

float range(float vmin, float vmax, float value) {
  return (value - vmin) / (vmax - vmin);
}

void main() {

  vec4 color = texture2D( uDiffuse, gl_FragCoord.xy / uResolution );

  vec2 center = uResolution * 0.5;
  float vignette = range(0.25, 1.0, distance( center, gl_FragCoord.xy ) / uResolution.x);
  vignette = uBoost - vignette * uReduction;

  color.rgb *= vignette;
  gl_FragColor = color;

}
