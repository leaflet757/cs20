precision mediump float;
			
varying vec2 vTextureCoord;

uniform vec3 uTint;
uniform float uTintWeight;
uniform float uAlpha;

uniform sampler2D uSampler;
  
void main(void) {
	vec4 textel = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
	float textelWeight = 1.0-uTintWeight;
	gl_FragColor = vec4((textel.r*textelWeight)+(uTint.r*uTintWeight),(textel.g*textelWeight)+(uTint.g*uTintWeight),(textel.b*textelWeight)+(uTint.b*uTintWeight),textel.a*uAlpha);
}