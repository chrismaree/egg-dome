import React from 'react'
import useStore from '../store'

const ControlsPanel = ({ mobile = false, mode = 'default' }) => {
  const { parameters, updateParameter } = useStore()
  const getThetaRad = useStore(state => state.getThetaRad)
  const getMEdge = useStore(state => state.getMEdge)
  const getCEdge = useStore(state => state.getCEdge)
  const getDPerp = useStore(state => state.getDPerp)
  const getA = useStore(state => state.getA)
  const getCosN = useStore(state => state.getCosN)
  
  if (mode === 'intersections') {
    const thetaRad = getThetaRad()
    const thetaDeg = (thetaRad * 180) / Math.PI
    const mEdge = getMEdge()
    const cEdge = getCEdge()
    const dPerp = getDPerp()
    const a = getA()
    const cosN = getCosN()
    const identityCheck = Math.abs(2 * cEdge + mEdge - parameters.s) < 0.001
    
    return (
      <div className={`${mobile ? 'w-full' : 'w-[360px]'} bg-slate-900 text-white p-4 md:p-8 overflow-y-auto shadow-2xl`}>
        <h2 className={`${mobile ? 'text-xl' : 'text-2xl'} font-bold mb-4 md:mb-8 text-purple-400 flex items-center gap-2`}>
          <span>📐</span>
          Layer Interceptor Controls
        </h2>
        
        {/* Polygon Parameters */}
        <div className="mb-4 md:mb-8 bg-slate-800 rounded-lg p-3 md:p-5">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-100">Polygon Parameters</h3>
          
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Sides (n)</label>
              <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters.n}</span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              step={1}
              value={parameters.n}
              onChange={(e) => updateParameter('n', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Side Length (s)</label>
              <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters.s}</span>
            </div>
            <input
              type="range"
              min={50}
              max={2000}
              step={10}
              value={parameters.s}
              onChange={(e) => updateParameter('s', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Period (K)</label>
              <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters.K}</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={parameters.K}
              onChange={(e) => updateParameter('K', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Rows</label>
              <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters.rows}</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={parameters.rows}
              onChange={(e) => updateParameter('rows', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Rotation Control */}
        <div className="mb-4 md:mb-8 bg-slate-800 rounded-lg p-3 md:p-5">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-100">Rotation Control</h3>
          
          <div className="mb-4">
            <label className="text-sm block mb-2">Theta Mode</label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="auto"
                  checked={parameters.thetaMode === 'auto'}
                  onChange={() => updateParameter('thetaMode', 'auto')}
                  className="mr-2"
                />
                Auto
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="custom"
                  checked={parameters.thetaMode === 'custom'}
                  onChange={() => updateParameter('thetaMode', 'custom')}
                  className="mr-2"
                />
                Custom
              </label>
            </div>
          </div>
          
          {parameters.thetaMode === 'custom' && (
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-300">Theta (degrees)</label>
                <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters.thetaDeg}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={180 / parameters.n - 0.1}
                step={0.1}
                value={parameters.thetaDeg}
                onChange={(e) => updateParameter('thetaDeg', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
        
        {/* Beam Dimensions */}
        <div className="mb-4 md:mb-8 bg-slate-800 rounded-lg p-3 md:p-5">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-100">Beam Dimensions</h3>
          
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Layer Height</label>
              <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters.layerHeight}</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={1}
              value={parameters.layerHeight}
              onChange={(e) => updateParameter('layerHeight', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Beam Thickness</label>
              <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters.beamThickness}</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={0.5}
              value={parameters.beamThickness}
              onChange={(e) => updateParameter('beamThickness', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Beam Depth</label>
              <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters.beamDepth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={parameters.beamDepth}
              onChange={(e) => updateParameter('beamDepth', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Display Options */}
        <div className="mb-4 md:mb-8 bg-slate-800 rounded-lg p-3 md:p-5">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-100">Display Options</h3>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.showIntersections}
              onChange={(e) => updateParameter('showIntersections', e.target.checked)}
              className="mr-3 w-5 h-5 accent-blue-500"
            />
            <span className="text-sm">Show Intersections</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.showPerpMarkers}
              onChange={(e) => updateParameter('showPerpMarkers', e.target.checked)}
              className="mr-3 w-5 h-5 accent-blue-500"
            />
            <span className="text-sm">Show Perpendicular Markers</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.showInnerPolygon}
              onChange={(e) => updateParameter('showInnerPolygon', e.target.checked)}
              className="mr-3 w-5 h-5 accent-blue-500"
            />
            <span className="text-sm">Show Inner Polygon</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.gridOn}
              onChange={(e) => updateParameter('gridOn', e.target.checked)}
              className="mr-3 w-5 h-5 accent-blue-500"
            />
            <span className="text-sm">Show Grid</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.axesOn}
              onChange={(e) => updateParameter('axesOn', e.target.checked)}
              className="mr-3 w-5 h-5 accent-blue-500"
            />
            <span className="text-sm">Show Axes</span>
          </label>
          
          <div className="mb-4">
            <label className="text-sm block mb-1">Color Scheme</label>
            <select
              value={parameters.colorScheme}
              onChange={(e) => updateParameter('colorScheme', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="byLayer">By Layer</option>
              <option value="byRole">By Role</option>
            </select>
          </div>
        </div>
        
        {/* Computed Values */}
        <div className="mb-4 md:mb-8 bg-slate-800 rounded-lg p-3 md:p-5">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-100">Computed Values</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">θ (degrees)</span>
              <span className="font-mono text-blue-300">{thetaDeg.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">m_edge</span>
              <span className="font-mono text-blue-300">{mEdge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">c_edge</span>
              <span className="font-mono text-blue-300">{cEdge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">d_perp</span>
              <span className="font-mono text-blue-300">{dPerp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">a (apothem)</span>
              <span className="font-mono text-blue-300">{a.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">cos(π/n)</span>
              <span className="font-mono text-blue-300">{cosN.toFixed(4)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">2c + m = s</span>
                <span className={`font-mono ${identityCheck ? 'text-green-400' : 'text-red-400'}`}>
                  {identityCheck ? '✓' : '✗'} {(2 * cEdge + mEdge).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sliderGroups = [
    {
      title: 'Dome Dimensions',
      controls: [
        { name: 'domeHeight', label: 'Height (m)', min: 3, max: 8, step: 0.1 },
        { name: 'domeDiameter', label: 'Diameter (m)', min: 4, max: 12, step: 0.1 }
      ]
    },
    {
      title: 'Board Specifications',
      controls: [
        { name: 'boardLength', label: 'Board Length (m)', min: 1.5, max: 3.0, step: 0.01 },
        { name: 'boardThickness', label: 'Thickness (mm)', min: 20, max: 60, step: 1 },
        { name: 'boardWidth', label: 'Width (mm)', min: 80, max: 180, step: 1 }
      ]
    },
    {
      title: 'Construction Details',
      controls: [
        { name: 'verticalGap', label: 'Inter-Row Vertical Gap (mm)', min: -150, max: 50, step: 1 },
        { name: 'sameRowVerticalGap', label: 'Same-Row Vertical Gap (mm)', min: -50, max: parameters.boardWidth, step: 1 },
        { name: 'endOverlap', label: 'End Overlap (mm)', min: 0, max: 100, step: 1 },
        { name: 'minTopBoards', label: 'Min Boards at Top', min: 4, max: 20, step: 1 }
      ]
    },
    {
      title: 'Lighting',
      controls: [
        { name: 'lightIntensity', label: 'Light Intensity (%)', min: 0, max: 100, step: 1 }
      ]
    }
  ]

  return (
    <div className={`${mobile ? 'w-full' : 'w-[360px]'} bg-slate-900 text-white p-4 md:p-8 overflow-y-auto shadow-2xl`}>
      <h2 className={`${mobile ? 'text-xl' : 'text-2xl'} font-bold mb-4 md:mb-8 text-purple-400 flex items-center gap-2`}>
        <span>🎯</span>
        Shadow Controls
      </h2>
      
      {sliderGroups.map(group => (
        <div key={group.title} className="mb-4 md:mb-8 bg-slate-800 rounded-lg p-3 md:p-5">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-100">{group.title}</h3>
          {group.controls.map(control => (
            <div key={control.name} className="mb-5">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-300">{control.label}</label>
                <span className="text-sm font-mono bg-slate-700 px-2 py-1 rounded text-blue-300">{parameters[control.name]}</span>
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={parameters[control.name]}
                onChange={(e) => updateParameter(control.name, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      ))}
      
      <div className="mb-8 bg-slate-800 rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">Pricing</h3>
        <div className="mb-4">
          <label className="text-sm block mb-1">Price per 6m Stock (ZAR)</label>
          <input
            type="number"
            value={parameters.pricePerStock}
            onChange={(e) => updateParameter('pricePerStock', parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="mb-8 bg-slate-800 rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">Display Options</h3>
        
        <label className="flex items-center mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={parameters.invertShape}
            onChange={(e) => updateParameter('invertShape', e.target.checked)}
            className="mr-3 w-5 h-5 accent-blue-500"
          />
          <span className="text-sm">Invert Shape (Dome → Cup)</span>
        </label>
        
        <label className="flex items-center mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={parameters.enableHalfOpen}
            onChange={(e) => updateParameter('enableHalfOpen', e.target.checked)}
            className="mr-3 w-5 h-5 accent-blue-500"
          />
          <span className="text-sm">Half-Open Dome (Entrance)</span>
        </label>
        
        <label className="flex items-center mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={parameters.showDoor}
            onChange={(e) => updateParameter('showDoor', e.target.checked)}
            className="mr-3 w-5 h-5 accent-blue-500"
          />
          <span className="text-sm">Add Entrance Cutout (2m × 0.75m)</span>
        </label>
        
        <label className="flex items-center mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={parameters.showLighting}
            onChange={(e) => updateParameter('showLighting', e.target.checked)}
            className="mr-3 w-5 h-5 accent-blue-500"
          />
          <span className="text-sm">Show Central Light</span>
        </label>
        
        <div className="mb-4">
          <label className="text-sm block mb-1">Render Mode</label>
          <select
            value={parameters.renderMode}
            onChange={(e) => updateParameter('renderMode', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="wireframe">Wireframe</option>
            <option value="shaded">Shaded</option>
            <option value="textured">Textured</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="text-sm block mb-1">Camera View</label>
          <select
            value={parameters.cameraView}
            onChange={(e) => updateParameter('cameraView', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="outside">Outside</option>
            <option value="inside">Inside</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="text-sm block mb-1">Light Color</label>
          <input
            type="color"
            value={parameters.lightColor}
            onChange={(e) => updateParameter('lightColor', e.target.value)}
            className="w-full h-10 bg-slate-700 rounded border border-slate-600 cursor-pointer"
          />
        </div>
      </div>
      
      <button
        onClick={() => useStore.getState().resetParameters()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
      >
        Reset to Defaults
      </button>
    </div>
  )
}

export default ControlsPanel