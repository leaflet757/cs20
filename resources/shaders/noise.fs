precision mediump float;
varying vec2 texCoord2D;
uniform float time;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
	gl_FragColor = vec4(rand(time*texCoord2D)*vec3(1.0,1.0,1.0),1.0);
}