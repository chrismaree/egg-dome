import { create } from 'zustand'

const useStore = create((set) => ({
  parameters: {
    domeHeight: 6.0,
    domeDiameter: 8.0,
    boardLength: 2.88,
    boardThickness: 38,
    boardWidth: 114,
    verticalGap: 29,
    endOverlap: 0,
    pricePerStock: 179,
    minTopBoards: 9,
    enableHalfOpen: false,
    showLighting: true,
    lightIntensity: 50,
    renderMode: 'shaded',
    lightColor: '#ffd700',
    cameraView: 'outside'
  },
  
  updateParameter: (name, value) => set((state) => ({
    parameters: {
      ...state.parameters,
      [name]: value
    }
  })),
  
  resetParameters: () => set((state) => ({
    parameters: {
      domeHeight: 6.0,
      domeDiameter: 8.0,
      boardLength: 2.88,
      boardThickness: 38,
      boardWidth: 114,
      verticalGap: 29,
      endOverlap: 0,
      pricePerStock: 179,
      minTopBoards: 9,
      enableHalfOpen: false,
      showLighting: true,
      lightIntensity: 50,
      renderMode: 'shaded',
      lightColor: '#ffd700',
      cameraView: 'outside'
    }
  }))
}))

export default useStore