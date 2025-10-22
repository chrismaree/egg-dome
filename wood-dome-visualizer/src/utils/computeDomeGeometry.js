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
      let modifiedLength = boardLength
      let skipBoard = false
      
      if (showDoor && invertShape) {
        // For dome mode: check if within door height from ground
        const actualHeight = totalHeight - yPos
        if (actualHeight < doorHeight) {
          // Calculate the angle span of this board
          const boardStartAngle = angle - (angleStep / 2)
          const boardEndAngle = angle + (angleStep / 2)
          const doorStartAngle = doorAngle - (doorAngleSpan / 2)
          const doorEndAngle = doorAngle + (doorAngleSpan / 2)
          
          // Check if board intersects with door opening
          if (boardEndAngle > doorStartAngle && boardStartAngle < doorEndAngle) {
            // Board intersects door - calculate how much to shorten it
            const boardCenterX = radius * Math.cos(angle) / 1000
            const boardCenterZ = radius * Math.sin(angle) / 1000
            
            // If board center is within door area, skip it entirely
            if (angle > doorStartAngle && angle < doorEndAngle) {
              skipBoard = true
            } else {
              // Otherwise, shorten the board to terminate at door edge
              // This is a simplified approach - just reduce length proportionally
              const overlapRatio = Math.min(
                Math.abs(boardEndAngle - doorStartAngle),
                Math.abs(doorEndAngle - boardStartAngle)
              ) / angleStep
              modifiedLength = boardLength * (1 - overlapRatio * 0.5)
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
          length: modifiedLength,
          thickness: boardThickness / 1000
        })
      }
    }
  }
  
  return positions
}