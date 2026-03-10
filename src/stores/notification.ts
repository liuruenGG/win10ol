import { defineStore } from "pinia";
import { ref } from "vue";

export interface Notification {
    id: string;
    type: "info" | "success" | "warning" | "error";
    message: string;
    duration?: number;
    source?: string;
    isSystem?: boolean;
    timestamp?: number;
    showToast?: boolean;
    category?: string;
}

export const useNotificationStore = defineStore("notification", () => {
    const notifications = ref<Notification[]>([]);

    const add = (
        message: string,
        type: Notification["type"] = "info",
        duration = 3000,
        source?: string,
        isSystem: boolean = false,
    ) => {
        const id = crypto.randomUUID();
        const category = ["系统", "日程", "设置"].includes(source || "")
            ? "系统"
            : "应用";
        const notification: Notification = {
            id,
            type,
            message,
            duration,
            source: source || "系统",
            isSystem,
            timestamp: Date.now(),
            showToast: true,
            category,
        };
        notifications.value.push(notification);

        if (duration > 0) {
            setTimeout(() => {
                if (isSystem) {
                    const n = notifications.value.find((item) => item.id === id);
                    if (n) n.showToast = false;
                } else {
                    remove(id);
                }
            }, duration);
        }
        return id;
    };

    const remove = (id: string) => {
        notifications.value = notifications.value.filter((n) => n.id !== id);
    };

    const clearBySource = (source: string) => {
        notifications.value = notifications.value.filter(
            (n) => n.source !== source,
        );
    };

    const clearByCategory = (category: string) => {
        notifications.value = notifications.value.filter(
            (n) => n.category !== category,
        );
    };

    const clearAllSystem = () => {
        notifications.value = notifications.value.filter((n) => !n.isSystem);
    };

    const error = (message: string, duration = 5000) =>
        add(message, "error", duration);
    const success = (message: string, duration = 3000) =>
        add(message, "success", duration);
    const warning = (message: string, duration = 4000) =>
        add(message, "warning", duration);
    const info = (message: string, duration = 3000) =>
        add(message, "info", duration);

    const addSystemNotification = (message: string, source: string) => {
        return add(message, "info", 5000, source, true);
    };

    return {
        notifications,
        add,
        remove,
        clearBySource,
        clearByCategory,
        clearAllSystem,
        error,
        success,
        warning,
        info,
        addSystemNotification,
    };
});
