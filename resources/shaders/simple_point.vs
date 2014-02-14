precision mediump float;
			
attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float pointSize;

void main(void) {
	gl_PointSize = pointSize;
	
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}