import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Search, 
  X, 
  Copy,
  Trash2,
  RotateCw,
  ShieldCheck,
  Loader2,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { projectAPI } from '@/api/api';

const EnvironmentVariablesTab = ({ projectId, onReplay }) => {
  const [envVars, setEnvVars] = useState([]);
  const [originalEnvVars, setOriginalEnvVars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeploying, setRedeploying] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ key: '', value: '' });

  // Fetch environment variables from project
  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        setLoading(true);
        const response = await projectAPI.getProjectById(projectId);
        if (response.success && response.data.envVariables) {
          const envs = Array.isArray(response.data.envVariables) ? response.data.envVariables : [];
          setEnvVars(envs);
          setOriginalEnvVars(JSON.parse(JSON.stringify(envs))); // Deep copy
          setHasChanges(false);
        }
      } catch (error) {
        console.error('Failed to fetch environment variables:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchEnvVars();
    }
  }, [projectId]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(envVars) !== JSON.stringify(originalEnvVars);
    setHasChanges(changed);
  }, [envVars, originalEnvVars]);

  const handleReveal = (index) => {
    const newRevealed = new Set(revealedIds);
    if (newRevealed.has(index)) {
      newRevealed.delete(index);
    } else {
      newRevealed.add(index);
    }
    setRevealedIds(newRevealed);
  };

  const handleCopy = async (value) => {
    await navigator.clipboard.writeText(value);
  };

  const openDrawer = (variable = null, index = null) => {
    if (variable !== null && index !== null) {
      setEditingIndex(index);
      setFormData({
        key: variable.key,
        value: variable.value
      });
    } else {
      setEditingIndex(null);
      setFormData({ key: '', value: '' });
    }
    setIsDrawerOpen(true);
  };

  const saveVariable = () => {
    if (!formData.key.trim() || !formData.value.trim()) return;

    const trimmedKey = formData.key.trim().toUpperCase().replace(/\s/g, '_');
    const trimmedValue = formData.value.trim();

    let updatedEnvVars = [...envVars];

    if (editingIndex !== null) {
      // Update existing - check if key is being changed
      const oldKey = envVars[editingIndex].key;
      const keyChanged = oldKey !== trimmedKey;
      
      if (keyChanged) {
        // Check if new key already exists (excluding the current one being edited)
        const keyExists = envVars.some((v, i) => i !== editingIndex && v.key === trimmedKey);
        if (keyExists) {
          alert('Environment variable with this key already exists');
          return;
        }
      }
      
      // Update existing
      updatedEnvVars[editingIndex] = { key: trimmedKey, value: trimmedValue };
    } else {
      // Add new - check if key already exists
      const keyExists = envVars.some(v => v.key === trimmedKey);
      if (keyExists) {
        alert('Environment variable with this key already exists');
        return;
      }
      updatedEnvVars = [{ key: trimmedKey, value: trimmedValue }, ...envVars];
    }
    
    // Update state (this will trigger hasChanges to become true)
    setEnvVars(updatedEnvVars);
    setIsDrawerOpen(false);
    setFormData({ key: '', value: '' });
    setEditingIndex(null);
  };

  const deleteVariable = (index) => {
    const newEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newEnvVars);
    // Update visibility set
    const newRevealed = new Set(revealedIds);
    newRevealed.delete(index);
    // Adjust indices for items after deleted one
    const adjustedRevealed = new Set();
    newRevealed.forEach(idx => {
      if (idx < index) {
        adjustedRevealed.add(idx);
      } else if (idx > index) {
        adjustedRevealed.add(idx - 1);
      }
    });
    setRevealedIds(adjustedRevealed);
  };


  const handleRedeploy = async () => {
    try {
      setRedeploying(true);
      // First save the changes
      const saveResponse = await projectAPI.updateProject(projectId, {
        envVariables: envVars
      });
      if (!saveResponse.success) {
        alert('Failed to save environment variables');
        return;
      }
      setOriginalEnvVars(JSON.parse(JSON.stringify(envVars))); // Deep copy
      setHasChanges(false);
      
      // Then trigger redeployment
      const redeployResponse = await projectAPI.redeployProject(projectId);
      if (redeployResponse.success && onReplay) {
        await onReplay();
      }
    } catch (error) {
      console.error('Failed to redeploy:', error);
      alert('Failed to redeploy project');
    } finally {
      setRedeploying(false);
    }
  };

  const filteredVars = envVars.filter(v => 
    v.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Environment Variables</h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-xl mt-2">
            Environment variables allow you to configure your application dynamically. 
            Changes here will require a redeployment to take effect.
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <RotateCw className="animate-spin-slow" size={18} />
              <span className="text-sm font-medium">Changes pending. Redeploy to apply.</span>
            </div>
            <Button
              onClick={handleRedeploy}
              disabled={redeploying}
              className="h-8 px-3 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-500/30 rounded-full"
            >
              {redeploying ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Redeploying...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-3 w-3" />
                  Redeploy
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search keys..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-full py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <Button 
          onClick={() => openDrawer()} 
          className="w-full sm:w-auto rounded-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Variables List */}
      <div className="space-y-3">
        {filteredVars.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-background/30">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search size={20} />
            </div>
            <p className="text-muted-foreground font-medium">No variables found</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {searchQuery ? 'Try clearing your search query' : 'Add your first environment variable'}
            </p>
          </div>
        ) : (
          filteredVars.map((v, index) => {
            const actualIndex = envVars.findIndex(env => env.key === v.key && env.value === v.value);
            const isRevealed = revealedIds.has(actualIndex);
            
            return (
              <div 
                key={`${v.key}-${actualIndex}`}
                className="group relative bg-background/30 border border-border hover:border-primary/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-mono font-semibold text-[15px] text-foreground tracking-wide truncate">
                        {v.key}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 group/value">
                      <div className="font-mono text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-md select-all">
                        {isRevealed ? v.value : '•••••••••••••••••••••'}
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button 
                          onClick={() => handleReveal(actualIndex)}
                          className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          onClick={() => handleCopy(v.value)}
                          className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="h-8 px-3 text-xs rounded-full" 
                      onClick={() => openDrawer(v, actualIndex)}
                    >
                      Edit
                    </Button>
                    <button 
                      onClick={() => deleteVariable(actualIndex)}
                      className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                    <ShieldCheck size={12} />
                    Encrypted
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal - Centered */}
      {isDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-[500px] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold">
                  {editingIndex !== null ? 'Edit Variable' : 'New Variable'}
                </h2>
                <button 
                  onClick={() => setIsDrawerOpen(false)} 
                  className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Key Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Key
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                      placeholder="EXAMPLE_KEY"
                      className="w-full bg-background/50 border border-border rounded-xl p-4 text-foreground font-mono text-base focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-muted-foreground"
                    />
                    {formData.key && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                        {formData.key.length} chars
                      </div>
                    )}
                  </div>
                </div>

                {/* Value Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Value
                  </label>
                  <textarea
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Enter value..."
                    rows={4}
                    className="w-full bg-background/50 border border-border rounded-xl p-4 text-foreground font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-muted-foreground resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-border bg-background/50">
                <Button 
                  onClick={saveVariable} 
                  disabled={!formData.key.trim() || !formData.value.trim()}
                  className="w-full h-12 text-base rounded-full"
                >
                  {editingIndex !== null ? 'Save Changes' : 'Add Variable'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnvironmentVariablesTab;
