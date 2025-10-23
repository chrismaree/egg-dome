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
      <header className="bg-gradient-to-r from-purple-800 to-blue-800 text-white px-6 py-5 shadow-xl">
        <div className="bg-yellow-500 text-gray-900 px-4 py-2 mb-3 rounded-lg text-sm font-medium text-center">
          ⚠️ This tool is meant as a calculator to estimate resources needed and does not represent a true structural representation of the final design.
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl animate-pulse">✨</span>
            Shadow Catcher
            <span className="text-lg font-normal text-blue-200">🌙 Dome Builder</span>
          </h1>
          <div className="flex gap-3">
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
      
      <main className="flex-1 flex overflow-hidden bg-gray-50">
        {activeTab === 'builder' ? (
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