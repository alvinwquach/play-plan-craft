"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaBell,
  FaTrash,
  FaInbox,
} from "react-icons/fa";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@apollo/client";
import { APPROVE_USER } from "@/app/graphql/mutations/approveUser";
import { GET_NOTIFICATIONS } from "@/app/graphql/queries/getNotifications";
import { approveLessonDeletion } from "@/app/actions/approveLessonDeletion";
import { approveLessonReschedule } from "@/app/actions/approveLessonReschedule";
import { Notification } from "@/app/types/lessonPlan";

type NotificationsClientProps = {
  initialNotifications: Notification[];
  userId: string;
};

interface ApproveUserResponse {
  approveUser: {
    success?: boolean;
    user?: {
      id: string;
      email: string;
      name: string;
      organizationId?: number | null;
      pendingApproval: boolean;
    };
    notification?: {
      id: string;
      userId: string;
      senderId: string;
      type: string;
      message: string;
      organizationId?: number | null;
      status: string;
      createdAt: string;
      user?: {
        id: string;
        email: string | null;
        name: string | null;
        image: string | null;
      };
    };
    error?: { message: string; code: string };
  };
}

const NotificationSkeleton = () => (
  <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-full" />
    <div className="flex-1 space-y-3 w-full">
      <div className="h-4 bg-gray-200 rounded-full w-1/2" />
      <div className="h-3 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-1/4" />
    </div>
    <div className="flex gap-2 mt-4 sm:mt-0">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
    </div>
  </div>
);

