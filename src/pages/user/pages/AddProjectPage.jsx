import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Loader2, 
  ArrowLeft, 
  CheckIcon, 
  ChevronsUpDownIcon,
  Code,
  Server,
  Sparkles,
  Github,
  Terminal,
  Layers,
  Clock,
  X,
  Key,
  Upload,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { projectAPI, frameworkAPI, githubAPI } from '@/api/api';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { linkSocial } from '@/lib/auth-client';

const AddProjectPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [frontendFrameworks, setFrontendFrameworks] = useState([]);
  const [backendFrameworks, setBackendFrameworks] = useState([]);
  const [fullstackFrameworks, setFullstackFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [projectType, setProjectType] = useState('frontend'); // 'frontend', 'backend', or 'fullstack'
  const [formData, setFormData] = useState({
    name: '',
    gitUrl: '',
    frameworkPreset: '',
    buildCommand: '',
    installCommand: 'npm install',
    outputFolder: 'dist',
    startCommand: '',
    envVariables: [],
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [envFileContent, setEnvFileContent] = useState('');
  const [showEnvImport, setShowEnvImport] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoOpen, setRepoOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [includePrivate, setIncludePrivate] = useState(true);
  const [useGitHubSelector, setUseGitHubSelector] = useState(false);
  const [visibleEnvValues, setVisibleEnvValues] = useState(new Set()); // Track which env values are visible

  useEffect(() => {
    fetchFrameworks();
    
    // Check for error in URL parameters (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      // Handle account already linked error
      if (error === 'ACCOUNT_ALREADY_LINKED' || errorDescription?.includes('already linked') || errorDescription?.includes('already associated')) {
        setMessage({ 
          type: 'error', 
          text: 'This GitHub account is already associated with another account' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setMessage({ 
          type: 'error', 
          text: errorDescription || 'Failed to connect GitHub account' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Check if we're returning from GitHub OAuth
    const redirectPath = sessionStorage.getItem("github_oauth_redirect");
    if (redirectPath && window.location.pathname === redirectPath) {
      // Clear the stored redirect
      sessionStorage.removeItem("github_oauth_redirect");
      // Check GitHub connection after OAuth completes
      setTimeout(async () => {
        const connectionCheck = await checkGitHubConnection();
        // If connection failed and there's no error in URL, it might be an account linking issue
        if (!connectionCheck.success || !connectionCheck.connected) {
          // Check if there was an error that we might have missed
          const urlParams = new URLSearchParams(window.location.search);
          if (!urlParams.get('error')) {
            // No explicit error, but connection failed - might be account already linked
            // Better-auth might have prevented the linking silently
            setMessage({ 
              type: 'error', 
              text: 'Failed to connect GitHub account. This account may already be associated with another account.' 
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
          }
        }
      }, 1000);
    } else {
      checkGitHubConnection();
    }
  }, []);

  const checkGitHubConnection = async () => {
    try {
      const response = await githubAPI.checkConnection();
      if (response.success && response.connected) {
        setGithubConnected(true);
        // Auto-fetch repos if connected
        fetchRepositories(true);
      }
      return response;
    } catch (error) {
      console.error('Failed to check GitHub connection:', error);
      return { success: false, connected: false };
    }
  };

  const fetchRepositories = async (includePrivateRepos = true) => {
    try {
      setLoadingRepos(true);
      const response = await githubAPI.getRepositories(includePrivateRepos);
      if (response.success) {
        setRepositories(response.data || []);
        setIncludePrivate(includePrivateRepos);
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to fetch repositories' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      // Store the redirect URL in sessionStorage
      sessionStorage.setItem("github_oauth_redirect", window.location.pathname);
      

      await linkSocial({
        provider: "github",
        callbackURL: `${window.location.origin}/workspace/add-project`,
        scopes: ["repo"], // Request repo scope for private repository access
      });
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
      
      // Check if error is about account already linked
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('already linked') || errorMessage.includes('already associated') || errorMessage.includes('ACCOUNT_ALREADY_LINKED')) {
        setMessage({ 
          type: 'error', 
          text: 'This GitHub account is already associated with another account' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Failed to initiate GitHub connection' 
        });
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    setFormData({ ...formData, gitUrl: repo.cloneUrl });
    setRepoOpen(false);
  };

  const handleDisconnectGitHub = async () => {
    try {
      const response = await githubAPI.disconnect();
      if (response.success) {
        setGithubConnected(false);
        setRepositories([]);
        setSelectedRepo(null);
        setUseGitHubSelector(false);
        setFormData({ ...formData, gitUrl: '' });
        setMessage({ 
          type: 'success', 
          text: 'GitHub account disconnected successfully' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Failed to disconnect GitHub:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to disconnect GitHub account' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  useEffect(() => {
    // Reset framework selection when project type changes
    setFormData(prev => ({ 
      ...prev, 
      frameworkPreset: '',
      buildCommand: '',
      outputFolder: 'dist',
      startCommand: '',
    }));
  }, [projectType]);

  const fetchFrameworks = async () => {
    try {
      setLoading(true);
      const [frontendRes, backendRes, fullstackRes] = await Promise.all([
        frameworkAPI.getAllPresets('frontend'),
        frameworkAPI.getAllPresets('backend'),
        frameworkAPI.getAllPresets('fullstack'),
      ]);
      
      if (frontendRes.success) {
        setFrontendFrameworks(frontendRes.data);
      }
      if (backendRes.success) {
        setBackendFrameworks(backendRes.data);
      }
      if (fullstackRes.success) {
        setFullstackFrameworks(fullstackRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentFrameworks = projectType === 'frontend' 
    ? frontendFrameworks 
    : projectType === 'backend' 
    ? backendFrameworks 
    : fullstackFrameworks;
  const selectedFramework = currentFrameworks.find(f => f.id === formData.frameworkPreset);
  
  // Check if all frameworks of current type are locked
  const allFrameworksLocked = currentFrameworks.length > 0 && currentFrameworks.every(f => f.locked);
  
  // Clear selection if selected framework becomes locked
  useEffect(() => {
    if (selectedFramework?.locked) {
      setFormData(prev => ({ ...prev, frameworkPreset: '' }));
    }
  }, [selectedFramework?.locked]);

  // Validation function to check if required fields are filled
  const isFormValid = () => {
    // If all frameworks are locked, form is invalid
    if (allFrameworksLocked) {
      return false;
    }
    
    // Always required fields
    if (!formData.name.trim() || !formData.gitUrl.trim() || !formData.frameworkPreset) {
      return false;
    }
    
    // Check if selected framework is locked
    if (selectedFramework?.locked) {
      return false;
    }
    
    // Build command required for frontend and fullstack
    if ((projectType === 'frontend' || projectType === 'fullstack') && !formData.buildCommand.trim()) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.gitUrl || !formData.frameworkPreset) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    // Validate build command for frontend and fullstack
    if ((projectType === 'frontend' || projectType === 'fullstack') && !formData.buildCommand) {
      setMessage({ type: 'error', text: 'Build command is required for frontend and fullstack projects' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        ...formData,
        // Send buildCommand/outputFolder for frontend and fullstack
        buildCommand: (projectType === 'frontend' || projectType === 'fullstack') ? formData.buildCommand : null,
        outputFolder: (projectType === 'frontend' || projectType === 'fullstack') ? formData.outputFolder : null,
        // Send startCommand for backend and fullstack
        startCommand: (projectType === 'backend' || projectType === 'fullstack') ? formData.startCommand : null,
      };
      
      const response = await projectAPI.createProject(submitData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Project created successfully' });
        setTimeout(() => {
          navigate('/workspace/projects');
        }, 1500);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to create project' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Parse .env file content and convert to array format
  const parseEnvFile = (content) => {
    const lines = content.split('\n');
    const envVars = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Handle KEY=VALUE format
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        const value = trimmed.substring(equalIndex + 1).trim();
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (key) {
          envVars.push({ key, value: cleanValue });
        }
      }
    }
    
    return envVars;
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/plain' && !file.name.endsWith('.env')) {
      setMessage({ type: 'error', text: 'Please upload a .env file' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setEnvFileContent(content);
        const parsed = parseEnvFile(content);
        if (parsed.length > 0) {
          setFormData({ ...formData, envVariables: parsed });
          setVisibleEnvValues(new Set()); // Reset visibility when importing
          setMessage({ type: 'success', text: `Loaded ${parsed.length} environment variables from file` });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
          setMessage({ type: 'error', text: 'No valid environment variables found in file' });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle paste from textarea
  const handleEnvPaste = () => {
    if (!envFileContent.trim()) {
      setMessage({ type: 'error', text: 'Please paste .env content first' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    const parsed = parseEnvFile(envFileContent);
    if (parsed.length > 0) {
      setFormData({ ...formData, envVariables: parsed });
      setVisibleEnvValues(new Set()); // Reset visibility when importing
      setMessage({ type: 'success', text: `Loaded ${parsed.length} environment variables` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowEnvImport(false);
      setEnvFileContent('');
    } else {
      setMessage({ type: 'error', text: 'No valid environment variables found' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans w-full">
      <div className="w-full px-6 sm:px-12 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/workspace/projects')}
            className="rounded-full mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground mb-2">
                Create New Project
              </h1>
              <p className="text-muted-foreground text-lg font-medium tracking-tight">
                Deploy your application from GitHub
              </p>
            </div>
            
            {/* GitHub Connect Button - Right Side of Header */}
            <div className="flex items-center gap-3">
              {githubConnected ? (
                <>
                  {!useGitHubSelector && repositories.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUseGitHubSelector(true);
                      }}
                      className="rounded-full cursor-pointer"
                    >
                      <Github size={16} className="mr-2" />
                      Use Selector
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDisconnectGitHub}
                    className="rounded-full cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                    Connected
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleConnectGitHub}
                  className="rounded-full cursor-pointer"
                >
                  <Github size={16} className="mr-2" />
                  Connect GitHub
                </Button>
              )}
            </div>
          </div>
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl mb-6 max-w-7xl mx-auto ${
              message.type === 'error'
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Project Type Selection */}
        <div className="mb-6 max-w-7xl mx-auto">
          <Label className="text-sm font-medium mb-3 block">Project Type *</Label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setProjectType('frontend')}
              className={cn(
                "group relative flex flex-col items-center justify-center p-6 border rounded-2xl transition-all duration-300 cursor-pointer",
                projectType === 'frontend'
                  ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
                  : "bg-background/40 border-border hover:bg-background/60 hover:border-border/80"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl mb-3 transition-colors",
                projectType === 'frontend' ? "bg-blue-500/20" : "bg-muted"
              )}>
                <Code size={24} className={projectType === 'frontend' ? "text-blue-500" : "text-muted-foreground"} />
              </div>
              <span className={cn(
                "font-semibold text-sm",
                projectType === 'frontend' ? "text-blue-500" : "text-foreground"
              )}>
                Frontend
              </span>
              <span className="text-xs text-muted-foreground mt-1">React, Vue, Next.js</span>
            </button>

            <button
              type="button"
              onClick={() => setProjectType('backend')}
              className={cn(
                "group relative flex flex-col items-center justify-center p-6 border rounded-2xl transition-all duration-300 cursor-pointer",
                projectType === 'backend'
                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : "bg-background/40 border-border hover:bg-background/60 hover:border-border/80"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl mb-3 transition-colors",
                projectType === 'backend' ? "bg-emerald-500/20" : "bg-muted"
              )}>
                <Server size={24} className={projectType === 'backend' ? "text-emerald-500" : "text-muted-foreground"} />
              </div>
              <span className={cn(
                "font-semibold text-sm",
                projectType === 'backend' ? "text-emerald-500" : "text-foreground"
              )}>
                Backend
              </span>
              <span className="text-xs text-muted-foreground mt-1">Node.js, Express, API</span>
            </button>

            <button
              type="button"
              onClick={() => setProjectType('fullstack')}
              className={cn(
                "group relative flex flex-col items-center justify-center p-6 border rounded-2xl transition-all duration-300 cursor-pointer",
                projectType === 'fullstack'
                  ? "bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/10"
                  : "bg-background/40 border-border hover:bg-background/60 hover:border-border/80"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl mb-3 transition-colors",
                projectType === 'fullstack' ? "bg-orange-500/20" : "bg-muted"
              )}>
                <Layers size={24} className={projectType === 'fullstack' ? "text-orange-500" : "text-muted-foreground"} />
              </div>
              <span className={cn(
                "font-semibold text-sm",
                projectType === 'fullstack' ? "text-orange-500" : "text-foreground"
              )}>
                Fullstack
              </span>
              <span className="text-xs text-muted-foreground mt-1">Next.js, Remix, Nuxt</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="relative bg-background/40 border border-border backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] transition-all duration-300 max-w-7xl mx-auto">
          {/* Glassy Overlay - Show when all frameworks are locked */}
          {allFrameworksLocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl backdrop-blur-xl bg-background/70 border border-border/40 shadow-2xl"
            >
              <div className="text-center space-y-5 px-8 py-12 max-w-lg">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/60 backdrop-blur-sm border border-border/60 shadow-lg mb-3"
                >
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </motion.div>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="space-y-3"
                >
                  <h3 className="text-3xl font-bold text-foreground tracking-tight">Coming Soon</h3>
                  <div className="h-px w-16 mx-auto bg-border/60"></div>
                </motion.div>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto"
                >
                  All <span className="font-semibold text-foreground capitalize">{projectType}</span> frameworks are currently being prepared. 
                  <br className="mt-2" />
                  <span className="text-xs">Please check back later for updates.</span>
                </motion.p>
              </div>
            </motion.div>
          )}
          
          <div className={cn("p-6 sm:p-8", allFrameworksLocked && "opacity-60 pointer-events-none")}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Project Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., my-awesome-app"
                  className="rounded-xl border-border/50 h-11 bg-background/50"
                  required
                />
              </div>

              {/* GitHub Repository Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gitUrl" className="text-sm font-medium flex items-center gap-2">
                    <Github size={14} />
                    GitHub Repository *
                  </Label>
                  {githubConnected && repositories.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUseGitHubSelector(!useGitHubSelector)}
                      className="rounded-xl h-7 text-xs"
                    >
                      {useGitHubSelector ? 'Use URL' : 'Select from GitHub'}
                    </Button>
                  )}
                </div>
                
                {useGitHubSelector && githubConnected && repositories.length > 0 ? (
                  <>
                    <Popover open={repoOpen} onOpenChange={setRepoOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={repoOpen}
                          className="w-full justify-between rounded-xl border-border/50 h-11 cursor-pointer bg-background/50"
                          disabled={loadingRepos}
                        >
                          {selectedRepo ? (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Github size={16} className="shrink-0" />
                              <span className="truncate">{selectedRepo.fullName}</span>
                              {selectedRepo.private && (
                                <span className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground shrink-0">
                                  Private
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              {loadingRepos ? 'Loading repositories...' : 'Select repository...'}
                            </span>
                          )}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-border/30" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <Command className="rounded-2xl">
                          <CommandInput placeholder="Search repositories..." className="rounded-t-2xl" />
                          <div className="px-2 py-1.5 flex items-center justify-between border-b border-border/30">
                            <span className="text-xs text-muted-foreground">Include private repos</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchRepositories(!includePrivate)}
                              className="h-6 text-xs"
                            >
                              {includePrivate ? 'Hide' : 'Show'}
                            </Button>
                          </div>
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty>
                              {loadingRepos ? 'Loading...' : 'No repositories found'}
                            </CommandEmpty>
                            <CommandGroup>
                              {repositories.map((repo) => (
                                <CommandItem
                                  key={repo.id}
                                  value={`${repo.fullName} ${repo.name} ${repo.description || ''}`}
                                  onSelect={() => handleRepoSelect(repo)}
                                  className="rounded-xl cursor-pointer"
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedRepo?.id === repo.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex items-center gap-3 py-1 flex-1 min-w-0">
                                    <Github size={16} className="shrink-0" />
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm truncate">{repo.fullName}</span>
                                        {repo.private && (
                                          <span className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground shrink-0">
                                            Private
                                          </span>
                                        )}
                                      </div>
                                      {repo.description && (
                                        <span className="text-xs text-muted-foreground truncate">{repo.description}</span>
                                      )}
                                      <div className="flex items-center gap-3 mt-0.5">
                                        {repo.language && (
                                          <span className="text-xs text-muted-foreground">{repo.language}</span>
                                        )}
                                        {repo.stars > 0 && (
                                          <span className="text-xs text-muted-foreground">⭐ {repo.stars}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Select a repository from your GitHub account
                    </p>
                  </>
                ) : (
                  <>
                    <Input
                      id="gitUrl"
                      type="url"
                      value={formData.gitUrl}
                      onChange={(e) => setFormData({ ...formData, gitUrl: e.target.value })}
                      placeholder="https://github.com/username/repo"
                      className="rounded-xl border-border/50 h-11 bg-background/50"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be a valid GitHub repository URL
                    </p>
                  </>
                )}
              </div>

              {/* Framework Selection */}
              <div className="space-y-2">
                <Label htmlFor="frameworkPreset" className="text-sm font-medium flex items-center gap-2">
                  <Sparkles size={14} />
                  Framework *
                </Label>
                {loading ? (
                  <div className="flex items-center justify-center h-11 rounded-xl bg-muted/50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between rounded-xl border-border/50 h-11 cursor-pointer bg-background/50"
                        >
                          {selectedFramework ? (
                            <div className="flex items-center gap-2">
                              {selectedFramework.images?.urls?.[0] ? (
                                <img 
                                  src={selectedFramework.images.urls[0]} 
                                  alt={selectedFramework.name}
                                  className="w-5 h-5 rounded-lg object-cover border border-border/30"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-lg bg-muted flex items-center justify-center">
                                  <span className="text-xs font-medium">{selectedFramework.name.charAt(0).toUpperCase()}</span>
                                </div>
                              )}
                              <span>{selectedFramework.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Select framework...</span>
                          )}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-border/30" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <Command className="rounded-2xl">
                          <CommandInput placeholder="Search framework..." className="rounded-t-2xl" />
                          <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                              {currentFrameworks.map((framework) => {
                                const isLocked = framework.locked;
                                return (
                                  <CommandItem
                                    key={framework.id}
                                    value={`${framework.name} ${framework.type}`}
                                    onSelect={() => {
                                      if (!isLocked) {
                                        setFormData({ 
                                          ...formData, 
                                          frameworkPreset: formData.frameworkPreset === framework.id ? "" : framework.id 
                                        });
                                        setOpen(false);
                                      }
                                    }}
                                    className={cn(
                                      "rounded-xl",
                                      isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                                    )}
                                    disabled={isLocked}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.frameworkPreset === framework.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex items-center gap-3 py-1 flex-1">
                                      {framework.images?.urls?.[0] ? (
                                        <img 
                                          src={framework.images.urls[0]} 
                                          alt={framework.name}
                                          className="w-8 h-8 rounded-lg object-cover border border-border/30"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                          <span className="text-xs font-medium">{framework.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                      )}
                                      <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">{framework.name}</span>
                                          {isLocked && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                                              Coming Soon
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground capitalize">{framework.type}</span>
                                      </div>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </div>

              {/* Install Command */}
              <div className="space-y-2">
                <Label htmlFor="installCommand" className="text-sm font-medium flex items-center gap-2">
                  <Terminal size={14} />
                  Install Command
                </Label>
                <Input
                  id="installCommand"
                  value={formData.installCommand}
                  onChange={(e) => setFormData({ ...formData, installCommand: e.target.value })}
                  placeholder="npm install"
                  className="rounded-xl border-border/50 h-11 bg-background/50 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Command to install dependencies (default: npm install)
                </p>
              </div>

              {/* Build Command - For Frontend and Fullstack */}
              {(projectType === 'frontend' || projectType === 'fullstack') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="buildCommand" className="text-sm font-medium flex items-center gap-2">
                    <Code size={14} />
                    Build Command *
                  </Label>
                  <Input
                    id="buildCommand"
                    value={formData.buildCommand}
                    onChange={(e) => setFormData({ ...formData, buildCommand: e.target.value })}
                    placeholder="npm run build"
                    className="rounded-xl border-border/50 h-11 bg-background/50 font-mono text-sm"
                    required={projectType === 'frontend'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Command to build your frontend application (default: npm run build)
                  </p>
                </motion.div>
              )}

              {/* Output Folder - For Frontend and Fullstack */}
              {(projectType === 'frontend' || projectType === 'fullstack') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="outputFolder" className="text-sm font-medium">
                    Output Folder
                  </Label>
                  <Input
                    id="outputFolder"
                    value={formData.outputFolder}
                    onChange={(e) => setFormData({ ...formData, outputFolder: e.target.value })}
                    placeholder="dist"
                    className="rounded-xl border-border/50 h-11 bg-background/50 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Folder containing build output (default: dist)
                  </p>
                </motion.div>
              )}

              {/* Start Command - For Backend and Fullstack */}
              {(projectType === 'backend' || projectType === 'fullstack') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="startCommand" className="text-sm font-medium flex items-center gap-2">
                    <Server size={14} />
                    Start Command
                  </Label>
                  <Input
                    id="startCommand"
                    value={formData.startCommand}
                    onChange={(e) => setFormData({ ...formData, startCommand: e.target.value })}
                    placeholder="npm start"
                    className="rounded-xl border-border/50 h-11 bg-background/50 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Command to start your backend server (default: npm start for Node.js, python -m uvicorn main:app --host 0.0.0.0 --port 3000 for FastAPI)
                  </p>
                </motion.div>
              )}

              {/* Environment Variables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Key size={14} />
                    Environment Variables
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnvImport(!showEnvImport)}
                    className="rounded-xl h-8 text-xs"
                  >
                    {showEnvImport ? (
                      <>
                        <X size={12} className="mr-1" />
                        Cancel Import
                      </>
                    ) : (
                      <>
                        <Upload size={12} className="mr-1" />
                        Import .env File
                      </>
                    )}
                  </Button>
                </div>

                {/* Import .env File Section */}
                {showEnvImport && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 p-4 rounded-xl border border-border/50 bg-background/30"
                  >
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".env,text/plain"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="env-file-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('env-file-upload')?.click()}
                          className="rounded-xl h-10 w-full cursor-pointer"
                        >
                          <Upload size={14} className="mr-2" />
                          Upload .env File
                        </Button>
                      </label>
                      <div className="text-xs text-muted-foreground flex items-center px-2">OR</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <FileText size={12} />
                        Paste .env Content
                      </Label>
                      <Textarea
                        placeholder="Paste your .env file content here...&#10;Example:&#10;API_KEY=your-api-key&#10;DATABASE_URL=postgres://...&#10;NODE_ENV=production"
                        value={envFileContent}
                        onChange={(e) => setEnvFileContent(e.target.value)}
                        className="rounded-xl border-border/50 bg-background/50 font-mono text-xs min-h-[120px] resize-none"
                      />
                      <Button
                        type="button"
                        variant="default"
                        onClick={handleEnvPaste}
                        disabled={!envFileContent.trim()}
                        className="rounded-xl h-9 w-full"
                      >
                        Import Variables
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Manual Entry Section */}
                <div className="space-y-2">
                  {formData.envVariables.map((env, index) => {
                    const isVisible = visibleEnvValues.has(index);
                    return (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="KEY"
                          value={env.key}
                          onChange={(e) => {
                            const newEnvVars = [...formData.envVariables];
                            newEnvVars[index].key = e.target.value;
                            setFormData({ ...formData, envVariables: newEnvVars });
                          }}
                          className="rounded-xl border-border/50 h-10 bg-background/50 font-mono text-sm flex-1"
                        />
                        <div className="relative flex-1">
                          <Input
                            placeholder="VALUE"
                            value={env.value}
                            onChange={(e) => {
                              const newEnvVars = [...formData.envVariables];
                              newEnvVars[index].value = e.target.value;
                              setFormData({ ...formData, envVariables: newEnvVars });
                            }}
                            className="rounded-xl border-border/50 h-10 bg-background/50 font-mono text-sm pr-10"
                            type={isVisible ? "text" : "password"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newVisible = new Set(visibleEnvValues);
                              if (isVisible) {
                                newVisible.delete(index);
                              } else {
                                newVisible.add(index);
                              }
                              setVisibleEnvValues(newVisible);
                            }}
                            className="absolute right-0 top-0 h-10 w-10 rounded-xl hover:bg-transparent cursor-pointer"
                          >
                            {isVisible ? (
                              <EyeOff size={16} className="text-muted-foreground" />
                            ) : (
                              <Eye size={16} className="text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newEnvVars = formData.envVariables.filter((_, i) => i !== index);
                            setFormData({ ...formData, envVariables: newEnvVars });
                            // Remove from visible set if it was visible
                            const newVisible = new Set(visibleEnvValues);
                            newVisible.delete(index);
                            // Adjust indices for remaining items
                            const adjustedVisible = new Set();
                            newVisible.forEach((idx) => {
                              if (idx < index) {
                                adjustedVisible.add(idx);
                              } else if (idx > index) {
                                adjustedVisible.add(idx - 1);
                              }
                            });
                            setVisibleEnvValues(adjustedVisible);
                          }}
                          className="rounded-xl h-10 w-10"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        envVariables: [...formData.envVariables, { key: '', value: '' }]
                      });
                    }}
                    className="rounded-xl h-10 w-full"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Environment Variable
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add environment variables that will be available during build and runtime (like Vercel). 
                  {formData.envVariables.length > 0 && (
                    <span className="ml-1 font-medium text-foreground">
                      {formData.envVariables.length} variable{formData.envVariables.length !== 1 ? 's' : ''} configured
                    </span>
                  )}
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !isFormValid()}
                  className="rounded-full h-11 px-6 font-medium cursor-pointer flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/workspace/projects')}
                  className="rounded-full h-11 px-6 font-medium cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectPage;
