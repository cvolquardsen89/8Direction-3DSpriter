---
description: 'You are my coding assistant. I want to build a modern, user-friendly web application using React + Vite + TailwindCSS + Three.js. 
The app converts 3D animation files (.fbx, .gltf, .obj) into 2D sprite sheet PNGs.

Requirements:

Core Features:
1. File Import/Export:
   - Import 3D model and animation files (.fbx, .gltf, .obj).
   - Export as a 2D PNG sprite sheet.
   - Export must always have a transparent background (no solid fill).
   - Frame-skipping option (export every X frames).
   - Option to export single-frame renders or full animations.

2. 3D Viewport:
   - Large real-time 3D viewport in the center.
   - Use Three.js WebGLRenderer with `alpha: true` to ensure transparency.
   - OrbitControls for rotate, pan, zoom.
   - Smooth, responsive rendering.
   - Grid/floor toggle for orientation (toggle does not affect export transparency).

3. Controls & UI:
   - Modern sidebar with collapsible sections:
     - **Import Section** → drag-and-drop or file picker.
     - **Animation Controls** → play/pause, timeline slider, frame skip.
     - **Camera Controls** → orbit, reset, FOV slider, position sliders.
     - **Lighting Controls** → color picker, intensity slider, direction adjuster.
     - **Export Options** → rows, columns, frame skip, "Export Sprite Sheet" button.
   - Real-time preview of the generated sprite sheet before saving.
   - Use TailwindCSS + shadcn/ui components for a polished, intuitive UI.

4. Sprite Sheet Export:
   - Frames captured from the Three.js canvas (transparent background).
   - Packed into a single PNG sprite sheet using Canvas API.
   - User sets rows, columns.
   - Option to export individual frames as a ZIP.
   - Transparency must be preserved in all cases.

Tech Stack:
- React + Vite for frontend.
- TailwindCSS for styling.
- Three.js for 3D rendering.
- Canvas API for sprite sheet generation.
- JSZip for frame exports.

Rules:
- Organize into React components: Viewer, Sidebar, Importer, Controls, Exporter.
- Write clean, production-ready code with comments.
- Scaffold step by step:
  1. Setup React + Vite + Tailwind project.
  2. Add Three.js viewport with OrbitControls and transparent renderer.
  3. Add sidebar UI layout.
  4. Implement file import + model preview.
  5. Add animation playback + timeline.
  6. Add camera + lighting controls.
  7. Implement transparent sprite sheet export pipeline.
  8. Add sprite sheet preview before download.
  9. Polish UI with tooltips, smooth animations, dark mode toggle.

Extra Feature Ideas:
- Save/load presets for camera & lighting setups.
- Auto-center camera button.
- Keyboard shortcuts for quick actions.
- Export JSON metadata alongside sprite sheet.
- Mobile-responsive design with collapsible controls.

Deliverable:
Start by scaffolding a React + Vite + Tailwind project with:
- Left sidebar for controls
- Right side main Three.js viewport
- WebGLRenderer initialized with `alpha: true` for transparent background
Then expand iteratively to support import, animation playback, and sprite sheet export.'
tools: []
---
Define the purpose of this chat mode and how AI should behave: response style, available tools, focus areas, and any mode-specific instructions or constraints.