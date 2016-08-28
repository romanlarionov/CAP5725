
var Model = function() {
    this.loadedMesh = {};
    this.meshIsLoaded = false;
    this.usesCustomShader = false;
};
        
Model.prototype = {
    constructor: Model,

    loadOBJ: function(path, name, shaderMaterial, createShader) {
        var that = this; // Used to save global Model scope in loader callback.

        var onProgress = function(xhr) {
		    if (xhr.lengthComputable) {
			    var percentComplete = xhr.loaded / xhr.total * 100;
			    console.log(Math.round(percentComplete, 2) + "% downloaded");
			}
		};

        var onError = function(err) {
		    console.log("Model:" + name + " failed to load");
		    console.log(err);
        };

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath(path);
        mtlLoader.load(name + ".mtl", function(materials) {
            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath(path);
            objLoader.load(name + ".obj", function(mesh) {
                if (shaderMaterial) {
                    mesh.traverse(function(child) {
                        if (child instanceof THREE.Mesh) {
                            if (child.material.materials.length > 0) {
                                that._traverseMesh(child, func);
                            }

                            child.material = func(child);
                        }
                    });

                    that.usesCustomShader = true;
                }

                scene.add(mesh);
                that.loadedMesh = mesh;
                that.meshIsLoaded = true;
            });
        }, onProgress, onError);
    },

    loadJSON: function(path, name, shaderMaterial) {
        var that = this;
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load(path + name, function(geometry, materials) {
            var material = shaderMaterial;
            if (!material) {
                material = new THREE.MultiMaterial(materials);
            }
            var mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            that.loadedMesh = mesh;
            that.meshIsLoaded = true;
        });
    },

    updateUniforms: function(uniforms) {
        if (!this.meshIsLoaded) {
            return;
        }

        var update = function(object) {
            for (uniform in uniforms) {
                if (uniforms.hasOwnProperty(uniform)) { // if not undefined
                    if (!object.material.uniforms.hasOwnProperty(uniform)) {
                        object.material.uniforms[uniform] = {};
                    }
                    object.material.uniforms[uniform] = uniform;
                }
            }
        }

        this._traverseMesh(this.loadedMesh, update);
    },

    _traverseMesh: function(mesh, func) {
        if (!mesh || !func) {
            return;
        }

        var that = this;
        mesh.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                if (child.material.materials.length > 0) {
                    that._traverseMesh(child, func);
                }

                child.material = func(child);
            }
        });
    }
};