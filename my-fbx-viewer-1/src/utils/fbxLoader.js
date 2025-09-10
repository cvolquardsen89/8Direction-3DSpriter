import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export function loadFBX(filePath, scene, onLoad, onError) {
    const loader = new FBXLoader();
    
    loader.load(
        filePath,
        (object) => {
            scene.add(object);
            if (onLoad) onLoad(object);
        },
        undefined,
        (error) => {
            console.error('An error happened while loading the FBX file:', error);
            if (onError) onError(error);
        }
    );
}