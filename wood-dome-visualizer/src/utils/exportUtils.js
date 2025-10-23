import { saveAs } from 'file-saver'
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { generateBoardPositions } from './computeDomeGeometry'

export function exportToCSV(rowData, params, costs) {
  const headers = ['Row', 'Height (mm)', 'Radius (mm)', 'Boards', 'Per-End Gap (mm)']
  const rows = rowData.map(row => 
    [row.row, row.height, row.radius, row.boards, row.perEndGap].join(',')
  )
  
  const summary = [
    '',
    'Summary',
    `Total Boards,${costs.totalBoards}`,
    `Total Cost (ZAR),${costs.totalCost.toFixed(2)}`,
    `Stocks Needed,${costs.stocksNeeded}`,
    `Total Volume (m³),${costs.totalVolume.toFixed(3)}`,
    `Total Weight (kg),${costs.totalWeight.toFixed(1)}`
  ]
  
  const csvContent = [headers.join(','), ...rows, ...summary].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `dome-plan-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportToJSON(params, geometry, costs) {
  const exportData = {
    timestamp: new Date().toISOString(),
    parameters: params,
    geometry: {
      sphereRadius: geometry.sphereRadius,
      rows: geometry.rows,
      totalBoards: geometry.totalBoards
    },
    costs: costs,
    rowData: geometry.rowData
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  saveAs(blob, `dome-config-${new Date().toISOString().split('T')[0]}.json`)
}

export function exportCanvasAsImage(canvasElement, filename = 'dome-visualization.png') {
  canvasElement.toBlob((blob) => {
    saveAs(blob, filename)
  })
}

export function generateBOM(params, costs, geometry) {
  const lines = [
    'WOOD DOME BILL OF MATERIALS',
    '=' .repeat(40),
    '',
    'DOME SPECIFICATIONS:',
    `Height: ${params.domeHeight} m`,
    `Diameter: ${params.domeDiameter} m`,
    `Rows: ${geometry.rows}`,
    '',
    'BOARD SPECIFICATIONS:',
    `Board Length: ${params.boardLength} m`,
    `Board Width: ${params.boardWidth} mm`,
    `Board Thickness: ${params.boardThickness} mm`,
    `Vertical Gap: ${params.verticalGap} mm`,
    `End Overlap: ${params.endOverlap} mm`,
    '',
    'MATERIALS REQUIRED:',
    `Total Boards: ${geometry.totalBoards}`,
    `6m Stock Pieces: ${costs.stocksNeeded}`,
    `Total Linear Meters: ${costs.totalLinearMeters.toFixed(1)} m`,
    `Total Wood Volume: ${costs.totalVolume.toFixed(3)} m³`,
    `Estimated Weight: ${costs.totalWeight.toFixed(1)} kg`,
    '',
    'COST ESTIMATE:',
    `Price per 6m Stock: R${params.pricePerStock}`,
    `Total Cost: R${costs.totalCost.toFixed(2)}`,
    '',
    `Generated: ${new Date().toLocaleString()}`
  ]
  
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' })
  saveAs(blob, `dome-bom-${new Date().toISOString().split('T')[0]}.txt`)
}

export function exportToSTL(params, geometry) {
  // Create a Three.js scene with the dome geometry
  const scene = new THREE.Scene()
  const boardMaterial = new THREE.MeshBasicMaterial()
  
  // Generate all board positions and create mesh for each
  geometry.rowData.forEach((row, rowIndex) => {
    const positions = generateBoardPositions(
      row,
      params.boardLength,
      params.boardThickness,
      params.enableHalfOpen,
      params.invertShape,
      params.domeHeight,
      rowIndex,
      params.showDoor,
      params.sameRowVerticalGap
    )
    
    positions.forEach(pos => {
      const boardGeometry = new THREE.BoxGeometry(pos.length, params.boardWidth / 1000, pos.thickness)
      const board = new THREE.Mesh(boardGeometry, boardMaterial)
      board.position.set(pos.x, pos.y, pos.z)
      board.rotation.y = pos.rotation
      scene.add(board)
    })
  })
  
  // Export to STL
  const exporter = new STLExporter()
  const stlString = exporter.parse(scene, { binary: false })
  const blob = new Blob([stlString], { type: 'text/plain' })
  saveAs(blob, `dome-${new Date().toISOString().split('T')[0]}.stl`)
}

export function exportTo3D(params, geometry, format = 'stl') {
  // For now just support STL, but this could be extended to OBJ, etc.
  if (format === 'stl') {
    exportToSTL(params, geometry)
  }
}