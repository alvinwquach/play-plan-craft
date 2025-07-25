"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaCheckCircle, FaTimesCircle, FaBell, FaTrash } from "react-icons/fa";
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
  <div className="bg-white border border-teal-100 p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-5 animate-pulse">
    <div className="w-14 h-14 bg-gray-200 rounded-full" />
    <div className="flex-1 space-y-2 w-full">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
    <div className="flex gap-3 mt-4 sm:mt-0">
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
          if (!["PENDING", "INFO"].includes(newNotification.status)) return;

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
            ...prev,
            {
              ...newNotification,
              user: sender || {
                email: "Unknown",
                name: "Unknown Sender",
                image: null,
              },
            },
          ]);

          if (newNotification.type === "APPROVAL") {
            toast.info(newNotification.message, {
              position: "top-center",
              autoClose: 5000,
              theme: "colored",
            });
          }
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
          if (
            ["PENDING", "INFO"].includes(payload.new.status) ||
            ["PENDING", "INFO"].includes(payload.old.status)
          ) {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? { ...n, ...payload.new } : n
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
          if (["PENDING", "INFO"].includes(payload.old.status)) {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            );
          }
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
      console.error("Error fetching current user:", authError?.message);
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
      const originalNotification = notifications.find(
        (n) => n.id === notificationId
      );

      const { error: notificationUpdateError } = await supabase
        .from("notifications")
        .update({ status: "APPROVED" })
        .eq("id", notificationId);

      if (notificationUpdateError) {
        console.error("Error updating notification:", notificationUpdateError);
        toast.error("Failed to update notification.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      }

      if (originalNotification?.user) {
        const { error: notifyApprovedUserError } = await supabase
          .from("notifications")
          .insert([
            {
              userId: senderId,
              senderId: educator.id,
              type: "APPROVAL",
              message: "🎉 You have been approved to join the organization!",
              status: "INFO",
              organizationId: originalNotification.organizationId,
            },
          ]);

        if (notifyApprovedUserError) {
          console.error(
            "Failed to notify approved user:",
            notifyApprovedUserError
          );
        }
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success("User approved successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      console.error("Error approving user:", response.error);
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

    const { error: userError } = await supabase
      .from("users")
      .update({ organizationId: null, pendingApproval: false })
      .eq("id", senderId);

    const { error: notificationError } = await supabase
      .from("notifications")
      .update({ status: "REJECTED" })
      .eq("id", notificationId);

    if (userError || notificationError) {
      toast.error("Failed to reject request. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success("Request rejected successfully.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }

    setLoading(false);
  };

  const handleDismiss = async (notificationId: number) => {
    setLoading(true);
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      toast.error("Failed to dismiss notification.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success("Notification dismissed.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }

    setLoading(false);
  };

  const hasApprovalNotification = notifications?.some(
    (n) => n.type === "APPROVAL" && n.status === "INFO"
  );

  const skeletonCount = Math.max(initialNotifications.length, 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-on-load mb-12">
          <FaBell className="text-6xl text-teal-600 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-800">
            Notifications
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Review and manage requests sent to you
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(skeletonCount)].map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 text-xl mt-12">
              No notifications available!
            </p>
            {hasApprovalNotification && (
              <button
                onClick={() => router.push("/lesson-plan")}
                className="mt-4 bg-teal-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-teal-600 transition-all duration-300"
              >
                Proceed to Lesson Plan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map((notification) => {
              const user = notification.user || {
                email: null,
                name: null,
                image: null,
              };

              const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
              )}&background=0D8ABC&color=fff`;

              return (
                <div
                  key={notification.id}
                  className="bg-white border border-teal-100 p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 animate-on-load hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <Image
                      src={user.image || fallbackImage}
                      alt={user.name || "User Avatar"}
                      width={56}
                      height={56}
                      className="rounded-full object-cover border border-gray-200 w-14 h-14"
                    />
                    <div className="space-y-1">
                      <p className="text-gray-900 font-semibold text-lg">
                        {user.name || "Unknown Sender"}
                        {notification.type === "LESSON_DELETION_REQUEST" && (
                          <span className="ml-2 text-sm text-teal-600 font-medium">
                            (Lesson Deletion Request)
                          </span>
                        )}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {user.email || "No email"}
                      </p>
                    </div>
                  </div>
                  {notification.status === "PENDING" ? (
                    <div className="flex gap-3 shrink-0 mt-4 sm:mt-0">
                      <button
                        onClick={() =>
                          handleApprove(
                            notification.id,
                            notification.senderId,
                            notification.type
                          )
                        }
                        disabled={loading}
                        className="flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white w-10 h-10 rounded-full transition duration-300 disabled:opacity-50"
                        title="Approve"
                      >
                        <FaCheckCircle className="text-xl" />
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
                        className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full transition duration-300 disabled:opacity-50"
                        title="Reject"
                      >
                        <FaTimesCircle className="text-xl" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 shrink-0 mt-4 sm:mt-0">
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        disabled={loading}
                        className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white w-10 h-10 rounded-full transition duration-300 disabled:opacity-50"
                        title="Dismiss"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {hasApprovalNotification && (
              <div className="text-center mt-6">
                <button
                  onClick={() => router.push("/lesson-plan")}
                  className="bg-teal-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-teal-600 transition-all duration-300"
                >
                  Proceed to Lesson Plan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
