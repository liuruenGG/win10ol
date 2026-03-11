<template>
    <div id="app">
        <router-view />

        <!-- 全局通知系统 -->
        <div class="notification-container" v-if="notificationsVisible">
            <TransitionGroup name="notification">
                <div v-for="n in notificationStore.notifications.filter(n => n.showToast !== false)" :key="n.id"
                    :class="['notification-item', n.type]" @click="notificationStore.remove(n.id)">
                    <div class="notification-icon">
                        <span v-if="n.type === 'success'">✓</span>
                        <span v-else-if="n.type === 'error'">✕</span>
                        <span v-else-if="n.type === 'warning'">!</span>
                        <span v-else>ℹ</span>
                    </div>
                    <div class="notification-content">{{ n.message }}</div>
                </div>
            </TransitionGroup>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification';
import { useScheduleStore } from '@/stores/schedule';
import { useSystemStore } from '@/stores/system';
import { onMounted, watch, ref } from 'vue';

const notificationStore = useNotificationStore();
const scheduleStore = useScheduleStore();
const systemStore = useSystemStore();

const notificationsVisible = ref(false);

watch(() => systemStore.isLocked, (locked) => {
    if (locked) {
        notificationsVisible.value = false;
    } else {
        setTimeout(() => {
            notificationsVisible.value = true;
        }, 3000);
    }
}, { immediate: true });

watch(notificationsVisible, (val) => {
    if (val) {
        checkTodaySchedules();
    }
});

watch(() => scheduleStore.events, () => {
    checkTodaySchedules();
}, { deep: true });

const checkTodaySchedules = () => {
    if (!notificationsVisible.value) return;

    const today = new Date();
    const events = scheduleStore.getEventsByDate(today);

    events.forEach(event => {
        let message = '';
        if (event.content.includes('生日')) {
            message = '今天是生日，祝你生日快乐!';
        } else {
            message = `今天是 ${event.content}，不要忘记了!`;
        }

        // Avoid duplicates
        const exists = notificationStore.notifications.some(n =>
            n.isSystem && n.source === '日程' && n.message === message
        );

        if (!exists) {
            notificationStore.addSystemNotification(message, '日程');
        }
    });
};
</script>

<style>
/* 全局样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 确保html和body占满整个窗口 */
html,
body,
#app {
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* 全局禁止滚动 */
}

/* 通知系统样式 */
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
}

.notification-item {
    pointer-events: auto;
    min-width: 280px;
    max-width: 400px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    border-left: 4px solid #ccc;
    animation: slideIn 0.3s ease-out;
}

.notification-item.success {
    border-left-color: #4caf50;
}

.notification-item.error {
    border-left-color: #f44336;
}

.notification-item.warning {
    border-left-color: #ff9800;
}

.notification-item.info {
    border-left-color: #2196f3;
}

.notification-icon {
    font-weight: bold;
    font-size: 18px;
}

.success .notification-icon {
    color: #4caf50;
}

.error .notification-icon {
    color: #f44336;
}

.warning .notification-icon {
    color: #ff9800;
}

.info .notification-icon {
    color: #2196f3;
}

.notification-content {
    color: #333;
    font-size: 14px;
    line-height: 1.4;
}

/* 动画 */
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
