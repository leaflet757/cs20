precision mediump float;
attribute vec3 aVertexPosition;

uniform float time;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
varying vec2 texCoord2D;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	texCoord2D = aVertexPosition.xy;
}