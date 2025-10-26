import { saveAs } from 'file-saver'
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
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
  // Create a single merged geometry for all boards
  const geometries = []
  let boardCount = 0
  
  // Generate all board positions and create geometry for each
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
    
    positions.forEach((pos, boardIndex) => {
      // Create box geometry for board
      const boardGeometry = new THREE.BoxGeometry(pos.length, params.boardWidth / 1000, pos.thickness)
      
      // Apply position and rotation transformations
      const matrix = new THREE.Matrix4()
      matrix.makeRotationY(pos.rotation)
      matrix.setPosition(pos.x, pos.y, pos.z)
      boardGeometry.applyMatrix4(matrix)
      
      geometries.push(boardGeometry)
      boardCount++
    })
  })
  
  console.log(`Exporting ${boardCount} boards to STL`)
  
  // Merge all geometries into one
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
  const material = new THREE.MeshBasicMaterial()
  const mesh = new THREE.Mesh(mergedGeometry, material)
  
  // Create scene and add merged mesh
  const scene = new THREE.Scene()
  scene.add(mesh)
  
  // Export to STL
  const exporter = new STLExporter()
  const stlString = exporter.parse(scene, { binary: false }) // Use ASCII for debugging
  const blob = new Blob([stlString], { type: 'text/plain' })
  saveAs(blob, `dome-${boardCount}-boards-${new Date().toISOString().split('T')[0]}.stl`)
}

export function exportToFusion360Script(params, geometry) {
  // Generate Python script for Fusion 360
  const scriptLines = [
    '# Shadow Catcher Dome Generator for Fusion 360',
    '# Generated on ' + new Date().toISOString(),
    '',
    'import adsk.core, adsk.fusion, traceback',
    'import math',
    '',
    'def run(context):',
    '    ui = None',
    '    try:',
    '        app = adsk.core.Application.get()',
    '        ui = app.userInterface',
    '        design = app.activeProduct',
    '        rootComp = design.rootComponent',
    '        ',
    '        # Create new component for dome',
    '        allOccs = rootComp.occurrences',
    '        newOcc = allOccs.addNewComponent(adsk.core.Matrix3D.create())',
    '        newComp = newOcc.component',
    '        newComp.name = "Shadow Catcher Dome"',
    '        ',
    '        # Get construction planes',
    '        planes = newComp.constructionPlanes',
    '        xyPlane = newComp.xYConstructionPlane',
    '        ',
    '        # Parameters',
    `        board_width = ${params.boardWidth / 1000}  # Convert mm to meters`,
    `        board_thickness = ${params.boardThickness / 1000}`,
    `        dome_height = ${params.domeHeight}`,
    '        ',
    '        # Create collection for combining bodies',
    '        bodies = adsk.core.ObjectCollection.create()',
    '        ',
    '        # Function to create a board',
    '        def create_board(x, y, z, rotation, length, thickness, width):',
    '            sketches = newComp.sketches',
    '            sketch = sketches.add(xyPlane)',
    '            ',
    '            # Draw rectangle centered at origin',
    '            lines = sketch.sketchCurves.sketchLines',
    '            rect = lines.addCenterRectangle(',
    '                adsk.core.Point3D.create(0, 0, 0),',
    '                adsk.core.Point3D.create(length/2, width/2, 0)',
    '            )',
    '            ',
    '            # Extrude',
    '            prof = sketch.profiles.item(0)',
    '            extrudes = newComp.features.extrudeFeatures',
    '            extInput = extrudes.createInput(prof, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)',
    '            distance = adsk.core.ValueInput.createByReal(thickness)',
    '            extInput.setDistanceExtent(False, distance)',
    '            feat = extrudes.add(extInput)',
    '            body = feat.bodies.item(0)',
    '            ',
    '            # Create transform matrix',
    '            transform = adsk.core.Matrix3D.create()',
    '            transform.translation = adsk.core.Vector3D.create(x, y, z)',
    '            ',
    '            # Apply rotation around Z axis (vertical)',
    '            origin = adsk.core.Point3D.create(x, y, z)',
    '            axis = adsk.core.Vector3D.create(0, 0, 1)',
    '            transform.setToRotation(rotation, axis, origin)',
    '            ',
    '            # Move body',
    '            moveInput = newComp.features.moveFeatures.createInput(body, transform)',
    '            newComp.features.moveFeatures.add(moveInput)',
    '            ',
    '            return body',
    '        ',
    '        # Board data',
    '        boards_data = [',
  ]

  // Add board data
  let boardCount = 0
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
    
    positions.forEach((pos) => {
      scriptLines.push(`            (${pos.x}, ${pos.y}, ${pos.z}, ${pos.rotation}, ${pos.length}, ${pos.thickness}, ${params.boardWidth / 1000}),`)
      boardCount++
    })
  })

  scriptLines.push(...[
    '        ]',
    '        ',
    `        ui.messageBox(f"Creating {len(boards_data)} boards...")`,
    '        ',
    '        # Create progress dialog',
    '        progressDialog = ui.createProgressDialog()',
    '        progressDialog.cancelButtonText = "Cancel"',
    '        progressDialog.isBackgroundTranslucent = False',
    '        progressDialog.isCancelButtonShown = True',
    `        progressDialog.show("Creating Dome", f"Creating {len(boards_data)} boards...", 0, len(boards_data), 1)`,
    '        ',
    '        # Create boards',
    '        for i, (x, y, z, rotation, length, thickness, width) in enumerate(boards_data):',
    '            if progressDialog.wasCancelled:',
    '                break',
    '            body = create_board(x, y, z, rotation, length, thickness, width)',
    '            bodies.add(body)',
    '            progressDialog.progressValue = i + 1',
    '            progressDialog.message = f"Creating board {i+1} of {len(boards_data)}"',
    '            adsk.doEvents()',
    '        ',
    '        progressDialog.hide()',
    '        ',
    '        # Combine all bodies (optional - comment out if you want separate bodies)',
    '        if bodies.count > 1:',
    '            combineInput = newComp.features.combineFeatures.createInput(bodies.item(0), bodies)',
    '            combineInput.operation = adsk.fusion.FeatureOperations.JoinFeatureOperation',
    '            combineInput.isKeepToolBodies = False',
    '            newComp.features.combineFeatures.add(combineInput)',
    '        ',
    `        ui.messageBox(f"Successfully created dome with {len(boards_data)} boards!")`,
    '        ',
    '    except:',
    '        if ui:',
    '            ui.messageBox("Failed:\\n{}".format(traceback.format_exc()))',
  ])

  const scriptContent = scriptLines.join('\n')
  const blob = new Blob([scriptContent], { type: 'text/plain' })
  saveAs(blob, `dome-fusion360-script-${new Date().toISOString().split('T')[0]}.py`)
}

