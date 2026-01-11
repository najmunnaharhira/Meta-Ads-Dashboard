import { useState, useCallback } from 'react';
import Notification, { NotificationType } from '../components/Notification';

export const useNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const NotificationComponent = notification ? (
    <Notification
      message={notification.message}
      type={notification.type}
      onClose={hideNotification}
    />
  ) : null;

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
};
