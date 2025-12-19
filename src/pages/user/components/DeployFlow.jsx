import React, { useState, useEffect, useRef, useCallback } from 'react';

import { 
  Play, 
  RotateCcw, 
  Check,
} from 'lucide-react';

// --- Brand Icons from react-icons ---
import { 
  SiGithub, 
  SiVite,
  SiNodedotjs,
  SiDocker,
  SiExpress,
} from 'react-icons/si';

// AWS Icons (using AWS icon from react-icons or custom)
const AwsS3 = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4 6.5L12 2L20 6.5V17.5L12 22L4 17.5V6.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M4 6.5L12 11L20 6.5M12 11V22" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 13.5L16 13.5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const AwsEc2 = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M3 8H21M3 16H21" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 3V8M16 3V8M8 16V21M16 16V21" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const AwsCloudFront = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="4" r="2" fill="currentColor"/>
    <circle cx="20" cy="12" r="2" fill="currentColor"/>
    <circle cx="12" cy="20" r="2" fill="currentColor"/>
    <circle cx="4" cy="12" r="2" fill="currentColor"/>
    <path d="M12 6V8M18 12H16M12 18V16M6 12H8" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// --- Configuration & Data ---
const initialNodes = [
  { 
    id: 'source', 
    type: 'trigger', 
    label: 'GitHub Repository', 
    subLabel: 'push to main',
    icon: SiGithub,
    iconUrl: 'https://skillicons.dev/icons?i=github',
    x: 100, 
    y: 300, 
    status: 'idle',
    accent: 'slate'
  },
  { 
    id: 'ci', 
    type: 'action', 
    label: 'GitHub Actions', 
    subLabel: 'CI/CD Pipeline',
    icon: SiGithub,
    iconUrl: 'https://skillicons.dev/icons?i=githubactions',
    x: 450, 
    y: 300, 
    status: 'idle',
    accent: 'blue'
  },
  { 
    id: 'vite-build', 
    type: 'process', 
    label: 'Vite Build', 
    subLabel: 'Frontend Bundle',
    icon: SiVite,
    iconUrl: 'https://skillicons.dev/icons?i=vite',
    x: 800, 
    y: 150, 
    status: 'idle',
    accent: 'violet'
  },
  { 
    id: 'express-build', 
    type: 'process', 
    label: 'Express Build', 
    subLabel: 'Backend Logic',
    icon: SiExpress,
    iconUrl: 'https://skillicons.dev/icons?i=express',
    x: 800, 
    y: 450, 
    status: 'idle',
    accent: 'green'
  },
  { 
    id: 's3', 
    type: 'service', 
    label: 'AWS S3', 
    subLabel: 'Static Storage',
    icon: AwsS3, 
    x: 1150, 
    y: 100, 
    status: 'idle',
    accent: 'emerald'
  },
  { 
    id: 'cloudfront', 
    type: 'output', 
    label: 'CloudFront', 
    subLabel: 'CDN Distribution',
    icon: AwsCloudFront, 
    x: 1500, 
    y: 100, 
    status: 'idle',
    accent: 'purple'
  },
  { 
    id: 'docker', 
    type: 'process', 
    label: 'Docker Build', 
    subLabel: 'Containerization',
    icon: SiDocker,
    iconUrl: 'https://skillicons.dev/icons?i=docker',
    x: 1150, 
    y: 450, 
    status: 'idle',
    accent: 'sky'
  },
  { 
    id: 'ec2', 
    type: 'output', 
    label: 'AWS EC2', 
    subLabel: 'Compute Instance',
    icon: AwsEc2, 
    x: 1500, 
    y: 450, 
    status: 'idle',
    accent: 'orange'
  }
];

const connections = [
  { from: 'source', to: 'ci' },
  { from: 'ci', to: 'vite-build' },
  { from: 'ci', to: 'express-build' },
  { from: 'vite-build', to: 's3' },
  { from: 's3', to: 'cloudfront' },
  { from: 'express-build', to: 'docker' },
  { from: 'docker', to: 'ec2' }
];

