import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlants } from '../context/PlantContext';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

export function useNotifications() {
  const { user } = useAuth();
  const { schedule } = usePlants();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user?.notificationsEnabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const checkNotifications = () => {
      const now = new Date();
      const hour = now.getHours();
      const todayStr = format(now, 'yyyy-MM-dd');
      
      const sentKey = `plant_app_notifications_${todayStr}`;
      const sentStatus = JSON.parse(localStorage.getItem(sentKey) || '{"morning": false, "afternoon": false}');

      const todaysTasks = schedule.filter(task => task.date === todayStr && !task.completed);

      // Morning: 8 AM to 11:59 AM
      const isMorning = hour >= 8 && hour < 12;
      // Afternoon/Evening: 12 PM onwards
      const isAfternoon = hour >= 12;

      if (isMorning && !sentStatus.morning) {
        const waterTasks = todaysTasks.filter(t => t.type !== 'scan');
        if (waterTasks.length > 0) {
          new Notification('BioLife', {
            body: `${t('Good morning')}! ${t('You have')} ${waterTasks.length} ${t('plant(s) that need water today.')}`,
            icon: '/favicon.ico'
          });
          sentStatus.morning = true;
          localStorage.setItem(sentKey, JSON.stringify(sentStatus));
        }
      }

      if (isAfternoon && !sentStatus.afternoon) {
        const scanTasks = todaysTasks.filter(t => t.type === 'scan');
        if (scanTasks.length > 0) {
          new Notification('BioLife', {
            body: `${t('Good afternoon')}! ${t('Time for a health scan for')} ${scanTasks.length} ${t('plant(s)')}.`,
            icon: '/favicon.ico'
          });
          sentStatus.afternoon = true;
          localStorage.setItem(sentKey, JSON.stringify(sentStatus));
        }
      }
    };

    // Check immediately
    checkNotifications();

    // Check every minute
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.notificationsEnabled, schedule, t]);
}
