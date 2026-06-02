
import React, { useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ToolpathData, ColorMode } from '../types';

interface VisualizerProps {
  data: ToolpathData | null;
  progress: number;
  colorMode: ColorMode;
}

const Group = 'group' as any;
const Primitive = 'primitive' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;

// A simple color scale from blue (low) to red (high)
const getColor = (normalized: number) => {
  const color = new THREE.Color();
  // Using a cold-to-hot (blue -> cyan -> green -> yellow -> red) gradient
  color.setHSL((1 - normalized) * 0.7, 0.8, 0.5);
  return color;
};

// Component to handle Camera positioning and Control resetting on data load
const CameraManager: React.FC<{ data: ToolpathData | null }> = ({ data }) => {
  const { camera, controls } = useThree();

  const recenterCamera = () => {
    if (!data || !controls) return;

    // Calculate dimensions based on mapping: X->X, Z->Y, Y->Z
    const width = data.maxBounds.x - data.minBounds.x;
    const height = data.maxBounds.z - data.minBounds.z; 
    const depth = data.maxBounds.y - data.minBounds.y;

    const maxDim = Math.max(width, height, depth) || 1000;
    
    // We use <Center bottom>, so the object is centered at X=0, Z=0 and sits on Y=0.
    // The visual center of the object is at (0, height/2, 0).
    const centerTarget = new THREE.Vector3(0, height / 2, 0);

    // Calculate distance to fit object
    // Approximate FOV logic to ensure object fits in view
    const distFactor = 1.5;
    const distance = maxDim * distFactor;

    // Reset OrbitControls
    const orbitControls = controls as any;
    orbitControls.reset();
    
    // Target the geometric center
    orbitControls.target.copy(centerTarget);
    
    // Position camera: Isometric-ish look
    camera.position.set(distance, centerTarget.y + distance * 0.5, distance);
    
    // Update clip planes for large objects
    camera.far = distance * 20;
    camera.near = maxDim / 1000; 
    camera.updateProjectionMatrix();
    
    orbitControls.update();
  };

  useEffect(() => {
    // Call RecenterCamera() when data changes
    if (data) {
      recenterCamera();
    }
  }, [data, camera, controls]);

  return null;
};

const PathLayer: React.FC<{ data: ToolpathData; progress: number; colorMode: ColorMode }> = ({ data, progress, colorMode }) => {
  const { positions, colors } = useMemo(() => {
    const limit = Math.floor(data.segments.length * progress);
    const visibleSegments = data.segments.slice(0, limit);
    
    // Compute static centering values based on the boundaries of the full toolpath
    const centerX = (data.minBounds.x + data.maxBounds.x) / 2;
    const centerZ = -(data.minBounds.y + data.maxBounds.y) / 2;
    const offsetY = data.minBounds.z;

    const posAttr: number[] = [];
    const colorAttr: number[] = [];

    const range = colorMode === 'none' ? null : data.ranges[colorMode];
    const defaultColor = new THREE.Color('#3b82f6');

    visibleSegments.forEach(s => {
      // Coordinates: Mapping JSON X,Y,Z to Three.js X,Z,-Y (CAD to WebGL standard)
      // and translating so the object remains statically centered and grounded on top of Y=0.
      const startX = s.start.x - centerX;
      const startY = s.start.z - offsetY;
      const startZ = -s.start.y - centerZ;

      const endX = s.end.x - centerX;
      const endY = s.end.z - offsetY;
      const endZ = -s.end.y - centerZ;

      posAttr.push(startX, startY, startZ);
      posAttr.push(endX, endY, endZ);

      // Colors
      let segColor = defaultColor;
      if (colorMode !== 'none' && range) {
        const value = s[colorMode];
        const normalized = range.max === range.min ? 0.5 : (value - range.min) / (range.max - range.min);
        segColor = getColor(normalized);
      }

      colorAttr.push(segColor.r, segColor.g, segColor.b);
      colorAttr.push(segColor.r, segColor.g, segColor.b);
    });

    return { 
      positions: new Float32Array(posAttr), 
      colors: new Float32Array(colorAttr) 
    };
  }, [data, progress, colorMode]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    if (positions.length > 0) {
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    return geo;
  }, [positions, colors]);

  return (
    <Group>
      {positions.length > 0 && (
        <Primitive object={new THREE.LineSegments(
          geometry,
          new THREE.LineBasicMaterial({ 
            vertexColors: colorMode !== 'none', 
            color: colorMode === 'none' ? '#3b82f6' : 0xffffff, 
            linewidth: 2 
          })
        )} />
      )}
    </Group>
  );
};

