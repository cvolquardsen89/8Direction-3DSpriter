# 8Direction-3DSpriter

A modern web application for converting 3D animated models into 2D sprite sheets with 8-directional support. Built with React, Three.js, and Vite.

## Features

- **3D Model Support**: Load FBX, GLTF/GLB, and OBJ files
- **8-Directional Sprites**: Generate sprite sheets from 8 different camera angles
- **Animation Support**: Capture animated models at different frames
- **Customizable Export**: Control FPS, frame skip, resolution, and export type
- **Real-time Preview**: Interactive 3D viewer with orbit controls
- **Manual Camera Control**: Fine-tune camera position, FOV, and lighting
- **Transparent PNG Export**: Generate sprite sheets with transparent backgrounds
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to the displayed URL (usually `http://localhost:5173`)

## Usage

1. **Load a 3D Model**: Click "Choose File" and select an FBX, GLTF/GLB, or OBJ file
2. **Adjust Settings**:
   - Camera controls (orbit/manual mode)
   - Lighting (color and intensity)
   - FOV and animation settings
3. **Configure Export**:
   - Choose export type (8 directions, platformer, single)
   - Set resolution, FPS, and frame skip
4. **Export**: Click "Export Sprite Sheet" to download your PNG sprite sheet

## Export Types

- **8 Directions**: Creates a sprite sheet with 8 directional views
- **Platformer**: Single row sprite sheet for side-scrolling games
- **Single**: Single sprite from current camera position

## Controls

- **Orbit Mode**: Mouse controls for camera rotation, zoom, and pan
- **Manual Mode**: Precise control over camera position and angles
- **Lock Current View**: Copy current orbit position to manual controls
- **Animation**: Play/pause and scrub through model animations

## Technical Details

- **Frontend**: React 18 with hooks
- **3D Rendering**: Three.js with React Three Fiber
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS
- **File Loading**: Support for FBX, GLTF/GLB, and OBJ formats

## Browser Support

Works in all modern browsers that support WebGL:
- Chrome 51+
- Firefox 45+
- Safari 10+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Feel free to use and modify as needed.
