import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Package, Send, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 3).map((notif) => {
        const getIcon = () => {
          switch (notif.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            case 'order':
              return <Package className="w-5 h-5 text-amber-400 shrink-0" />;
            case 'broadcast':
              return <Send className="w-5 h-5 text-sky-400 shrink-0" />;
            default:
              return <AlertCircle className="w-5 h-5 text-neutral-300 shrink-0" />;
          }
        };

        return (
          <div
            key={notif.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-neutral-900/95 border border-neutral-700/80 rounded-xl shadow-xl shadow-black/40 text-neutral-100 backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-3"
          >
            <div className="mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-neutral-100 truncate">{notif.title}</div>
              <div className="text-xs text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</div>
              <div className="text-[10px] text-neutral-500 mt-1">{notif.timestamp}</div>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-neutral-500 hover:text-neutral-200 p-0.5 rounded transition-colors"
              aria-label="Закрыть уведомление"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
