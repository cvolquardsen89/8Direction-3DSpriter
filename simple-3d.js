/**
 * Simple 3D Mock System for demonstration
 * This is a simplified implementation for the demo
 */

// Mock THREE.js-like API for demonstration
window.THREE = {
    Scene: function() {
        return {
            background: null,
            add: function(object) { console.log('Added object to scene'); },
            remove: function(object) { console.log('Removed object from scene'); }
        };
    },
    
    PerspectiveCamera: function(fov, aspect, near, far) {
        return {
            position: { x: 0, y: 0, z: 5, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } },
            rotation: { x: 0, y: 0, z: 0 },
            lookAt: function(x, y, z) { console.log('Camera looking at:', x, y, z); },
            updateProjectionMatrix: function() { console.log('Camera projection updated'); },
            aspect: aspect
        };
    },
    
    WebGLRenderer: function(options) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.background = '#222';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        // Draw a placeholder 3D scene
        const ctx = canvas.getContext('2d');
        this.drawPlaceholderScene = function() {
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            for (let i = 0; i <= canvas.width; i += 50) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i <= canvas.height; i += 50) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            
            // Draw placeholder model
            ctx.fillStyle = '#666';
            ctx.fillRect(canvas.width/2 - 50, canvas.height/2 - 50, 100, 100);
            
            // Draw text
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('3D Viewer', canvas.width/2, 30);
            ctx.fillText('Load an FBX file to see your model here', canvas.width/2, canvas.height - 30);
        };
        
        this.drawPlaceholderScene();
        
        return {
            domElement: canvas,
            setSize: function(width, height) {
                canvas.width = width;
                canvas.height = height;
                this.drawPlaceholderScene?.();
            }.bind(this),
            render: function(scene, camera) {
                this.drawPlaceholderScene();
            }.bind(this),
            shadowMap: {
                enabled: false,
                type: null
            },
            preserveDrawingBuffer: true
        };
    },
    
    Color: function(color) {
        return { color: color };
    },
    
    AmbientLight: function(color, intensity) {
        return {
            intensity: intensity,
            color: color
        };
    },
    
    DirectionalLight: function(color, intensity) {
        return {
            intensity: intensity,
            color: color,
            position: { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } },
            castShadow: false,
            shadow: {
                mapSize: { width: 2048, height: 2048 }
            }
        };
    },
    
    PlaneGeometry: function(width, height) {
        return { width: width, height: height };
    },
    
    MeshLambertMaterial: function(options) {
        return { color: options.color };
    },
    
    Mesh: function(geometry, material) {
        return {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            receiveShadow: false,
            castShadow: false
        };
    },
    
    Clock: function() {
        let lastTime = Date.now();
        return {
            getDelta: function() {
                const now = Date.now();
                const delta = (now - lastTime) / 1000;
                lastTime = now;
                return delta;
            }
        };
    },
    
    AnimationMixer: function(object) {
        return {
            clipAction: function(clip) {
                return {
                    play: function() { console.log('Animation playing'); },
                    stop: function() { console.log('Animation stopped'); },
                    getClip: function() { return { duration: 1.0 }; }
                };
            },
            setTime: function(time) { console.log('Animation time set to:', time); },
            update: function(delta) { /* Animation update */ }
        };
    },
    
    Box3: function() {
        return {
            setFromObject: function(object) {
                return this;
            },
            getSize: function(target) {
                return { x: 2, y: 2, z: 2 };
            },
            getCenter: function(target) {
                return { x: 0, y: 0, z: 0, multiplyScalar: function(s) { return this; } };
            }
        };
    },
    
    Vector3: function(x, y, z) {
        return { x: x || 0, y: y || 0, z: z || 0 };
    },
    
    MathUtils: {
        degToRad: function(degrees) {
            return degrees * Math.PI / 180;
        }
    },
    
    PCFSoftShadowMap: 'PCFSoftShadowMap'
};

// Mock OrbitControls
THREE.OrbitControls = function(camera, domElement) {
    return {
        enableDamping: true,
        dampingFactor: 0.25,
        update: function() { /* Update controls */ }
    };
};

// Mock FBXLoader
THREE.FBXLoader = function() {
    return {
        load: function(url, onLoad, onProgress, onError) {
            // Simulate loading delay
            setTimeout(() => {
                // Create a mock FBX object with animations
                const mockObject = {
                    scale: {
                        setScalar: function(scale) { console.log('Scale set to:', scale); }
                    },
                    position: {
                        sub: function(vector) { return this; }
                    },
                    rotation: { x: 0, y: 0, z: 0 },
                    traverse: function(callback) {
                        // Simulate mesh children
                        for (let i = 0; i < 3; i++) {
                            callback({
                                isMesh: true,
                                castShadow: false,
                                receiveShadow: false
                            });
                        }
                    },
                    animations: [
                        { name: 'Idle Animation', duration: 2.0 },
                        { name: 'Walk Animation', duration: 1.5 },
                        { name: 'Run Animation', duration: 1.0 }
                    ]
                };
                
                onLoad(mockObject);
            }, 1000);
        }
    };
};