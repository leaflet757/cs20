precision mediump float;

attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float pointSize;

varying vec4 vColor;

void main(void) {
	gl_PointSize = pointSize;
	
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	
	vColor = aVertexColor;
}