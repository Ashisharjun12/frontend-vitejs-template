import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal,
  Copy,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { projectAPI } from '@/api/api';

const DeploymentLogs = ({ deploymentId, project, deploymentStatus }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const logsEndRef = useRef(null);
  const prevLogsLengthRef = useRef(0);

  const fetchLogs = React.useCallback(async () => {
    if (!deploymentId) return;
    
    try {
      const response = await projectAPI.getDeploymentLogs(deploymentId);
      if (response.success) {
        setLogs(prevLogs => {
          // Only update if logs actually changed to prevent unnecessary re-renders
          const newLogsStr = JSON.stringify(response.data);
          const prevLogsStr = JSON.stringify(prevLogs);
          
          if (newLogsStr !== prevLogsStr) {
            const prevLength = prevLogs.length;
            const newLength = response.data.length;
            
            // Store previous length for auto-scroll check
            prevLogsLengthRef.current = prevLength;
            
            // Auto-scroll only if new logs were added and user is near bottom
            if (newLength > prevLength) {
              setTimeout(() => {
                const container = logsEndRef.current?.parentElement?.parentElement;
                if (container) {
                  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
                  if (isNearBottom) {
                    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }, 100);
            }
            
            return response.data;
          }
          return prevLogs;
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLoading(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    if (!deploymentId) return;

    // Initial fetch
    fetchLogs();

    // Only poll if deployment is active (QUEUED or DEPLOYING)
    const isActive = deploymentStatus === 'QUEUED' || deploymentStatus === 'DEPLOYING';
    
    if (!isActive) {
      // If not active, just fetch once
      return;
    }

    // Poll every 3 seconds only for active deployments
    const interval = setInterval(() => {
      fetchLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, [deploymentId, deploymentStatus, fetchLogs]);

  const handleCopyLogs = async () => {
    const logText = logs.map(logEntry => {
      const logText = typeof logEntry.log === 'string' ? logEntry.log : JSON.stringify(logEntry.log);
      const timestamp = logEntry.timestamp ? new Date(logEntry.timestamp).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }) : '';
      return `[${timestamp}] ${logText}`;
    }).join('\n');
    
    await navigator.clipboard.writeText(logText);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-[400px] bg-background rounded-xl border border-border p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isBuilding = deploymentStatus === 'QUEUED' || deploymentStatus === 'DEPLOYING';

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 px-2">
        <h2 className="text-lg font-semibold text-foreground">Build Logs</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyLogs}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Copy logs"
          >
            <Copy size={14} />
            Copy
          </button>
          <button 
            onClick={fetchLogs}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh logs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Terminal / Logs */}
      <div 
        className="bg-black rounded-md p-3 font-mono text-[11px] border border-border text-zinc-400 shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center gap-2 text-zinc-500 mb-2 pb-2 border-b border-zinc-900 sticky top-0 bg-black">
          <Terminal size={12} />
          <span>Build Logs</span>
          {isBuilding && (
            <span className="text-blue-400 text-[10px] animate-pulse ml-2">Building...</span>
          )}
        </div>
        <div className="space-y-1">
          {logs.length === 0 ? (
            <div className="text-zinc-600 italic">No logs available yet...</div>
          ) : (
            logs.map((logEntry, idx) => {
              const logText = typeof logEntry.log === 'string' ? logEntry.log : JSON.stringify(logEntry.log);
              const isError = logText.toLowerCase().includes('error') || logText.toLowerCase().includes('failed');
              
              return (
                <div key={idx} className="flex">
                  <span className="text-zinc-700 mr-2 select-none min-w-[10px]">$</span>
                  <span className={isError ? 'text-red-400' : 'text-zinc-300'}>{logText}</span>
                </div>
              );
            })
          )}
          {isBuilding && (
            <div className="text-blue-400 animate-pulse flex">
              <span className="text-zinc-700 mr-2 select-none min-w-[10px]">$</span>
              Processing...
            </div>
          )}
        </div>
        {/* Scroll anchor */}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default DeploymentLogs;
