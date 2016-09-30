
precision mediump float;
precision mediump int;

uniform vec3 color;
uniform vec3 specular;

varying vec3 Normal;
varying vec2 UV;

void main() {
    gl_FragColor = vec4(color, 1.0);
}