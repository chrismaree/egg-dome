import { create } from 'zustand'

const useStore = create((set, get) => ({
  parameters: {
    // Existing dome parameters
    domeHeight: 6.0,
    domeDiameter: 7,
    boardLength: 2,
    boardThickness: 38,
    boardWidth: 152,
    verticalGap: 29,
    sameRowVerticalGap: 0,
    endOverlap: 0,
    pricePerStock: 229,
    minTopBoards: 12,
    invertShape: true,
    enableHalfOpen: false,
    showDoor: false,
    showLighting: true,
    lightIntensity: 50,
    renderMode: 'shaded',
    lightColor: '#ffd700',
    cameraView: 'outside',
    
    // Beam intersection parameters
    n: 3,
    s: 3000,  // 3m in mm
    K: 2,
    rows: 3,
    thetaMode: 'auto',
    thetaDeg: 0,
    layerHeight: 152,
    beamThickness: 38,
    beamDepth: 152,
    showIntersections: true,
    showPerpMarkers: false,
    showInnerPolygon: true,
    colorScheme: 'byLayer',
    gridOn: true,
    axesOn: false
  },
  
  // Derived selectors for beam intersections
  getThetaRad: () => {
    const params = get().parameters
    return params.thetaMode === 'auto' 
      ? (2 * Math.PI) / (params.n * params.K)
      : (params.thetaDeg * Math.PI) / 180
  },
  
  getCosN: () => {
    const n = get().parameters.n
    return Math.cos(Math.PI / n)
  },
  
  getCotN: () => {
    const n = get().parameters.n
    return 1 / Math.tan(Math.PI / n)
  },
  
  getA: () => {
    const params = get().parameters
    return params.s / (2 * Math.tan(Math.PI / params.n))
  },
  
  getMEdge: () => {
    const params = get().parameters
    const cotN = get().getCotN()
    const thetaRad = get().getThetaRad()
    return params.s * cotN * Math.tan(thetaRad / 2)
  },
  
  getCEdge: () => {
    const params = get().parameters
    const mEdge = get().getMEdge()
    return (params.s - mEdge) / 2
  },
  
  getDPerp: () => {
    const params = get().parameters
    const a = get().getA()
    const thetaRad = get().getThetaRad()
    return a * Math.tan(thetaRad / 2)
  },
  
  updateParameter: (name, value) => set((state) => ({
    parameters: {
      ...state.parameters,
      [name]: value
    }
  })),
  
  resetParameters: () => set((state) => ({
    parameters: {
      // Existing dome parameters
      domeHeight: 6.0,
      domeDiameter: 7,
      boardLength: 2,
      boardThickness: 38,
      boardWidth: 152,
      verticalGap: 29,
      sameRowVerticalGap: 0,
      endOverlap: 0,
      pricePerStock: 229,
      minTopBoards: 12,
      invertShape: true,
      enableHalfOpen: false,
      showDoor: false,
      showLighting: true,
      lightIntensity: 50,
      renderMode: 'shaded',
      lightColor: '#ffd700',
      cameraView: 'outside',
      
      // Beam intersection parameters
      n: 3,
      s: 3000,  // 3m in mm
      K: 2,
      rows: 3,
      thetaMode: 'auto',
      thetaDeg: 0,
      layerHeight: 152,
      beamThickness: 38,
      beamDepth: 152,
      showIntersections: true,
      showPerpMarkers: false,
      showInnerPolygon: true,
      colorScheme: 'byLayer',
      gridOn: true,
      axesOn: false
    }
  }))
}))

export default useStore