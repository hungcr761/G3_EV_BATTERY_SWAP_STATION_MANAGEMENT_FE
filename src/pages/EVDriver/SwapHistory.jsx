import React from 'react';
import { useSwapHistory } from '@/hooks/useSwapHistory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Search, Calendar, Battery, MapPin, Bike, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function SwapHistory() {
  const { filtered, loading, error, filters, updateFilters, formatDateTime, refetch } = useSwapHistory();
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading swap history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center text-red-600">{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Button
          variant='ghost'
          onClick={() => navigate('/dashboard')}
          className='mb-6 hover:bg-white/60 transition-all duration-200'
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back To Dashboard
        </Button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Swap History</h1>
            <p className="text-slate-600">Review your past motorbike battery swaps</p>
          </div>
        </div>

        {/* Filters */}
        {/* <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Search className="w-5 h-5" /> Filters</CardTitle>
            <CardDescription>Search by license plate, station, model or swap ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="border-slate-300 focus:border-indigo-500"
              />
              <Select value={filters.dateRange} onValueChange={(v) => updateFilters({ dateRange: v })}>
                <SelectTrigger className="border-slate-300 focus:border-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()} className="flex gap-2 items-center">
                <RefreshCcw className="w-4 h-4" /> Refresh
              </Button>
            </div>
            <div className="text-xs text-slate-500 mt-2">Showing {filtered.length} swap(s)</div>
          </CardContent>
        </Card> */}

        {/* Empty state */}
        {filtered.length === 0 && (
          <Card className="bg-white/80 border-slate-200/60">
            <CardContent className="py-12 text-center">
              <Battery className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No swap records</h3>
              <p className="text-slate-500">Try adjusting your filters or perform a battery swap.</p>
            </CardContent>
          </Card>
        )}

        {/* List */}
        <div className="space-y-4">
          {filtered.map(r => {
            const chemClass = (chem) => chem === 'LFP' ? 'bg-emerald-100 text-emerald-700' : (chem === 'Li-ion' || chem === 'NMC') ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700';
            return (
              <Card key={r.swap_id} className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-sky-500 via-blue-500 to-indigo-600"></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="p-1.5 rounded-md bg-gradient-to-br from-sky-500 to-indigo-600 text-white"><Bike className="w-4 h-4" /></span>
                        <span className="font-semibold">{r.vehicle.license_plate}</span>
                        <Badge className="bg-sky-100 text-sky-700">{r.vehicle.model_name}</Badge>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(r.swap_time)}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.station.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Badge className="bg-emerald-100 text-emerald-700">SOH In {r.soh_in}</Badge>
                        <Badge className="bg-sky-100 text-sky-700">SOH Out {r.soh_out}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex gap-2 items-start">
                      <div className="p-2 rounded-md bg-slate-100 text-slate-700"><MapPin className="w-4 h-4" /></div>
                      <div>
                        <p className="font-medium text-slate-700">{r.station.name}</p>
                        <p className="text-xs text-slate-500">{r.station.address}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">Returned Battery</p>
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-slate-700 text-xs">{r.returnedBattery.serial}</span>
                        <Badge className={`${chemClass(r.returnedBattery.chemistry)} text-xs`}>{r.returnedBattery.chemistry}</Badge>
                      </div>
                      <div className="text-xs text-slate-500">SOH {r.returnedBattery.current_soh}</div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">Retrieved Battery</p>
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-slate-700 text-xs">{r.retrievedBattery.serial}</span>
                        <Badge className={`${chemClass(r.retrievedBattery.chemistry)} text-xs`}>{r.retrievedBattery.chemistry}</Badge>
                      </div>
                      <div className="text-xs text-slate-500">SOH {r.retrievedBattery.current_soh}</div>
                    </div>
                  </div>
                  {/* Inline extra info (replacing modal) */}
                  <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold">Swap ID:</span>
                      <span className="ml-2 font-mono break-all">{r.swap_id}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Station ID:</span>
                      <span className="ml-2">{r.station?.id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Driver:</span>
                      <span className="ml-2">{r?.driver?.fullname || ''}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* Modal removed; details are shown inline */}
      </div>
    </div>
  );
}