const Visualizer: React.FC<VisualizerProps> = ({ data, progress, colorMode }) => {
  return (
    <div className="w-full h-full bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800 relative">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera 
          makeDefault 
          position={[4000, 4000, 4000]} 
          fov={45} 
        />
        
        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05}
        />
        
        <CameraManager data={data} />

        <AmbientLight intensity={0.6} />
        <PointLight position={[5000, 8000, 5000]} intensity={2.0} />
        <PointLight position={[-5000, -2000, -5000]} intensity={0.5} color="#3b82f6" />
        
        <Grid 
          infiniteGrid 
          fadeDistance={25000} 
          sectionSize={1000} 
          cellSize={100}
          sectionThickness={1.5}
          sectionColor="#3f3f46" 
          cellColor="#27272a" 
          position={[0, -0.1, 0]} 
        />
        
        {data && (
          <PathLayer data={data} progress={progress} colorMode={colorMode} />
        )}
      </Canvas>
      
      {!data && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-zinc-800/80 backdrop-blur-md p-8 rounded-2xl border border-zinc-700 text-center max-w-md">
            <h3 className="text-xl font-bold mb-2">Large Scale Visualizer</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Upload a manufacturing JSON toolpath.<br/>
              Workspace optimized for 3000 x 3000 x 3000 mm.
            </p>
          </div>
        </div>
      )}

      {data && colorMode !== 'none' && (() => {
        const minVal = data.ranges[colorMode].min;
        const maxVal = data.ranges[colorMode].max;
        const isConstant = Math.abs(maxVal - minVal) < 1e-6;

        return (
          <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2 pointer-events-none bg-zinc-950/80 backdrop-blur-md p-3 rounded-xl border border-zinc-800 shadow-xl">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
              Heatmap: {colorMode === 'flowRate' ? 'Flow Rate' : colorMode}
            </div>
            {isConstant ? (
              <div className="flex items-center gap-2 mt-1 bg-zinc-950/35 px-2 py-1 rounded border border-zinc-800">
                <div 
                  className="w-3 h-3 rounded-full border border-zinc-700" 
                  style={{ backgroundColor: `hsl(${(1 - 0.5) * 0.7 * 360}, 80%, 50%)` }}
                />
                <span className="text-xs font-mono font-bold text-zinc-100">
                  {minVal.toFixed(2)}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-mono font-semibold">(Constant Value)</span>
              </div>
            ) : (
              <>
                <div className="w-64 h-3 rounded-sm bg-gradient-to-r from-[hsl(252,80%,50%)] via-[hsl(120,80%,50%)] to-[hsl(0,80%,50%)] border border-zinc-700 shadow-lg" />
                <div className="w-64 flex justify-between text-[10px] font-mono text-zinc-300 px-1">
                  <span>{minVal.toFixed(2)}</span>
                  <span>{maxVal.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        );
      })()}
      
      {/* Scale Indicator */}
      <div className="absolute bottom-8 left-8 p-3 bg-zinc-900/60 backdrop-blur-md rounded-lg border border-zinc-800 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-10 h-[2px] bg-zinc-400"></div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">Scale Ref: 1000 units</span>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
