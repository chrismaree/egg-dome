import React, { useMemo } from 'react'
import useStore from '../store'
import { computeDomeGeometry } from '../utils/computeDomeGeometry'
import { computeCosts } from '../utils/computeCosts'
import { exportToCSV, exportToJSON, exportCanvasAsImage, generateBOM } from '../utils/exportUtils'

const ExportPanel = () => {
  const parameters = useStore(state => state.parameters)
  
  const { geometry, costs } = useMemo(() => {
    const geo = computeDomeGeometry(parameters)
    const cost = computeCosts(parameters, geo.totalBoards)
    return { geometry: geo, costs: cost }
  }, [parameters])
  
  const handleCSVExport = () => {
    exportToCSV(geometry.rowData, parameters, costs)
  }
  
  const handleJSONExport = () => {
    exportToJSON(parameters, geometry, costs)
  }
  
  const handleImageExport = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      exportCanvasAsImage(canvas, `dome-${new Date().toISOString().split('T')[0]}.png`)
    }
  }
  
  const handleBOMExport = () => {
    generateBOM(parameters, costs, geometry)
  }
  
  const exportButtons = [
    { label: 'Export CSV', icon: '📊', onClick: handleCSVExport, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Export JSON', icon: '🧮', onClick: handleJSONExport, color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Save Image', icon: '📸', onClick: handleImageExport, color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Export BOM', icon: '📋', onClick: handleBOMExport, color: 'bg-orange-500 hover:bg-orange-600' }
  ]
  
  return (
    <div className="bg-white rounded-xl shadow-xl p-5 border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Export Options</h3>
      <div className="grid grid-cols-2 gap-3">
        {exportButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`${button.color} flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg`}
          >
            <span className="text-lg">{button.icon}</span>
            <span className="text-sm font-medium">{button.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExportPanel