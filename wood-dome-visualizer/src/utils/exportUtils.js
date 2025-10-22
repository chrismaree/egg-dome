import { saveAs } from 'file-saver'

export function exportToCSV(rowData, params, costs) {
  const headers = ['Row', 'Height (mm)', 'Radius (mm)', 'Boards', 'Per-End Gap (mm)']
  const rows = rowData.map(row => 
    [row.row, row.height, row.radius, row.boards, row.perEndGap].join(',')
  )
  
  const summary = [
    '',
    'Summary',
    `Total Boards,${costs.totalBoards}`,
    `Total Cost (EUR),${costs.totalCost.toFixed(2)}`,
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
    `Price per 6m Stock: €${params.pricePerStock}`,
    `Total Cost: €${costs.totalCost.toFixed(2)}`,
    '',
    `Generated: ${new Date().toLocaleString()}`
  ]
  
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' })
  saveAs(blob, `dome-bom-${new Date().toISOString().split('T')[0]}.txt`)
}