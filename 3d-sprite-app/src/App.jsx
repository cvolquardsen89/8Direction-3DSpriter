import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Viewer from './components/Viewer'

function App() {
  const [fileUrl, setFileUrl] = useState(null)
  const [fileName, setFileName] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationTime, setAnimationTime] = useState(0)
  const [maxTime, setMaxTime] = useState(1)
  const [fov, setFov] = useState(75)
  const [lightColor, setLightColor] = useState('#ffffff')
  const [lightIntensity, setLightIntensity] = useState(1)
  const [cameraTheta, setCameraTheta] = useState(0)
  const [cameraPhi, setCameraPhi] = useState(Math.PI / 2)
  const [cameraDistance, setCameraDistance] = useState(5)
  const [cameraLookAtX, setCameraLookAtX] = useState(0)
  const [cameraLookAtY, setCameraLookAtY] = useState(1)
  const [cameraLookAtZ, setCameraLookAtZ] = useState(0)
  const [enableOrbit, setEnableOrbit] = useState(true)

  const handleFileSelect = (url, name) => {
    setFileUrl(url)
    setFileName(name)
    setIsPlaying(false)
    setAnimationTime(0)
    setMaxTime(1)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar 
        onFileSelect={handleFileSelect} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
        animationTime={animationTime} 
        setAnimationTime={setAnimationTime} 
        maxTime={maxTime} 
        fov={fov}
        setFov={setFov}
        lightColor={lightColor}
        setLightColor={setLightColor}
        lightIntensity={lightIntensity}
        setLightIntensity={setLightIntensity}
        cameraTheta={cameraTheta}
        setCameraTheta={setCameraTheta}
        cameraPhi={cameraPhi}
        setCameraPhi={setCameraPhi}
        cameraDistance={cameraDistance}
        setCameraDistance={setCameraDistance}
        cameraLookAtX={cameraLookAtX}
        setCameraLookAtX={setCameraLookAtX}
        cameraLookAtY={cameraLookAtY}
        setCameraLookAtY={setCameraLookAtY}
        cameraLookAtZ={cameraLookAtZ}
        setCameraLookAtZ={setCameraLookAtZ}
        enableOrbit={enableOrbit}
        setEnableOrbit={setEnableOrbit}
      />
      <div className="flex-1">
        <Viewer 
          fileUrl={fileUrl} 
          fileName={fileName} 
          isPlaying={isPlaying} 
          animationTime={animationTime} 
          setMaxTime={setMaxTime} 
          fov={fov}
          lightColor={lightColor}
          lightIntensity={lightIntensity}
          setAnimationTime={setAnimationTime}
          cameraTheta={cameraTheta}
          cameraPhi={cameraPhi}
          cameraDistance={cameraDistance}
          cameraLookAtX={cameraLookAtX}
          cameraLookAtY={cameraLookAtY}
          cameraLookAtZ={cameraLookAtZ}
          enableOrbit={enableOrbit}
        />
      </div>
    </div>
  )
}

export default App
