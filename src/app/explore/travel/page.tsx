'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Bus, Train, Car, Bike, ExternalLink, Loader2, AlertCircle, Download, Search, Megaphone, Map, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { TAMIL_WORDS } from '@/lib/constants';
import { checkRouteAvailability, RouteResponse, TransportCategory, PrivateMode } from '@/lib/routingService';

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

const POPULAR_MTC_ROUTES = [
  { no: '21G', from: 'Broadway', to: 'Tambaram', freq: 'Every 10 mins', first: '05:00 AM', last: '10:20 PM' },
  { no: '570', from: 'CMBT', to: 'Kelambakkam', freq: 'Every 15 mins', first: '05:15 AM', last: '09:50 PM' },
  { no: '19B', from: 'Saidapet', to: 'Kelambakkam', freq: 'Every 20 mins', first: '05:30 AM', last: '10:00 PM' },
  { no: 'A1', from: 'Central', to: 'Thiruvanmiyur', freq: 'Every 12 mins', first: '05:40 AM', last: '09:30 PM' },
  { no: '102', from: 'Broadway', to: 'Kelambakkam', freq: 'Every 20 mins', first: '05:00 AM', last: '09:00 PM' },
];

const LOCAL_TRAIN_ROUTES = [
  { line: 'South Line', route: 'Chennai Beach - Tambaram - Chengalpattu', freq: '10-15 mins', first: '04:00 AM', last: '11:59 PM', type: 'Suburban' },
  { line: 'MRTS', route: 'Chennai Beach - Velachery', freq: '20 mins', first: '05:00 AM', last: '11:00 PM', type: 'Elevated' },
  { line: 'West Line', route: 'Chennai Central - Arakkonam', freq: '20-30 mins', first: '03:50 AM', last: '11:15 PM', type: 'Suburban' },
  { line: 'North Line', route: 'Chennai Central - Gummidipoondi', freq: '30 mins', first: '04:15 AM', last: '10:45 PM', type: 'Suburban' },
];

export default function TravelPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState<TransportCategory>('public');
  const [privateMode, setPrivateMode] = useState<PrivateMode>('ola');
  
  const [isLoading, setIsLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTimetableTab, setActiveTimetableTab] = useState<'mtc' | 'train'>('mtc');

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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Route Planner</h2>

              </div>
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
                  { title: 'MTC Bus', desc: 'Metropolitan Transport Corp — covers all of Chennai. Fare: ₹5-₹30', color: 'bg-green-50 text-green-700', url: 'https://chalo.com/app/' },
                  { title: 'Chennai Metro', desc: '2 lines covering major areas. Fare: ₹10-₹60', color: 'bg-blue-50 text-blue-700', url: 'https://chennai.metroroute.co.in/' },
                  { title: 'MRTS', desc: 'Beach to Velachery elevated rail. Fare: ₹5-₹15', color: 'bg-purple-50 text-purple-700' },
                  { title: 'Suburban Train', desc: 'Southern Railway suburban. Cheapest option.', color: 'bg-amber-50 text-amber-700', url: 'https://play.google.com/store/apps/details?id=com.whereismytrain.android' },
                ].map((t) => {
                  const content = (
                    <>
                      <h4 className="font-bold text-sm flex items-center gap-1.5">
                        {t.title} {t.url && <ExternalLink className="w-3 h-3 opacity-70" />}
                      </h4>
                      <p className="text-xs mt-1 opacity-80">{t.desc}</p>
                    </>
                  );
                  
                  return t.url ? (
                    <a key={t.title} href={t.url} target="_blank" rel="noopener noreferrer" className={`block p-4 rounded-xl hover:scale-[1.02] transition-transform cursor-pointer ${t.color}`}>
                      {content}
                    </a>
                  ) : (
                    <div key={t.title} className={`p-4 rounded-xl ${t.color}`}>
                      {content}
                    </div>
                  );
                })}
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

            {/* Popular Routes & Timetables */}
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold">Popular Routes & Timetables</h3>
                <div className="flex bg-surface rounded-lg p-1 border border-border">
                  <button 
                    onClick={() => setActiveTimetableTab('mtc')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTimetableTab === 'mtc' ? 'bg-white shadow-sm text-green-700' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    <Bus className="w-4 h-4" /> MTC Bus
                  </button>
                  <button 
                    onClick={() => setActiveTimetableTab('train')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTimetableTab === 'train' ? 'bg-white shadow-sm text-amber-700' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    <Train className="w-4 h-4" /> Local Train
                  </button>
                </div>
              </div>

              {activeTimetableTab === 'mtc' && (
                <div className="space-y-3">
                  {POPULAR_MTC_ROUTES.map((route, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border bg-white hover:border-green-200 hover:bg-green-50/30 transition-colors gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-lg shrink-0">
                          {route.no}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                            {route.from} <Navigation className="w-3 h-3 text-text-muted" /> {route.to}
                          </h4>
                          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Frequency: {route.freq}
                          </p>
                        </div>
                      </div>
                      <div className="text-right sm:text-left flex sm:flex-col gap-2 sm:gap-0 justify-between items-center sm:items-end bg-surface sm:bg-transparent p-2 sm:p-0 rounded-lg">
                        <span className="text-xs text-text-muted">First: <span className="font-medium text-text-primary">{route.first}</span></span>
                        <span className="text-xs text-text-muted">Last: <span className="font-medium text-text-primary">{route.last}</span></span>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-text-muted text-center mt-4">Note: Timings are approximate and subject to traffic conditions.</p>
                </div>
              )}

              {activeTimetableTab === 'train' && (
                <div className="space-y-3">
                  {LOCAL_TRAIN_ROUTES.map((route, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border bg-white hover:border-amber-200 hover:bg-amber-50/30 transition-colors gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center shrink-0">
                          <Train className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm text-text-primary">{route.line}</h4>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-amber-50 border-amber-200 text-amber-700">{route.type}</Badge>
                          </div>
                          <p className="text-xs text-text-primary font-medium">{route.route}</p>
                          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Freq: {route.freq}
                          </p>
                        </div>
                      </div>
                      <div className="text-right sm:text-left flex sm:flex-col gap-2 sm:gap-0 justify-between items-center sm:items-end bg-surface sm:bg-transparent p-2 sm:p-0 rounded-lg">
                        <span className="text-xs text-text-muted">First: <span className="font-medium text-text-primary">{route.first}</span></span>
                        <span className="text-xs text-text-muted">Last: <span className="font-medium text-text-primary">{route.last}</span></span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-text-muted">Timings may vary on Sundays and public holidays.</p>
                    <a href="https://play.google.com/store/apps/details?id=com.whereismytrain.android" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      Get Train App <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Tamil Words Helper */}
          <div>
            <Card className="sticky top-20">
              <h3 className="text-lg font-bold mb-4 inline-flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" /> Tamil Word Helper
              </h3>
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
