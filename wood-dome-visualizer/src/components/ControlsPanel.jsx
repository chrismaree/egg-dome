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
      <div className={`${mobile ? 'w-full' : 'w-[380px]'} h-full`} style={{backgroundColor: '#f5f5f5', padding: '16px'}}>
        <div className="overflow-y-auto" style={{backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '20px', height: 'calc(100% - 0px)'}}>
          {/* Polygon Parameters */}
          <div className="mb-5">
            <h3 className="text-base font-semibold mb-4 text-[#333]">Polygon Parameters</h3>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-[#666]">Sides (n)</label>
              <span className="text-sm font-mono px-2 py-1 rounded text-[#495057]" style={{backgroundColor: 'transparent'}}>{parameters.n}</span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              step={1}
              value={parameters.n}
              onChange={(e) => updateParameter('n', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{accentColor: '#28a745'}}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-[#666]">Side Length (mm)</label>
              <span className="text-sm font-mono px-2 py-1 rounded text-[#495057]" style={{backgroundColor: 'transparent'}}>{parameters.s} mm</span>
            </div>
            <input
              type="range"
              min={500}
              max={20000}
              step={100}
              value={parameters.s}
              onChange={(e) => updateParameter('s', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{accentColor: '#28a745'}}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-[#666]">Period (K)</label>
              <span className="text-sm font-mono px-2 py-1 rounded text-[#666]" style={{backgroundColor: 'transparent'}}>{parameters.K}</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={1}
              value={parameters.K}
              onChange={(e) => updateParameter('K', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{accentColor: '#28a745'}}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-[#666]">Rows</label>
              <span className="text-sm font-mono px-2 py-1 rounded text-[#666]" style={{backgroundColor: 'transparent'}}>{parameters.rows}</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={parameters.rows}
              onChange={(e) => updateParameter('rows', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{accentColor: '#28a745'}}
            />
          </div>
          </div>
          
          {/* Beam Dimensions */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-[#333]">Beam Dimensions</h3>
            <button
              onClick={() => {
                updateParameter('layerHeight', 152)
                updateParameter('beamThickness', 38)
                updateParameter('beamDepth', 152)
              }}
              className="text-xs px-3 py-1.5 font-medium transition-all"
              style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                color: '#495057',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              }}
            >
              Reset
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-[#666]">Layer Height (mm)</label>
              <span className="text-sm font-mono px-2 py-1 rounded text-[#666]" style={{backgroundColor: 'transparent'}}>{parameters.layerHeight} mm</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={1}
              value={parameters.layerHeight}
              onChange={(e) => updateParameter('layerHeight', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{accentColor: '#28a745'}}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-[#666]">Beam Thickness (mm)</label>
              <span className="text-sm font-mono px-2 py-1 rounded text-[#666]" style={{backgroundColor: 'transparent'}}>{parameters.beamThickness} mm</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={1}
              value={parameters.beamThickness}
              onChange={(e) => updateParameter('beamThickness', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{accentColor: '#28a745'}}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-[#666]">Beam Depth (mm)</label>
              <span className="text-sm font-mono px-2 py-1 rounded text-[#666]" style={{backgroundColor: 'transparent'}}>{parameters.beamDepth} mm</span>
            </div>
            <input
              type="range"
              min={10}
              max={300}
              step={1}
              value={parameters.beamDepth}
              onChange={(e) => updateParameter('beamDepth', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{accentColor: '#28a745'}}
            />
          </div>
          </div>
          
          {/* Display Options */}
          <div className="mb-5">
            <h3 className="text-base font-semibold mb-4 text-[#333]">Display Options</h3>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.showIntersections}
              onChange={(e) => updateParameter('showIntersections', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Show Intersections</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.showPerpMarkers}
              onChange={(e) => updateParameter('showPerpMarkers', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Show Perpendicular Markers</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.showInnerPolygon}
              onChange={(e) => updateParameter('showInnerPolygon', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Show Inner Polygon</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.gridOn}
              onChange={(e) => updateParameter('gridOn', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Show Grid</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.axesOn}
              onChange={(e) => updateParameter('axesOn', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Show Axes</span>
          </label>
          </div>
          
          {/* Computed Values */}
          <div className="mb-4">
            <h3 className="text-base font-semibold mb-4 text-[#333]">Computed Values</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#666]">θ (degrees)</span>
              <span className="font-mono text-[#333] font-medium">{thetaDeg.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">m_edge</span>
              <span className="font-mono text-[#333] font-medium">{mEdge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">c_edge</span>
              <span className="font-mono text-[#333] font-medium">{cEdge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">d_perp</span>
              <span className="font-mono text-[#333] font-medium">{dPerp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">a (apothem)</span>
              <span className="font-mono text-[#333] font-medium">{a.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">cos(π/n)</span>
              <span className="font-mono text-[#333] font-medium">{cosN.toFixed(4)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-[#666]">2c + m = s</span>
                <span className={`font-mono font-medium ${identityCheck ? 'text-[#28a745]' : 'text-red-600'}`}>
                  {identityCheck ? '✓' : '✗'} {(2 * cEdge + mEdge).toFixed(2)}
                </span>
              </div>
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
    <div className={`${mobile ? 'w-full' : 'w-[380px]'} h-full`} style={{backgroundColor: '#f5f5f5', padding: '16px'}}>
      <div className="overflow-y-auto" style={{backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '20px', height: 'calc(100% - 0px)'}}>
        {sliderGroups.map((group, index) => (
          <div key={group.title} className="mb-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-[#333]">{group.title}</h3>
              {group.title === 'Dome Dimensions' && (
                <button
                  onClick={() => useStore.getState().resetParameters()}
                  className="text-xs px-3 py-1.5 font-medium transition-all"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    color: '#495057',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          {group.controls.map(control => (
            <div key={control.name} className="mb-5">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-[#666]">{control.label}</label>
                <span className="text-sm font-mono px-2 py-1 rounded text-[#495057]" style={{backgroundColor: 'transparent'}}>{parameters[control.name]}</span>
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={parameters[control.name]}
                onChange={(e) => updateParameter(control.name, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{accentColor: '#28a745'}}
              />
            </div>
          ))}
        </div>
      ))}
      
        <div className="mb-4">
          <h3 className="text-base font-semibold mb-4 text-[#333]">Pricing</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-[#666]">Price per 6m Stock (ZAR)</label>
              <input
                type="number"
                value={parameters.pricePerStock}
                onChange={(e) => updateParameter('pricePerStock', parseFloat(e.target.value))}
                className="w-32 px-3 py-1.5 rounded-md text-sm transition-all focus:outline-none text-right"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  color: '#495057',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#28a745';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>
      
        <div className="mb-4">
          <h3 className="text-base font-semibold mb-4 text-[#333]">Display Options</h3>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.invertShape}
              onChange={(e) => updateParameter('invertShape', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Invert Shape (Dome → Cup)</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.enableHalfOpen}
              onChange={(e) => updateParameter('enableHalfOpen', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Half-Open Dome (Entrance)</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.showDoor}
              onChange={(e) => updateParameter('showDoor', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Add Entrance Cutout (2m × 0.75m)</span>
          </label>
          
          <label className="flex items-center mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={parameters.showLighting}
              onChange={(e) => updateParameter('showLighting', e.target.checked)}
              className="mr-3 w-4 h-4 text-[#28a745] focus:ring-[#28a745] focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-sm text-[#666]">Show Central Light</span>
          </label>
          
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-[#666]">Render Mode</label>
              <select
                value={parameters.renderMode}
                onChange={(e) => updateParameter('renderMode', e.target.value)}
                className="px-3 py-1.5 rounded-md text-sm transition-all focus:outline-none"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  color: '#495057',
                  cursor: 'pointer',
                  minWidth: '140px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#28a745';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="wireframe">Wireframe</option>
                <option value="shaded">Shaded</option>
                <option value="textured">Textured</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-[#666]">Camera View</label>
              <select
                value={parameters.cameraView}
                onChange={(e) => updateParameter('cameraView', e.target.value)}
                className="px-3 py-1.5 rounded-md text-sm transition-all focus:outline-none"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  color: '#495057',
                  cursor: 'pointer',
                  minWidth: '140px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#28a745';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="outside">Outside</option>
                <option value="inside">Inside</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-[#666]">Light Color</label>
              <input
                type="color"
                value={parameters.lightColor}
                onChange={(e) => updateParameter('lightColor', e.target.value)}
                className="w-20 h-8 bg-white border border-gray-300 rounded-md cursor-pointer focus:border-[#28a745] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlsPanel