import React, { useMemo } from 'react'
import useStore from '../store'
import { computeDomeGeometry } from '../utils/computeDomeGeometry'
import { computeCosts } from '../utils/computeCosts'

const SummaryPanel = () => {
  const parameters = useStore(state => state.parameters)
  
  const { geometry, costs } = useMemo(() => {
    const geo = computeDomeGeometry(parameters)
    const cost = computeCosts(parameters, geo.totalBoards)
    return { geometry: geo, costs: cost }
  }, [parameters])
  
  const stats = [
    { label: 'Total Boards', value: geometry.totalBoards, unit: '' },
    { label: 'Total Rows', value: geometry.rows, unit: '' },
    { label: 'Total Cost', value: `R${costs.totalCost.toFixed(0)}`, unit: '' },
    { label: 'Wood Needed', value: costs.totalLinearMeters.toFixed(0), unit: 'm' },
    { label: 'Stock Pieces', value: costs.stocksNeeded, unit: '' },
    { label: 'Wood Volume', value: costs.totalVolume.toFixed(2), unit: 'm³' },
    { label: 'Weight', value: costs.totalWeight.toFixed(0), unit: 'kg' },
    { label: 'Waste per Stock', value: costs.wastedWoodPerStock.toFixed(2), unit: 'm' }
  ]
  
  return (
    <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 border border-gray-100">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-5 text-gray-800">Project Summary</h3>
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-2.5 md:p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-base md:text-xl font-bold text-gray-800 mt-0.5 md:mt-1">
              {stat.value}
              {stat.unit && <span className="text-xs md:text-sm font-normal text-gray-600 ml-1">{stat.unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SummaryPanel