import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Tidak Ada Data',
  subtitle = 'Belum ada data yang tersimpan pada bagian ini.',
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">{subtitle}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

