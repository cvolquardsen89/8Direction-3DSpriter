import { useRef } from 'react'

function Sidebar({ onFileSelect, isPlaying, setIsPlaying, animationTime, setAnimationTime, maxTime, fov, setFov, lightColor, setLightColor, lightIntensity, setLightIntensity, cameraTheta, setCameraTheta, cameraPhi, setCameraPhi, cameraDistance, setCameraDistance, cameraLookAtX, setCameraLookAtX, cameraLookAtY, setCameraLookAtY, cameraLookAtZ, setCameraLookAtZ, enableOrbit, setEnableOrbit, exportFps, setExportFps, exportFrameSkip, setExportFrameSkip, exportType, setExportType, exportResolution, setExportResolution, lockCurrentView }) {
  const fileInputRef = useRef(null)

  const normalizedThetaDeg = ((((cameraTheta * 180) / Math.PI) % 360) + 360) % 360

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onFileSelect(url, file.name)
    }
  }

  return (
    <div className="bg-gray-800 p-4 w-64 text-white h-screen overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-white font-semibold mb-2">Import</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".fbx,.gltf,.obj"
            onChange={handleFileChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
            id="file-input"
            name="fileInput"
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
            <label className="block text-sm mb-1" htmlFor="animation-time-range">Animation Time: {animationTime.toFixed(2)} / {maxTime.toFixed(2)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max={maxTime || 1}
                step="0.01"
                value={animationTime}
                onChange={(e) => setAnimationTime(parseFloat(e.target.value))}
                className="flex-1"
                id="animation-time-range"
                name="animationTime"
              />
              <input
                type="number"
                min="0"
                max={maxTime || 1}
                step="0.01"
                value={animationTime.toFixed(2)}
                onChange={(e) => setAnimationTime(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-gray-700 text-white rounded"
                id="animation-time-number"
                name="animationTimeNumber"
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Camera Controls</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="fov-range">FOV: {fov}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="30"
                max="120"
                value={fov}
                onChange={(e) => setFov(parseInt(e.target.value))}
                className="flex-1"
                id="fov-range"
                name="fov"
                title="Field of View: Adjust camera lens angle (lower = zoom in)"
              />
              <input
                type="number"
                min="30"
                max="120"
                value={fov}
                onChange={(e) => setFov(parseInt(e.target.value) || 75)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                id="fov-number"
                name="fovNumber"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="theta-range">Horizontal Angle: {normalizedThetaDeg.toFixed(0)}°</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.01"
                value={cameraTheta}
                onChange={(e) => setCameraTheta(parseFloat(e.target.value))}
                className="flex-1"
                id="theta-range"
                name="cameraTheta"
              />
              <input
                type="number"
                min="0"
                max="360"
                step="1"
                value={normalizedThetaDeg.toFixed(0)}
                onChange={(e) => setCameraTheta((parseFloat(e.target.value) || 0) * Math.PI / 180)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                id="theta-number"
                name="cameraThetaNumber"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="phi-range">Vertical Angle: {(cameraPhi * 180 / Math.PI).toFixed(0)}°</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0.1"
                max={Math.PI - 0.1}
                step="0.01"
                value={cameraPhi}
                onChange={(e) => setCameraPhi(parseFloat(e.target.value))}
                className="flex-1"
                id="phi-range"
                name="cameraPhi"
              />
              <input
                type="number"
                min="0"
                max="180"
                step="1"
                value={(cameraPhi * 180 / Math.PI).toFixed(0)}
                onChange={(e) => setCameraPhi((parseFloat(e.target.value) || 90) * Math.PI / 180)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                id="phi-number"
                name="cameraPhiNumber"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="distance-range">Distance: {cameraDistance.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={cameraDistance}
                onChange={(e) => setCameraDistance(parseFloat(e.target.value))}
                className="flex-1"
                id="distance-range"
                name="cameraDistance"
                title="Camera Distance: How far the camera is from the model"
              />
              <input
                type="number"
                min="1"
                max="20"
                step="0.1"
                value={cameraDistance.toFixed(1)}
                onChange={(e) => setCameraDistance(parseFloat(e.target.value) || 5)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                id="distance-number"
                name="cameraDistanceNumber"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="lookatx-range">Look At X: {cameraLookAtX.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtX}
                onChange={(e) => setCameraLookAtX(parseFloat(e.target.value))}
                className="flex-1"
                id="lookatx-range"
                name="cameraLookAtX"
              />
              <input
                type="number"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtX.toFixed(1)}
                onChange={(e) => setCameraLookAtX(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                id="lookatx-number"
                name="cameraLookAtXNumber"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="lookaty-range">Look At Y: {cameraLookAtY.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtY}
                onChange={(e) => setCameraLookAtY(parseFloat(e.target.value))}
                className="flex-1"
                id="lookaty-range"
                name="cameraLookAtY"
                title="Look At Y: Vertical focus point (higher = look up, lower = look down)"
              />
              <input
                type="number"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtY.toFixed(1)}
                onChange={(e) => setCameraLookAtY(parseFloat(e.target.value) || 1)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                id="lookaty-number"
                name="cameraLookAtYNumber"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="lookatz-range">Look At Z: {cameraLookAtZ.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtZ}
                onChange={(e) => setCameraLookAtZ(parseFloat(e.target.value))}
                className="flex-1"
                id="lookatz-range"
                name="cameraLookAtZ"
              />
              <input
                type="number"
                min="-5"
                max="5"
                step="0.1"
                value={cameraLookAtZ.toFixed(1)}
                onChange={(e) => setCameraLookAtZ(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                id="lookatz-number"
                name="cameraLookAtZNumber"
              />
            </div>
          </div>
          <button onClick={() => setEnableOrbit(!enableOrbit)} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded">
            {enableOrbit ? 'Disable Orbit' : 'Enable Orbit'}
          </button>
          <button onClick={lockCurrentView} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded ml-2" title="Copy current camera view to manual controls">
            Lock Current View
          </button>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Lighting Controls</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="light-color">Color</label>
            <input
              type="color"
              value={lightColor}
              onChange={(e) => setLightColor(e.target.value)}
              className="w-full h-10 rounded"
              id="light-color"
              name="lightColor"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="intensity-range">Intensity: {lightIntensity.toFixed(1)}</label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                className="flex-1"
                id="intensity-range"
                name="lightIntensity"
              />
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={lightIntensity.toFixed(1)}
                onChange={(e) => setLightIntensity(parseFloat(e.target.value) || 1)}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                id="intensity-number"
                name="lightIntensityNumber"
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Export Options</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="export-type">Export Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded"
              id="export-type"
              name="exportType"
              title="Choose export style: Animation captures frames over time, Single captures one frame per direction"
            >
              <option value="8directions">8 Directions Animation</option>
              <option value="platformer">Platformer Animation</option>
              <option value="single">Single Frame 8 Directions</option>
            </select>
          </div>
          {exportType !== 'single' && (
            <>
              <div className="mb-2">
                <label className="block text-sm mb-1" htmlFor="fps-range">FPS: {exportFps}</label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={exportFps}
                  onChange={(e) => setExportFps(parseInt(e.target.value))}
                  className="w-full"
                  id="fps-range"
                  name="exportFps"
                  title="Frames Per Second: Higher FPS captures more animation frames"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm mb-1" htmlFor="frameskip-range">Frame Skip: {exportFrameSkip}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={exportFrameSkip}
                  onChange={(e) => setExportFrameSkip(parseInt(e.target.value))}
                  className="w-full"
                  id="frameskip-range"
                  name="exportFrameSkip"
                  title="Skip frames between captures to reduce file size (0 = no skip)"
                />
              </div>
            </>
          )}
          <div className="mb-2">
            <label className="block text-sm mb-1" htmlFor="resolution-select">Resolution: {exportResolution}px</label>
            <select
              value={exportResolution}
              onChange={(e) => setExportResolution(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white p-2 rounded"
              id="resolution-select"
              name="exportResolution"
              title="Higher resolution for more detailed sprites (affects file size)"
            >
              <option value="64">64px</option>
              <option value="128">128px</option>
              <option value="256">256px</option>
              <option value="512">512px</option>
            </select>
          </div>
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
