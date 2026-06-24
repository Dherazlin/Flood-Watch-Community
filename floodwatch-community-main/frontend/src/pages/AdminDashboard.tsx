import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const fetchPending = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/reports?status=PENDING');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {}
  };

  useEffect(() => { fetchPending(); }, []);

  const action = async (id: number, type: 'verify' | 'reject') => {
    if (!token) return;
    const res = await fetch(`http://localhost:8080/api/reports/${id}/${type}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchPending();
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-2 text-2xl font-bold text-foreground">Admin Reports</h2>
      <p className="mb-4 text-sm text-muted-foreground">Approve or reject pending flood reports.</p>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-left">
              <th className="p-3">#</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Location</th>
              <th className="p-3">Description</th>
              <th className="p-3">Reporter</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, idx) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{idx + 1}</td>
                <td className="p-3"><Badge variant="outline">{r.severity}</Badge></td>
                <td className="p-3">{r.location}</td>
                <td className="p-3">{r.description}</td>
                <td className="p-3">{r.reportedBy}</td>
                <td className="p-3 space-x-2">
                  <Button size="sm" onClick={() => action(r.id, 'verify')}>Verify</Button>
                  <Button size="sm" variant="destructive" onClick={() => action(r.id, 'reject')}>Reject</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AdminDashboard;


