
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

   _sRGBTransformation: new THREE.Matrix4().set(3.2406, -1.5372, -0.4986, 0.0,
                                                -0.9689, 1.8758, 0.0415, 0.0,
                                                0.0557, -0.204, 1.057, 0.0,
                                                0.0, 0.0, 0.0, 1.0),

    create: function(len) {
        if (len === null) len = 1;
        
        // color checker has 24 boxes with different colors
        var vertices = [];
        var colors = [];
        var scalingFactor = this.computeScaling();
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
                var rgbVec = this.XYZToRGB(this._sRGBTransformation, xyz.multiplyScalar(1/scalingFactor));
                var rgb = [rgbVec.x, rgbVec.y, rgbVec.z];
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
            X += reflectanceSpectra * D65EmissionSpectra[i] * CIEColorMatchFunction[i][0];
            Y += reflectanceSpectra * D65EmissionSpectra[i] * CIEColorMatchFunction[i][1];
            Z += reflectanceSpectra * D65EmissionSpectra[i] * CIEColorMatchFunction[i][2];
        }

        // return standard coordinates for current checker color
        return new THREE.Vector4(X, Y, Z, 1.0);
    },

    computeScaling: function() {
        var Y = 0;
        for (var i = 0; i <= (780 - 380) / 5; i += 1) {
            Y +=  D65EmissionSpectra[i] * CIEColorMatchFunction[i][1];
        }

        return Y; 
    },

    /**
     * Converts from 1931 CIE XYZ space to RGB space.
     * Used to transform colors from chromaticity map to clamped 3D space
     * where RGB values range from 0 to 1.
     */
    XYZToRGB: function(primaryColors, standardColor) {

        //    T * rgb = I * standardColor
        // => T * rgb = standardColor
        // => rgb = T^-1 * standardColor

        standardColor.applyMatrix4(primaryColors);
        return standardColor.clone();
    }
};