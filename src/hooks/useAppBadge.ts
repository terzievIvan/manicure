import { useEffect } from 'react';
import { AppointmentItem } from '@/lib/supabase';
import { format } from 'date-fns';

export function useAppBadge(appointments: AppointmentItem[]) {
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      const todayDateStr = format(new Date(), 'yyyy-MM-dd');
      
      // We calculate the number of appointments for today that are not completed or cancelled.
      // Assuming a simplistic check: any appointment today that isn't explicitly 'Завершен'.
      const todayPendingAppointments = appointments.filter(
        (app) => app.date === todayDateStr && app.status !== 'Завершен'
      );

      const count = todayPendingAppointments.length;

      try {
        if (count > 0) {
          // Type assertion to any as setAppBadge might not be fully typed in all TS DOM libs
          (navigator as any).setAppBadge(count).catch((error: Error) => {
            console.error('Failed to set app badge', error);
          });
        } else {
          (navigator as any).clearAppBadge().catch((error: Error) => {
            console.error('Failed to clear app badge', error);
          });
        }
      } catch (e) {
        console.error('Badging API error:', e);
      }
    }
  }, [appointments]);
}
