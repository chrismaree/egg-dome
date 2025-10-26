import React, { useState, useEffect } from 'react'
import ControlsPanel from './components/ControlsPanel'
import DomeRenderer from './components/DomeRenderer'
import DataTable from './components/DataTable'
import SummaryPanel from './components/SummaryPanel'
import ExportPanel from './components/ExportPanel'

function App() {
  const [activeTab, setActiveTab] = useState('builder')
  const [mobileTab, setMobileTab] = useState('3d') // '3d', 'controls', 'data'
  const [isMobile, setIsMobile] = useState(false)
  const [showModeMenu, setShowModeMenu] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModeMenu && !event.target.closest('.mode-menu-container')) {
        setShowModeMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showModeMenu])
  
  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <header className="bg-gradient-to-r from-purple-800 to-blue-800 text-white px-4 md:px-6 py-3 md:py-5 shadow-xl">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3 flex items-center gap-3">
            <span className="text-3xl md:text-5xl animate-pulse">✨</span>
            Dream Catcher Calculator
            <span className="text-3xl md:text-5xl animate-pulse">✨</span>
          </h1>
          
          <nav className="flex items-center gap-6 md:gap-10 text-sm md:text-base">
            {activeTab === 'builder' ? (
              <span className="text-white font-bold">🔨 Dome Builder</span>
            ) : (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveTab('builder') }}
                className="text-blue-300 hover:text-white underline"
              >
                🔨 Dome Builder
              </a>
            )}
            
            <span className="text-gray-300">|</span>
            
            {activeTab === 'intersections' ? (
              <span className="text-white font-bold">📐 Layer Interceptor</span>
            ) : (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveTab('intersections') }}
                className="text-blue-300 hover:text-white underline"
              >
                📐 Layer Interceptor
              </a>
            )}
            
            <span className="text-gray-300">|</span>
            
            {activeTab === 'visualizer' ? (
              <span className="text-white font-bold">🎨 Visualizer</span>
            ) : (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveTab('visualizer') }}
                className="text-blue-300 hover:text-white underline"
              >
                🎨 Visualizer
              </a>
            )}
          </nav>
          
          {activeTab === 'builder' && (
            <div className="bg-yellow-500 text-gray-900 px-3 py-1.5 mt-3 rounded-lg text-xs md:text-sm font-medium">
              ⚠️ This tool is meant as a calculator to estimate resources needed and does not represent a true structural representation of the final design.
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Mobile Tab Navigation */}
        {isMobile && activeTab === 'builder' && (
          <div className="md:hidden flex bg-white border-b border-gray-200 shadow-sm">
            <button
              onClick={() => setMobileTab('3d')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                mobileTab === '3d' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500'
              }`}
            >
              🎨 3D View
            </button>
            <button
              onClick={() => setMobileTab('controls')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                mobileTab === 'controls' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500'
              }`}
            >
              🎛️ Controls
            </button>
            <button
              onClick={() => setMobileTab('data')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                mobileTab === 'data' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500'
              }`}
            >
              📊 Data
            </button>
          </div>
        )}
        
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'builder' ? (
            isMobile ? (
              // Mobile Layout
              <div className="flex-1 flex flex-col">
                {mobileTab === '3d' && (
                  <div className="flex-1 p-4">
                    <div className="h-full rounded-xl overflow-hidden shadow-2xl">
                      <DomeRenderer />
                    </div>
                  </div>
                )}
                {mobileTab === 'controls' && (
                  <div className="flex-1 overflow-y-auto">
                    <ControlsPanel mobile={true} />
                  </div>
                )}
                {mobileTab === 'data' && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <SummaryPanel />
                    <DataTable />
                    <ExportPanel />
                  </div>
                )}
              </div>
            ) : (
              // Desktop Layout
              <div className="flex-1 flex">
                <ControlsPanel />
                <div className="flex-1 p-6">
                  <div className="flex gap-6 h-full">
                    <div className="flex-1 rounded-xl overflow-hidden shadow-2xl">
                      <DomeRenderer />
                    </div>
                    <div className="w-[420px] space-y-6 overflow-y-auto pr-2">
                      <SummaryPanel />
                      <DataTable />
                      <ExportPanel />
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : activeTab === 'visualizer' ? (
            // Visualizer Mode
            <div className="flex-1 p-4 md:p-6">
              <div className="h-full rounded-xl overflow-hidden shadow-2xl">
                <DomeRenderer />
              </div>
            </div>
          ) : (
            // Beam Intersections Mode
            <div className="flex-1 flex">
              <ControlsPanel mode="intersections" />
              <div className="flex-1 p-6">
                <div className="flex gap-6 h-full">
                  <div className="flex-1 rounded-xl overflow-hidden shadow-2xl">
                    <DomeRenderer mode="intersections" />
                  </div>
                  <div className="w-[420px] overflow-y-auto pr-2">
                    <ExportPanel mode="intersections" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App