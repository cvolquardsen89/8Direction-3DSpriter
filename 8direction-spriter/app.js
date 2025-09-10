const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('renderCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

const loader = new THREE.FBXLoader();
let model;

document.getElementById('loadModel').addEventListener('click', () => {
    const file = document.getElementById('modelInput').files[0];
    if (file) {
        loader.load(URL.createObjectURL(file), (fbx) => {
            model = fbx;
            scene.add(model);
        });
    }
});

document.getElementById('captureSprites').addEventListener('click', () => {
    if (!model) return;
    const directions = [0, 45, 90, 135, 180, 225, 270, 315]; // 8 directions in degrees
    directions.forEach((angle, index) => {
        model.rotation.y = THREE.MathUtils.degToRad(angle);
        renderer.render(scene, camera);
        const dataURL = renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `sprite_${index}.png`;
        link.click();
    });
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
