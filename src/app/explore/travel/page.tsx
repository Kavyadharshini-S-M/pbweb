'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Bus, Train, Car, Bike, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TAMIL_WORDS } from '@/lib/constants';
import { checkRouteAvailability, RouteResponse, TransportCategory, PrivateMode } from '@/lib/routingService';
import { TRANSPORT_ROUTES } from '@/lib/transportData';

const transportCategories = [
  { id: 'public', label: 'Public Transport', icon: <Bus className="w-5 h-5" />, desc: 'Bus, Metro, Train' },
  { id: 'private', label: 'Private Transport', icon: <Car className="w-5 h-5" />, desc: 'Auto, Cab, Bike' }
] as const;

const privateSubModes = [
  { id: 'ola', label: 'Ola', icon: <Car className="w-4 h-4" />, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { id: 'uber', label: 'Uber', icon: <Car className="w-4 h-4" />, color: 'bg-gray-900 text-white hover:bg-gray-800' },
  { id: 'rapido', label: 'Rapido', icon: <Bike className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' }
] as const;

const cabApps = [
  { name: 'Rapido', url: 'https://www.rapido.bike', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Ola', url: 'https://www.olacabs.com', color: 'bg-green-100 text-green-700' },
  { name: 'Uber', url: 'https://www.uber.com', color: 'bg-gray-900 text-white' },
  { name: 'Google Maps', url: 'https://maps.google.com', color: 'bg-blue-100 text-blue-700' },
];

export default function TravelPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState<TransportCategory>('public');
  const [privateMode, setPrivateMode] = useState<PrivateMode>('ola');
  
  const [isLoading, setIsLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Timetable State
  const [searchQuery, setSearchQuery] = useState('');
  const [timetableFilter, setTimetableFilter] = useState<'all' | 'mtc' | 'local_train'>('all');

  const filteredRoutes = TRANSPORT_ROUTES.filter(route => {
    const matchesType = timetableFilter === 'all' || route.type === timetableFilter;
    const matchesSearch = route.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          route.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          route.to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  }).sort((a, b) => {
    const fromCompare = a.from.localeCompare(b.from);
    if (fromCompare !== 0) return fromCompare;
    return a.to.localeCompare(b.to);
  });

  useEffect(() => {
    // Detect if user is on a mobile device to correctly format deep links
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Clear route result when inputs change
  useEffect(() => {
    setRouteResult(null);
  }, [from, to, category, privateMode]);

  const handleGetRoute = async () => {
    setIsLoading(true);
    setRouteResult(null);
    try {
      const res = await checkRouteAvailability(from, to, category, privateMode, isMobile);
      setRouteResult(res);
    } catch (error) {
      setRouteResult({ isValid: false, message: 'An error occurred while fetching the route.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <Link href="/" className="hover:text-primary">Home</Link><span>/</span>
            <span className="text-text-primary font-medium">Travel & Transport</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-text-primary">Travel & Transport</h1>
          <p className="mt-2 text-text-muted">Plan your route with bus, metro, auto, and cab options in Tamil Nadu.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Planner */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <h2 className="text-xl font-bold mb-6">Route Planner</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Enter starting point..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">To</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Enter destination..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-text-primary mb-3">Transport Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {transportCategories.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => setCategory(c.id as TransportCategory)}
                      className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${
                        category === c.id 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-border bg-white hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={category === c.id ? 'text-primary' : 'text-text-muted'}>
                          {c.icon}
                        </div>
                        <span className={`font-bold ${category === c.id ? 'text-primary' : 'text-text-primary'}`}>
                          {c.label}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted ml-7">{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {category === 'private' && (
                <div className="mt-4 p-4 bg-surface rounded-xl border border-border">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Select Provider</label>
                  <div className="flex flex-wrap gap-2">
                    {privateSubModes.map((m) => {
                      const isSelected = privateMode === m.id;
                      return (
                        <button 
                          key={m.id} 
                          onClick={() => setPrivateMode(m.id as PrivateMode)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            isSelected 
                              ? `${m.color} shadow-sm ring-2 ring-offset-2 ring-primary/50` 
                              : 'bg-white border border-border text-text-muted hover:border-gray-400 hover:text-gray-900'
                          }`}
                        >
                          {m.icon} {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full" 
                  disabled={!from || !to || isLoading}
                  onClick={handleGetRoute}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />} 
                  {isLoading ? 'Checking Availability...' : 'Check Availability & Get Route'}
                </Button>
              </div>

              {routeResult && !routeResult.isValid && (
                <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 flex flex-col gap-3 items-start">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="font-medium text-sm">{routeResult.message}</p>
                  </div>
                  {category === 'public' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white hover:bg-red-50 text-red-700 border-red-200 hover:border-red-300" 
                      onClick={() => setCategory('private')}
                    >
                      <Car className="w-4 h-4 mr-2" /> Switch to Private Transport
                    </Button>
                  )}
                </div>
              )}

              {routeResult && routeResult.isValid && (
                <div className="mt-4 p-5 bg-green-50/50 rounded-xl border border-green-200">
                  <h3 className="text-sm font-bold text-green-800 mb-4 border-b border-green-200/50 pb-2">Route Available</h3>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="flex flex-col bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                      <span className="text-xs text-green-600 font-medium mb-1">Est. Time</span>
                      <span className="font-bold text-green-900">{routeResult.estimatedTime}</span>
                    </div>
                    <div className="flex flex-col bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                      <span className="text-xs text-green-600 font-medium mb-1">Distance</span>
                      <span className="font-bold text-green-900">{routeResult.estimatedDistance}</span>
                    </div>
                    <div className="flex flex-col bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                      <span className="text-xs text-green-600 font-medium mb-1">Mode</span>
                      <span className="font-bold text-green-900 text-sm truncate">{routeResult.modeUsed}</span>
                    </div>
                  </div>
                  <a href={routeResult.url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm border-transparent">
                      <Navigation className="w-4 h-4 mr-2" /> 
                      {category === 'public' ? 'Open in Google Maps' : `Book on ${routeResult.modeUsed}`}
                    </Button>
                  </a>
                </div>
              )}
            </Card>

            {/* Chennai Transport Info */}
            <Card>
              <h3 className="text-lg font-bold mb-4">Chennai Transport Guide</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { 
                    title: 'Chennai Metro', 
                    desc: '2 lines covering major areas. Fare: ₹10-₹60', 
                    color: 'bg-blue-50 text-blue-700',
                    link: 'https://travelplanner.chennaimetrorail.org/',
                    linkLabel: 'Official Timing Page',
                    features: undefined
                  },
                  { 
                    title: 'Local Train', 
                    desc: 'Southern Railway suburban. Cheapest option.', 
                    color: 'bg-amber-50 text-amber-700',
                    link: undefined,
                    linkLabel: undefined,
                    features: undefined
                  },
                  { 
                    title: 'MRTS', 
                    desc: 'Beach to Velachery elevated rail. Fare: ₹5-₹15', 
                    color: 'bg-purple-50 text-purple-700',
                    link: undefined,
                    linkLabel: undefined,
                    features: undefined
                  },
                  { 
                    title: 'MTC Bus', 
                    desc: 'Metropolitan Transport Corp — covers all of Chennai. Fare: ₹5-₹30', 
                    color: 'bg-green-50 text-green-700',
                    link: undefined,
                    linkLabel: undefined,
                    features: undefined
                  },
                ].map((t) => (
                  <div key={t.title} className={`p-4 rounded-xl flex flex-col ${t.color}`}>
                    <h4 className="font-bold text-sm">{t.title}</h4>
                    <p className={`text-xs mt-1 opacity-80 ${t.link || t.features ? 'mb-2' : ''} flex-grow`}>{t.desc}</p>
                    {t.link && (
                      <a href={t.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium hover:underline mt-auto">
                        {t.linkLabel} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {t.features && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {t.features.map(f => (
                          <span key={f} className="text-[10px] px-2 py-0.5 bg-black/10 rounded-full font-medium">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Timetables & Routes */}
            <Card>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-bold">Timetables & Routes</h3>
                <div className="flex gap-2 w-full sm:w-auto bg-surface p-1 rounded-xl">
                  <button 
                    onClick={() => setTimetableFilter('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex-1 sm:flex-none ${timetableFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                  >All</button>
                  <button 
                    onClick={() => setTimetableFilter('mtc')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex-1 sm:flex-none ${timetableFilter === 'mtc' ? 'bg-green-600 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                  >MTC</button>
                  <button 
                    onClick={() => setTimetableFilter('local_train')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex-1 sm:flex-none ${timetableFilter === 'local_train' ? 'bg-amber-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                  >Local Train</button>
                </div>
              </div>
              
              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="Search by route number, origin, or destination..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => (
                    <div key={route.id} className="p-4 rounded-xl border border-border bg-white hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${route.type === 'mtc' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
                            {route.type === 'mtc' ? <Bus className="w-3.5 h-3.5 mr-1" /> : <Train className="w-3.5 h-3.5 mr-1" />}
                            {route.number}
                          </span>
                          <span className="text-xs font-medium text-text-muted bg-surface px-2 py-1 rounded">⏱ {route.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-bold text-text-primary">{route.from}</span>
                        <Navigation className="w-3.5 h-3.5 text-primary rotate-90 flex-shrink-0" />
                        <span className="text-sm font-bold text-text-primary">{route.to}</span>
                      </div>
                      
                      <div className="bg-surface/50 p-3 rounded-lg border border-border/50">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">Timetable</span>
                        <div className="flex flex-wrap gap-1.5">
                          {route.timetable.map((time, idx) => (
                            <span key={idx} className={`text-xs px-2 py-1 rounded-md font-medium ${time.startsWith('Every') ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white border border-border text-text-primary'}`}>
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-muted bg-surface rounded-xl">
                    <p className="text-sm">No routes found matching your search.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Cab Apps */}
            <Card>
              <h3 className="text-lg font-bold mb-4">Book a Ride</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cabApps.map((app) => (
                  <a key={app.name} href={app.url} target="_blank" rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${app.color} hover:scale-105 transition-transform`}>
                    <span className="text-sm font-bold">{app.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Tamil Words Helper */}
          <div>
            <Card className="sticky top-20">
              <h3 className="text-lg font-bold mb-4">🗣️ Tamil Word Helper</h3>
              <p className="text-sm text-text-muted mb-4">Common Tamil words you&apos;ll need while traveling:</p>
              <div className="space-y-3">
                {TAMIL_WORDS.map((word) => (
                  <div key={word.tamil} className="flex items-start gap-3 p-3 bg-surface rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary">{word.tamil}</p>
                      <p className="text-xs text-text-muted">{word.meaning}</p>
                    </div>
                    <span className="text-xs text-text-muted bengali-text">{word.script}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
