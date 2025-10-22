import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Box } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store'
import { computeDomeGeometry, generateBoardPositions } from '../utils/computeDomeGeometry'

function Board({ position, rotation, length, width = 0.114, thickness = 0.038, renderMode }) {
  const meshRef = useRef()
  
  const material = useMemo(() => {
    if (renderMode === 'wireframe') {
      return <meshBasicMaterial wireframe color="#00ff00" />
    }
    return (
      <meshStandardMaterial 
        color="#8B6F47"
        roughness={0.8}
        metalness={0.1}
      />
    )
  }, [renderMode])
  
  return (
    <mesh ref={meshRef} position={position} rotation={[0, rotation, 0]}>
      <boxGeometry args={[length, width, thickness]} />
      {material}
    </mesh>
  )
}

function CentralLight({ intensity, color, showLighting }) {
  if (!showLighting) return null
  
  return (
    <group position={[0, 1, 0]}>
      <mesh>
        <dodecahedronGeometry args={[0.5]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={intensity / 50}
        />
      </mesh>
      <pointLight 
        color={color} 
        intensity={intensity / 20} 
        distance={10}
        castShadow
      />
    </group>
  )
}

function DomeStructure() {
  const parameters = useStore(state => state.parameters)
  
  const { boards, geometry } = useMemo(() => {
    const geo = computeDomeGeometry(parameters)
    const allBoards = []
    
    geo.rowData.forEach((row, rowIndex) => {
      const positions = generateBoardPositions(
        row,
        parameters.boardLength,
        parameters.boardThickness,
        parameters.enableHalfOpen
      )
      
      positions.forEach((pos, boardIndex) => {
        allBoards.push({
          key: `${rowIndex}-${boardIndex}`,
          position: [pos.x, pos.y, pos.z],
          rotation: pos.rotation,
          length: pos.length
        })
      })
    })
    
    return { boards: allBoards, geometry: geo }
  }, [parameters])
  
  return (
    <>
      {boards.map(board => (
        <Board
          key={board.key}
          position={board.position}
          rotation={board.rotation}
          length={board.length}
          width={parameters.boardWidth / 1000}
          thickness={parameters.boardThickness / 1000}
          renderMode={parameters.renderMode}
        />
      ))}
      <CentralLight
        intensity={parameters.lightIntensity}
        color={parameters.lightColor}
        showLighting={parameters.showLighting}
      />
    </>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#c2976a" roughness={0.9} />
    </mesh>
  )
}

function CameraController({ view }) {
  const { camera } = useThree()
  
  useEffect(() => {
    if (view === 'inside') {
      camera.position.set(0, 1.7, 0)
      camera.lookAt(0, 2, -3)
    } else {
      camera.position.set(10, 7, 10)
      camera.lookAt(0, 3, 0)
    }
  }, [view, camera])
  
  return null
}

const DomeRenderer = () => {
  const parameters = useStore(state => state.parameters)
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-900 to-blue-600">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 7, 10]} />
        <CameraController view={parameters.cameraView} />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={2048}
        />
        
        <DomeStructure />
        <Ground />
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

export default DomeRenderer