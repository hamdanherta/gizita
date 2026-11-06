import React from 'react';

/**
 * Status Badge dengan skema warna resmi:
 * Merah: buruk / sangat kurang / sangat pendek
 * Kuning: kurang / pendek / berisiko lebih
 * Hijau: normal / baik / aktif / selesai
 * Oranye: lebih / berjalan
 * Ungu: obesitas
 */
const Badge = ({ children, status, variant, className = '' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  const val = (status || children || '').toString().toLowerCase();

  if (
    variant === 'danger' ||
    val.includes('buruk') ||
    val.includes('sangat kurang') ||
    val.includes('sangat pendek') ||
    val.includes('dibatalkan') ||
    val.includes('tidak_diberikan')
  ) {
    badgeStyle = 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/10';
  } else if (
    variant === 'warning' ||
    val.includes('kurang') ||
    val.includes('pendek') ||
    val.includes('berisiko') ||
    val.includes('sebagian')
  ) {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10';
  } else if (
    variant === 'success' ||
    val.includes('normal') ||
    val.includes('baik') ||
    val.includes('aktif') ||
    val.includes('selesai') ||
    val.includes('habis') ||
    val.includes('diberikan')
  ) {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10';
  } else if (
    variant === 'orange' ||
    val.includes('lebih') ||
    val.includes('berjalan') ||
    val.includes('terjadwal')
  ) {
    badgeStyle = 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-500/10';
  } else if (
    variant === 'purple' ||
    val.includes('obesitas')
  ) {
    badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10';
  } else if (
    variant === 'info' ||
    val.includes('tinggi') ||
    val.includes('konseling') ||
    val.includes('rujukan')
  ) {
    badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-500/10';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide whitespace-nowrap ${badgeStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children || status}
    </span>
  );
};

export default Badge;

