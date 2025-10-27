import React, { useMemo } from 'react'
import useStore from '../store'
import { computeBeamIntersectionGeometry } from '../utils/computeDomeGeometry'

const BeamPropertiesPanel = () => {
  const parameters = useStore(state => state.parameters)
  const getMEdge = useStore(state => state.getMEdge)
  const getThetaRad = useStore(state => state.getThetaRad)

  const mEdge = getMEdge()
  const scaleFactor = 10 / 3000
  const EPS = 1e-9

  const formatCut = (value) =>
    value !== undefined && value !== null ? `${value.toFixed(0)} mm` : '—'

  const cutInfo = useMemo(() => {
    if (parameters.rows < 3) {
      return null
    }

    const thetaRad = getThetaRad()

    const geometry = computeBeamIntersectionGeometry({
      n: parameters.n,
      s: parameters.s,
      K: parameters.K,
      rows: parameters.rows,
      thetaRad,
      layerHeight: parameters.layerHeight,
      beamThickness: parameters.beamThickness,
      beamDepth: parameters.beamDepth,
      showIntersections: true,
      showPerpMarkers: false,
      showInnerPolygon: false,
      showCutLabels: false
    })

    const targetRow = parameters.rows - 2
    const markers = geometry.elementData.filter(
      (element) =>
        element.type === 'marker' &&
        element.subtype === 'intercept' &&
        element.row === targetRow
    )

    if (markers.length === 0) {
      return null
    }

    const R = parameters.s / (2 * Math.sin(Math.PI / parameters.n))
    const phi0 = Math.PI / parameters.n
    const baseVertices = []

    for (let i = 0; i < parameters.n; i++) {
      const angle = phi0 + (2 * Math.PI * i) / parameters.n
      baseVertices.push({
        x: R * Math.cos(angle) * scaleFactor,
        y: R * Math.sin(angle) * scaleFactor
      })
    }

    const rotateVertex = (vertex, angle) => ({
      x: vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle),
      y: vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle)
    })

    const thetaRow = targetRow * thetaRad
    const rotatedVertices = baseVertices.map((vertex) =>
      rotateVertex(vertex, thetaRow)
    )

    const edgeLengths = {
      above: [],
      below: []
    }

    markers.forEach((marker) => {
      const edgeStart = rotatedVertices[marker.edgeIndex]
      const edgeEnd =
        rotatedVertices[(marker.edgeIndex + 1) % rotatedVertices.length]

      const edgeDX = edgeEnd.x - edgeStart.x
      const edgeDY = edgeEnd.y - edgeStart.y
      const denom = edgeDX * edgeDX + edgeDY * edgeDY

      if (denom < EPS) {
        return
      }

      const markerDX = marker.position.x - edgeStart.x
      const markerDY = marker.position.y - edgeStart.y
      const t = Math.min(Math.max((markerDX * edgeDX + markerDY * edgeDY) / denom, 0), 1)
      edgeLengths[marker.markerType].push(t * parameters.s)
    })

    const dedupeCuts = (values = []) => {
      const sorted = [...values].sort((a, b) => a - b)
      return sorted.filter((value, index) => {
        if (index === 0) return true
        return Math.abs(value - sorted[index - 1]) > 1e-3
      })
    }

    const topCuts = dedupeCuts(edgeLengths.above)
    const bottomCuts = dedupeCuts(edgeLengths.below)

    return {
      topCuts,
      bottomCuts
    }
  }, [
    parameters.n,
    parameters.s,
    parameters.K,
    parameters.rows,
    parameters.layerHeight,
    parameters.beamThickness,
    parameters.beamDepth,
    getThetaRad
  ])

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
          <span className="text-[#666]">Cut-to-Cut Gap</span>
          <span className="font-mono text-[#333] font-medium">{mEdge.toFixed(2)} mm</span>
        </div>
        {cutInfo ? (
          <>
            <div className="pt-3 mt-2 border-t border-gray-200 text-[#666]">Second-from-top row cuts</div>
            <div className="flex justify-between">
              <span className="text-[#666]">Top cut 1</span>
              <span className="font-mono text-[#333] font-medium">{formatCut(cutInfo.topCuts[0])}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">Top cut 2</span>
              <span className="font-mono text-[#333] font-medium">{formatCut(cutInfo.topCuts[1])}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">Bottom cut 1</span>
              <span className="font-mono text-[#333] font-medium">{formatCut(cutInfo.bottomCuts[0])}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666]">Bottom cut 2</span>
              <span className="font-mono text-[#333] font-medium">{formatCut(cutInfo.bottomCuts[1])}</span>
            </div>
          </>
        ) : (
          <div className="pt-3 mt-2 border-t border-gray-200 text-xs text-[#888]">
            Add at least three rows to see top/bottom cut distances.
          </div>
        )}
      </div>
    </div>
  )
}

export default BeamPropertiesPanel
