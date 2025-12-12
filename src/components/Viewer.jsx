import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useState, useRef, useEffect, useCallback } from 'react'
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

function CameraPositioner({ theta, phi, distance, lookAtX, lookAtY, lookAtZ, enableOrbit, refreshToken }) {
  const { camera, controls } = useThree()
  useEffect(() => {
    if (enableOrbit && controls) {
      controls.target.set(lookAtX, lookAtY, lookAtZ)
      controls.update()
    } else if (!enableOrbit) {
      camera.lookAt(lookAtX, lookAtY, lookAtZ)
      camera.updateProjectionMatrix()
    }
  }, [lookAtX, lookAtY, lookAtZ, camera, controls, enableOrbit, refreshToken])

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
  }, [theta, phi, distance, lookAtX, lookAtY, lookAtZ, camera, enableOrbit, refreshToken])

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

function ExportHandler({ fileName, maxTime, exportParams, modelRef, exportFps, exportFrameSkip, exportType, setExportTime, exportResolution, setIsExporting, onExportDone }) {
  const { gl, scene, camera } = useThree()

  const { cameraDistance, cameraPhi, cameraLookAtX, cameraLookAtY, cameraLookAtZ } = exportParams

  const exportSpriteSheet = useCallback(async () => {
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

    const spriteSize = Math.floor(Number(exportResolution)) || 128

    let directions, totalFrames
    if (exportType === 'single') {
      directions = 8
      totalFrames = 1
    } else if (exportType === 'platformer') {
      directions = 2
      totalFrames = Math.floor(maxTime * exportFps)
    } else { // 8directions
      directions = 8
      totalFrames = Math.floor(maxTime * exportFps)
    }

    const capturedImages = []

    // Store original camera/render settings so the viewer returns to exactly the same view.
    const originalPosition = camera.position.clone()
    const originalQuaternion = camera.quaternion.clone()
    const originalUp = camera.up.clone()
    const originalFov = camera.fov
    const originalAspect = camera.aspect
    const originalSize = { width: gl.domElement.width, height: gl.domElement.height }
    const originalClearColor = gl.getClearColor(new THREE.Color())
    const originalClearAlpha = gl.getClearAlpha()

    try {
      // Set transparent clear color (black with 0 alpha = transparent)
      gl.setClearColor(0x000000, 0)

      // Temporarily resize renderer for sprite capture
      gl.setSize(spriteSize, spriteSize, false)
      camera.aspect = 1
      camera.updateProjectionMatrix()

      // Render each direction and frame
      for (let dir = 0; dir < directions; dir++) {
        for (let frame = 0; frame < totalFrames; frame++) {
          if (frame % (exportFrameSkip + 1) !== 0) continue

          const frameTime = frame / exportFps

          // Set camera angle for this direction - use simpler positioning
          const radius = cameraDistance || 5
          const height = cameraPhi || Math.PI / 2
          let angle

          if (exportType === 'platformer') {
            // For platformer: 0° (right-facing) and 180° (left-facing)
            angle = dir * Math.PI
          } else {
            // For other modes: full 360° circle
            angle = (dir / directions) * Math.PI * 2
          }

          // Position camera in a circle around the look-at point
          camera.position.x = cameraLookAtX + radius * Math.cos(angle) * Math.sin(height)
          camera.position.y = cameraLookAtY + radius * Math.cos(height)
          camera.position.z = cameraLookAtZ + radius * Math.sin(angle) * Math.sin(height)

          camera.lookAt(cameraLookAtX, cameraLookAtY, cameraLookAtZ)
          camera.updateMatrixWorld()

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
          capturedImages.push(imageData)
        }
      }
    } finally {
      // Always restore camera/render state, even if export fails.
      setExportTime(undefined)
      setIsExporting(false)

      gl.setSize(originalSize.width, originalSize.height, false)
      camera.aspect = originalAspect
      camera.fov = originalFov
      camera.position.copy(originalPosition)
      camera.quaternion.copy(originalQuaternion)
      camera.up.copy(originalUp)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      gl.setClearColor(originalClearColor, originalClearAlpha)

      onExportDone?.()
    }

    // Calculate sprite sheet dimensions
    let rows, cols
    if (exportType === 'platformer') {
      rows = 2
      cols = capturedImages.length / directions
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

    // Download the sprite sheet
    console.log('Creating blob and downloading')
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const exportPrefix = exportType === 'single' ? 'singleframe' : exportType
      const baseName = (fileName || 'model').replace(/\.[^./\\]+$/, '')
      const safeBaseName = baseName.replace(/[^a-z0-9._-]+/gi, '_').replace(/^_+|_+$/g, '') || 'model'
      a.download = `${safeBaseName}_${exportPrefix}_spritesheet.png`
      document.body.appendChild(a)
      a.click()
      console.log('Download triggered')
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [camera, cameraDistance, cameraLookAtX, cameraLookAtY, cameraLookAtZ, cameraPhi, exportFps, exportFrameSkip, exportResolution, exportType, fileName, gl, maxTime, modelRef, scene, setExportTime, setIsExporting])

  useEffect(() => {
    const handleExport = () => {
      exportSpriteSheet()
    }

    window.addEventListener('exportSpriteSheet', handleExport)
    return () => window.removeEventListener('exportSpriteSheet', handleExport)
  }, [exportSpriteSheet])

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
      // Match CameraPositioner convention:
      // x = r*sin(phi)*cos(theta), z = r*sin(phi)*sin(theta)  => theta = atan2(z, x)
      let theta = Math.atan2(position.z, position.x)
      if (theta < 0) theta += Math.PI * 2
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
  const [cameraRefreshToken, setCameraRefreshToken] = useState(0)

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
          refreshToken={cameraRefreshToken}
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
          onExportDone={() => setCameraRefreshToken(t => t + 1)}
        />
      </Canvas>
    </div>
  )
}

export default Viewer
