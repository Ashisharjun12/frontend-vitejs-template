import React, { useState } from 'react';
import { Settings, Save, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SettingsTab = ({ project, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState({
    name: project?.name || '',
    gitUrl: project?.gitUrl || '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(formData);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'permanently delete') return;
    
    try {
      setLoading(true);
      await onDelete();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* General Settings */}
      <Card className="rounded-3xl border-border/30">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Update your project settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Project"
              className="rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gitUrl">GitHub Repository URL</Label>
            <Input
              id="gitUrl"
              value={formData.gitUrl}
              onChange={(e) => setFormData({ ...formData, gitUrl: e.target.value })}
              placeholder="https://github.com/username/repo"
              className="rounded-full"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Repository URL cannot be changed after project creation
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.name.trim()}
            className="rounded-full cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-3xl border-border/30 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Delete Project</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete a project, there is no going back. Please be certain.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="rounded-full cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              This will permanently delete the project, all its deployments, S3 files, and ECS tasks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Type <span className="font-mono font-bold">permanently delete</span> to confirm
              </Label>
              <Input
                id="confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="permanently delete"
                className="rounded-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmText('');
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteConfirmText !== 'permanently delete' || loading}
              variant="destructive"
              className="rounded-full cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsTab;

