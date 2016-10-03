
#extension GL_OES_standard_derivatives : enable

precision mediump float;
precision mediump int;

uniform vec3 camera;
uniform samplerCube envMap;
uniform sampler2D bumpMap;

varying vec3 Position;
varying vec2 UV;

void main() {
    vec3 normal = normalize(texture2D(bumpMap, UV).rgb * 2.0 - 1.0);
    vec3 Q1 = dFdx(Position);
    vec3 Q2 = dFdy(Position);
    vec2 st1 = dFdx(UV);
    vec2 st2 = dFdy(UV);
    vec3 tangent = normalize(Q1 * st2.t - Q2 * st1.t);
    vec3 bitangent = normalize(Q1 * st2.s - Q2 * st1.s);
    mat3 TBN = mat3(tangent, bitangent, normal);
    normal = TBN * normal;

    vec3 viewDir = normalize(Position - camera);
    vec3 reflection = reflect(viewDir, normal);
    vec3 color = textureCube(envMap, reflection).rgb;

    gl_FragColor = vec4(color, 1.0);
}