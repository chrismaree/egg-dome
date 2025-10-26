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
    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '20px' }}>
      <h3 className="text-base md:text-lg font-semibold mb-3 text-[#333]">Project Summary</h3>
      <div className="overflow-auto rounded-lg" style={{backgroundColor: 'white', border: '1px solid #e9ecef'}}>
        <table className="w-full text-sm">
          <tbody>
            {stats.map((stat, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors" style={{borderBottom: index < stats.length - 1 ? '1px solid #f0f0f0' : 'none'}}>
                <td className="px-3 py-2 text-[#666]">{stat.label}</td>
                <td className="px-3 py-2 text-right font-medium text-[#333]">
                  {stat.value}
                  {stat.unit && <span className="font-normal text-[#666] ml-1">{stat.unit}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SummaryPanel