export function exportTo3D(params, geometry, format = 'stl') {
  if (format === 'stl') {
    exportToSTL(params, geometry)
  } else if (format === 'fusion360') {
    exportToFusion360Script(params, geometry)
  }
}

export function exportIntersectionCSV(intersectionGeometry, params) {
  const lines = ['type,row,edgeIndex,centerX,centerY,centerZ,rotZ,length,width,height']
  
  // Export beams
  intersectionGeometry.elementData.forEach((element) => {
    if (element.type === 'beam') {
      lines.push([
        'beam',
        element.row,
        element.edgeIndex,
        element.position.x.toFixed(3),
        element.position.y.toFixed(3),
        element.position.z.toFixed(3),
        element.rotation.z.toFixed(4),
        element.dimensions.length.toFixed(3),
        element.dimensions.width.toFixed(3),
        element.dimensions.height.toFixed(3)
      ].join(','))
    }
  })
  
  // Add intersection data
  lines.push('')
  lines.push('type,row,edgeIndex,x,y,z,note')
  
  intersectionGeometry.elementData.forEach((element) => {
    if (element.type === 'marker' && element.subtype === 'intercept') {
      lines.push([
        'intersection',
        element.row,
        element.edgeIndex,
        element.position.x.toFixed(3),
        element.position.y.toFixed(3),
        element.position.z.toFixed(3),
        'intercept_point'
      ].join(','))
    }
  })
  
  // Add summary
  lines.push('')
  lines.push('Summary')
  lines.push(`n,${params.n}`)
  lines.push(`s,${params.s}`)
  lines.push(`K,${params.K}`)
  lines.push(`theta_deg,${intersectionGeometry.meta.thetaDeg.toFixed(2)}`)
  lines.push(`m_edge,${intersectionGeometry.meta.mEdge.toFixed(3)}`)
  lines.push(`c_edge,${intersectionGeometry.meta.cEdge.toFixed(3)}`)
  lines.push(`d_perp,${intersectionGeometry.meta.dPerp.toFixed(3)}`)
  
  const csvContent = lines.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `beam-intersections-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportIntersectionJSON(intersectionGeometry, params) {
  const exportData = {
    timestamp: new Date().toISOString(),
    parameters: {
      n: params.n,
      s: params.s,
      K: params.K,
      rows: params.rows,
      thetaMode: params.thetaMode,
      thetaDeg: params.thetaDeg,
      layerHeight: params.layerHeight,
      beamThickness: params.beamThickness,
      beamDepth: params.beamDepth
    },
    meta: intersectionGeometry.meta,
    elementData: intersectionGeometry.elementData,
    totalElements: intersectionGeometry.totalElements
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  saveAs(blob, `beam-intersections-${new Date().toISOString().split('T')[0]}.json`)
}

export function exportIntersectionSTL(intersectionGeometry, params) {
  const geometries = []
  
  // Create geometries for beams only
  intersectionGeometry.elementData.forEach((element) => {
    if (element.type === 'beam') {
      const geometry = new THREE.BoxGeometry(
        element.dimensions.length,
        element.dimensions.height,
        element.dimensions.width
      )
      
      // Apply transformations
      const matrix = new THREE.Matrix4()
      matrix.makeRotationZ(element.rotation.z)
      matrix.setPosition(element.position.x, element.position.z, -element.position.y)
      geometry.applyMatrix4(matrix)
      
      geometries.push(geometry)
    }
  })
  
  if (geometries.length === 0) {
    console.error('No beams to export')
    return
  }
  
  // Merge all geometries
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
  
  // Export to STL
  const exporter = new STLExporter()
  const stlString = exporter.parse(mergedGeometry)
  const blob = new Blob([stlString], { type: 'application/octet-stream' })
  saveAs(blob, `beam-intersections-${new Date().toISOString().split('T')[0]}.stl`)
}

export function exportIntersectionPython(intersectionGeometry, params) {
  const pythonTemplate = `#!/usr/bin/env python3
"""
Beam Intersection Parameters
Generated: ${new Date().toISOString()}
"""

# Polygon parameters
n = ${params.n}  # Number of sides
s = ${params.s}  # Side length
K = ${params.K}  # Periodic re-alignment period

# Computed values
theta_rad = ${intersectionGeometry.meta.thetaRad}
theta_deg = ${intersectionGeometry.meta.thetaDeg}
m_edge = ${intersectionGeometry.meta.mEdge}
c_edge = ${intersectionGeometry.meta.cEdge}
d_perp = ${intersectionGeometry.meta.dPerp}
a = ${intersectionGeometry.meta.a}  # Apothem
R = ${intersectionGeometry.meta.R}  # Circumradius
cos_n = ${intersectionGeometry.meta.cosN}
cot_n = ${intersectionGeometry.meta.cotN}

# Beam dimensions
layer_height = ${params.layerHeight}
beam_thickness = ${params.beamThickness}
beam_depth = ${params.beamDepth}
rows = ${params.rows}

# Verification
print(f"n = {n}, s = {s}, K = {K}")
print(f"theta = {theta_deg:.2f}°")
print(f"m_edge = {m_edge:.3f}")
print(f"c_edge = {c_edge:.3f}")
print(f"d_perp = {d_perp:.3f}")
print(f"Identity check: 2c + m = {2*c_edge + m_edge:.3f} (should be {s})")

# Example: Generate beam positions
import math

def generate_beams():
    phi0 = math.pi / n
    vertices = []
    for i in range(n):
        angle = phi0 + (2 * math.pi * i) / n
        vertices.append({
            'x': R * math.cos(angle),
            'y': R * math.sin(angle)
        })
    
    beams = []
    for row in range(rows):
        theta_row = row * theta_rad
        z = row * layer_height
        
        for i in range(n):
            v1 = vertices[i]
            v2 = vertices[(i + 1) % n]
            
            # Edge midpoint
            mid_x = (v1['x'] + v2['x']) / 2
            mid_y = (v1['y'] + v2['y']) / 2
            
            # Apply rotation
            rot_x = mid_x * math.cos(theta_row) - mid_y * math.sin(theta_row)
            rot_y = mid_x * math.sin(theta_row) + mid_y * math.cos(theta_row)
            
            beams.append({
                'row': row,
                'edge': i,
                'x': rot_x,
                'y': rot_y,
                'z': z
            })
    
    return beams

if __name__ == "__main__":
    beams = generate_beams()
    print(f"\\nGenerated {len(beams)} beams")
`
  
  const blob = new Blob([pythonTemplate], { type: 'text/plain;charset=utf-8;' })
  saveAs(blob, `beam-intersections-params-${new Date().toISOString().split('T')[0]}.py`)
}