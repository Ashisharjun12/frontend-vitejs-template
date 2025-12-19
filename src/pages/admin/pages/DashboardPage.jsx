import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the admin dashboard
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold mb-2">Total Users</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold mb-2">Total Projects</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold mb-2">Active Deployments</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold mb-2">System Status</h3>
          <p className="text-2xl font-bold text-green-500">Online</p>
        </div>
      </div>

      <div className="bg-muted/50 min-h-[400px] rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    </div>
  );
}

