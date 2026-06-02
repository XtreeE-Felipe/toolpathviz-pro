
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Visualizer from './components/Visualizer';
import { parseToolpathJson } from './services/gcodeParser';
import { ToolpathData, ColorMode } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<ToolpathData | null>(null);
  const [progress, setProgress] = useState(1);
  const [colorMode, setColorMode] = useState<ColorMode>('none');

  const handleLoadData = (json: any) => {
    try {
      const parsed = parseToolpathJson(json);
      setData(parsed);
      setProgress(1);
      setColorMode('none');
    } catch (err) {
      console.error("Invalid Toolpath Data:", err);
      alert("The data could not be parsed.");
    }
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        handleLoadData(json);
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="flex w-full h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      <Sidebar 
        onFileUpload={handleFileUpload}
        data={data}
        progress={progress}
        setProgress={setProgress}
        colorMode={colorMode}
        setColorMode={setColorMode}
      />
      
      <main className="flex-1 p-4 relative">
        <Visualizer 
          data={data}
          progress={progress}
          colorMode={colorMode}
        />
        
        {data && (
          <div className="absolute top-8 right-8 p-4 bg-zinc-900/60 backdrop-blur-lg rounded-xl border border-zinc-800 shadow-xl pointer-events-none transition-all">
            <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 border-b border-blue-500/20 pb-1 font-mono">Dimensional Envelope</h3>
            <div className="grid grid-cols-3 gap-6 font-mono text-xs">
              <div>
                <p className="text-zinc-600 text-[9px] uppercase mb-0.5">Length (X)</p>
                <p>{(data.maxBounds.x - data.minBounds.x).toFixed(1)} <span className="text-[9px] text-zinc-500">mm</span></p>
              </div>
              <div>
                <p className="text-zinc-600 text-[9px] uppercase mb-0.5">Width (Y)</p>
                <p>{(data.maxBounds.y - data.minBounds.y).toFixed(1)} <span className="text-[9px] text-zinc-500">mm</span></p>
              </div>
              <div>
                <p className="text-zinc-600 text-[9px] uppercase mb-0.5">Height (Z)</p>
                <p>{(data.maxBounds.z - data.minBounds.z).toFixed(1)} <span className="text-[9px] text-zinc-500">mm</span></p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
