import React, { useState } from 'react'
import ControlsPanel from './components/ControlsPanel'
import DomeRenderer from './components/DomeRenderer'
import DataTable from './components/DataTable'
import SummaryPanel from './components/SummaryPanel'
import ExportPanel from './components/ExportPanel'

function App() {
  const [activeTab, setActiveTab] = useState('builder')
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-gray-800 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🏗️ Wood Dome Visualizer</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 rounded transition-colors ${
                activeTab === 'builder' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Builder Mode
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-4 py-2 rounded transition-colors ${
                activeTab === 'visualizer' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Visualizer Mode
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden bg-gray-50">
        {activeTab === 'builder' ? (
          <>
            <ControlsPanel />
            <div className="flex-1 flex gap-6 p-6">
              <div className="flex-1 rounded-xl overflow-hidden shadow-2xl">
                <DomeRenderer />
              </div>
              <div className="w-[420px] space-y-6 overflow-y-auto pr-2">
                <SummaryPanel />
                <DataTable />
                <ExportPanel />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 p-6">
            <div className="h-full rounded-xl overflow-hidden shadow-2xl">
              <DomeRenderer />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App