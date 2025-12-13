import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Notification } from "@/types";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Set up real-time listener for notifications
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const fetchedNotifications: Notification[] = [];
        let unread = 0;

        snapshot.forEach((doc) => {
          const notification = { id: doc.id, ...doc.data() } as Notification;
          fetchedNotifications.push(notification);
          if (!notification.read) {
            unread++;
          }
        });

        setNotifications(fetchedNotifications);
        setUnreadCount(unread);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
  };
}
