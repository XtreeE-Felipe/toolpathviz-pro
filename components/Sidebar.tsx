
import React, { useState } from 'react';
import { Upload, Play, Pause, Zap, Box, Palette, User, Calendar, Database } from 'lucide-react';
import { ToolpathData, ColorMode } from '../types';
import { toolpathDatabase } from '../services/databaseService';

interface SidebarProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectTemplate: (json: any) => void;
  data: ToolpathData | null;
  progress: number;
  setProgress: (p: number) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onFileUpload,
  onSelectTemplate,
  data,
  progress,
  setProgress,
  colorMode,
  setColorMode
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    let interval: any;
    if (isPlaying && progress < 1) {
      interval = setInterval(() => {
        setProgress(Math.min(1, progress + 0.005));
      }, 16);
    } else if (progress >= 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress, setProgress]);

  return (
    <div className="w-96 h-full flex flex-col gap-4 p-4 bg-zinc-950 border-r border-zinc-800 overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Zap className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">XtreeE Toolpath Visualizer</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold text-blue-500">JSON toolpath</p>
        </div>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="border-t border-zinc-800 pt-3">
          <div className="flex items-center gap-2 mb-3">
            <Upload size={14} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-mono">XtreeE toolpath</h2>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-14 border border-dashed border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800/40 hover:border-blue-500/50 transition-all group">
            <p className="text-[10px] text-zinc-500 font-semibold group-hover:text-zinc-300">Click to upload JSON file</p>
            <input type="file" className="hidden" accept=".json" onChange={onFileUpload} />
          </label>
        </div>
      </section>

      {data && (
        <section className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <Box size={14} />
            <h2 className="text-xs font-bold uppercase tracking-wider">{data.objectInfo.ObjectName} v{data.objectInfo.ObjectVersion}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
            <div className="flex items-center gap-1"><User size={10} /> {data.objectInfo.Designer}</div>
            <div className="flex items-center gap-1"><Calendar size={10} /> {data.objectInfo.ExportDate}</div>
          </div>
        </section>
      )}

      {/* Visualization Settings */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider font-mono">Playback</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!data}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-full transition-all flex-shrink-0"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex-1">
              <input
                type="range" min="0" max="1" step="0.001" value={progress}
                disabled={!data}
                onChange={(e) => setProgress(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-1 text-[10px] text-zinc-500 font-mono">
                <span>{Math.round(progress * 100)}%</span>
                <span>Layers: {data ? Math.floor(data.layerKeys.length * progress) : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider font-mono flex items-center gap-2">
            <Palette size={14} /> Color Mapping
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'width', 'height', 'flowRate'] as ColorMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                disabled={!data}
                className={`px-2 py-1.5 text-[10px] font-bold uppercase rounded border transition-all ${colorMode === mode
                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-700'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {mode === 'none' ? 'Default' : mode.replace(/Rate/, ' Rate')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {data && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 grid grid-cols-2 gap-3">
          <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <p className="text-[9px] text-zinc-500 uppercase font-bold">Volume</p>
            <p className="text-lg font-mono">{data.totalVolume} <span className="text-xs text-zinc-600">{data.units.VolumeUnit}</span></p>
          </div>
          <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <p className="text-[9px] text-zinc-500 uppercase font-bold">Print Time</p>
            <p className="text-lg font-mono">{data.totalPrintingTime} <span className="text-xs text-zinc-600">{data.units.PrintingTimeUnit}</span></p>
          </div>
          <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <p className="text-[9px] text-zinc-500 uppercase font-bold">Layers</p>
            <p className="text-lg font-mono">{data.layerKeys.length}</p>
          </div>
          <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <p className="text-[9px] text-zinc-500 uppercase font-bold">Segments</p>
            <p className="text-lg font-mono">{data.segments.length.toLocaleString()}</p>
          </div>
        </section>
      )}

    </div>
  );
};

export default Sidebar;
