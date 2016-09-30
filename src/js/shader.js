
var Shader = function(file, uniforms) {
    this.file = file;
    this.material = new THREE.RawShaderMaterial({
        uniforms,
        side: THREE.DoubleSide, // todo: might want to change
        vertexShader: this._loadShaderFile(this.file + ".vert"),
        fragmentShader: this._loadShaderFile(this.file + ".frag")
    });
};

Shader.prototype = {
    constructor: Shader,

    _loadShaderFile: function(file) {
        var loadedFile;

        $.ajax({
            async: false, // todo: this is deprecated. see to that
            url: '../src/shaders/' + file,
            complete: function(result) {
                loadedFile = result.responseText;
            } 
        });

        return loadedFile;
    }
};