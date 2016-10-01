
precision mediump float;
precision mediump int;

uniform vec3 camera;
uniform samplerCube envMap;

varying vec3 Position;
varying vec3 Normal;

void main() {
    vec3 viewDir = normalize(Position - camera);
    vec3 reflection = reflect(viewDir, normalize(Normal));
    vec3 color = textureCube(envMap, reflection).rgb;

    gl_FragColor = vec4(color, 1.0);
}