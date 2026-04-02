import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Notification } from "@down/common";
import { getNotifications, markNotificationAsRead } from "../../src/services/api";
import { useNotificationStore } from "../../src/stores/notificationStore";
import { useGroupStore } from "../../src/stores/groupStore";
import { relativeFormatted } from "@down/common";

export default function NotificationsScreen() {
  const router = useRouter();
  const { reset } = useNotificationStore();
  const { groups } = useGroupStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then((notifs) => {
        setNotifications(notifs);
        // Mark all unread as read
        notifs
          .filter((n) => !n.read)
          .forEach((n) => markNotificationAsRead(n.id).catch(() => {}));
        reset();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getGroupName = (groupId: string) =>
    groups.find((g) => g.id === groupId)?.name ?? 'your group';

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row items-center gap-4">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#3F6377" />
        </Pressable>
        <Text className="font-heading-extrabold text-2xl text-on-surface">
          notifications
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#3F6377" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-4xl">🔔</Text>
          <Text className="font-heading text-lg text-on-surface text-center">
            all caught up
          </Text>
          <Text className="font-body text-sm text-on-surface-variant text-center">
            we'll let you know when something goes down 👀
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {notifications.map((notif) => (
            <Pressable
              key={notif.id}
              className={`flex-row items-start gap-4 px-6 py-4 border-b border-outline-variant/20 ${!notif.read ? 'bg-surface-container-lowest' : ''}`}
            >
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center flex-shrink-0 mt-0.5">
                <Text className="text-lg">👥</Text>
              </View>
              <View className="flex-1">
                <Text className="font-body-medium text-sm text-on-surface">
                  {notif.actorName ? (
                    <><Text className="font-heading">{notif.actorName}</Text>{' joined '}</>
                  ) : 'New member joined '}
                  <Text className="font-heading text-primary">
                    {getGroupName(notif.groupId)}
                  </Text>
                </Text>
                <Text className="font-body text-xs text-on-surface-variant mt-0.5">
                  {relativeFormatted(notif.createdAt)}
                </Text>
              </View>
              {!notif.read && (
                <View className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
