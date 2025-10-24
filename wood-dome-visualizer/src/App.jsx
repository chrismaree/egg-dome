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
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <header className="bg-gradient-to-r from-purple-800 to-blue-800 text-white px-4 md:px-6 py-3 md:py-5 shadow-xl">
        <div className="bg-yellow-500 text-gray-900 px-3 py-1.5 mb-2 md:mb-3 rounded-lg text-xs md:text-sm font-medium text-center">
          ⚠️ This tool is meant as a calculator to estimate resources needed and does not represent a true structural representation of the final design.
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-4xl animate-pulse">✨</span>
            <span className="hidden sm:inline">Shadow Catcher</span>
            <span className="sm:hidden">Shadow</span>
            <span className="hidden md:inline text-base md:text-lg font-normal text-blue-200">🌙 Dome Builder</span>
          </h1>
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 ${
                activeTab === 'builder' 
                  ? 'bg-white text-purple-800 shadow-lg' 
                  : 'bg-purple-700 text-purple-100 hover:bg-purple-600'
              }`}
            >
              🔨 Builder Mode
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 ${
                activeTab === 'visualizer' 
                  ? 'bg-white text-purple-800 shadow-lg' 
                  : 'bg-purple-700 text-purple-100 hover:bg-purple-600'
              }`}
            >
              🎨 Visualizer Mode
            </button>
          </div>
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
          ) : (
            // Visualizer Mode
            <div className="flex-1 p-4 md:p-6">
              <div className="h-full rounded-xl overflow-hidden shadow-2xl">
                <DomeRenderer />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App