import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FloodMap from '@/components/FloodMap';
import { Badge } from '@/components/ui/badge';

const UserDashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const fetchMine = async () => {
    if (!token) return;
    const res = await fetch('http://localhost:8080/api/reports/my-reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setReports(await res.json());
  };

  useEffect(() => { fetchMine(); }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-2 text-2xl font-bold text-foreground">My Dashboard</h2>
      <p className="mb-4 text-sm text-muted-foreground">Report flooding on the map and see your report history.</p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 text-lg font-semibold">Report Flooding</h3>
          <div className="h-[420px]">
            <FloodMap user={{}} onAuthRequired={() => {}} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Click on the map to select a location; location description will auto-fill.
          </p>
        </Card>
        <Card className="p-4 overflow-x-auto">
          <h3 className="mb-3 text-lg font-semibold">My Reports</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-2">When</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Location</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r: any) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.createdAt?.replace('T',' ').slice(0,16)}</td>
                  <td className="p-2"><Badge variant="outline">{r.severity}</Badge></td>
                  <td className="p-2">{r.location}</td>
                  <td className="p-2">{r.status}</td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td className="p-3 text-sm text-muted-foreground" colSpan={4}>No reports yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;


