import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label, indicator }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload.find(p => p.dataKey === 'actual');
    const pointData = dataPoint?.payload;

    return (
      <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 shadow-soft-lg text-xs space-y-1.5 max-w-xs">
        <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex justify-between">
          <span>{indicator === 'BBTB' ? `Tinggi: ${label} cm` : `Umur: ${label} Bulan`}</span>
          {pointData?.tanggal_ukur && (
            <span className="font-normal text-slate-500">{pointData.tanggal_ukur}</span>
          )}
        </div>
        {pointData?.actual !== undefined ? (
          <>
            <div className="flex justify-between items-center gap-4 text-slate-700">
              <span className="font-semibold text-brand-700">Pengukuran Balita:</span>
              <span className="font-bold text-slate-900">
                {pointData.actual} {indicator === 'TBU' ? 'cm' : 'kg'}
              </span>
            </div>
            {pointData?.zscore !== undefined && (
              <div className="flex justify-between items-center gap-4 text-slate-600">
                <span>Skor Z (SD):</span>
                <span className="font-semibold text-slate-900">{pointData.zscore} SD</span>
              </div>
            )}
            {pointData?.kategori && (
              <div className="flex justify-between items-center gap-4 text-slate-600">
                <span>Kategori:</span>
                <span className="font-semibold text-brand-700">{pointData.kategori}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-slate-500 italic">Garis standar referensi WHO</div>
        )}
      </div>
    );
  }
  return null;
};

const KmsChart = ({ curves = [], actualPoints = [], indicator = 'BBU', title }) => {
  // Gabungkan data kurva dan titik ukur berdasarkan x
  const xKey = indicator === 'BBTB' ? 'height' : 'month';

  // Map actual points by x
  const pointMap = {};
  actualPoints.forEach(p => {
    pointMap[p[xKey]] = p;
  });

  const chartData = curves.map(c => {
    const pt = pointMap[c[xKey]];
    return {
      ...c,
      actual: pt ? pt.actual : undefined,
      tanggal_ukur: pt ? pt.tanggal_ukur : undefined,
      zscore: pt ? pt.zscore : undefined,
      kategori: pt ? pt.kategori : undefined
    };
  });

  const yUnit = indicator === 'TBU' ? ' cm' : ' kg';

  return (
    <div className="w-full bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
      {title && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500">Standar Kurva Pertumbuhan Antropometri WHO</p>
        </div>
      )}

      <div className="h-80 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey={xKey}
              unit={indicator === 'BBTB' ? ' cm' : ' bln'}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <YAxis
              unit={yUnit}
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <Tooltip content={<CustomTooltip indicator={indicator} />} />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
              iconType="plainline"
            />

            {/* WHO Reference Lines */}
            <Line
              type="monotone"
              dataKey="sdPos3"
              name="+3 SD"
              stroke="#ef4444"
              strokeWidth={1.2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="sdPos2"
              name="+2 SD"
              stroke="#f97316"
              strokeWidth={1.2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="sdPos1"
              name="+1 SD"
              stroke="#eab308"
              strokeWidth={1.2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="median"
              name="Median (0 SD)"
              stroke="#0d9488"
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="sdNeg2"
              name="-2 SD"
              stroke="#f97316"
              strokeWidth={1.2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="sdNeg3"
              name="-3 SD"
              stroke="#ef4444"
              strokeWidth={1.2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Actual child measurement line and highlighted dots */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Data Balita"
              stroke="#0f172a"
              strokeWidth={2.5}
              connectNulls={true}
              dot={{ r: 5, fill: '#0f172a', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-2 px-2 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> Titik Pengukuran Balita
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-teal-600"></span> Garis Hijau: Median WHO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-amber-500"></span> Garis Kuning/Oranye: ±1 & ±2 SD
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-red-500"></span> Garis Merah: ±3 SD
        </span>
      </div>
    </div>
  );
};

export default KmsChart;

