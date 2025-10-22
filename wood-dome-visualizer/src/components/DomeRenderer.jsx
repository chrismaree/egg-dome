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
        <dodecahedronGeometry args={[1]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={intensity / 50}
        />
      </mesh>
      <pointLight 
        color={color} 
        intensity={intensity / 20} 
        distance={15}
        castShadow
      />
    </group>
  )
}

function DoorFrame({ domeDiameter, domeHeight, invertShape }) {
  const doorHeight = 2.0
  const doorWidth = 0.75
  const frameThickness = 0.1
  const frameDepth = 0.2
  
  if (!invertShape) return null // Door only works on dome mode (when inverted is true)
  
  // Calculate radius at ground level for proper positioning
  const a = domeDiameter / 2
  const H = domeHeight
  const R = (a * a + H * H) / (2 * H)
  
  // For inverted shape (dome), ground level is at the bottom
  const groundLevel = 0.1 // Small offset from ground
  const groundRadius = Math.sqrt(R * R - (R - groundLevel) * (R - groundLevel))
  
  return (
    <group>
      {/* Position door frame at the perimeter of the dome */}
      <group position={[0, 0, groundRadius - frameDepth/2]}>
        {/* Left vertical frame */}
        <Box 
          args={[frameThickness, doorHeight, frameDepth]} 
          position={[-doorWidth/2 - frameThickness/2, doorHeight/2, 0]}
        >
          <meshStandardMaterial color="#654321" roughness={0.8} metalness={0.1} />
        </Box>
        
        {/* Right vertical frame */}
        <Box 
          args={[frameThickness, doorHeight, frameDepth]} 
          position={[doorWidth/2 + frameThickness/2, doorHeight/2, 0]}
        >
          <meshStandardMaterial color="#654321" roughness={0.8} metalness={0.1} />
        </Box>
        
        {/* Top horizontal frame */}
        <Box 
          args={[doorWidth + 2*frameThickness, frameThickness, frameDepth]} 
          position={[0, doorHeight + frameThickness/2, 0]}
        >
          <meshStandardMaterial color="#654321" roughness={0.8} metalness={0.1} />
        </Box>
        
        {/* Floor threshold */}
        <Box 
          args={[doorWidth + 2*frameThickness, 0.05, frameDepth]} 
          position={[0, 0.025, 0]}
        >
          <meshStandardMaterial color="#654321" roughness={0.8} metalness={0.1} />
        </Box>
      </group>
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
        parameters.enableHalfOpen,
        parameters.invertShape,
        parameters.domeHeight,
        rowIndex,
        parameters.showDoor,
        parameters.sameRowVerticalGap
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
      {parameters.showDoor && (
        <DoorFrame 
          domeDiameter={parameters.domeDiameter}
          domeHeight={parameters.domeHeight}
          invertShape={parameters.invertShape}
        />
      )}
    </>
  )
}

function Ground() {
  const meshRef = useRef()
  
  useMemo(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry
      const positions = geometry.attributes.position
      
      // Create subtle desert undulations
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        
        // Create gentle waves with different frequencies
        const wave1 = Math.sin(x * 0.1) * 0.15
        const wave2 = Math.cos(y * 0.15) * 0.1
        const wave3 = Math.sin((x + y) * 0.08) * 0.12
        
        // Add small random variations
        const randomVariation = (Math.random() - 0.5) * 0.05
        
        const z = wave1 + wave2 + wave3 + randomVariation
        positions.setZ(i, z)
      }
      
      positions.needsUpdate = true
      geometry.computeVertexNormals()
    }
  }, [])
  
  return (
    <group>
      {/* Main desert ground with displacement */}
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow
      >
        <planeGeometry args={[60, 60, 50, 50]} />
        <meshStandardMaterial 
          color="#E6D4A3"
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      
      {/* Small rocks/details scattered around */}
      <mesh position={[12, 0.05, 8]} castShadow>
        <dodecahedronGeometry args={[0.3]} />
        <meshStandardMaterial color="#8B7355" roughness={1} />
      </mesh>
      
      <mesh position={[-10, 0.03, -7]} castShadow>
        <dodecahedronGeometry args={[0.2]} />
        <meshStandardMaterial color="#A0826D" roughness={1} />
      </mesh>
      
      <mesh position={[8, 0.04, -10]} castShadow>
        <dodecahedronGeometry args={[0.25]} />
        <meshStandardMaterial color="#8B7355" roughness={1} />
      </mesh>
      
      <mesh position={[-7, 0.02, 9]} castShadow>
        <dodecahedronGeometry args={[0.15]} />
        <meshStandardMaterial color="#967961" roughness={1} />
      </mesh>
    </group>
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
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 7, 10]} />
        <CameraController view={parameters.cameraView} />
        
        <ambientLight intensity={0.4} color="#FFE4B5" />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          color="#FFF8DC"
          castShadow
          shadow-mapSize={2048}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#FFB6C1" />
        
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