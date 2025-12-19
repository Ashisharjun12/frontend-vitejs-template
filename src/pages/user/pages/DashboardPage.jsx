import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your dashboard
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold mb-2">My Projects</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold mb-2">Active Deployments</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold mb-2">Total Builds</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="bg-muted/50 min-h-[400px] rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
      </div>
    </div>
  );
}

