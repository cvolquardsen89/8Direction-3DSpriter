# 8Direction-3DSpriter

An 8-directional 2D sprite sheet maker using 3D animation files.

## Features

- **FBX Import**: Load 3D models and animations from FBX files
- **8-Direction Camera**: Preset camera positions for all 8 directions (N, NE, E, SE, S, SW, W, NW)
- **Manual Controls**: Fine-tune camera position, distance, and height
- **Lighting System**: Adjustable ambient and directional lighting
- **Animation Control**: Play/pause animations and select specific clips
- **Sprite Generation**: Create sprite sheets with customizable frame counts
- **PNG Export**: Export sprite sheets as PNG images with configurable layouts

## How to Use

1. **Load Model**: Click "Choose File" and select an FBX file, then click "Load FBX"
2. **Set Camera**: Use the directional preset buttons or manual controls to position the camera
3. **Adjust Lighting**: Modify ambient and directional light settings for optimal visibility
4. **Configure Animation**: Select animation clips and set frame count for export
5. **Generate Sprites**: Click "Generate Sprite Sheet" to create frames for all 8 directions
6. **Export**: Click "Export PNG" to download the final sprite sheet

## Technical Details

- Built with HTML5, CSS3, and JavaScript
- Uses Three.js for 3D rendering and FBX loading
- Responsive web interface
- Client-side processing (no server required)

## Running the Application

### Option 1: Local Server
```bash
npm install
npm start
```

### Option 2: Simple HTTP Server
```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Browser Requirements

- Modern browser with WebGL support
- File API support for FBX loading
- Canvas API support for sprite generation
