import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";

export interface ScheduleEvent {
    id: string;
    content: string;
    date: string;
    createdAt: number;
}

export const useScheduleStore = defineStore("schedule", () => {
    const events = ref<ScheduleEvent[]>([]);

    onMounted(() => {
        const storedEvents = localStorage.getItem("win10_schedules");
        if (storedEvents) {
            try {
                events.value = JSON.parse(storedEvents);
            } catch (e) {
                console.error("Failed to parse schedules from localStorage", e);
                events.value = [];
            }
        }
    });

    watch(
        events,
        (newEvents) => {
            localStorage.setItem("win10_schedules", JSON.stringify(newEvents));
        },
        { deep: true },
    );

    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const addEvent = (content: string, date: Date) => {
        const dateStr = formatDateKey(date);
        const newEvent: ScheduleEvent = {
            id: Math.random().toString(36).substring(2, 11),
            content,
            date: dateStr,
            createdAt: Date.now(),
        };
        events.value.push(newEvent);
    };

    const removeEvent = (id: string) => {
        const index = events.value.findIndex((e) => e.id === id);
        if (index !== -1) {
            events.value.splice(index, 1);
        }
    };

    const getEventsByDate = (date: Date) => {
        const dateStr = formatDateKey(date);
        return events.value.filter((e) => e.date === dateStr);
    };

    const hasEvents = (date: Date) => {
        const dateStr = formatDateKey(date);
        return events.value.some((e) => e.date === dateStr);
    };

    return {
        events,
        addEvent,
        removeEvent,
        getEventsByDate,
        hasEvents,
    };
});
