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
    <mesh ref={meshRef} position={position} rotation={[0, rotation, 0]} receiveShadow castShadow>
      <boxGeometry args={[length, width, thickness]} />
      {material}
    </mesh>
  )
}

function CentralLight({ intensity, color, showLighting }) {
  if (!showLighting) return null
  
  // Create intricate Islamic/geometric pattern for each face
  const createFacePattern = (size) => {
    const patterns = []
    
    // Outer pentagon frame
    for (let i = 0; i < 5; i++) {
      const angle1 = (i / 5) * Math.PI * 2 - Math.PI/2
      const angle2 = ((i + 1) / 5) * Math.PI * 2 - Math.PI/2
      const r = size * 0.45
      patterns.push({
        type: 'line',
        x1: Math.cos(angle1) * r,
        y1: Math.sin(angle1) * r,
        x2: Math.cos(angle2) * r,
        y2: Math.sin(angle2) * r,
        width: 0.015
      })
    }
    
    // Inner star pattern
    for (let i = 0; i < 10; i++) {
      const isOuter = i % 2 === 0
      const angle = (i / 10) * Math.PI * 2 - Math.PI/2
      const r1 = isOuter ? size * 0.35 : size * 0.2
      const nextAngle = ((i + 1) / 10) * Math.PI * 2 - Math.PI/2
      const r2 = ((i + 1) % 2 === 0) ? size * 0.35 : size * 0.2
      patterns.push({
        type: 'line',
        x1: Math.cos(angle) * r1,
        y1: Math.sin(angle) * r1,
        x2: Math.cos(nextAngle) * r2,
        y2: Math.sin(nextAngle) * r2,
        width: 0.01
      })
    }
    
    // Radiating lines from center
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 - Math.PI/2
      const r1 = size * 0.05
      const r2 = i % 2 === 0 ? size * 0.35 : size * 0.2
      patterns.push({
        type: 'line',
        x1: Math.cos(angle) * r1,
        y1: Math.sin(angle) * r1,
        x2: Math.cos(angle) * r2,
        y2: Math.sin(angle) * r2,
        width: 0.008
      })
    }
    
    // Small decorative triangles
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI/2
      const r = size * 0.28
      const x = Math.cos(angle) * r
      const y = Math.sin(angle) * r
      
      // Triangle points
      for (let j = 0; j < 3; j++) {
        const a1 = angle + (j / 3) * Math.PI/2.5
        const a2 = angle + ((j + 1) / 3) * Math.PI/2.5
        patterns.push({
          type: 'line',
          x1: x + Math.cos(a1) * size * 0.06,
          y1: y + Math.sin(a1) * size * 0.06,
          x2: x + Math.cos(a2) * size * 0.06,
          y2: y + Math.sin(a2) * size * 0.06,
          width: 0.008
        })
      }
    }
    
    return patterns
  }
  
  return (
    <group position={[0, 0.2, 0]}>
      {/* Elevated legs */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2
        const radius = 0.6
        return (
          <mesh key={`leg-${i}`} position={[Math.cos(angle) * radius, -0.1, Math.sin(angle) * radius]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.9} metalness={0.1} />
          </mesh>
        )
      })}
      
      {/* Regular dodecahedron 2m tall */}
      <group position={[0, 1, 0]}>
        {/* Dodecahedron frame - only edges visible for debugging */}
        {false && (
          <mesh>
            <dodecahedronGeometry args={[1]} />
            <meshBasicMaterial wireframe color="#333333" />
          </mesh>
        )}
        
        {/* Pattern cutouts on each face */}
        {(() => {
          // Create a reference dodecahedron to get face positions
          const geometry = new THREE.DodecahedronGeometry(1)
          
          // Golden ratio
          const phi = (1 + Math.sqrt(5)) / 2
          
          // Dodecahedron face centers normalized
          const faceCenters = [
            [0, phi, 1/phi],
            [0, phi, -1/phi],
            [0, -phi, 1/phi],
            [0, -phi, -1/phi],
            [1/phi, 0, phi],
            [-1/phi, 0, phi],
            [1/phi, 0, -phi],
            [-1/phi, 0, -phi],
            [phi, 1/phi, 0],
            [phi, -1/phi, 0],
            [-phi, 1/phi, 0],
            [-phi, -1/phi, 0]
          ].map(v => {
            const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)
            return new THREE.Vector3(v[0]/len, v[1]/len, v[2]/len)
          })
          
          // Distance from center to face for unit dodecahedron
          const faceDistance = 0.85065
          
          return faceCenters.map((normal, idx) => {
            const position = normal.clone().multiplyScalar(faceDistance + 0.001) // Slightly outside
            
            // Create rotation to align pattern with face
            const quaternion = new THREE.Quaternion()
            quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              normal
            )
            const euler = new THREE.Euler().setFromQuaternion(quaternion)
            
            return (
              <group key={idx} position={[position.x, position.y, position.z]} rotation={[euler.x, euler.y, euler.z]}>
                {/* Semi-transparent background for light to pass through */}
                <mesh>
                  <circleGeometry args={[0.525, 5]} />
                  <meshBasicMaterial 
                    transparent
                    opacity={0}
                  />
                </mesh>
                
                {/* Pattern lines that block light */}
                {createFacePattern(1.0).map((pattern, i) => {
                  if (pattern.type === 'line') {
                    const dx = pattern.x2 - pattern.x1
                    const dy = pattern.y2 - pattern.y1
                    const length = Math.sqrt(dx*dx + dy*dy)
                    const midX = (pattern.x1 + pattern.x2) / 2
                    const midY = (pattern.y1 + pattern.y2) / 2
                    const rotation = Math.atan2(dy, dx)
                    
                    return (
                      <mesh key={i} position={[midX, midY, 0]} rotation={[0, 0, rotation]} castShadow>
                        <planeGeometry args={[length, pattern.width]} />
                        <meshStandardMaterial 
                          color="#1A0F08"
                          roughness={0.95}
                          metalness={0.05}
                        />
                      </mesh>
                    )
                  }
                  return null
                })}
              </group>
            )
          })
        })()}
        
        {/* Single bright omnidirectional light source */}
        <mesh>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={intensity}
          />
        </mesh>
        
        {/* Single high-quality omnidirectional point light */}
        <pointLight 
          position={[0, 0, 0]}
          color={color} 
          intensity={intensity * 2} 
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-near={0.01}
          shadow-camera-far={25}
          shadow-bias={-0.0001}
          shadow-normalBias={0.02}
        />
      </group>
    </group>
  )
}

