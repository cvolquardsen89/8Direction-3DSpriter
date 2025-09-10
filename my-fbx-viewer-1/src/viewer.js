class Viewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
    }

    init(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);
        this.camera.position.z = 5;
    }

    loadModel(fbxFilePath) {
        const loader = new FBXLoader();
        loader.load(fbxFilePath, (object) => {
            this.model = object;
            this.scene.add(this.model);
            this.render();
        }, (error) => {
            console.error('Error loading FBX model:', error);
        });
    }

    render() {
        requestAnimationFrame(() => this.render());
        if (this.model) {
            this.model.rotation.y += 0.01; // Rotate the model for some basic animation
        }
        this.renderer.render(this.scene, this.camera);
    }
}

export default Viewer;