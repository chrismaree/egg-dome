export function computeCosts(params, totalBoards) {
  const {
    boardLength,
    boardWidth,
    boardThickness,
    pricePerStock
  } = params
  
  const stockLength = 6.0
  const boardsPerStock = Math.floor(stockLength / boardLength)
  const stocksNeeded = Math.ceil(totalBoards / boardsPerStock)
  const totalCost = stocksNeeded * pricePerStock
  
  const boardVolume = boardLength * (boardWidth / 1000) * (boardThickness / 1000)
  const totalVolume = boardVolume * totalBoards
  
  const woodDensity = 500
  const totalWeight = totalVolume * woodDensity
  
  const totalLinearMeters = totalBoards * boardLength
  
  return {
    boardsPerStock,
    stocksNeeded,
    totalCost,
    totalVolume,
    totalWeight,
    totalLinearMeters,
    wastedWoodPerStock: stockLength - (boardsPerStock * boardLength),
    totalWastedWood: stocksNeeded * (stockLength - (boardsPerStock * boardLength))
  }
}