export function computeDomeGeometry(params) {
  const {
    domeHeight,
    domeDiameter,
    boardLength,
    boardWidth,
    verticalGap,
    endOverlap,
    minTopBoards = 9,
    invertShape = false,
    enableHalfOpen = false,
    showDoor = false
  } = params

  const a = domeDiameter / 2
  const H = domeHeight
  const R = (a * a + H * H) / (2 * H)
  const pitch = boardWidth + verticalGap
  const rows = Math.floor(H * 1000 / pitch)
  
  const rowData = []
  let totalBoards = 0
  
  for (let i = 0; i < rows; i++) {
    const z = ((i + 0.5) * pitch) / 1000
    const distanceFromTop = H - z
    const r = Math.sqrt(R * R - (R - H + distanceFromTop) * (R - H + distanceFromTop))
    const circumference = 2 * Math.PI * r
    const effectiveBoardLength = boardLength - endOverlap / 1000
    const calculatedBoards = Math.round(circumference / effectiveBoardLength)
    const boards = Math.max(minTopBoards, calculatedBoards)
    const actualCircumference = boards * boardLength - boards * (endOverlap / 1000)
    const gap = (circumference - actualCircumference) / boards * 1000
    
    totalBoards += enableHalfOpen ? Math.ceil(boards / 2) : boards
    
    rowData.push({
      row: i + 1,
      height: Math.round(z * 1000),
      radius: Math.round(r * 1000),
      boards: enableHalfOpen ? Math.ceil(boards / 2) : boards,
      fullCircleBoards: boards,
      perEndGap: Math.max(0, Math.round(gap)),
      angleStep: (2 * Math.PI) / boards
    })
  }
  
  return {
    sphereRadius: R,
    rows,
    rowData,
    totalBoards
  }
}

export function generateBoardPositions(rowInfo, boardLength, boardThickness, enableHalfOpen, invertShape = false, totalHeight = 6, rowIndex = 0, showDoor = false, sameRowVerticalGap = 0) {
  const positions = []
  const { radius, fullCircleBoards, angleStep, height } = rowInfo
  const boardCount = enableHalfOpen ? Math.ceil(fullCircleBoards / 2) : fullCircleBoards
  
  // Apply offset for odd rows to create brick-laying pattern
  const angleOffset = (rowIndex % 2 === 1) ? (angleStep / 2) : 0
  
  const startAngle = (enableHalfOpen ? -Math.PI / 2 : 0) + angleOffset
  const endAngle = (enableHalfOpen ? Math.PI / 2 : 2 * Math.PI) + angleOffset
  
  // Door dimensions
  const doorHeight = 2.0 // 2m
  const doorWidth = 0.75 // 0.75m
  const doorAngle = 0 // Door at front (0 degrees)
  const doorAngleSpan = doorWidth / (radius / 1000) // Angular span of door
  
  for (let i = 0; i < boardCount; i++) {
    const angle = startAngle + (i * angleStep)
    if (!enableHalfOpen || (angle >= -Math.PI / 2 && angle <= Math.PI / 2)) {
      const yPos = invertShape ? (totalHeight - height / 1000) : (height / 1000)
      
      // Apply alternating vertical offset within same row
      const verticalOffset = (i % 2 === 0 ? 1 : -1) * (sameRowVerticalGap / 2000)
      const adjustedYPos = yPos + verticalOffset
      
      // Check if board needs to be modified for door
      let boardStart = -boardLength / 2
      let boardEnd = boardLength / 2
      let skipBoard = false
      
      if (showDoor && invertShape) {
        // For dome mode: check if within door height from ground
        // yPos is the height of this board row above ground
        if (yPos < doorHeight) {
          // Normalize angle to 0-2π range, accounting for brick-laying offset
          let normalizedAngle = angle - angleOffset  // Remove the offset first
          while (normalizedAngle < 0) normalizedAngle += Math.PI * 2
          while (normalizedAngle > Math.PI * 2) normalizedAngle -= Math.PI * 2
          
          // Door is centered at angle 0 (facing forward)
          const doorCenterAngle = 0
          const doorHalfAngle = doorAngleSpan / 2
          
          // Check if this board position is within door angular range
          let angleDiff = Math.abs(normalizedAngle - doorCenterAngle)
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff
          
          if (angleDiff < doorHalfAngle) {
            // Board is in door area - calculate how to modify it
            const doorEdgeDistance = doorWidth / 2
            const boardX = radius * Math.cos(angle) / 1000
            const boardZ = radius * Math.sin(angle) / 1000
            
            // Calculate board direction vector
            const boardDirX = -Math.sin(angle)
            const boardDirZ = Math.cos(angle)
            
            // Calculate board endpoints in world space
            const startPointX = boardX + boardDirX * boardStart
            const startPointZ = boardZ + boardDirZ * boardStart
            const endPointX = boardX + boardDirX * boardEnd
            const endPointZ = boardZ + boardDirZ * boardEnd
            
            // Check if board crosses door edges
            const doorLeft = -doorWidth / 2
            const doorRight = doorWidth / 2
            
            // For boards at the front of the dome (angle near 0)
            // Check if board should be skipped entirely or trimmed
            if (Math.abs(normalizedAngle) < doorHalfAngle) {
              // Board is fully within door opening - skip it
              skipBoard = true
            } else {
              // Board is outside door but might be adjacent to it
              // Check if this board is the first one outside the door opening
              const nextAngle = normalizedAngle > 0 ? normalizedAngle - angleStep : normalizedAngle + angleStep
              
              // If the next board position would be inside the door, this board needs to be cut
              if (Math.abs(nextAngle) < doorHalfAngle) {
                // This board is adjacent to the door opening - cut it in half
                if (normalizedAngle > 0) {
                  // Board is on right side of door - keep right half
                  boardStart = 0
                  console.log(`Cutting board on right side of door to half length`)
                } else {
                  // Board is on left side of door - keep left half
                  boardEnd = 0
                  console.log(`Cutting board on left side of door to half length`)
                }
              }
            }
          }
        }
      }
      
      if (!skipBoard) {
        positions.push({
          x: radius * Math.cos(angle) / 1000,
          y: adjustedYPos,
          z: radius * Math.sin(angle) / 1000,
          rotation: -angle + Math.PI / 2,
          length: boardEnd - boardStart,
          thickness: boardThickness / 1000
        })
      }
    }
  }
  
  return positions
}

