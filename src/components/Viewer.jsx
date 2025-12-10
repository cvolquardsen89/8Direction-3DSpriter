import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three'

function CameraUpdater({ fov }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [fov, camera])
  return null
}

function CameraPositioner({ theta, phi, distance, lookAtX, lookAtY, lookAtZ, enableOrbit }) {
  const { camera, controls } = useThree()
  useEffect(() => {
    if (enableOrbit && controls) {
      controls.target.set(lookAtX, lookAtY, lookAtZ)
      controls.update()
    } else if (!enableOrbit) {
      camera.lookAt(lookAtX, lookAtY, lookAtZ)
      camera.updateProjectionMatrix()
    }
  }, [lookAtX, lookAtY, lookAtZ, camera, controls, enableOrbit])

  useEffect(() => {
    if (!enableOrbit) {
      // Update camera position based on spherical coordinates
      const x = distance * Math.sin(phi) * Math.cos(theta)
      const y = distance * Math.cos(phi)
      const z = distance * Math.sin(phi) * Math.sin(theta)

      camera.position.set(x, y, z)
      camera.lookAt(lookAtX, lookAtY, lookAtZ)
      camera.updateProjectionMatrix()
    }
  }, [theta, phi, distance, lookAtX, lookAtY, lookAtZ, camera, enableOrbit])

  return null
}

function Model({ url, fileName, isPlaying, animationTime, setMaxTime, setAnimationTime, modelRef, exportTime }) {
  const [model, setModel] = useState(null)
  const mixerRef = useRef(null)
  const actionRef = useRef(null)

  useEffect(() => {
    if (!url) return

    const extension = fileName.split('.').pop().toLowerCase()
    let loader

    if (extension === 'fbx') {
      loader = new FBXLoader()
    } else if (extension === 'gltf' || extension === 'glb') {
      loader = new GLTFLoader()
    } else if (extension === 'obj') {
      loader = new OBJLoader()
    } else {
      return
    }

    loader.load(url, (object) => {
      try {
        let scene
        let animations = []
        if (extension === 'gltf' || extension === 'glb') {
          scene = object.scene
          animations = object.animations || []
        } else {
          scene = object
          animations = object.animations || []
        }

        // Handle materials and textures
        if (scene && typeof scene.traverse === 'function') {
          scene.traverse((child) => {
            if (child.isMesh) {
              if (!child.material) {
                child.material = new THREE.MeshStandardMaterial({ color: 0x888888 })
              }
              // Ensure material is standard for lighting
              if (child.material && child.material.type !== 'MeshStandardMaterial') {
                try {
                  child.material = new THREE.MeshStandardMaterial({
                    map: child.material.map,
                    color: child.material.color || 0x888888
                  })
                } catch (error) {
                  console.error('Error updating material:', error)
                }
              }
            }
          })
        }

        console.log('Loaded model:', scene)
        console.log('Animations:', animations.length)

        // Center the model
        const box = new THREE.Box3().setFromObject(scene)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        scene.position.sub(center)
        
        // Scale model to fit in view
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim > 0) {
          const scale = 2 / maxDim  // Fit in a 2-unit sphere
          scene.scale.setScalar(scale)
        }

        console.log('Model loaded, centered, and scaled. Original size:', size, 'New scale:', scene.scale)

        if (animations.length > 0) {
          try {
            const mixer = new THREE.AnimationMixer(scene)
            const action = mixer.clipAction(animations[0])
            action.loop = THREE.LoopRepeat
            action.play()
            mixerRef.current = mixer
            actionRef.current = action
            setMaxTime(animations[0].duration || 1)
          } catch (error) {
            console.error('Error setting up animation:', error)
            setMaxTime(1)
          }
        } else {
          setMaxTime(1)
        }
        setModel(scene)
      } catch (error) {
        console.error('Error loading model:', error)
        setModel(null)
      }
    })
  }, [url, fileName, setMaxTime])

  useEffect(() => {
    if (mixerRef.current) {
      mixerRef.current.setTime(animationTime)
    }
  }, [animationTime])

  useEffect(() => {
    if (exportTime !== undefined && mixerRef.current) {
      mixerRef.current.setTime(exportTime)
    }
  }, [exportTime])

  useFrame((state, delta) => {
    if (mixerRef.current && isPlaying && exportTime === undefined) {
      mixerRef.current.update(delta)
      setAnimationTime(mixerRef.current.time)
    }
  })

  return model ? <group ref={modelRef}><primitive object={model} /></group> : null
}

