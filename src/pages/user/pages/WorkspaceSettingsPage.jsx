import React, { useState } from 'react';
import { 
  User, 
  Palette, 
  Save, 
  Loader2, 
  Trash2, 
  Mail
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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

export default function WorkspaceSettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    deploymentNotifications: true,
    securityAlerts: true,
    weeklyDigest: false,
  });

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to update preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Preferences updated:', preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    try {
      setLoading(true);
      // TODO: Implement API call to delete account
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Account deleted');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground font-sans w-full">
      <div className="w-full px-6 sm:px-12 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground text-lg font-medium tracking-tight">
            Manage your workspace settings and preferences
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2 rounded-full">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2 rounded-full">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="flex items-center gap-2 text-destructive rounded-full">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Danger</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="rounded-3xl border-border/30 bg-background/40 backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] transition-all duration-300">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-20 w-20 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-semibold text-primary-foreground border-2 border-border">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {session?.user?.name || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {session?.user?.email || 'No email'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    disabled
                    placeholder="John Doe"
                    className="rounded-xl border-border/50 h-11 bg-background/50 opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      placeholder="john@example.com"
                      className="rounded-xl border-border/50 h-11 bg-background/50 pl-9 opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="rounded-3xl border-border/30 bg-background/40 backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] transition-all duration-300">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px] rounded-xl border-border/50 h-11 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

              <Card className="rounded-3xl border-border/30 bg-background/40 backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] transition-all duration-300">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deployment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when deployments complete
                  </p>
                </div>
                <Switch
                  checked={preferences.deploymentNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, deploymentNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Important security-related notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.securityAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, securityAlerts: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your activity
                  </p>
                </div>
                <Switch
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, weeklyDigest: checked })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="rounded-full h-11 px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" className="space-y-6">
              <Card className="rounded-3xl border-border/30 border-destructive/20 bg-background/40 backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. All your projects, deployments, and data will be permanently deleted.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="rounded-xl"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all your projects, deployments, and data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="rounded-xl border-border/50 h-11 bg-background/50"
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
              className="rounded-full h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || loading}
              variant="destructive"
              className="rounded-full h-11 px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

