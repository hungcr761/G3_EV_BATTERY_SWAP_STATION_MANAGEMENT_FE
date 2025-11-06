import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useCabinets from '@/hooks/useCabinets';

export default function StaffBatteryManagement() {
  const { cabinets, batteries, loading, error, inShift, shift, refetch } = useCabinets();

  // Debug: log list data for verification
  useEffect(() => {
    if (!loading) {
      // console.log('[StaffBatteryManagement] Shift:', shift);
      // console.log('[StaffBatteryManagement] Station ID:', shift?.station_id);
      console.log('[StaffBatteryManagement] Cabinets:', cabinets);
      // console.log('[StaffBatteryManagement] Batteries (flatten):', batteries);
      // console.log('[StaffBatteryManagement] Counts => cabinets:', cabinets?.length || 0, ', batteries:', batteries?.length || 0);
    }
  }, [loading, shift, cabinets, batteries]);
  

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý pin tại trạm</h1>
          <p className="text-sm text-slate-600">Xem danh sách tủ và ô chứa pin của trạm bạn đang trực</p>
          <div className="mt-1 text-xs text-slate-500">
            {inShift ? (
              <>
                Ca hiện tại tại trạm: <span className="font-medium">{shift?.station?.station_name || `#${shift?.station_id}`}</span>
              </>
            ) : (
              'Bạn hiện không trong ca làm – danh sách sẽ trống.'
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch}>Tải lại</Button>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="p-6 text-slate-600">Đang tải dữ liệu...</div>
      )}
      {!!error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Batteries table */}
      {!loading && inShift && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Danh sách pin tại trạm {shift?.station?.station_name || `#${shift?.station_id}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {batteries.length === 0 ? (
              <div className="py-4 text-slate-600">Chưa có pin trong các tủ tại trạm.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="text-left py-2 px-3 w-14">#</th>
                    <th className="text-left py-2 px-3">Serial</th>
                    <th className="text-left py-2 px-3">SoC</th>
                    <th className="text-left py-2 px-3">SoH</th>
                    <th className="text-left py-2 px-3">Tủ</th>
                    <th className="text-left py-2 px-3">Ô</th>
                    <th className="text-left py-2 px-3">Điện áp (V)</th>
                    <th className="text-left py-2 px-3">Dòng (A)</th>
                  </tr>
                </thead>
                <tbody>
                  {batteries.map((b, idx) => (
                    <tr key={b.battery_id || `${b.cabinet_id}-${b.slot_number}-${idx}`} className="border-b">
                      <td className="py-2 px-3">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono">{b.battery_serial}</td>
                      <td className="py-2 px-3">{Number(b.current_soc ?? 0)}%</td>
                      <td className="py-2 px-3">{Number(b.current_soh ?? 0)}%</td>
                      <td className="py-2 px-3">{b.cabinet_code}</td>
                      <td className="py-2 px-3">{b.slot_number}</td>
                      <td className="py-2 px-3">{b.slot_voltage}</td>
                      <td className="py-2 px-3">{b.slot_current}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty or list */}
      {!loading && cabinets.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-slate-600">Không có dữ liệu tủ pin.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cabinets.map((cab) => (
          <Card key={cab.cabinet_id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{cab.cabinet_code}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {cab.status || 'unknown'}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Sức chứa: {cab.battery_capacity} • Công suất: {cab.power_capacity_kw} kW
              </div>
            </CardHeader>
            <CardContent>
              {/* Slots grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(cab.slots || []).map((slot) => {
                  const occupied = Boolean(slot?.battery);
                  return (
                    <div
                      key={`${cab.cabinet_id}-${slot.slot_number}`}
                      className={`rounded-lg border p-2 text-xs ${occupied ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
                      title={occupied ? `${slot?.battery?.battery_serial} • SoC ${slot?.battery?.current_soc}%` : 'Ô trống'}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{slot.slot_number}</span>
                        <span className={`px-1.5 py-0.5 rounded ${occupied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}> 
                          {occupied ? 'Đã gắn' : 'Trống'}
                        </span>
                      </div>
                      <div className="mt-1">
                        {occupied ? (
                          <div className="space-y-0.5">
                            <div className="truncate"><span className="text-slate-500">Serial:</span> {slot?.battery?.battery_serial}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">SoC</span>
                              <span className="font-medium">{slot?.battery?.current_soc}%</span>
                              <span className="text-slate-500">SoH</span>
                              <span className="font-medium">{slot?.battery?.current_soh}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500">Ô trống</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