function ShadowPanels({ domeDiameter, domeHeight }) {
  const panelCount = 8
  const panels = []
  
  // Create geometric panels around the dome
  for (let i = 0; i < panelCount; i++) {
    const angle = (i / panelCount) * Math.PI * 2
    const radius = domeDiameter / 2 + 2 // Position panels just outside dome
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    
    // Alternate between different panel heights and patterns
    const panelHeight = i % 2 === 0 ? domeHeight * 0.8 : domeHeight * 0.6
    const panelWidth = 3
    const rotation = angle + Math.PI / 2
    
    panels.push(
      <group key={i} position={[x, panelHeight / 2, z]} rotation={[0, rotation, 0]}>
        {/* Main panel */}
        <mesh castShadow>
          <boxGeometry args={[panelWidth, panelHeight, 0.1]} />
          <meshStandardMaterial color="#2C1810" roughness={0.9} metalness={0.1} />
        </mesh>
        
        {/* Decorative cutouts for pattern */}
        {i % 2 === 0 && (
          <>
            <mesh position={[0, panelHeight * 0.3, -0.06]} castShadow>
              <boxGeometry args={[panelWidth * 0.6, panelHeight * 0.2, 0.2]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[0, -panelHeight * 0.2, -0.06]} castShadow>
              <cylinderGeometry args={[panelWidth * 0.3, panelWidth * 0.3, 0.2]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </>
        )}
      </group>
    )
  }
  
  return <group>{panels}</group>
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
      {parameters.showShadowPanels && (
        <ShadowPanels 
          domeDiameter={parameters.domeDiameter}
          domeHeight={parameters.domeHeight}
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
  
  // Removed displacement - keeping ground completely flat
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry
      const positions = geometry.attributes.position
      
      // Set all Z positions to 0 for completely flat ground
      for (let i = 0; i < positions.count; i++) {
        positions.setZ(i, 0)
      }
      
      positions.needsUpdate = true
      geometry.computeVertexNormals()
    }
  }, [])
  
  return (
    <group>
      {/* Single flat ground plane for clean shadow reception */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.95}
          metalness={0}
        />
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
      <Canvas shadows="soft">
        <PerspectiveCamera makeDefault position={[10, 7, 10]} />
        <CameraController view={parameters.cameraView} />
        
        <ambientLight intensity={0.25} color="#FFE4B5" />
        <directionalLight
          position={[10, 15, 5]}
          intensity={0.3}
          color="#FFF8DC"
          castShadow={false}
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