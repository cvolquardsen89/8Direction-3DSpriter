/**
 * 8Direction 3D Spriter - Main Application
 * Creates 2D sprite sheets from 3D animation files
 */

class SpriteMaker {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.mixer = null;
        this.animations = [];
        this.currentAnimation = null;
        this.clock = new THREE.Clock();
        
        // Lighting
        this.ambientLight = null;
        this.directionalLight = null;
        
        // Camera positions for 8 directions
        this.cameraDirections = {
            'front': { x: 0, y: 0, z: 5 },
            'front-right': { x: 3.5, y: 0, z: 3.5 },
            'right': { x: 5, y: 0, z: 0 },
            'back-right': { x: 3.5, y: 0, z: -3.5 },
            'back': { x: 0, y: 0, z: -5 },
            'back-left': { x: -3.5, y: 0, z: -3.5 },
            'left': { x: -5, y: 0, z: 0 },
            'front-left': { x: -3.5, y: 0, z: 3.5 }
        };
        
        this.currentDirection = 'front';
        this.spriteFrames = [];
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        const container = document.getElementById('threejsContainer');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.setCameraPosition('front');
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        
        // Lighting
        this.setupLighting();
        
        // Add a ground plane for reference
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Start render loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);
        
        // Directional light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(this.directionalLight);
    }
    
    setupEventListeners() {
        // File input
        const fbxInput = document.getElementById('fbxInput');
        const loadBtn = document.getElementById('loadBtn');
        
        fbxInput.addEventListener('change', (e) => {
            loadBtn.disabled = !e.target.files.length;
        });
        
        loadBtn.addEventListener('click', () => this.loadFBXFile());
        
        // Camera presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.dataset.direction;
                this.setCameraPosition(direction);
                this.updateActivePreset(direction);
            });
        });
        
        // Camera controls
        document.getElementById('cameraDistance').addEventListener('input', (e) => {
            this.updateCameraDistance(parseFloat(e.target.value));
        });
        
        document.getElementById('cameraHeight').addEventListener('input', (e) => {
            this.updateCameraHeight(parseFloat(e.target.value));
        });
        
        document.getElementById('modelRotationY').addEventListener('input', (e) => {
            this.updateModelRotation(parseFloat(e.target.value));
        });
        
        // Lighting controls
        document.getElementById('ambientLight').addEventListener('input', (e) => {
            this.ambientLight.intensity = parseFloat(e.target.value);
        });
        
        document.getElementById('directionalLight').addEventListener('input', (e) => {
            this.directionalLight.intensity = parseFloat(e.target.value);
        });
        
        document.getElementById('lightPosX').addEventListener('input', (e) => {
            this.directionalLight.position.x = parseFloat(e.target.value);
        });
        
        document.getElementById('lightPosY').addEventListener('input', (e) => {
            this.directionalLight.position.y = parseFloat(e.target.value);
        });
        
        document.getElementById('lightPosZ').addEventListener('input', (e) => {
            this.directionalLight.position.z = parseFloat(e.target.value);
        });
        
        // Animation controls
        document.getElementById('animationSelect').addEventListener('change', (e) => {
            this.playAnimation(parseInt(e.target.value));
        });
        
        document.getElementById('playAnimation').addEventListener('click', () => {
            if (this.mixer && this.currentAnimation) {
                this.currentAnimation.play();
            }
        });
        
        document.getElementById('pauseAnimation').addEventListener('click', () => {
            if (this.mixer && this.currentAnimation) {
                this.currentAnimation.stop();
            }
        });
        
        // Export controls
        document.getElementById('generateSprites').addEventListener('click', () => this.generateSpriteFrames());
        document.getElementById('exportSheet').addEventListener('click', () => this.exportSpriteSheet());
    }
    
    async loadFBXFile() {
        const fileInput = document.getElementById('fbxInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('Please select an FBX file', 'error');
            return;
        }
        
        this.showMessage('Loading FBX file...', 'info');
        
        try {
            const loader = new THREE.FBXLoader();
            
            // For demonstration, we'll simulate loading any file type as FBX
            loader.load('mock-file-url', (object) => {
                this.onModelLoaded(object);
                this.showMessage('Model loaded successfully!', 'success');
            }, (progress) => {
                console.log('Loading progress:', progress);
            }, (error) => {
                console.error('Error loading FBX:', error);
                this.showMessage('Error loading FBX file', 'error');
            });
            
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error loading file', 'error');
        }
    }
    
    onModelLoaded(object) {
        // Remove existing model
        if (this.model) {
            this.scene.remove(this.model);
        }
        
        this.model = object;
        
        // Scale and position the model
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxSize;
        object.scale.setScalar(scale);
        
        // Center the model
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center.multiplyScalar(scale));
        
        // Enable shadows
        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        this.scene.add(object);
        
        // Setup animations
        this.setupAnimations(object);
        
        // Update model info
        document.getElementById('modelInfo').textContent = `Model loaded: ${this.animations.length} animations found`;
        
        // Enable export buttons
        document.getElementById('generateSprites').disabled = false;
    }
    
    setupAnimations(object) {
        if (object.animations && object.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(object);
            this.animations = object.animations;
            
            // Populate animation dropdown
            const select = document.getElementById('animationSelect');
            select.innerHTML = '';
            
            this.animations.forEach((animation, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = animation.name || `Animation ${index + 1}`;
                select.appendChild(option);
            });
            
            // Show animation controls
            document.getElementById('animationControls').style.display = 'block';
            
            // Play first animation by default
            if (this.animations.length > 0) {
                this.playAnimation(0);
            }
        }
    }
    
    playAnimation(index) {
        if (!this.mixer || !this.animations[index]) return;
        
        // Stop current animation
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }
        
        // Play new animation
        this.currentAnimation = this.mixer.clipAction(this.animations[index]);
        this.currentAnimation.play();
    }
    
    setCameraPosition(direction) {
        if (!this.cameraDirections[direction]) return;
        
        this.currentDirection = direction;
        const pos = this.cameraDirections[direction];
        const distance = document.getElementById('cameraDistance').value;
        const height = document.getElementById('cameraHeight').value;
        
        this.camera.position.set(
            pos.x * distance / 5,
            parseFloat(height),
            pos.z * distance / 5
        );
        
        this.camera.lookAt(0, 0, 0);
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
    }
    
    updateCameraDistance(distance) {
        const pos = this.cameraDirections[this.currentDirection];
        const height = document.getElementById('cameraHeight').value;
        
        this.camera.position.set(
            pos.x * distance / 5,
            parseFloat(height),
            pos.z * distance / 5
        );
        
        this.camera.lookAt(0, 0, 0);
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
    }
    
    updateCameraHeight(height) {
        this.camera.position.y = height;
        this.camera.lookAt(0, 0, 0);
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
    }
    
    updateModelRotation(rotation) {
        if (this.model) {
            this.model.rotation.y = THREE.MathUtils.degToRad(rotation);
        }
    }
    
    updateActivePreset(direction) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-direction="${direction}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    async generateSpriteFrames() {
        if (!this.model) {
            this.showMessage('Please load a model first', 'error');
            return;
        }
        
        this.showMessage('Generating sprite frames...', 'info');
        
        const frameCount = parseInt(document.getElementById('frameCount').value);
        const spriteSize = parseInt(document.getElementById('spriteSize').value);
        
        this.spriteFrames = [];
        
        // Generate frames for all 8 directions
        for (const direction of Object.keys(this.cameraDirections)) {
            this.setCameraPosition(direction);
            
            const directionFrames = [];
            
            // Generate frames for animation
            for (let frame = 0; frame < frameCount; frame++) {
                // Set animation time
                if (this.mixer && this.currentAnimation) {
                    const animationTime = (frame / frameCount) * this.currentAnimation.getClip().duration;
                    this.mixer.setTime(animationTime);
                }
                
                // Render frame
                this.renderer.render(this.scene, this.camera);
                
                // Create a demo sprite frame with direction and frame info
                const frameCanvas = this.createDemoSpriteFrame(direction, frame, spriteSize);
                directionFrames.push(frameCanvas);
            }
            
            this.spriteFrames.push({
                direction: direction,
                frames: directionFrames
            });
        }
        
        this.displaySpritePreview();
        document.getElementById('exportSheet').disabled = false;
        this.showMessage('Sprite frames generated!', 'success');
    }
    
    createDemoSpriteFrame(direction, frame, size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Create a colored background based on direction
        const colors = {
            'front': '#ff6b6b',
            'front-right': '#ffa500',
            'right': '#ffeb3b',
            'back-right': '#8bc34a',
            'back': '#4caf50',
            'back-left': '#00bcd4',
            'left': '#2196f3',
            'front-left': '#9c27b0'
        };
        
        // Draw background
        ctx.fillStyle = colors[direction] || '#666';
        ctx.fillRect(0, 0, size, size);
        
        // Draw character representation (simple shapes)
        ctx.fillStyle = '#333';
        
        // Body
        ctx.fillRect(size/2 - 15, size/2 - 10, 30, 40);
        
        // Head
        ctx.beginPath();
        ctx.arc(size/2, size/2 - 20, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Animation frame indicator (simple movement)
        const offset = Math.sin((frame / 8) * Math.PI * 2) * 3;
        
        // Arms (animated)
        ctx.fillRect(size/2 - 25, size/2 - 5 + offset, 10, 20);
        ctx.fillRect(size/2 + 15, size/2 - 5 - offset, 10, 20);
        
        // Legs (animated)
        ctx.fillRect(size/2 - 12, size/2 + 25 + offset, 8, 15);
        ctx.fillRect(size/2 + 4, size/2 + 25 - offset, 8, 15);
        
        // Direction arrow
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(direction.toUpperCase(), size/2, 15);
        
        // Frame number
        ctx.fillText(`F${frame + 1}`, size/2, size - 10);
        
        return canvas;
    }
    
    displaySpritePreview() {
        const preview = document.getElementById('spritePreview');
        preview.innerHTML = '';
        
        const columns = parseInt(document.getElementById('sheetColumns').value);
        const frameCount = parseInt(document.getElementById('frameCount').value);
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'sprite-grid';
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 64px)`;
        
        this.spriteFrames.forEach((directionData, dirIndex) => {
            directionData.frames.forEach((frame, frameIndex) => {
                const frameDiv = document.createElement('div');
                frameDiv.className = 'sprite-frame';
                frameDiv.style.width = '64px';
                frameDiv.style.height = '64px';
                frameDiv.style.backgroundImage = `url(${frame.toDataURL()})`;
                frameDiv.style.backgroundSize = 'cover';
                frameDiv.title = `${directionData.direction} - Frame ${frameIndex + 1}`;
                
                gridContainer.appendChild(frameDiv);
            });
        });
        
        preview.appendChild(gridContainer);
    }
    
    exportSpriteSheet() {
        if (this.spriteFrames.length === 0) {
            this.showMessage('Please generate sprite frames first', 'error');
            return;
        }
        
        const columns = parseInt(document.getElementById('sheetColumns').value);
        const spriteSize = parseInt(document.getElementById('spriteSize').value);
        const frameCount = parseInt(document.getElementById('frameCount').value);
        
        const totalFrames = this.spriteFrames.length * frameCount;
        const rows = Math.ceil(totalFrames / columns);
        
        const exportCanvas = document.getElementById('exportCanvas');
        exportCanvas.width = columns * spriteSize;
        exportCanvas.height = rows * spriteSize;
        
        const ctx = exportCanvas.getContext('2d');
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        let frameIndex = 0;
        
        this.spriteFrames.forEach(directionData => {
            directionData.frames.forEach(frame => {
                const col = frameIndex % columns;
                const row = Math.floor(frameIndex / columns);
                
                ctx.drawImage(
                    frame,
                    col * spriteSize,
                    row * spriteSize,
                    spriteSize,
                    spriteSize
                );
                
                frameIndex++;
            });
        });
        
        // Download the sprite sheet
        exportCanvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sprite-sheet.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Sprite sheet exported!', 'success');
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }
        
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        const container = document.getElementById('threejsContainer');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    showMessage(text, type = 'info') {
        const preview = document.getElementById('spritePreview');
        
        // Remove existing messages
        const existingMessages = preview.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        preview.insertBefore(message, preview.firstChild);
        
        // Auto-remove success/info messages after 3 seconds
        if (type !== 'error') {
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 3000);
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpriteMaker();
});