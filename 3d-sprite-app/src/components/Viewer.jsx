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

function CameraPositioner({ theta, phi, distance, lookAtX, lookAtY, lookAtZ }) {
  const { camera } = useThree()
  useEffect(() => {
    // Only update camera position if OrbitControls is not controlling it
    // For now, let's make it work by updating the lookAt target
    camera.lookAt(lookAtX, lookAtY, lookAtZ)
    camera.updateProjectionMatrix()
  }, [lookAtX, lookAtY, lookAtZ, camera])

  useEffect(() => {
    // Update camera position based on spherical coordinates
    const x = distance * Math.sin(phi) * Math.cos(theta)
    const y = distance * Math.cos(phi)
    const z = distance * Math.sin(phi) * Math.sin(theta)

    camera.position.set(x, y, z)
    camera.lookAt(lookAtX, lookAtY, lookAtZ)
    camera.updateProjectionMatrix()
  }, [theta, phi, distance, lookAtX, lookAtY, lookAtZ, camera])

  return null
}

function Model({ url, fileName, isPlaying, animationTime, setMaxTime, setAnimationTime, modelRef }) {
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
        scene.position.sub(center)

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

  useFrame((state, delta) => {
    if (mixerRef.current && isPlaying) {
      mixerRef.current.update(delta)
      setAnimationTime(mixerRef.current.time)
    }
  })

  return model ? <group ref={modelRef}><primitive object={model} /></group> : null
}

function ExportHandler({ fileName, maxTime, exportParams, modelRef }) {
  const { gl, scene, camera } = useThree()

  const exportSpriteSheet = async () => {
    if (!modelRef.current) {
      alert('No model loaded!')
      return
    }

    const spriteSize = 128
    const directions = 8
    const spriteSheetWidth = spriteSize * directions
    const spriteSheetHeight = spriteSize

    // Create canvas for sprite sheet
    const canvas = document.createElement('canvas')
    canvas.width = spriteSheetWidth
    canvas.height = spriteSheetHeight
    const ctx = canvas.getContext('2d')

    // Fill with transparent background
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, spriteSheetWidth, spriteSheetHeight)

    // Store original camera settings
    const originalPosition = camera.position.clone()
    const originalFov = camera.fov

    // Temporarily resize renderer for sprite capture
    const originalSize = { width: gl.domElement.width, height: gl.domElement.height }
    gl.setSize(spriteSize, spriteSize)
    camera.aspect = 1
    camera.updateProjectionMatrix()

    // Render each direction
    for (let dir = 0; dir < directions; dir++) {
      // Set camera angle for this direction
      const angle = (dir / directions) * Math.PI * 2
      const spherical = new THREE.Spherical(exportParams.cameraDistance, exportParams.cameraPhi, angle)
      camera.position.setFromSpherical(spherical)
      camera.lookAt(exportParams.cameraLookAtX, exportParams.cameraLookAtY, exportParams.cameraLookAtZ)
      camera.updateMatrixWorld()

      // Render the scene
      gl.render(scene, camera)

      // Get image data from WebGL
      const pixels = new Uint8Array(spriteSize * spriteSize * 4)
      gl.readPixels(0, 0, spriteSize, spriteSize, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      
      // Create image data and flip Y axis
      const imageData = ctx.createImageData(spriteSize, spriteSize)
      for (let y = 0; y < spriteSize; y++) {
        for (let x = 0; x < spriteSize; x++) {
          const srcIndex = ((spriteSize - 1 - y) * spriteSize + x) * 4
          const dstIndex = (y * spriteSize + x) * 4
          imageData.data[dstIndex] = pixels[srcIndex]     // R
          imageData.data[dstIndex + 1] = pixels[srcIndex + 1] // G
          imageData.data[dstIndex + 2] = pixels[srcIndex + 2] // B
          imageData.data[dstIndex + 3] = pixels[srcIndex + 3] // A
        }
      }
      
      // Draw to sprite sheet
      const x = dir * spriteSize
      ctx.putImageData(imageData, x, 0)
    }

    // Restore original settings
    gl.setSize(originalSize.width, originalSize.height)
    camera.aspect = originalSize.width / originalSize.height
    camera.position.copy(originalPosition)
    camera.fov = originalFov
    camera.updateProjectionMatrix()

    // Download the sprite sheet
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName || 'model'}_spritesheet.png`
      document.body.appendChild(a)
      a.click()
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

function Viewer({ fileUrl, fileName, isPlaying, animationTime, setMaxTime, fov, lightColor, lightIntensity, setAnimationTime, cameraTheta, cameraPhi, cameraDistance, cameraLookAtX, cameraLookAtY, cameraLookAtZ, enableOrbit }) {
  const modelRef = useRef()

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
        camera={{ position: [5, 5, 5], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Grid args={[10, 10]} />
        
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
          />
        )}
        
        {/* Add OrbitControls for mouse interaction */}
        {enableOrbit && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
        
        <ExportHandler 
          fileName={fileName} 
          maxTime={maxTime} 
          exportParams={exportParams} 
          modelRef={modelRef} 
        />
      </Canvas>
    </div>
  )
}

export default Viewer