// --- Components ---
const Node = ({ data, isSelected, onClick, isRunning }) => {
  const getAccentColor = (accent) => {
    const colors = {
      purple: 'from-purple-500 to-fuchsia-600',
      blue: 'from-blue-500 to-cyan-400',
      sky: 'from-sky-400 to-blue-600',
      violet: 'from-violet-500 to-purple-500',
      cyan: 'from-cyan-400 to-blue-500',
      green: 'from-green-500 to-emerald-400',
      emerald: 'from-emerald-500 to-green-600',
      orange: 'from-orange-500 to-amber-500',
      teal: 'from-teal-400 to-emerald-500',
      indigo: 'from-indigo-400 to-purple-500',
      slate: 'from-slate-400 to-slate-600'
    };
    return colors[accent] || colors.blue;
  };

  const getBorderColor = () => {
    if (data.status === 'error') return 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    if (data.status === 'completed') return 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
    if (data.status === 'running') return 'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.3)]';
    if (isSelected) return 'border-blue-500/60 shadow-[0_0_25px_rgba(59,130,246,0.4)]';
    return 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]';
  };

  return (
    <div 
      onClick={() => onClick(data.id)}
      style={{ left: data.x, top: data.y }}
      className={`absolute w-72 group cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] 
        ${isSelected ? 'scale-105 z-30' : 'z-10 hover:scale-[1.02]'}
      `}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-br ${getAccentColor(data.accent)} rounded-2xl opacity-0 transition-opacity duration-500 blur-lg
        ${isSelected || data.status === 'running' ? 'opacity-30' : 'group-hover:opacity-10'}
      `} />
      <div className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 h-full
        ${getBorderColor()}
        bg-[#0B0E14]/80
      `}>
        {data.status === 'running' && (
          <div className="absolute top-0 left-0 h-1 w-full bg-slate-800/50 overflow-hidden">
            <div className={`h-full w-full bg-gradient-to-r ${getAccentColor(data.accent)} animate-[shimmer_1.5s_infinite] -translate-x-full`} />
          </div>
        )}
        <div className="p-5 flex gap-4 items-start">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${getAccentColor(data.accent)} bg-opacity-10 shadow-inner flex items-center justify-center`}>
            {data.iconUrl ? (
              <img 
                src={data.iconUrl} 
                alt={data.label}
                className="w-6 h-6 drop-shadow-md"
                onError={(e) => {
                  // Fallback to react-icon if image fails to load
                  e.target.style.display = 'none';
                  if (data.icon) {
                    const iconElement = e.target.parentElement.querySelector('.icon-fallback');
                    if (iconElement) iconElement.style.display = 'block';
                  }
                }}
              />
            ) : null}
            {data.icon && (
              <data.icon 
                size={24} 
                className={`text-white drop-shadow-md icon-fallback ${data.iconUrl ? 'hidden' : ''}`}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
               <h3 className="font-bold text-slate-100 text-sm tracking-wide">{data.label}</h3>
               {data.status === 'completed' && <div className="p-1 rounded-full bg-emerald-500/20"><Check size={12} className="text-emerald-400" /></div>}
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">{data.subLabel}</p>
            <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border
              ${data.status === 'running' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                data.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                'bg-slate-800/50 border-slate-700 text-slate-500'}
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                data.status === 'running' ? 'bg-amber-400 animate-pulse' :
                data.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-500'
              }`} />
              {data.status === 'idle' ? 'READY' : data.status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Connection = ({ start, end, status }) => {
  const midX = (start.x + end.x) / 2;
  const pathData = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  const id = `gradient-${start.x}-${start.y}-${end.x}`;
  return (
    <g className="pointer-events-none">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path 
        d={pathData} 
        fill="none" 
        stroke="#1e293b" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      {(status === 'running' || status === 'completed') && (
        <path 
          d={pathData} 
          fill="none" 
          stroke={`url(#${id})`}
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-700 opacity-50"
        />
      )}
      {status === 'running' && (
        <path 
          d={pathData} 
          fill="none" 
          stroke="#60a5fa" 
          strokeWidth="3"
          strokeDasharray="10 10"
          className="animate-[dash_1s_linear_infinite] drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
        />
      )}
      {status === 'completed' && (
        <path 
          d={pathData} 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="2"
          className="transition-all duration-1000 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] opacity-60"
        />
      )}
    </g>
  );
};

export default function DeployFlow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [zoom, setZoom] = useState(0.7);
  const [hasAutoRun, setHasAutoRun] = useState(false);
  const containerRef = useRef(null);

  const resetNodes = useCallback(() => {
    setNodes(initialNodes.map(n => ({ ...n, status: 'idle' })));
  }, []);

  const runWorkflow = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    resetNodes();

    const processNode = async (nodeId, delay = 1500) => {
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'running' } : n));
      setSelectedNodeId(nodeId);
      
      await new Promise(r => setTimeout(r, delay));
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'completed' } : n));
    };

    await processNode('source');
    await processNode('ci');
    setNodes(prev => prev.map(n => 
      (n.id === 'vite-build' || n.id === 'express-build') ? { ...n, status: 'running' } : n
    ));
    
    await processNode('vite-build', 1000);
    await processNode('s3', 1000);
    await processNode('cloudfront', 1000);
    await processNode('express-build', 1000);
    await processNode('docker', 1200);
    await processNode('ec2', 1200);
    setIsRunning(false);
    setSelectedNodeId(null);
  }, [isRunning, resetNodes]);

  const getPortPosition = (nodeId, type) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const width = 288;
    const height = 130;
    
    if (type === 'source') {
      return { x: node.x + width, y: node.y + height / 2 };
    } else {
      return { x: node.x, y: node.y + height / 2 };
    }
  };

  const handleZoom = (delta) => {
    setZoom(prev => Math.min(Math.max(0.4, prev + delta), 1.5));
  };

  // Auto-start workflow when component comes into view
  useEffect(() => {
    if (hasAutoRun || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoRun && !isRunning) {
            setHasAutoRun(true);
            // Small delay to ensure component is fully visible
            setTimeout(() => {
              runWorkflow();
            }, 500);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of component is visible
        rootMargin: '0px',
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasAutoRun, isRunning, runWorkflow]);

  return (
    <div ref={containerRef} className="h-[600px] w-full bg-background text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 rounded-2xl border border-border/50 relative">
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-background">
        <div 
          className="absolute inset-0 origin-top-left transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1)"
          style={{ transform: `scale(${zoom}) translate(0px, 0px)` }}
        >
          <svg className="absolute inset-0 w-[3000px] h-[2000px] pointer-events-none z-0">
            {connections.map((conn, idx) => {
              const start = getPortPosition(conn.from, 'source');
              const end = getPortPosition(conn.to, 'target');
              const sourceNode = nodes.find(n => n.id === conn.from);
              return (
                <Connection 
                  key={idx} 
                  start={start} 
                  end={end} 
                  status={sourceNode?.status} 
                />
              );
            })}
          </svg>
          {nodes.map(node => (
            <Node 
              key={node.id} 
              data={node} 
              isSelected={selectedNodeId === node.id}
              onClick={setSelectedNodeId}
              isRunning={isRunning}
            />
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-6 right-6 pointer-events-none z-50">
          <div className="pointer-events-auto flex items-center gap-1 p-1.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-black/20">
            <button onClick={() => handleZoom(-0.1)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">-</button>
            <span className="text-xs font-mono w-10 text-center text-slate-500">{Math.round(zoom * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">+</button>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 flex flex-col gap-4 z-50">
          <button 
            onClick={resetNodes}
            className="group p-4 bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95"
            title="Reset Pipeline"
          >
            <RotateCcw size={22} className="group-hover:-rotate-180 transition-transform duration-500" />
          </button>
          <button 
            onClick={runWorkflow}
            disabled={isRunning}
            className={`p-5 rounded-full shadow-2xl shadow-blue-500/20 transition-all duration-300 flex items-center justify-center border hover:scale-110 active:scale-95 ${
              isRunning 
                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 border-white/10 text-white hover:shadow-blue-500/40'
            }`}
          >
            {isRunning ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

