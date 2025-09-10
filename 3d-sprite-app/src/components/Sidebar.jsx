import { useRef } from 'react'

function Sidebar({ onFileSelect, isPlaying, setIsPlaying, animationTime, setAnimationTime, maxTime, fov, setFov, lightColor, setLightColor, lightIntensity, setLightIntensity, cameraTheta, setCameraTheta, cameraPhi, setCameraPhi, cameraDistance, setCameraDistance, cameraLookAtX, setCameraLookAtX, cameraLookAtY, setCameraLookAtY, cameraLookAtZ, setCameraLookAtZ, enableOrbit, setEnableOrbit }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onFileSelect(url, file.name)
    }
  }

  return (
    <div className="bg-gray-800 p-4 w-64 text-white">
      <div className="space-y-6">
        <div>
          <h3 className="text-white font-semibold mb-2">Import</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".fbx,.gltf,.obj"
            onChange={handleFileChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Animation Controls</h3>
          <div className="flex items-center mb-2">
            <button onClick={() => setIsPlaying(!isPlaying)} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded mr-2">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <span className="text-sm">{isPlaying ? 'Playing' : 'Paused'}</span>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">Animation Time: {animationTime.toFixed(2)} / {maxTime.toFixed(2)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max={maxTime || 1}
                step="0.01"
                value={animationTime}
                onChange={(e) => setAnimationTime(parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max={maxTime || 1}
                step="0.01"
                value={animationTime.toFixed(2)}
                onChange={(e) => setAnimationTime(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Camera Controls</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1">FOV: {fov}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="30"
                max="120"
                value={fov}
                onChange={(e) => setFov(parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="30"
                max="120"
                value={fov}
                onChange={(e) => setFov(parseInt(e.target.value) || 75)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">Horizontal Angle: {(cameraTheta * 180 / Math.PI).toFixed(0)}°</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.01"
                value={cameraTheta}
                onChange={(e) => setCameraTheta(parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="360"
                step="1"
                value={(cameraTheta * 180 / Math.PI).toFixed(0)}
                onChange={(e) => setCameraTheta((parseFloat(e.target.value) || 0) * Math.PI / 180)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">Vertical Angle: {(cameraPhi * 180 / Math.PI).toFixed(0)}°</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0.1"
                max={Math.PI - 0.1}
                step="0.01"
                value={cameraPhi}
                onChange={(e) => setCameraPhi(parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="180"
                step="1"
                value={(cameraPhi * 180 / Math.PI).toFixed(0)}
                onChange={(e) => setCameraPhi((parseFloat(e.target.value) || 90) * Math.PI / 180)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">Distance: {cameraDistance.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={cameraDistance}
                onChange={(e) => setCameraDistance(parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="1"
                max="20"
                step="0.1"
                value={cameraDistance.toFixed(1)}
                onChange={(e) => setCameraDistance(parseFloat(e.target.value) || 5)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">Look At X: {cameraLookAtX.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtX}
                onChange={(e) => setCameraLookAtX(parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtX.toFixed(1)}
                onChange={(e) => setCameraLookAtX(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">Look At Y: {cameraLookAtY.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtY}
                onChange={(e) => setCameraLookAtY(parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtY.toFixed(1)}
                onChange={(e) => setCameraLookAtY(parseFloat(e.target.value) || 1)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1">Look At Z: {cameraLookAtZ.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtZ}
                onChange={(e) => setCameraLookAtZ(parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtZ.toFixed(1)}
                onChange={(e) => setCameraLookAtZ(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
          <button onClick={() => setEnableOrbit(!enableOrbit)} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded">
            {enableOrbit ? 'Disable Orbit' : 'Enable Orbit'}
          </button>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Lighting Controls</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1">Color</label>
            <input
              type="color"
              value={lightColor}
              onChange={(e) => setLightColor(e.target.value)}
              className="w-full h-10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Intensity: {lightIntensity.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={lightIntensity.toFixed(1)}
                onChange={(e) => setLightIntensity(parseFloat(e.target.value) || 1)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Export Options</h3>
          <button 
            onClick={() => {
              // Trigger export - this will be handled by the ExportHandler component
              const event = new CustomEvent('exportSpriteSheet')
              window.dispatchEvent(event)
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded w-full"
          >
            Export Sprite Sheet
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
