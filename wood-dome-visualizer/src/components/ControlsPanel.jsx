import React from 'react'
import useStore from '../store'

const ControlsPanel = () => {
  const { parameters, updateParameter } = useStore()

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
    <div className="w-[360px] bg-slate-900 text-white p-8 overflow-y-auto shadow-2xl">
      <h2 className="text-2xl font-bold mb-8 text-purple-400 flex items-center gap-2">
        <span>🎯</span>
        Shadow Controls
      </h2>
      
      {sliderGroups.map(group => (
        <div key={group.title} className="mb-8 bg-slate-800 rounded-lg p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-100">{group.title}</h3>
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
          <span className="text-sm">Add Door (2m × 0.75m)</span>
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
        
        <label className="flex items-center mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={parameters.showShadowPanels}
            onChange={(e) => updateParameter('showShadowPanels', e.target.checked)}
            className="mr-3 w-5 h-5 accent-blue-500"
          />
          <span className="text-sm">Show Shadow Panels</span>
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