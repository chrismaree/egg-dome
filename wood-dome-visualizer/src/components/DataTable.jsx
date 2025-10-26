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
    <div className="flex flex-col" style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '20px', maxHeight: '400px' }}>
      <h3 className="text-base font-semibold mb-3 text-[#333]">Row Plan Details ({geometry.rows} rows)</h3>
      <div className="overflow-auto rounded-lg flex-1" style={{backgroundColor: 'white', border: '1px solid #e9ecef'}}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr style={{backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6'}}>
              <th className="px-3 py-2 text-left font-medium text-[#666]">Row</th>
              <th className="px-3 py-2 text-left font-medium text-[#666] hidden sm:table-cell">Height</th>
              <th className="px-3 py-2 text-left font-medium text-[#666] hidden sm:table-cell">Radius</th>
              <th className="px-3 py-2 text-left font-medium text-[#666]">Boards</th>
              <th className="px-3 py-2 text-left font-medium text-[#666]">Gap</th>
            </tr>
          </thead>
          <tbody>
            {geometry.rowData.map((row, index) => (
              <tr key={row.row} className="hover:bg-white transition-colors" style={{backgroundColor: 'transparent'}}>
                <td className="px-3 py-2 font-medium text-[#333]">{row.row}</td>
                <td className="px-3 py-2 text-[#666] hidden sm:table-cell">{row.height}</td>
                <td className="px-3 py-2 text-[#666] hidden sm:table-cell">{row.radius}</td>
                <td className="px-3 py-2 text-[#666]">{row.boards}</td>
                <td className="px-3 py-2 text-[#666]">{row.perEndGap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable