import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon, XCircleIcon, TicketIcon, BellIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext.jsx";

const notificationIcons = {
  REQUEST_APPROVED: CheckCircleIcon,
  REQUEST_REJECTED: XCircleIcon,
  PERMIT_ISSUED: TicketIcon,
  PERMIT_REVOKED: XCircleIcon
};

const notificationColors = {
  REQUEST_APPROVED: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
  REQUEST_REJECTED: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  PERMIT_ISSUED: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  PERMIT_REVOKED: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
};

export default function NotificationModal({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useAuth();

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900">
                    Notifications
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1 hover:bg-slate-100 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-slate-500" />
                  </button>
                </div>

                {unreadCount > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <BellIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const Icon = notificationIcons[notification.type] || BellIcon;
                      const colorClass = notificationColors[notification.type] || "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800";

                      return (
                        <div
                          key={notification.notification_id}
                          className={`p-3 rounded-lg border ${
                            notification.is_read ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800" : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1">
                                {notification.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.notification_id)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}