import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store'
import { computeDomeGeometry, generateBoardPositions, computeBeamIntersectionGeometry } from '../utils/computeDomeGeometry'

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
        {/* Base dodecahedron structure - more visible */}
        <mesh>
          <dodecahedronGeometry args={[1]} />
          <meshPhysicalMaterial 
            color="#1A0F08"
            transmission={0.3}
            thickness={0.5}
            roughness={0.2}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            opacity={0.8}
            transparent
          />
        </mesh>
        
        {/* Pattern overlays on each face */}
        {(() => {
          // Create a dodecahedron geometry to extract face data
          const geometry = new THREE.DodecahedronGeometry(1)
          const posAttr = geometry.attributes.position
          
          // Get unique face centers by processing triangles
          const faceMap = new Map()
          
          for (let i = 0; i < posAttr.count; i += 3) {
            // Get triangle vertices
            const v1 = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
            const v2 = new THREE.Vector3(posAttr.getX(i+1), posAttr.getY(i+1), posAttr.getZ(i+1))
            const v3 = new THREE.Vector3(posAttr.getX(i+2), posAttr.getY(i+2), posAttr.getZ(i+2))
            
            // Calculate face center
            const center = new THREE.Vector3().addVectors(v1, v2).add(v3).divideScalar(3)
            
            // Calculate face normal
            const edge1 = new THREE.Vector3().subVectors(v2, v1)
            const edge2 = new THREE.Vector3().subVectors(v3, v1)
            const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()
            
            // Create unique key for face
            const key = `${Math.round(normal.x*10)}_${Math.round(normal.y*10)}_${Math.round(normal.z*10)}`
            
            if (!faceMap.has(key)) {
              faceMap.set(key, { center: center.clone(), normal: normal.clone() })
            }
          }
          
          const faces = Array.from(faceMap.values()).slice(0, 12) // Ensure we only get 12 faces
          
          return faces.map((face, idx) => {
            // Position pattern exactly on face surface (0.8506 is the exact distance for a unit dodecahedron)
            const position = face.center.normalize().multiplyScalar(0.8507)
            
            // Create rotation to align pattern with face
            const quaternion = new THREE.Quaternion()
            quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              face.normal
            )
            const euler = new THREE.Euler().setFromQuaternion(quaternion)
            
            return (
              <group key={idx} position={[position.x, position.y, position.z]} rotation={[euler.x, euler.y, euler.z]}>
                {/* Pentagon base to ensure full face coverage */}
                <mesh>
                  <circleGeometry args={[0.525, 5]} />
                  <meshBasicMaterial color="#0A0805" opacity={0.9} transparent />
                </mesh>
                
                {/* Pattern lines that create the openings */}
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


// Door cutout is now handled in the geometry generation, no need for a separate frame component

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

function BeamElement({ element, row, totalRows }) {
  const color = useMemo(() => {
    // Strong vibrant colors palette
    const colors = [
      '#eebe41', // Golden yellow
      '#b05adc', // Purple
      '#a2e85e', // Light green
      '#7aa8e6', // Light blue
      '#d25d4c', // Coral red
      '#f39c12', // Orange
      '#e74c3c', // Red
      '#3498db', // Blue
      '#2ecc71', // Green
      '#9b59b6', // Violet
    ]
    const colorIndex = Math.floor((row / totalRows) * colors.length)
    return colors[colorIndex % colors.length]
  }, [row, totalRows])
  
  return (
    <mesh 
      position={[element.position.x, element.position.z, -element.position.y]}
      rotation={[0, element.rotation.z, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[element.dimensions.length, element.dimensions.height, element.dimensions.width]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.3} 
        metalness={0} 
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

function MarkerElement({ element }) {
  if (element.subtype === 'intercept') {
    // Blue for intersections from below, red for intersections from above
    const color = element.markerType === 'above' ? '#ff0000' : '#0000ff'
    return (
      <mesh position={[element.position.x, element.position.z, -element.position.y]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    )
  }
  
  if (element.subtype === 'perpLine') {
    const points = [
      new THREE.Vector3(element.start.x, element.start.z, -element.start.y),
      new THREE.Vector3(element.end.x, element.end.z, -element.end.y)
    ]
    return (
      <Line points={points} color="#00ff00" lineWidth={2} />
    )
  }
  
  return null
}

function PolylineElement({ element }) {
  const points = element.points.map(p => new THREE.Vector3(p.x, p.z, -p.y))
  
  // Manually ensure the polygon is closed by adding the first point at the end
  if (points.length > 0 && !points[0].equals(points[points.length - 1])) {
    points.push(points[0].clone())
  }
  
  return <Line points={points} color="#ffff00" lineWidth={3} />
}

function BeamIntersectionStructure() {
  const parameters = useStore(state => state.parameters)
  const getThetaRad = useStore(state => state.getThetaRad)
  const getMEdge = useStore(state => state.getMEdge)
  const getCEdge = useStore(state => state.getCEdge)
  const getDPerp = useStore(state => state.getDPerp)
  
  const geometryData = useMemo(() => {
    const thetaRad = getThetaRad()
    return computeBeamIntersectionGeometry({
      n: parameters.n,
      s: parameters.s,
      K: parameters.K,
      rows: parameters.rows,
      thetaRad: thetaRad,
      layerHeight: parameters.layerHeight,
      beamThickness: parameters.beamThickness,
      beamDepth: parameters.beamDepth,
      showIntersections: parameters.showIntersections,
      showPerpMarkers: parameters.showPerpMarkers,
      showInnerPolygon: parameters.showInnerPolygon
    })
  }, [
    parameters.n, parameters.s, parameters.K, parameters.rows,
    parameters.layerHeight, parameters.beamThickness, parameters.beamDepth,
    parameters.showIntersections, parameters.showPerpMarkers, parameters.showInnerPolygon,
    getThetaRad
  ])
  
  return (
    <>
      {geometryData.elementData.map((element) => {
        if (element.type === 'beam') {
          return (
            <BeamElement 
              key={element.id} 
              element={element} 
              row={element.row}
              totalRows={parameters.rows}
            />
          )
        } else if (element.type === 'marker') {
          return <MarkerElement key={element.id} element={element} />
        } else if (element.type === 'polyline') {
          return <PolylineElement key={element.id} element={element} />
        }
        return null
      })}
      
      {/* Display overlay with calculations */}
      <Html position={[-8, 5, 0]} style={{ width: '200px', pointerEvents: 'none' }}>
        <div className="bg-black/80 text-white p-2 rounded text-xs">
          <div>θ = {geometryData.meta.thetaDeg.toFixed(2)}°</div>
          <div>m_edge = {geometryData.meta.mEdge.toFixed(2)}</div>
          <div>c_edge = {geometryData.meta.cEdge.toFixed(2)}</div>
          <div>d_perp = {geometryData.meta.dPerp.toFixed(2)}</div>
        </div>
      </Html>
    </>
  )
}

function CameraController({ view, mode = 'default' }) {
  const { camera } = useThree()
  const parameters = useStore(state => state.parameters)
  
  useEffect(() => {
    if (mode === 'intersections') {
      // Adjust camera position based on geometry size
      const cameraDistance = Math.max(15, parameters.s / 150)
      camera.position.set(cameraDistance, cameraDistance * 0.67, cameraDistance)
      const centerHeight = (parameters.rows * parameters.layerHeight * 10) / (2 * parameters.s)
      camera.lookAt(0, centerHeight, 0)
    } else if (view === 'inside') {
      camera.position.set(0, 1.7, 0)
      camera.lookAt(0, 2, -3)
    } else {
      camera.position.set(15, 12, 15)
      camera.lookAt(0, 3, 0)
    }
  }, [view, camera, mode, parameters.s, parameters.rows, parameters.layerHeight])
  
  return null
}

const DomeRenderer = ({ mode = 'default' }) => {
  const parameters = useStore(state => state.parameters)
  
  // For intersections mode, adjust camera based on geometry size
  const cameraDistance = mode === 'intersections' ? Math.max(15, parameters.s / 150) : 10
  const cameraPosition = mode === 'intersections' 
    ? [cameraDistance, cameraDistance * 0.67, cameraDistance]
    : [10, 7, 10]
  
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Canvas shadows="soft">
        <PerspectiveCamera makeDefault position={cameraPosition} />
        <CameraController view={parameters.cameraView} mode={mode} />
        
        <ambientLight intensity={0.25} color="#FFE4B5" />
        <directionalLight
          position={[10, 15, 5]}
          intensity={0.3}
          color="#FFF8DC"
          castShadow={false}
        />
        
        {mode === 'intersections' ? (
          <>
            <BeamIntersectionStructure />
            {parameters.gridOn && (
              <gridHelper args={[Math.max(30, parameters.s / 50), 20]} position={[0, 0, 0]} />
            )}
            {parameters.axesOn && (
              <axesHelper args={[Math.max(10, parameters.s / 100)]} />
            )}
          </>
        ) : (
          <>
            <DomeStructure />
            <Ground />
          </>
        )}
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={mode === 'intersections' ? 3 : 2}
          maxDistance={mode === 'intersections' ? Math.max(50, parameters.s / 30) : 20}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

export default DomeRenderer
