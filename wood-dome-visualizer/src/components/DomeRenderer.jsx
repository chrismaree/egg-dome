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
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Create a sandy texture
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 512)
    gradient.addColorStop(0, '#F4E4C1')
    gradient.addColorStop(0.5, '#E8D4B0')
    gradient.addColorStop(1, '#D2B48C')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    // Add noise for texture
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(${200 + Math.random() * 55}, ${180 + Math.random() * 40}, ${140 + Math.random() * 40}, ${Math.random() * 0.1})`
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1)
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    return texture
  }, [])
  
  const normalMap = useMemo(() => {
    // Create a normal map for surface detail
    const size = 256
    const data = new Uint8Array(size * size * 4)
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const idx = (i * size + j) * 4
        // Add random bumps
        const nx = (Math.random() - 0.5) * 0.3 + 0.5
        const ny = (Math.random() - 0.5) * 0.3 + 0.5
        data[idx] = nx * 255
        data[idx + 1] = ny * 255
        data[idx + 2] = 255
        data[idx + 3] = 255
      }
    }
    
    const normalTexture = new THREE.DataTexture(data, size, size)
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping
    normalTexture.repeat.set(8, 8)
    return normalTexture
  }, [])
  
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry
      const positions = geometry.attributes.position
      
      // Create dramatic desert dunes with controlled amplitude
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        
        // Distance from center for edge falloff
        const distance = Math.sqrt(x * x + y * y)
        const edgeFalloff = Math.max(0, 1 - (distance / 45))
        
        // Major dune patterns - more controlled height
        const dune1 = Math.sin(x * 0.05) * 3.5 * Math.cos(y * 0.03)
        const dune2 = Math.sin((x - 20) * 0.03 + 1) * 2.5
        const dune3 = Math.cos(y * 0.04) * 2
        
        // Medium frequency waves
        const wave1 = Math.sin(x * 0.1 + y * 0.05) * 0.8
        const wave2 = Math.cos(x * 0.08 - y * 0.06) * 0.6
        
        // Small ripples
        const ripple = Math.sin(x * 0.3) * 0.2 * Math.cos(y * 0.35) * 0.15
        
        // Combine all effects with edge falloff to prevent holes
        const z = (dune1 + dune2 + dune3 + wave1 + wave2 + ripple) * edgeFalloff * 0.7
        positions.setZ(i, Math.max(z, -0.5)) // Prevent going too low
      }
      
      positions.needsUpdate = true
      geometry.computeVertexNormals()
    }
  }, [])
  
  return (
    <group>
      {/* Base plane to prevent holes */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial 
          color="#D2B48C"
          roughness={1}
          metalness={0}
        />
      </mesh>
      
      {/* Main desert ground with displacement */}
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
        castShadow
      >
        <planeGeometry args={[100, 100, 200, 200]} />
        <meshStandardMaterial 
          map={texture}
          normalMap={normalMap}
          normalScale={[0.5, 0.5]}
          roughness={0.95}
          metalness={0.05}
          envMapIntensity={0.2}
        />
      </mesh>
      
      
      {/* Desert rocks and debris */}
      {[...Array(8)].map((_, i) => {
        const x = (Math.random() - 0.5) * 30
        const z = (Math.random() - 0.5) * 30
        const size = 0.1 + Math.random() * 0.4
        
        return (
          <mesh 
            key={`rock-${i}`}
            position={[x, size / 2, z]} 
            castShadow
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <dodecahedronGeometry args={[size]} />
            <meshStandardMaterial 
              color={`hsl(${30 + Math.random() * 20}, ${30 + Math.random() * 20}%, ${40 + Math.random() * 20}%)`}
              roughness={1} 
            />
          </mesh>
        )
      })}
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
      camera.position.set(15, 12, 15)
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
        
        <ambientLight intensity={0.3} color="#FFE4B5" />
        <directionalLight
          position={[10, 15, 5]}
          intensity={1.5}
          color="#FFF8DC"
          castShadow
          shadow-mapSize={2048}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#FFB6C1" />
        <pointLight position={[15, 8, 15]} intensity={0.2} color="#FFA500" />
        
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