function ExportHandler({ fileName, maxTime, exportParams, modelRef, exportFps, exportFrameSkip, exportType, setExportTime, exportResolution, setIsExporting }) {
  const { gl, scene, camera } = useThree()

  const exportSpriteSheet = async () => {
    console.log('Starting sprite sheet export')
    if (!modelRef.current) {
      console.log('No model loaded')
      alert('No model loaded!')
      return
    }
    
    setIsExporting(true)
    
    // Wait for React to re-render and hide the grid
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('Model ref:', modelRef.current)
    console.log('Model children:', modelRef.current.children)
    console.log('Model position:', modelRef.current.position)
    console.log('Model scale:', modelRef.current.scale)

    const context = gl.getContext()
    const spriteSize = Math.floor(Number(exportResolution)) || 128

    let directions, totalFrames
    if (exportType === 'single') {
      directions = 8
      totalFrames = 1
    } else if (exportType === 'platformer') {
      directions = 1
      totalFrames = Math.floor(maxTime * exportFps)
    } else { // 8directions
      directions = 8
      totalFrames = Math.floor(maxTime * exportFps)
    }

    const capturedImages = []

    // Store original camera settings
    const originalPosition = camera.position.clone()
    const originalFov = camera.fov
    const originalSize = { width: gl.domElement.width, height: gl.domElement.height }
    const originalClearColor = gl.getClearColor(new THREE.Color())
    const originalClearAlpha = gl.getClearAlpha()

    // Set transparent clear color (black with 0 alpha = transparent)
    gl.setClearColor(0x000000, 0)
    
    // Temporarily resize renderer for sprite capture
    gl.setSize(spriteSize, spriteSize, false)
    camera.aspect = 1
    camera.updateProjectionMatrix()

    // Render each direction and frame
    for (let dir = 0; dir < directions; dir++) {
      const angle = (dir / directions) * Math.PI * 2
      for (let frame = 0; frame < totalFrames; frame++) {
        if (frame % (exportFrameSkip + 1) !== 0) continue

        const frameTime = frame / exportFps

        // Set camera angle for this direction - use simpler positioning
        const radius = exportParams.cameraDistance || 5
        const height = exportParams.cameraPhi || Math.PI / 2
        const angle = (dir / directions) * Math.PI * 2
        
        // Position camera in a circle around the look-at point
        camera.position.x = exportParams.cameraLookAtX + radius * Math.cos(angle) * Math.sin(height)
        camera.position.y = exportParams.cameraLookAtY + radius * Math.cos(height)
        camera.position.z = exportParams.cameraLookAtZ + radius * Math.sin(angle) * Math.sin(height)
        
        camera.lookAt(exportParams.cameraLookAtX, exportParams.cameraLookAtY, exportParams.cameraLookAtZ)
        camera.updateMatrixWorld()

        // Debug: Log camera position
        console.log(`Direction ${dir}, Frame ${frame}: Camera at`, camera.position, 'looking at', exportParams.cameraLookAtX, exportParams.cameraLookAtY, exportParams.cameraLookAtZ)

        // Set animation time
        setExportTime(frameTime)

        // Wait for next tick to ensure mixer is updated
        await new Promise(resolve => setTimeout(resolve, 0))

        // Clear with transparent background and render
        gl.clear()

        // Render the scene
        gl.render(scene, camera)

        // Get image data from the canvas instead of WebGL directly
        const canvas = gl.domElement
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = spriteSize
        tempCanvas.height = spriteSize
        const tempCtx = tempCanvas.getContext('2d')
        
        // Draw the WebGL canvas content to our temp canvas
        tempCtx.drawImage(canvas, 0, 0, spriteSize, spriteSize)
        
        // Get image data from the temp canvas
        const imageData = tempCtx.getImageData(0, 0, spriteSize, spriteSize)
        const pixels = imageData.data
        
        // Debug: Check if pixels have any non-zero values
        let hasVisiblePixels = false
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 0 || pixels[i + 1] > 0 || pixels[i + 2] > 0 || pixels[i + 3] > 0) {
            hasVisiblePixels = true
            break
          }
        }
        console.log(`Frame ${frame}, Direction ${dir}: Has visible pixels:`, hasVisiblePixels)
        console.log('Sample pixels (first 20):', pixels.slice(0, 20))
        
        capturedImages.push(imageData)
      }
    }

    // Reset export time and exporting state
    setExportTime(undefined)
    setIsExporting(false)

    // Calculate sprite sheet dimensions
    let rows, cols
    if (exportType === 'platformer') {
      rows = 1
      cols = capturedImages.length
    } else if (exportType === '8directions') {
      rows = directions
      cols = capturedImages.length / directions
    } else { // single
      rows = 1
      cols = directions
    }

    const spriteSheetWidth = cols * spriteSize
    const spriteSheetHeight = rows * spriteSize

    // Create canvas for sprite sheet
    const canvas = document.createElement('canvas')
    canvas.width = spriteSheetWidth
    canvas.height = spriteSheetHeight
    const finalCtx = canvas.getContext('2d', { alpha: true })

    // Clear with transparent background
    finalCtx.clearRect(0, 0, spriteSheetWidth, spriteSheetHeight)

    // Draw captured images to sprite sheet
    for (let i = 0; i < capturedImages.length; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      const x = col * spriteSize
      const y = row * spriteSize
      finalCtx.putImageData(capturedImages[i], x, y)
    }

    // Restore original settings
    gl.setSize(originalSize.width, originalSize.height, false)
    camera.aspect = originalSize.width / originalSize.height
    camera.position.copy(originalPosition)
    camera.fov = originalFov
    camera.updateProjectionMatrix()
    gl.setClearColor(originalClearColor, originalClearAlpha)

    // Download the sprite sheet
    console.log('Creating blob and downloading')
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName || 'model'}_spritesheet.png`
      document.body.appendChild(a)
      a.click()
      console.log('Download triggered')
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  useEffect(() => {
    const handleExport = (event) => {
      exportSpriteSheet()
    }
    
    window.addEventListener('exportSpriteSheet', handleExport)
    return () => window.removeEventListener('exportSpriteSheet', handleExport)
  }, [fileName, maxTime])

  return null
}

function LockViewHandler({ lockTrigger, setCameraTheta, setCameraPhi, setCameraDistance, setCameraLookAtX, setCameraLookAtY, setCameraLookAtZ }) {
  const { camera, controls } = useThree()

  useEffect(() => {
    if (lockTrigger > 0) {
      if (controls) {
        setCameraLookAtX(controls.target.x)
        setCameraLookAtY(controls.target.y)
        setCameraLookAtZ(controls.target.z)
      }
      const position = camera.position
      const distance = position.length()
      const theta = Math.atan2(position.x, position.z)
      const phi = Math.acos(position.y / distance)
      setCameraTheta(theta)
      setCameraPhi(phi)
      setCameraDistance(distance)
    }
  }, [lockTrigger, camera, controls, setCameraTheta, setCameraPhi, setCameraDistance, setCameraLookAtX, setCameraLookAtY, setCameraLookAtZ])

  return null
}

function Viewer({ fileUrl, fileName, isPlaying, animationTime, setMaxTime, maxTime, fov, lightColor, lightIntensity, setAnimationTime, cameraTheta, cameraPhi, cameraDistance, cameraLookAtX, cameraLookAtY, cameraLookAtZ, enableOrbit, exportFps, exportFrameSkip, exportType, exportResolution, lockCurrentViewSetter, setCameraTheta, setCameraPhi, setCameraDistance, setCameraLookAtX, setCameraLookAtY, setCameraLookAtZ }) {
  const modelRef = useRef()
  const [exportTime, setExportTime] = useState()
  const [isExporting, setIsExporting] = useState(false)
  const [lockTrigger, setLockTrigger] = useState(0)

  useEffect(() => {
    if (lockCurrentViewSetter) {
      lockCurrentViewSetter(() => setLockTrigger(prev => prev + 1))
    }
  }, [lockCurrentViewSetter])

  const exportParams = {
    cameraDistance,
    cameraPhi,
    cameraLookAtX,
    cameraLookAtY,
    cameraLookAtZ
  }

  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [5, 5, 5], fov }}
        gl={{ 
          alpha: true, 
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Camera FOV and position updaters */}
        <CameraUpdater fov={fov} />
        <CameraPositioner 
          theta={cameraTheta} 
          phi={cameraPhi} 
          distance={cameraDistance} 
          lookAtX={cameraLookAtX} 
          lookAtY={cameraLookAtY} 
          lookAtZ={cameraLookAtZ} 
          enableOrbit={enableOrbit}
        />
        <LockViewHandler 
          lockTrigger={lockTrigger}
          setCameraTheta={setCameraTheta}
          setCameraPhi={setCameraPhi}
          setCameraDistance={setCameraDistance}
          setCameraLookAtX={setCameraLookAtX}
          setCameraLookAtY={setCameraLookAtY}
          setCameraLookAtZ={setCameraLookAtZ}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={lightIntensity} color={lightColor} />
        {/* Grid helper - only show when not exporting */}
        {!exportTime && !isExporting && <Grid args={[10, 10]} cellSize={1} cellThickness={0.5} cellColor="#666666" sectionSize={5} sectionThickness={1} sectionColor="#888888" fadeDistance={25} fadeStrength={1} />}
        {/* Only show the cube if no model is loaded */}
        {!fileUrl && (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        )}
        {/* Load and display the uploaded model */}
        {fileUrl && (
          <Model 
            url={fileUrl} 
            fileName={fileName} 
            isPlaying={isPlaying} 
            animationTime={animationTime} 
            setMaxTime={setMaxTime} 
            setAnimationTime={setAnimationTime} 
            modelRef={modelRef} 
            exportTime={exportTime}
          />
        )}
        {/* Add OrbitControls for mouse interaction - only show when not exporting */}
        {enableOrbit && !exportTime && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
        <ExportHandler 
          fileName={fileName} 
          maxTime={maxTime} 
          exportParams={exportParams} 
          modelRef={modelRef}
          exportFps={exportFps}
          exportFrameSkip={exportFrameSkip}
          exportType={exportType}
          setExportTime={setExportTime}
          exportResolution={exportResolution}
          setIsExporting={setIsExporting}
        />
      </Canvas>
    </div>
  )
}

export default Viewer
