import React, { useState, useEffect } from 'react';
import { Plus, Loader2, X, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { frameworkAPI } from '@/api/api';
import FrameworkTable from '../components/FrameworkTable';
import { ImageUpload } from '../components/ImageUpload';

const FrameworkPage = () => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState(null);
  const [editingPreset, setEditingPreset] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const response = await frameworkAPI.getAllPresets();
      if (response.success) {
        setPresets(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch framework presets' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFilesChange = (files) => {
    setImageFiles(files);
    setFormData({ ...formData, images: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('type', formData.type);
      
      formData.images.forEach((file) => {
        data.append('images', file);
      });

      if (isEditMode && editingPreset) {
        const response = await frameworkAPI.updatePreset(editingPreset.id, data);
        if (response.success) {
          setMessage({ type: 'success', text: 'Framework preset updated successfully' });
          resetForm();
          fetchPresets();
        }
      } else {
        const response = await frameworkAPI.createPreset(data);
        if (response.success) {
          setMessage({ type: 'success', text: 'Framework preset created successfully' });
          resetForm();
          fetchPresets();
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save framework preset' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: '', images: [] });
    setImageFiles([]);
    setExistingImages([]);
    setIsEditMode(false);
    setEditingPreset(null);
  };

  const handleEdit = (preset) => {
    setEditingPreset(preset);
    setIsEditMode(true);
    setFormData({
      name: preset.name,
      type: preset.type,
      images: [],
    });
    setImageFiles([]);
    // Set existing images from the preset
    if (preset.images?.urls && preset.images.urls.length > 0) {
      setExistingImages(preset.images.urls);
    } else {
      setExistingImages([]);
    }
  };

  const handleDeleteClick = (id) => {
    setPresetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!presetToDelete) return;

    try {
      const response = await frameworkAPI.deletePreset(presetToDelete);
      if (response.success) {
        setMessage({ type: 'success', text: 'Framework preset deleted successfully' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        fetchPresets();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete framework preset' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setDeleteDialogOpen(false);
      setPresetToDelete(null);
    }
  };

  const handleToggleLock = async (id) => {
    try {
      const response = await frameworkAPI.toggleLock(id);
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: response.data.locked ? 'Framework locked successfully' : 'Framework unlocked successfully' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        fetchPresets();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle framework lock' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };


  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded-3xl ${
          message.type === 'error' 
            ? 'bg-destructive/10 text-destructive border border-destructive/20' 
            : 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
        }`}>
          {message.text}
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold">Framework Presets</h1>
        <p className="text-muted-foreground mt-2">
          Manage framework presets for frontend, backend, and fullstack deployments
        </p>
      </div>

      {/* Create/Edit Form */}
      <Card className="rounded-3xl border-border/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{isEditMode ? 'Edit Framework Preset' : 'Create Framework Preset'}</CardTitle>
              <CardDescription className="text-sm">
                {isEditMode ? 'Update framework preset details' : 'Add a new framework preset with images'}
              </CardDescription>
            </div>
            {isEditMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., React, Next.js, Express"
                  className="rounded-full border-border/50 h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="rounded-full border-border/50 h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="fullstack">Fullstack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Images</Label>
              <ImageUpload
                value={imageFiles}
                onValueChange={handleImageFilesChange}
                maxFiles={10}
                maxSize={10 * 1024 * 1024}
              />
              {isEditMode && existingImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">Existing Images:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Existing ${idx + 1}`}
                          className="w-full h-20 object-cover rounded-xl border border-border/30"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <p className="text-xs text-white">Will be replaced</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Uploading new images will replace existing ones
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={submitting}
                className="rounded-full h-11 px-6 font-medium cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Preset
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Preset
                      </>
                    )}
                  </>
                )}
              </Button>
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="rounded-full h-11 px-6 font-medium cursor-pointer"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Presets Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Existing Presets</h2>
        <FrameworkTable 
          data={presets} 
          onDelete={handleDeleteClick} 
          onEdit={handleEdit} 
          onToggleLock={handleToggleLock}
          loading={loading} 
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl border-border/50 p-0 gap-0 max-w-md">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-bold">Delete Framework Preset?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the framework preset and all associated images.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 pt-4 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-full h-11 px-6 font-medium cursor-pointer flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="rounded-full h-11 px-6 font-medium cursor-pointer flex-1 sm:flex-none"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FrameworkPage;

