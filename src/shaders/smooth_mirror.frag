
precision mediump float;
precision mediump int;

uniform vec3 camera;
uniform samplerCube envMap;
uniform vec3 fresnel;

varying vec3 Position;
varying vec3 Normal;

//float calculateFresnel(float theta) {
//    return (fresnel + (1 - fresnel) * pow(1 - cos(theta), 5));
//}

void main() {
    vec3 normal = normalize(Normal);
    vec3 viewDir = normalize(Position - camera);
    vec3 reflection = reflect(viewDir, normal);
    vec3 color = textureCube(envMap, reflection).rgb;

    //color = mix(materialColor, color, calculateFresnel());

    gl_FragColor = vec4(color, 1.0);
}