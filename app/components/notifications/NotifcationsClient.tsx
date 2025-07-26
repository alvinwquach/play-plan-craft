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
import { approveLessonDeletion } from "@/app/actions/approveLessonDeletion";
import { RealtimeChannel } from "@supabase/supabase-js";
import { approveUser } from "@/app/actions/approveUser";
import { Notification } from "../../types/lessonPlan";

interface NotificationsClientProps {
  initialNotifications: Notification[];
  userId: string;
}

const NotificationSkeleton = () => (
  <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-full" />
    <div className="flex-1 space-y-3 w-full">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
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
  const supabase = createClient();
  const router = useRouter();

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
          if (!["PENDING", "INFO", "APPROVED"].includes(newNotification.status))
            return;

          const { data: sender, error } = await supabase
            .from("users")
            .select("email, name, image")
            .eq("id", newNotification.senderId)
            .single();

          if (error) {
            console.error("Error fetching sender details:", error.message);
            toast.error("Failed to fetch sender details.", {
              position: "top-center",
              autoClose: 3000,
              theme: "colored",
            });
          }

          setNotifications((prev) => [
            {
              ...newNotification,
              createdAt: newNotification.createdAt
                ? new Date(
                    isNaN(Number(newNotification.createdAt))
                      ? newNotification.createdAt
                      : Number(newNotification.createdAt)
                  ).toISOString()
                : new Date().toISOString(),
              user: sender || {
                email: "Unknown",
                name: "Unknown Sender",
                image: null,
              },
              organizationId:
                newNotification.organizationId || "default_organization_id",
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
          if (["PENDING", "APPROVED"].includes(payload.new.status)) {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id
                  ? {
                      ...n,
                      ...payload.new,
                      createdAt: payload.new.createdAt
                        ? new Date(
                            isNaN(Number(payload.new.createdAt))
                              ? payload.new.createdAt
                              : Number(payload.new.createdAt)
                          ).toISOString()
                        : n.createdAt,
                    }
                  : n
              )
            );
          }
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
          console.error("Subscription error:", error.message);
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
  }, [userId, supabase, subscribed]);

  const handleApprove = async (
    notificationId: number,
    senderId: string,
    type: string
  ) => {
    setLoading(true);

    if (type === "LESSON_DELETION_REQUEST") {
      const response = await approveLessonDeletion(notificationId, true);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Lesson deletion request approved successfully!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        toast.error(response.error || "Failed to approve lesson deletion", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      }
      setLoading(false);
      return;
    }

    const {
      data: { user: educator },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !educator) {
      toast.error("Failed to authenticate user. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
      return;
    }

    const response = await approveUser(senderId, educator.id);

    if (response.data?.success) {
      await supabase
        .from("notifications")
        .update({ status: "APPROVED" })
        .eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success("User approved successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      toast.error(response.error?.message || "Failed to approve request.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }

    setLoading(false);
  };

  const handleReject = async (
    notificationId: number,
    senderId: string,
    type: string
  ) => {
    setLoading(true);

    if (type === "LESSON_DELETION_REQUEST") {
      const response = await approveLessonDeletion(notificationId, false);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Lesson deletion request rejected successfully!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        toast.error(response.error || "Failed to reject lesson deletion", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      }
      setLoading(false);
      return;
    }

    await supabase
      .from("users")
      .update({ organizationId: null, pendingApproval: false })
      .eq("id", senderId);

    await supabase
      .from("notifications")
      .update({ status: "REJECTED" })
      .eq("id", notificationId);

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    toast.success("Request rejected successfully.", {
      position: "top-center",
      autoClose: 3000,
      theme: "colored",
    });

    setLoading(false);
  };

  const handleDismiss = async (notificationId: number) => {
    setLoading(true);
    await supabase.from("notifications").delete().eq("id", notificationId);

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    toast.success("Notification dismissed.", {
      position: "top-center",
      autoClose: 3000,
      theme: "colored",
    });

    setLoading(false);
  };

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
        {loading ? (
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
                email: null,
                name: null,
                image: null,
              };

              const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
              )}&background=0D8ABC&color=fff`;

              const createdAtDate = new Date(
                isNaN(Number(notification.createdAt))
                  ? notification.createdAt
                  : Number(notification.createdAt)
              );
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
                      src={user.image || fallbackImage}
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
                        {notification.type === "ASSISTANT_REQUEST" && (
                          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                            Assistant Request
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          notification.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
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
                    {notification.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() =>
                            handleApprove(
                              notification.id,
                              notification.senderId,
                              notification.type
                            )
                          }
                          disabled={loading}
                          className="w-10 h-10 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition transform hover:scale-105 shadow-sm flex items-center justify-center"
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
                          disabled={loading}
                          className="w-10 h-10 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition transform hover:scale-105 shadow-sm flex items-center justify-center"
                          title="Reject"
                        >
                          <FaTimesCircle />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        disabled={loading}
                        className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105 shadow-sm flex items-center justify-center"
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
