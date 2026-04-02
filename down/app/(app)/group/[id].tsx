// Group Detail screen — Social Sketchbook aesthetic

import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Share, ActivityIndicator, Alert, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventCardNew, AvatarCircle, SectionLabel, FloatingActionButton } from "../../../components";
import { useAuth } from "../../../src/context/AuthContext";
import { useGroupStore } from "../../../src/stores/groupStore";
import { useEventStore } from "../../../src/stores/eventStore";
import { createInvite, removeGroupMember, updateMemberRole, transferOwnership } from "../../../src/services/api";
import { useGroupMembersRealtime, hasPermission, getRoleLabel, getAssignableRoles, canManageRole, getRoleRank } from "@down/common";
import type { GroupMember, GroupRole } from "@down/common";
import { supabase } from "../../../src/services/supabase";

const WEB_URL = process.env.EXPO_PUBLIC_APP_URL ?? "https://rudown.co";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { groups, removeMember, removeGroup, loadGroups, updateMemberRole: storeUpdateRole } = useGroupStore();
  const { events, loadEvents } = useEventStore();

  const [inviteLoading, setInviteLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [inspectedMember, setInspectedMember] = useState<GroupMember | null>(null);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const cachedToken = useRef<string | null>(null);

  const group = groups.find((g) => g.id === id);

  useEffect(() => {
    if (id) loadEvents(id);
  }, [id]);

  const inviteLoadingRef = useRef(false);

  const handleInvite = useCallback(async () => {
    if (inviteLoadingRef.current || !id) return;
    inviteLoadingRef.current = true;
    setInviteLoading(true);
    try {
      if (!cachedToken.current) {
        const result = await createInvite(id);
        cachedToken.current = result.token;
      }
      const webLink = `${WEB_URL}/invite/${cachedToken.current}`;
      await Share.share({ url: webLink });
    } catch (e: any) {
      if (e?.message !== "User did not share") {
        console.error("[Invite] error:", e?.message);
      }
    } finally {
      inviteLoadingRef.current = false;
      setInviteLoading(false);
    }
  }, [id]);

  const myRole = group?.members.find((m) => m.id === user?.id)?.role;
  const canRemoveMembers = myRole ? hasPermission(myRole, 'member.remove') : false;
  const canInvite = myRole ? hasPermission(myRole, 'member.invite') : false;

  // Sync member changes from other clients in real-time
  useGroupMembersRealtime(supabase, id, (event) => {
    if (event.type === 'removed') {
      if (event.userId === user?.id) {
        // Current user was removed — drop the group and go back
        removeGroup(id);
        router.replace('/(app)/(tabs)/groups');
        return;
      }
      removeMember(id, event.userId);
    }
    if (event.type === 'added') loadGroups();
  });

  const handleRemoveMember = useCallback((memberId: string, memberName: string) => {
    if (!id || !group) return;
    Alert.alert(
      "Remove member",
      `Remove ${memberName.split(" ")[0]} from ${group.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingUserId(memberId);
            try {
              await removeGroupMember(id, memberId);
              removeMember(id, memberId);
            } catch (e: any) {
              Alert.alert("Couldn't remove member", e?.message ?? "Something went wrong");
            } finally {
              setRemovingUserId(null);
            }
          },
        },
      ]
    );
  }, [id, group, removeMember]);

  const handleRoleChange = useCallback(async (memberId: string, newRole: GroupRole) => {
    if (!id) return;
    setRoleUpdating(true);
    try {
      await updateMemberRole(id, memberId, newRole);
      storeUpdateRole(id, memberId, newRole);
      setInspectedMember((prev) => prev && prev.id === memberId ? { ...prev, role: newRole } : prev);
    } catch (e: any) {
      Alert.alert("Couldn't update role", e?.message ?? "Something went wrong");
    } finally {
      setRoleUpdating(false);
    }
  }, [id, storeUpdateRole]);

  const handleTransferOwnership = useCallback((memberId: string, memberName: string) => {
    if (!id) return;
    Alert.alert(
      "Transfer ownership",
      `Make ${memberName.split(" ")[0]} the new owner? You'll be demoted to Admin.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Transfer",
          style: "destructive",
          onPress: async () => {
            setRoleUpdating(true);
            try {
              await transferOwnership(id, memberId);
              storeUpdateRole(id, memberId, "owner");
              if (user?.id) storeUpdateRole(id, user.id, "admin");
              setInspectedMember(null);
            } catch (e: any) {
              Alert.alert("Couldn't transfer ownership", e?.message ?? "Something went wrong");
            } finally {
              setRoleUpdating(false);
            }
          },
        },
      ]
    );
  }, [id, user?.id, storeUpdateRole]);

  if (!group) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="font-body text-on-surface-variant">Group not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row items-center gap-4">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#3F6377" />
        </Pressable>
        <View className="flex-1">
          <Text className="font-heading-extrabold text-2xl text-on-surface">
            {group.name}
          </Text>
          <Text className="font-body text-xs text-on-surface-variant">
            {group.memberCount} members
          </Text>
        </View>
        <Pressable>
          <Ionicons name="settings-outline" size={22} color="#677A86" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, gap: 24 }}
      >
        {/* Members */}
        <View className="gap-3">
          <SectionLabel text="members" className="px-6" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16, paddingTop: 8 }}
          >
            {group.members.map((member) => {
              const isCurrentUser = member.id === user?.id;
              return (
                <Pressable
                  key={member.id}
                  className="items-center gap-1.5"
                  onPress={() => setInspectedMember(member)}
                >
                  <View className="relative">
                    <AvatarCircle user={member} size="lg" tilt={1} />
                    {removingUserId === member.id && (
                      <View className="absolute inset-0 rounded-full bg-black/40 items-center justify-center">
                        <ActivityIndicator size="small" color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text className="font-body-medium text-xs text-on-surface">
                    {member.name.split(" ")[0]}
                    {isCurrentUser ? " (you)" : ""}
                  </Text>
                  <Text className="font-body text-[10px] text-outline leading-none">
                    {getRoleLabel(member.role)}
                  </Text>
                </Pressable>
              );
            })}
            {canInvite && (
              <Pressable onPress={handleInvite} disabled={inviteLoading} className="items-center gap-1.5">
                <View className="w-14 h-14 rounded-full border-2 border-dashed border-outline-variant items-center justify-center">
                  {inviteLoading
                    ? <ActivityIndicator size="small" color="#677A86" />
                    : <Ionicons name="add" size={22} color="#677A86" />
                  }
                </View>
                <Text className="font-body-medium text-xs text-outline">Invite</Text>
                <Text className="font-body text-[10px] leading-none"> </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>

        {/* Events */}
        <View className="px-6 gap-4">
          <SectionLabel text="hangouts" />
          {events.length === 0 ? (
            <View className="items-center py-12 gap-4">
              <Text className="text-4xl">📭</Text>
              <Text className="font-heading text-lg text-on-surface">no hangouts planned yet</Text>
              <Text className="font-body text-sm text-on-surface-variant text-center">
                be the first to suggest something!
              </Text>
            </View>
          ) : (
            <View className="gap-8">
              {events.map((event) => (
                <EventCardNew
                  key={event.id}
                  event={event}
                  currentUserId={user?.id}
                  onPress={() =>
                    router.push({
                      pathname: event.status === "voting"
                        ? "/(app)/event/[id]/vote"
                        : "/(app)/event/[id]/rsvp",
                      params: { id: event.id },
                    })
                  }
                  onRSVP={() => {}}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={() =>
          router.push({
            pathname: "/(app)/event/create",
            params: { groupId: id },
          })
        }
      />

      {/* Member inspect modal */}
      <Modal
        visible={!!inspectedMember}
        transparent
        animationType="fade"
        onRequestClose={() => setInspectedMember(null)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-6"
          onPress={() => setInspectedMember(null)}
        >
          {inspectedMember && (() => {
            const isInspectingSelf = inspectedMember.id === user?.id;
            const assignableRoles = (myRole && !isInspectingSelf)
              ? getAssignableRoles(myRole, inspectedMember.role)
              : [];
            const canTransfer = myRole === "owner" && !isInspectingSelf;
            const canRemoveInspected = canRemoveMembers && !isInspectingSelf
              && myRole && canManageRole(myRole, inspectedMember.role);
            const hasActions = assignableRoles.length > 0 || canTransfer || canRemoveInspected;
            return (
              <Pressable
                className="bg-surface rounded-2xl w-full overflow-hidden shadow-xl"
                onPress={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <View className="items-center gap-2 pt-6 pb-4 px-4">
                  <AvatarCircle user={inspectedMember} size="lg" />
                  <View className="items-center">
                    <Text className="font-heading-extrabold text-lg text-on-surface">
                      {inspectedMember.name}{isInspectingSelf ? " (you)" : ""}
                    </Text>
                    <Text className="font-body text-sm text-outline">
                      {getRoleLabel(inspectedMember.role)}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                {hasActions && (
                  <View className="border-t border-outline-variant/30 px-2 py-2 gap-0.5">
                    {assignableRoles.map((role) => (
                      <Pressable
                        key={role}
                        onPress={() => handleRoleChange(inspectedMember.id, role)}
                        disabled={roleUpdating}
                        className="flex-row items-center justify-between px-3 py-3 rounded-xl active:bg-surface-container-lowest"
                      >
                        <Text className="font-body text-sm text-on-surface">
                          {getRoleRank(role) > getRoleRank(inspectedMember.role) ? "Promote" : "Demote"} to {getRoleLabel(role)}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color="#677A86" />
                      </Pressable>
                    ))}
                    {canTransfer && (
                      <Pressable
                        onPress={() => handleTransferOwnership(inspectedMember.id, inspectedMember.name)}
                        disabled={roleUpdating}
                        className="flex-row items-center justify-between px-3 py-3 rounded-xl active:bg-surface-container-lowest"
                      >
                        <Text className="font-body text-sm text-primary">Transfer ownership</Text>
                        <Ionicons name="chevron-forward" size={14} color="#677A86" />
                      </Pressable>
                    )}
                    {canRemoveInspected && (
                      <Pressable
                        onPress={() => { setInspectedMember(null); handleRemoveMember(inspectedMember.id, inspectedMember.name); }}
                        disabled={removingUserId !== null}
                        className="flex-row items-center justify-between px-3 py-3 rounded-xl active:bg-error/10"
                      >
                        <Text className="font-body text-sm text-error">Remove from group</Text>
                        <Ionicons name="close" size={14} color="#B3261E" />
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Close */}
                <View className="border-t border-outline-variant/30 px-2 py-2">
                  <Pressable
                    onPress={() => setInspectedMember(null)}
                    className="px-3 py-2.5 rounded-xl items-center active:bg-surface-container-lowest"
                  >
                    <Text className="font-body text-sm text-on-surface-variant">Close</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })()}
        </Pressable>
      </Modal>
    </View>
  );
}
