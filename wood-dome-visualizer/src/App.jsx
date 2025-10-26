import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import ControlsPanel from './components/ControlsPanel'
import DomeRenderer from './components/DomeRenderer'
import DataTable from './components/DataTable'
import SummaryPanel from './components/SummaryPanel'
import ExportPanel from './components/ExportPanel'

function AppContent() {
  const location = useLocation()
  const [mobileTab, setMobileTab] = useState('3d') // '3d', 'controls', 'data'
  const [isMobile, setIsMobile] = useState(false)
  const [showModeMenu, setShowModeMenu] = useState(false)
  
  // Determine active tab from URL
  const activeTab = location.pathname === '/intersections' ? 'intersections' : 
                    location.pathname === '/visualizer' ? 'visualizer' : 'builder'
  
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
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif' }}>
      <header style={{backgroundColor: '#f5f5f5', padding: '12px'}}>
        <div style={{backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '12px', margin: '0 auto'}}>
          <div className="flex items-center gap-6">
            <img 
              src="/image.png" 
              alt="Dream Catcher" 
              style={{
                width: '90px',
                height: '90px',
                objectFit: 'contain'
              }}
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#333]">
                Dream Catcher Calculator
              </h1>
              
              <nav className="flex items-center text-sm mt-2" style={{gap: '5px'}}>
                {activeTab === 'builder' ? (
                  <span className="font-bold" style={{color: '#000'}}>Dome Builder</span>
                ) : (
                  <Link
                    to="/"
                    className="text-[#2196f3] hover:text-[#1976d2] transition-colors underline"
                  >
                    Dome Builder
                  </Link>
                )}
                
                <span style={{color: '#ddd'}}>|</span>
                
                {activeTab === 'intersections' ? (
                  <span className="font-bold" style={{color: '#000'}}>Layer Interceptor</span>
                ) : (
                  <Link
                    to="/intersections"
                    className="text-[#2196f3] hover:text-[#1976d2] transition-colors underline"
                  >
                    Layer Interceptor
                  </Link>
                )}
                
                <span style={{color: '#ddd'}}>|</span>
                
                {activeTab === 'visualizer' ? (
                  <span className="font-bold" style={{color: '#000'}}>Visualizer</span>
                ) : (
                  <Link
                    to="/visualizer"
                    className="text-[#2196f3] hover:text-[#1976d2] transition-colors underline"
                  >
                    Visualizer
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col overflow-hidden" style={{backgroundColor: '#f5f5f5'}}>
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
          <Routes>
            <Route path="/" element={(
            isMobile ? (
              // Mobile Layout
              <div className="flex-1 flex flex-col">
                {mobileTab === '3d' && (
                  <div className="flex-1 p-4">
                    <div className="h-full overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
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
                <div className="flex-1" style={{padding: '16px'}}>
                  <div className="flex h-full" style={{gap: '16px'}}>
                    <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <DomeRenderer />
                    </div>
                    <div className="w-[420px] overflow-y-auto" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                      <SummaryPanel />
                      <DataTable />
                      <ExportPanel />
                    </div>
                  </div>
                </div>
              </div>
            )
            )} />
            <Route path="/visualizer" element={(
            // Visualizer Mode
            <div className="flex-1" style={{padding: '16px'}}>
              <div className="h-full overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <DomeRenderer />
              </div>
            </div>
            )} />
            <Route path="/intersections" element={(
            // Beam Intersections Mode
            <div className="flex-1 flex">
              <ControlsPanel mode="intersections" />
              <div className="flex-1" style={{padding: '16px'}}>
                <div className="flex h-full" style={{gap: '16px'}}>
                  <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <DomeRenderer mode="intersections" />
                  </div>
                  <div className="w-[420px] overflow-y-auto pr-2">
                    <ExportPanel mode="intersections" />
                  </div>
                </div>
              </div>
            </div>
            )} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App