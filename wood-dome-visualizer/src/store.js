import { create } from 'zustand'

const useStore = create((set) => ({
  parameters: {
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
      cameraView: 'outside'
    }
  }))
}))

export default useStore