export default function NotificationsClient({
  initialNotifications,
  userId,
}: NotificationsClientProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [filter, setFilter] = useState<
    | "ALL"
    | "PENDING"
    | "APPROVED"
    | "LESSON_DELETION_REQUEST"
    | "LESSON_RESCHEDULE_REQUEST"
    | "ASSISTANT_REQUEST"
    | "EDUCATOR_REQUEST"
  >("ALL");
  const supabase = createClient();
  const router = useRouter();
  const [approveUser, { loading: approveUserLoading }] =
    useMutation<ApproveUserResponse>(APPROVE_USER);

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_NOTIFICATIONS, {
    variables: { filter: filter === "ALL" ? null : filter },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.notifications?.notifications) {
      setNotifications(data.notifications.notifications);
    }
  }, [data]);

  useEffect(() => {
    refetch({ filter: filter === "ALL" ? null : filter });
  }, [filter, refetch]);

  useEffect(() => {
    if (subscribed) return;

    const channel: RealtimeChannel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${userId}`,
        },
        async (payload) => {
          const newNotification = payload.new as Omit<Notification, "user">;
          if (!["PENDING", "APPROVED"].includes(newNotification.status)) {
            return;
          }

          if (
            filter !== "ALL" &&
            (filter === "PENDING" || filter === "APPROVED"
              ? newNotification.status !== filter
              : newNotification.type !== filter)
          ) {
            return;
          }

          const { data: sender, error } = await supabase
            .from("users")
            .select("id, email, name, image")
            .eq("id", newNotification.senderId)
            .single();

          if (error) {
            console.error(
              "NotificationsClient: Error fetching sender details:",
              error.message
            );
            toast.error("Failed to fetch sender details.", {
              position: "top-center",
              autoClose: 3000,
              theme: "colored",
            });
          }

          setNotifications((prev) => [
            {
              ...newNotification,
              createdAt: new Date(newNotification.createdAt).toISOString(),
              user: sender || {
                id: newNotification.senderId,
                email: null,
                name: "Unknown Sender",
                image: null,
              },
              organizationId: newNotification.organizationId || null,
            },
            ...prev,
          ]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          if (!["PENDING", "APPROVED"].includes(payload.new.status)) {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.new.id)
            );
            return;
          }

          if (
            filter !== "ALL" &&
            (filter === "PENDING" || filter === "APPROVED"
              ? payload.new.status !== filter
              : payload.new.type !== filter)
          ) {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.new.id)
            );
            return;
          }

          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id
                ? {
                    ...n,
                    ...payload.new,
                    createdAt: new Date(payload.new.createdAt).toISOString(),
                  }
                : n
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== payload.old.id)
          );
        }
      )
      .subscribe((status, error) => {
        setSubscribed(status === "SUBSCRIBED");
        if (error) {
          console.error(
            "NotificationsClient: Subscription error:",
            error.message
          );
          toast.error("Error connecting to notifications. Please refresh.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setSubscribed(false);
    };
  }, [userId, supabase, subscribed, filter]);

  const handleApprove = async (
    notificationId: string,
    senderId: string | null,
    notificationType: string
  ) => {
    setLoading(true);
    if (!senderId) {
      console.error("handleApprove: Sender ID is missing");
      toast.error("Sender ID is missing. Cannot approve request.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
      return;
    }

    try {
      if (
        notificationType === "ASSISTANT_REQUEST" ||
        notificationType === "EDUCATOR_REQUEST"
      ) {
        const { data, errors } = await approveUser({
          variables: { input: { userId: senderId, approverId: userId } },
        });
        if (errors) {
          console.error("handleApprove: GraphQL mutation errors:", errors);
          toast.error(
            `Failed to approve user: ${errors[0]?.message || "Unknown error"}`,
            {
              position: "top-center",
              autoClose: 3000,
              theme: "colored",
            }
          );
          setLoading(false);
          return;
        }
        const response = data?.approveUser;
        if (response?.error) {
          console.error("handleApprove: Approve user error:", response.error);
          toast.error(response.error.message || "Failed to approve request.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
          setLoading(false);
          return;
        }
        if (response?.success) {
          const { error: updateError } = await supabase
            .from("notifications")
            .update({ status: "APPROVED" })
            .eq("id", notificationId);
          if (updateError) {
            console.error(
              "handleApprove: Supabase notification update error:",
              updateError
            );
            toast.error("Failed to update notification status.", {
              position: "top-center",
              autoClose: 3000,
              theme: "colored",
            });
          }
          toast.success("User approved successfully!", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        } else {
          console.error("handleApprove: No success response:", response);
          toast.error("Failed to approve user: No success response.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        }
      } else if (notificationType === "LESSON_DELETION_REQUEST") {
        const result = await approveLessonDeletion(
          Number(notificationId),
          true
        );
        if (result.success) {
          toast.success("Lesson deletion approved successfully!", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        } else {
          console.error("handleApprove: Lesson deletion error:", result.error);
          toast.error(result.error || "Failed to approve lesson deletion.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        }
      } else if (notificationType === "LESSON_RESCHEDULE_REQUEST") {
        const result = await approveLessonReschedule(
          Number(notificationId),
          true
        );
        if (result.success) {
          toast.success("Lesson reschedule approved successfully!", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        } else {
          console.error(
            "handleApprove: Lesson reschedule error:",
            result.error
          );
          toast.error(result.error || "Failed to approve lesson reschedule.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        }
      }
      refetch();
    } catch (error: unknown) {
      console.error("handleApprove: Error:", error);
      toast.error(
        `Failed to approve request: ${
          (error as Error).message || "Unknown error"
        }`,
        {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (
    notificationId: string,
    senderId: string | null,
    notificationType: string
  ) => {
    setLoading(true);
    if (!senderId) {
      console.error("handleReject: Sender ID is missing");
      toast.error("Sender ID is missing. Cannot reject request.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
      return;
    }

    try {
      if (
        notificationType === "ASSISTANT_REQUEST" ||
        notificationType === "EDUCATOR_REQUEST"
      ) {
        await supabase
          .from("users")
          .update({ organizationId: null, pendingApproval: false })
          .eq("id", senderId);
        await supabase
          .from("notifications")
          .update({ status: "REJECTED" })
          .eq("id", notificationId);
        toast.success("Request rejected successfully.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } else if (notificationType === "LESSON_DELETION_REQUEST") {
        const result = await approveLessonDeletion(
          Number(notificationId),
          false
        );
        if (result.success) {
          toast.success("Lesson deletion rejected successfully!", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        } else {
          console.error("handleReject: Lesson deletion error:", result.error);
          toast.error(result.error || "Failed to reject lesson deletion.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        }
      } else if (notificationType === "LESSON_RESCHEDULE_REQUEST") {
        const result = await approveLessonReschedule(
          Number(notificationId),
          false
        );
        if (result.success) {
          toast.success("Lesson reschedule rejected successfully!", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        } else {
          console.error("handleReject: Lesson reschedule error:", result.error);
          toast.error(result.error || "Failed to reject lesson reschedule.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        }
      }
      refetch();
    } catch (error: unknown) {
      console.error("handleReject: Error rejecting request:", error);
      toast.error("Failed to reject request.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    setLoading(true);
    try {
      await supabase.from("notifications").delete().eq("id", notificationId);
      toast.success("Notification dismissed.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      refetch();
    } catch (error: unknown) {
      console.error("handleDismiss: Error dismissing notification:", error);
      toast.error("Failed to dismiss notification.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Deletion Requests", value: "LESSON_DELETION_REQUEST" },
    { label: "Reschedule Requests", value: "LESSON_RESCHEDULE_REQUEST" },
    { label: "Assistant Requests", value: "ASSISTANT_REQUEST" },
    { label: "Educator Requests", value: "EDUCATOR_REQUEST" },
  ];

  const skeletonCount = Math.max(initialNotifications.length, 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white pt-24 pb-32 sm:pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <FaBell className="text-5xl text-teal-600 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Your Notifications
          </h1>
          <p className="text-gray-500 text-md mt-2 max-w-md mx-auto">
            Stay updated with requests and actions related to your lesson plans
            and organization.
          </p>
        </div>
        <div className="mb-6">
          <div className="flex overflow-x-auto space-x-4 pb-2 sm:justify-center scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as typeof filter)}
                role="tab"
                aria-selected={filter === tab.value}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  filter === tab.value
                    ? "text-teal-600 border-b-4 border-teal-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {loading || approveUserLoading || queryLoading ? (
          <div className="space-y-4">
            {[...Array(skeletonCount)].map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <FaInbox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-4">
              No notifications yet!
            </p>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              When you receive requests or updates, they’ll appear here.
            </p>
            <button
              onClick={() => router.push("/lesson-plan")}
              className="mt-6 bg-teal-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-teal-700 transition-all duration-300 shadow-sm"
            >
              Go to Lesson Plans
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const user = notification.user || {
                id: notification.senderId,
                email: null,
                name: null,
                image: null,
              };

              const createdAtDate = new Date(notification.createdAt);
              const formattedDate = isNaN(createdAtDate.getTime())
                ? "Invalid Date"
                : createdAtDate.toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  });

              return (
                <div
                  key={notification.id}
                  className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start gap-4 animate-fade-in"
                >
                  <div className="flex-shrink-0">
                    <Image
                      src={user.image || "/images/fallback-avatar.png"}
                      alt={user.name || "User Avatar"}
                      width={48}
                      height={48}
                      className="rounded-full object-cover border-2 border-teal-100 shadow-sm w-12 h-12"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 font-semibold text-lg">
                          {user.name || "Unknown Sender"}
                        </p>
                        {notification.type === "LESSON_DELETION_REQUEST" && (
                          <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded-full">
                            Lesson Deletion
                          </span>
                        )}
                        {notification.type === "LESSON_RESCHEDULE_REQUEST" && (
                          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full">
                            Lesson Reschedule
                          </span>
                        )}
                        {notification.type === "ASSISTANT_REQUEST" && (
                          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                            Assistant Request
                          </span>
                        )}
                        {notification.type === "EDUCATOR_REQUEST" && (
                          <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                            Educator Request
                          </span>
                        )}
                        {notification.type === "ALERT" && (
                          <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                            Alert
                          </span>
                        )}
                        {notification.type === "REMINDER" && (
                          <span className="text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded-full">
                            Reminder
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          notification.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : notification.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {notification.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{user.email || "No email"}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 sm:mt-0 sm:ml-4">
                    {notification.status === "PENDING" &&
                    [
                      "ASSISTANT_REQUEST",
                      "EDUCATOR_REQUEST",
                      "LESSON_DELETION_REQUEST",
                      "LESSON_RESCHEDULE_REQUEST",
                    ].includes(notification.type) ? (
                      <>
                        <button
                          onClick={() =>
                            handleApprove(
                              notification.id,
                              notification.senderId,
                              notification.type
                            )
                          }
                          disabled={loading || approveUserLoading}
                          className="w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition transform hover:scale-105 shadow-sm flex items-center justify-center"
                          title="Approve"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() =>
                            handleReject(
                              notification.id,
                              notification.senderId,
                              notification.type
                            )
                          }
                          disabled={loading || approveUserLoading}
                          className="w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition transform hover:scale-105 shadow-sm flex items-center justify-center"
                          title="Reject"
                        >
                          <FaTimesCircle />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        disabled={loading || approveUserLoading}
                        className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition transform hover:scale-105 shadow-sm flex items-center justify-center"
                        title="Dismiss"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}