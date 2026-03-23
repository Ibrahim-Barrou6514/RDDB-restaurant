import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-emerald-500/90 border-emerald-400',
  error: 'bg-red-500/90 border-red-400',
  info: 'bg-blue-500/90 border-blue-400',
};

export default function NotificationToast() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-24 right-4 z-[60] flex flex-col gap-3 w-80">
      <AnimatePresence>
        {notifications.map((n) => {
          const Icon = icons[n.type] || Info;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl text-white shadow-2xl ${colors[n.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{n.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
