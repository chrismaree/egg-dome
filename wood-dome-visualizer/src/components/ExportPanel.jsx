import React, { useMemo } from 'react'
import useStore from '../store'
import { computeDomeGeometry, computeBeamIntersectionGeometry } from '../utils/computeDomeGeometry'
import { computeCosts } from '../utils/computeCosts'
import { 
  exportToCSV, 
  exportToJSON, 
  exportCanvasAsImage, 
  generateBOM, 
  exportTo3D,
  exportIntersectionCSV,
  exportIntersectionJSON,
  exportIntersectionSTL,
  exportIntersectionPython
} from '../utils/exportUtils'

const ExportPanel = ({ mode = 'default' }) => {
  const parameters = useStore(state => state.parameters)
  const getThetaRad = useStore(state => state.getThetaRad)
  
  const { geometry, costs, intersectionGeometry } = useMemo(() => {
    if (mode === 'intersections') {
      const thetaRad = getThetaRad()
      const intGeo = computeBeamIntersectionGeometry({
        n: parameters.n,
        s: parameters.s,
        K: parameters.K,
        rows: parameters.rows,
        thetaRad: thetaRad,
        layerHeight: parameters.layerHeight,
        beamThickness: parameters.beamThickness,
        beamDepth: parameters.beamDepth,
        showIntersections: parameters.showIntersections,
        showPerpMarkers: parameters.showPerpMarkers,
        showInnerPolygon: parameters.showInnerPolygon
      })
      return { geometry: null, costs: null, intersectionGeometry: intGeo }
    } else {
      const geo = computeDomeGeometry(parameters)
      const cost = computeCosts(parameters, geo.totalBoards)
      return { geometry: geo, costs: cost, intersectionGeometry: null }
    }
  }, [parameters, mode, getThetaRad])
  
  const handleCSVExport = () => {
    if (mode === 'intersections') {
      exportIntersectionCSV(intersectionGeometry, parameters)
    } else {
      exportToCSV(geometry.rowData, parameters, costs)
    }
  }
  
  const handleJSONExport = () => {
    if (mode === 'intersections') {
      exportIntersectionJSON(intersectionGeometry, parameters)
    } else {
      exportToJSON(parameters, geometry, costs)
    }
  }
  
  const handleImageExport = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const filename = mode === 'intersections' 
        ? `beam-intersections-${new Date().toISOString().split('T')[0]}.png`
        : `dome-${new Date().toISOString().split('T')[0]}.png`
      exportCanvasAsImage(canvas, filename)
    }
  }
  
  const handleBOMExport = () => {
    generateBOM(parameters, costs, geometry)
  }
  
  const handleSTLExport = () => {
    if (mode === 'intersections') {
      exportIntersectionSTL(intersectionGeometry, parameters)
    } else {
      exportTo3D(parameters, geometry, 'stl')
    }
  }
  
  const handleFusion360Export = () => {
    exportTo3D(parameters, geometry, 'fusion360')
  }
  
  const handlePythonExport = () => {
    exportIntersectionPython(intersectionGeometry, parameters)
  }
  
  const exportButtons = mode === 'intersections' ? [
    { label: 'Export CSV', icon: '📊', onClick: handleCSVExport, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Export JSON', icon: '🧮', onClick: handleJSONExport, color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Save Image', icon: '📸', onClick: handleImageExport, color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Export STL', icon: '🔧', onClick: handleSTLExport, color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: 'Python Template', icon: '🐍', onClick: handlePythonExport, color: 'bg-purple-600 hover:bg-purple-700' }
  ] : [
    { label: 'Export CSV', icon: '📊', onClick: handleCSVExport, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Export JSON', icon: '🧮', onClick: handleJSONExport, color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Save Image', icon: '📸', onClick: handleImageExport, color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Export BOM', icon: '📋', onClick: handleBOMExport, color: 'bg-orange-500 hover:bg-orange-600' },
    { label: 'Export STL', icon: '🔧', onClick: handleSTLExport, color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: 'Fusion 360 Script', icon: '🐍', onClick: handleFusion360Export, color: 'bg-purple-600 hover:bg-purple-700' }
  ]
  
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '20px' }}>
      <h3 className="text-base font-semibold mb-4 text-[#333]">Export Options</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {exportButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className="flex items-center justify-center px-4 py-2.5 transition-all"
            style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              color: '#495057',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <span className="text-base">{button.icon}</span>
              {button.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExportPanel