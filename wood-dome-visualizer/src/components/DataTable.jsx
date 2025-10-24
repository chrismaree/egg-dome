import React, { useMemo } from 'react'
import useStore from '../store'
import { computeDomeGeometry } from '../utils/computeDomeGeometry'

const DataTable = () => {
  const parameters = useStore(state => state.parameters)
  
  const geometry = useMemo(() => {
    const geo = computeDomeGeometry(parameters)
    
    // When inverted (dome), reverse the rows so row 1 is at the bottom
    if (parameters.invertShape) {
      const reversedData = [...geo.rowData].reverse().map((row, index) => ({
        ...row,
        row: index + 1
      }))
      return { ...geo, rowData: reversedData }
    }
    
    return geo
  }, [parameters])
  
  return (
    <div className="bg-white rounded-xl shadow-xl p-3 md:p-5 border border-gray-100 flex flex-col" style={{ maxHeight: '400px' }}>
      <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-gray-800">Row Plan Details ({geometry.rows} rows)</h3>
      <div className="overflow-auto rounded-lg border border-gray-200 flex-1">
        <table className="w-full text-xs md:text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b bg-gray-50">
              <th className="px-2 py-2 md:px-3 md:py-3 text-left font-semibold text-gray-700">Row</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Height</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Radius</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-left font-semibold text-gray-700">Boards</th>
              <th className="px-2 py-2 md:px-3 md:py-3 text-left font-semibold text-gray-700">Gap</th>
            </tr>
          </thead>
          <tbody>
            {geometry.rowData.map((row, index) => (
              <tr key={row.row} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-2 py-1.5 md:px-3 md:py-2 font-medium">{row.row}</td>
                <td className="px-2 py-1.5 md:px-3 md:py-2 hidden sm:table-cell">{row.height}</td>
                <td className="px-2 py-1.5 md:px-3 md:py-2 hidden sm:table-cell">{row.radius}</td>
                <td className="px-2 py-1.5 md:px-3 md:py-2">{row.boards}</td>
                <td className="px-2 py-1.5 md:px-3 md:py-2">{row.perEndGap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable