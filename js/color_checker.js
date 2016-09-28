
var ColorChecker = function() {
    var checker;
};

ColorChecker.prototype = {
    constructor: ColorChecker,
    
    _rawVertShader: 
        "precision mediump float;" +
        "precision mediump int;" +

        "uniform mat4 modelViewMatrix;" +
        "uniform mat4 projectionMatrix;" +

        "attribute vec3 position;" +
        "attribute vec3 color;" +

        "varying vec3 Color;" +

        "void main() {" +
        "    Color = color;" +
        "    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);" +
        "}",

    _rawFragShader: 
        "precision mediump float;" +
        "precision mediump int;" +

        "varying vec3 Color;" +

        "void main() {" +
            "gl_FragColor = vec4(Color, 1.0);" +
        "}",

    _sRGBTransformation: new THREE.Matrix4().set(3.2406, -0.9689, 0.0557, 0.0,
                                           -1.5372, 1.8758, -0.204, 0.0
                                           -0.4986, 0.0415, 1.057, 0.0,
                                           0.0, 0.0, 0.0, 1.0),
    
    create: function(len) {
        if (len === null) len = 1;
        
        // color checker has 24 boxes with different colors
        var vertices = [];
        var colors = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 6; j++) {
                var stepx = i * len;
                var v0 = [i*len, j*len, 0]; // todo: vertices aren't spread out correctly
                var v1 = [i*len, j*len + len, 0];
                var v2 = [i*len + len, j*len + len, 0];
                var v3 = [i*len + len, j*len, 0];

                vertices.push.apply(vertices, v0);
                vertices.push.apply(vertices, v1);
                vertices.push.apply(vertices, v2);
                vertices.push.apply(vertices, v0);
                vertices.push.apply(vertices, v2);
                vertices.push.apply(vertices, v3);

                // perform conversion of spectral information to RGB space then store in attribute buffer.
                var xyz = this.spectrumToXYZ(i * 6 + j);
                var rgbVec = this.XYZToRGB(this._sRGBTransformation, xyz);
                var rgb = [rgbVec.x, rgbVec.y, rgbVec.z];
                //var rgb = [i / 4, j / 6, 0];
                for (var k = 0; k < 6; k++) {
                    colors.push.apply(colors, rgb);
                }
            }
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

        var uniforms = {};
        var shaderMaterial = new THREE.RawShaderMaterial({
            uniforms,
            side: THREE.DoubleSide,
            vertexShader: this._rawVertShader,
            fragmentShader: this._rawFragShader 
        });

        this.checker = new THREE.Mesh(geometry, shaderMaterial);
    },

    /**
     * Converts from an normal human reflection spectrum function to 1931 CIE XYZ space.
     */
    spectrumToXYZ:  function(checkerIndex) {

        var X = 0, Y = 0, Z = 0;
        // The spectral data I have is strided by 5 nm increments. Lower stride would be more accurate.
        for (var i = 0; i <= (780 - 380) / 5; i += 1) {
            // reflection spectrum function for individual checker
            var reflectanceSpectra = MacbethColorCheckerData[checkerIndex][i];
            var lightSourceEmission = D65EmissionSpectra[i];
            var reflectedLightIntesity = CIEColorMatchFunction[i];
            X += reflectanceSpectra * lightSourceEmission * reflectedLightIntesity[0];
            Y += reflectanceSpectra * lightSourceEmission * reflectedLightIntesity[1];
            Z += reflectanceSpectra * lightSourceEmission * reflectedLightIntesity[2];
        }

        var XYZ = (X + Y + Z);

        // return xyY
        return new THREE.Vector4(X/XYZ, Y/XYZ, Y, 1.0);
    },

    /**
     * Converts from 1931 CIE XYZ space to RGB space.
     * Used to transform colors from chromaticity map to clamped 3D space
     * where RGB values range from 0 to 1.
     */
    XYZToRGB: function(primaryColors, chromaticity) {

        //    T * rgb = I * chromaticity
        // => T * rgb = chromaticity
        // => rgb = T^-1 * chromaticity

        //var invertedPrimaries = new THREE.Matrix4();
        //invertedPrimaries.getInverse(primaryColors);
        chromaticity.set(chromaticity.z * chromaticity.x / chromaticity.y,
                         chromaticity.z,
                         chromaticity.z * (1 - chromaticity.x - chromaticity.y),
                         1.0);
        chromaticity.applyMatrix4(primaryColors);

        return chromaticity.clone();
    }

    /*_invert3x3Mat: function(mat) {
        var a00 = mat[1][1] * mat[0][2] - mat[1][2] * mat[0][1];
        var a01 = mat[1][0] * mat[0][2] - mat[1][2] * mat[0][0];
        var a02 = mat[1][0] * mat[0][1] - mat[1][1] * mat[0][0];

        var a10 = mat[2][1] * mat[0][2] - mat[2][2] * mat[0][1];
        var a11 = mat[2][0] * mat[0][2] - mat[2][2] * mat[0][0];
        var a12 = mat[2][0] * mat[0][1] - mat[2][1] * mat[0][0];

        var a20 = mat[2][1] * mat[][] - mat[][] * mat[][];
        var a21 = mat[][] * mat[][] - mat[][] * mat[][];
        var a22 = mat[][] * mat[][] - mat[][] * mat[][];

        return [[a00, a01, a02], [a10, a11, a12], [a20, a21, a22]];
    }*/
};