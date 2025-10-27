import React from 'react'
import useStore from '../store'

const BeamPropertiesPanel = () => {
  const parameters = useStore(state => state.parameters)
  const getMEdge = useStore(state => state.getMEdge)
  const getCEdge = useStore(state => state.getCEdge)

  const mEdge = getMEdge()
  const cEdge = getCEdge()
  const secondCutFromSameCorner = cEdge + mEdge
  const secondCutFromOppositeCorner = parameters.s - cEdge

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
        padding: '20px'
      }}
    >
      <h3 className="text-base font-semibold mb-4 text-[#333]">Beam Properties</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#666]">Beam Length</span>
          <span className="font-mono text-[#333] font-medium">{parameters.s.toFixed(2)} mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666]">Beam Width</span>
          <span className="font-mono text-[#333] font-medium">{parameters.beamThickness.toFixed(2)} mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666]">Beam Depth</span>
          <span className="font-mono text-[#333] font-medium">{parameters.beamDepth.toFixed(2)} mm</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-200">
          <span className="text-[#666]">First Cut from Corner</span>
          <span className="font-mono text-[#333] font-medium">{cEdge.toFixed(2)} mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666]">Second Cut from Same Corner</span>
          <span className="font-mono text-[#333] font-medium">{secondCutFromSameCorner.toFixed(2)} mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666]">Second Cut from Opposite Corner</span>
          <span className="font-mono text-[#333] font-medium">{secondCutFromOppositeCorner.toFixed(2)} mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666]">Cut-to-Cut Gap</span>
          <span className="font-mono text-[#333] font-medium">{mEdge.toFixed(2)} mm</span>
        </div>
      </div>
    </div>
  )
}

export default BeamPropertiesPanel