export function computeBeamIntersectionGeometry(params) {
  const {
    n,
    s,
    K,
    rows,
    thetaRad,
    layerHeight,
    beamThickness,
    beamDepth,
    showIntersections,
    showPerpMarkers,
    showInnerPolygon
  } = params
  
  // Scale factor to normalize geometry to reasonable units (target 10 unit radius for 3000mm side)
  const scaleFactor = 10 / 3000
  
  // Calculate derived values
  const R = s / (2 * Math.sin(Math.PI / n))
  const a = s / (2 * Math.tan(Math.PI / n))
  const cotN = 1 / Math.tan(Math.PI / n)
  const mEdge = s * cotN * Math.tan(thetaRad / 2)
  const cEdge = (s - mEdge) / 2
  const dPerp = a * Math.tan(thetaRad / 2)
  
  const elementData = []
  let elementId = 0
  
  // Generate base polygon vertices (scaled)
  const phi0 = Math.PI / n // Start with one edge horizontal
  const vertices = []
  for (let i = 0; i < n; i++) {
    const angle = phi0 + (2 * Math.PI * i) / n
    vertices.push({
      x: R * Math.cos(angle) * scaleFactor,
      y: R * Math.sin(angle) * scaleFactor,
      z: 0
    })
  }
  
  // Add vertical offset to raise the whole geometry by half layer height
  const verticalOffset = (layerHeight / 2) * scaleFactor
  
  // Generate geometry for each row
  for (let row = 0; row < rows; row++) {
    const thetaRow = row * thetaRad
    const z = (row * layerHeight * scaleFactor) + verticalOffset
    
    // Generate beams for this row
    for (let i = 0; i < n; i++) {
      const v1 = vertices[i]
      const v2 = vertices[(i + 1) % n]
      
      // Calculate edge midpoint and direction
      const midX = (v1.x + v2.x) / 2
      const midY = (v1.y + v2.y) / 2
      const edgeAngle = Math.atan2(v2.y - v1.y, v2.x - v1.x)
      
      // Apply rotation for this row
      const rotatedMidX = midX * Math.cos(thetaRow) - midY * Math.sin(thetaRow)
      const rotatedMidY = midX * Math.sin(thetaRow) + midY * Math.cos(thetaRow)
      const rotatedAngle = edgeAngle + thetaRow
      
      elementData.push({
        id: elementId++,
        type: 'beam',
        row: row,
        edgeIndex: i,
        position: {
          x: rotatedMidX,
          y: rotatedMidY,
          z: z
        },
        rotation: {
          x: 0,
          y: 0,
          z: rotatedAngle
        },
        dimensions: {
          length: s * scaleFactor,
          width: beamThickness * scaleFactor,    // Scale beam thickness same as geometry
          height: beamDepth * scaleFactor       // Scale beam depth same as geometry
        }
      })
    }
    
    // Calculate intersection points for this row
    const intersectionPoints = []
    for (let i = 0; i < n; i++) {
      const v1 = vertices[i]
      const v2 = vertices[(i + 1) % n]
      
      // Calculate intercept positions along edge
      const t1 = cEdge / s
      const t2 = 1 - cEdge / s
      
      // Interpolate positions
      const p1 = {
        x: v1.x + t1 * (v2.x - v1.x),
        y: v1.y + t1 * (v2.y - v1.y),
        z: 0
      }
      const p2 = {
        x: v1.x + t2 * (v2.x - v1.x),
        y: v1.y + t2 * (v2.y - v1.y),
        z: 0
      }
      
      // Apply rotation for this row
      const rotP1X = p1.x * Math.cos(thetaRow) - p1.y * Math.sin(thetaRow)
      const rotP1Y = p1.x * Math.sin(thetaRow) + p1.y * Math.cos(thetaRow)
      const rotP2X = p2.x * Math.cos(thetaRow) - p2.y * Math.sin(thetaRow)
      const rotP2Y = p2.x * Math.sin(thetaRow) + p2.y * Math.cos(thetaRow)
      
      intersectionPoints.push({ x: rotP1X, y: rotP1Y, z: z })
      intersectionPoints.push({ x: rotP2X, y: rotP2Y, z: z })
      
      // Add markers if enabled
      if (showIntersections) {
        elementData.push({
          id: elementId++,
          type: 'marker',
          subtype: 'intercept',
          row: row,
          edgeIndex: i,
          position: { x: rotP1X, y: rotP1Y, z: z }
        })
        
        elementData.push({
          id: elementId++,
          type: 'marker',
          subtype: 'intercept',
          row: row,
          edgeIndex: i,
          position: { x: rotP2X, y: rotP2Y, z: z }
        })
      }
    }
    
    // Add edge connection lines if enabled
    if (showInnerPolygon && intersectionPoints.length > 0) {
      // Create lines connecting the two intersection points on each edge
      for (let i = 0; i < n; i++) {
        const p1 = intersectionPoints[i * 2]
        const p2 = intersectionPoints[i * 2 + 1]
        
        elementData.push({
          id: elementId++,
          type: 'polyline',
          row: row,
          edgeIndex: i,
          points: [p1, p2]
        })
      }
    }
    
    // Add perpendicular markers if enabled
    if (showPerpMarkers) {
      for (let i = 0; i < n; i++) {
        const v1 = vertices[i]
        const v2 = vertices[(i + 1) % n]
        
        // Edge midpoint
        const midX = (v1.x + v2.x) / 2
        const midY = (v1.y + v2.y) / 2
        
        // Perpendicular direction (inward) - note vertices are already scaled
        const edgeLength = Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2)
        const perpX = -(v2.y - v1.y) / edgeLength
        const perpY = (v2.x - v1.x) / edgeLength
        
        // Perpendicular marker position (scale dPerp)
        const perpEndX = midX + perpX * dPerp * scaleFactor
        const perpEndY = midY + perpY * dPerp * scaleFactor
        
        // Apply rotation
        const rotMidX = midX * Math.cos(thetaRow) - midY * Math.sin(thetaRow)
        const rotMidY = midX * Math.sin(thetaRow) + midY * Math.cos(thetaRow)
        const rotPerpX = perpEndX * Math.cos(thetaRow) - perpEndY * Math.sin(thetaRow)
        const rotPerpY = perpEndX * Math.sin(thetaRow) + perpEndY * Math.cos(thetaRow)
        
        elementData.push({
          id: elementId++,
          type: 'marker',
          subtype: 'perpLine',
          row: row,
          edgeIndex: i,
          start: { x: rotMidX, y: rotMidY, z: z },
          end: { x: rotPerpX, y: rotPerpY, z: z }
        })
      }
    }
  }
  
  return {
    totalElements: elementData.length,
    elementData: elementData,
    meta: {
      thetaRad: thetaRad,
      thetaDeg: (thetaRad * 180) / Math.PI,
      mEdge: mEdge,
      cEdge: cEdge,
      dPerp: dPerp,
      a: a,
      R: R,
      cosN: Math.cos(Math.PI / n),
      cotN: cotN
    }
  }
}