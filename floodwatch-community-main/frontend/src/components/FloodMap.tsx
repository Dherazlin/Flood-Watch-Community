import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Camera, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FloodMap = ({ user, onAuthRequired }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [dummyData, setDummyData] = useState<any[]>([]);

  const generateDummyIndiaData = (count: number) => {
    const items: any[] = [];
    const minLat = 6.5, maxLat = 35.5;
    const minLng = 68.0, maxLng = 97.5;
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'SEVERE'];

    // Seed a few major cities with each severity for visibility
    const cityAnchors = [
      { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
      { name: 'Pune', lat: 18.5204, lng: 73.8567 },
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
      { name: 'Lucknow', lat: 26.8467, lng: 80.9462 }
    ];

    let idSeq = 1;
    cityAnchors.forEach((c) => {
      severities.forEach((sev, sIdx) => {
        const lat = c.lat + (Math.random() - 0.5) * 0.06;
        const lng = c.lng + (Math.random() - 0.5) * 0.06;
        items.push({
          id: `d-city-${idSeq++}`,
          latitude: Number(lat.toFixed(5)),
          longitude: Number(lng.toFixed(5)),
          severity: sev,
          description: `${sev} flooding near ${c.name}`,
          location: c.name
        });
      });
    });

    // Scatter remaining points across India
    for (let i = items.length; i < count; i += 1) {
      const lat = minLat + Math.random() * (maxLat - minLat);
      const lng = minLng + Math.random() * (maxLng - minLng);
      const sev = severities[Math.floor(Math.random() * severities.length)];
      items.push({
        id: `d-${i + 1}`,
        latitude: Number(lat.toFixed(5)),
        longitude: Number(lng.toFixed(5)),
        severity: sev,
        description: `${sev} waterlogging reported`,
        location: 'India'
      });
    }

    return items;
  };
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [reportForm, setReportForm] = useState({
    severity: '',
    description: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const { toast } = useToast();

  // Initial load
  useEffect(() => {
    // Generate a broad set of dummy markers across India
    setDummyData(generateDummyIndiaData(120));
    fetchReports();
  }, []);

  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!user) {
          onAuthRequired();
          return;
        }
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        setIsReportDialogOpen(true);

        // Reverse geocode using Nominatim (public)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
          .then(r => r.json())
          .then(d => {
            const display = d?.display_name || '';
            setReportForm(prev => ({ ...prev, location: display }));
          })
          .catch(() => {});
      }
    });
    return null;
  };

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/reports/active');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        // Merge verified backend data into dummy overlays if not already present
        setDummyData((prev) => {
          const byKey = new Set(prev.map(d => `${d.latitude.toFixed(4)},${d.longitude.toFixed(4)}`));
          const additions = data
            .filter((r: any) => r.latitude && r.longitude)
            .filter((r: any) => !byKey.has(`${Number(r.latitude).toFixed(4)},${Number(r.longitude).toFixed(4)}`))
            .map((r: any) => ({
              id: `v-${r.id}`,
              latitude: Number(r.latitude),
              longitude: Number(r.longitude),
              severity: r.severity,
              description: r.description,
              location: r.location || 'Verified location'
            }));
          return additions.length ? [...prev, ...additions] : prev;
        });
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const severityColor = (s: string) =>
    s === 'SEVERE' ? '#ef4444' : s === 'HIGH' ? '#f97316' : s === 'MEDIUM' ? '#f59e0b' : '#22c55e';

  // Submit flood report
  const handleSubmitReport = async () => {
    if (!selectedLocation || !reportForm.severity) {
      toast({
        title: "Missing Information",
        description: "Please select severity level.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          severity: reportForm.severity,
          description: reportForm.description,
          location: reportForm.location
        })
      });

      if (response.ok) {
        toast({
          title: "Report Submitted",
          description: "Your flood report has been submitted successfully.",
        });
        const created = await response.json();
        // Optional: upload attachment
        if (attachment) {
          const fd = new FormData();
          fd.append('image', attachment);
          await fetch(`http://localhost:8080/api/reports/${created.id}/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd
          });
        }
        setIsReportDialogOpen(false);
        setAttachment(null);
        setReportForm({ severity: '', description: '', location: '' });
        fetchReports();
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div className="h-[500px] w-full rounded-lg border bg-muted" style={{ minHeight: '500px' }}>
        <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          <ClickHandler />

          {/* Backend verified reports */}
          {reports.map((r: any) => (
            <CircleMarker key={`r-${r.id}`} center={[Number(r.latitude), Number(r.longitude)]} radius={10} pathOptions={{ color: '#fff', weight: 2, fillColor: severityColor(r.severity), fillOpacity: 0.9 }}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{r.severity} flood</div>
                  <div>{r.location || 'Unknown location'}</div>
                  <div className="text-muted-foreground">{r.description || 'No description'}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Dummy overlays */}
          {dummyData.map((d: any) => (
            <CircleMarker key={d.id} center={[d.latitude, d.longitude]} radius={12} pathOptions={{ color: '#111827', weight: 1, fillColor: severityColor(d.severity), fillOpacity: 0.5 }}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{d.severity} flood (dummy)</div>
                  <div>{d.location}</div>
                  <div className="text-muted-foreground">{d.description}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        {/* Map Legend */}
        <div className="absolute right-4 top-4 z-10">
          <Card className="p-3">
            <h4 className="mb-2 text-sm font-semibold">Flood Severity</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                <span className="text-xs">Low</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
                <span className="text-xs">High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-xs">Severe</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Instructions Overlay */}
        {!user && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
            <Card className="p-6 text-center">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Login to report flooding incidents</p>
            </Card>
          </div>
        )}
      </div>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Flooding</DialogTitle>
            <DialogDescription>
              Report a waterlogged area to help others navigate safely.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity Level *</Label>
              <Select value={reportForm.severity} onValueChange={(value) => setReportForm(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low - Minor puddles</SelectItem>
                  <SelectItem value="MEDIUM">Medium - Ankle deep water</SelectItem>
                  <SelectItem value="HIGH">High - Knee deep water</SelectItem>
                  <SelectItem value="SEVERE">Severe - Vehicle stranded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location Description</Label>
              <Input
                id="location"
                placeholder="e.g., Near Central Mall"
                value={reportForm.location}
                onChange={(e) => setReportForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the flooding situation..."
                value={reportForm.description}
                onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachment">Attachment (optional)</Label>
              <Input id="attachment" type="file" accept="image/*" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
            </div>
            {selectedLocation && (
              <div className="text-xs text-muted-foreground">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReport} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FloodMap;