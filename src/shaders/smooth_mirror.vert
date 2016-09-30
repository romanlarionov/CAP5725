
precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 Normal;
varying vec2 UV;

void main() {
     Normal = normal;
     UV = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}