import React, { useState } from 'react';
import { Globe, Plus, Trash2, ExternalLink, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomDomainsTab = ({ project }) => {
  const [domains, setDomains] = useState(project?.customDomain ? [project.customDomain] : []);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [domainInput, setDomainInput] = useState('');

  const handleAdd = () => {
    setDomainInput('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!domainInput.trim()) return;

    try {
      setLoading(true);
      // TODO: Add API call to save custom domain
      const newDomain = domainInput.trim();
      if (!domains.includes(newDomain)) {
        setDomains(prev => [...prev, newDomain]);
      }
      setDialogOpen(false);
      setDomainInput('');
    } catch (error) {
      console.error('Failed to add domain:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (domain) => {
    try {
      setLoading(true);
      // TODO: Add API call to delete custom domain
      setDomains(prev => prev.filter(d => d !== domain));
    } catch (error) {
      console.error('Failed to delete domain:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Custom Domains</h3>
        <Button onClick={handleAdd} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {domains.length === 0 ? (
        <Card className="rounded-3xl border-border/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No custom domains</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Add a custom domain to your deployment
            </p>
            <Button onClick={handleAdd} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {domains.map((domain, i) => (
            <Card key={i} className="rounded-2xl border-border/30 group hover:border-border/50 transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Globe size={20} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{domain}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle2 size={12} />
                        <span>Verified</span>
                      </div>
                      <a
                        href={`https://${domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => handleDelete(domain)}
                >
                  <Trash2 size={14} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Domain Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add Custom Domain</DialogTitle>
            <DialogDescription>
              Add a custom domain to your deployment. You'll need to configure DNS settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="example.com"
                className="rounded-full"
              />
              <p className="text-xs text-muted-foreground">
                Enter your domain without http:// or https://
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!domainInput.trim() || loading}
              className="rounded-full cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Domain'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomDomainsTab;

