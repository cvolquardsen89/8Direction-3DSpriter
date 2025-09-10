import { Viewer } from './viewer.js';
import { loadFBX } from './utils/fbxLoader.js';

const viewer = new Viewer();

document.getElementById('load-button').addEventListener('click', () => {
    const filePath = document.getElementById('file-input').value;
    loadFBX(filePath)
        .then(model => {
            viewer.loadModel(model);
            viewer.render();
        })
        .catch(error => {
            console.error('Error loading FBX model:', error);
        });
});

viewer.init();