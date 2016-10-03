
precision mediump float;
precision mediump int;

uniform vec3 color;
uniform vec3 specular;
uniform sampler2D map;
uniform sampler2D bumpMap;

varying vec3 Normal;
varying vec2 UV;

void main() {
    vec4 c = texture2D(map, UV);
    gl_FragColor = c;//vec4(c, 1.0);
}