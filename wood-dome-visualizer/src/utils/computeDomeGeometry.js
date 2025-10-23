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
            } else if (Math.abs(normalizedAngle) < doorHalfAngle * 3) {
              // Board is near the door - calculate if it extends into door space
              // Each board is tangent to the circle, so we need to check its endpoints
              
              // Calculate board endpoints in angular terms
              const boardArcLength = boardLength / (radius / 1000)
              const boardStartAngle = normalizedAngle - boardArcLength / 2
              const boardEndAngle = normalizedAngle + boardArcLength / 2
              
              // Check if board overlaps with door opening
              if (boardStartAngle < doorHalfAngle && boardEndAngle > -doorHalfAngle) {
                // Board crosses into door area
                if (normalizedAngle > 0) {
                  // Board is on right side of door
                  if (boardStartAngle < doorHalfAngle) {
                    // Trim left side of board to door edge
                    const newStartAngle = doorHalfAngle
                    const newArcLength = boardEndAngle - newStartAngle
                    const newLength = newArcLength * (radius / 1000)
                    boardStart = boardEnd - newLength
                  }
                } else {
                  // Board is on left side of door
                  if (boardEndAngle > -doorHalfAngle) {
                    // Trim right side of board to door edge
                    const newEndAngle = -doorHalfAngle
                    const newArcLength = newEndAngle - boardStartAngle
                    const newLength = newArcLength * (radius / 1000)
                    boardEnd = boardStart + newLength
                  }
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