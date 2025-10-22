import React, { useMemo } from 'react'
import useStore from '../store'
import { computeDomeGeometry } from '../utils/computeDomeGeometry'

const DataTable = () => {
  const parameters = useStore(state => state.parameters)
  
  const geometry = useMemo(() => {
    return computeDomeGeometry(parameters)
  }, [parameters])
  
  return (
    <div className="bg-white rounded-xl shadow-xl p-5 border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Row Plan Details</h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-3 text-left font-semibold text-gray-700">Row</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-700">Height (mm)</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-700">Radius (mm)</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-700">Boards</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-700">Gap (mm)</th>
            </tr>
          </thead>
          <tbody>
            {geometry.rowData.slice(0, 15).map((row, index) => (
              <tr key={row.row} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-3 py-2 font-medium">{row.row}</td>
                <td className="px-3 py-2">{row.height}</td>
                <td className="px-3 py-2">{row.radius}</td>
                <td className="px-3 py-2">{row.boards}</td>
                <td className="px-3 py-2">{row.perEndGap}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {geometry.rowData.length > 15 && (
          <p className="text-center text-gray-500 text-sm py-3 bg-gray-50 border-t">
            Showing first 15 rows of {geometry.rows}
          </p>
        )}
      </div>
    </div>
  )
}

export default DataTable