<template>
    <div class="calendar-wrapper" :class="{ 'light-theme': systemStore.theme === 'light' }">
        <!-- 顶部钟表 -->
        <div class="calendar-clock-section">
            <div class="digital-clock">{{ formatTime(currentTime) }}</div>
            <div class="full-date">{{ formatDateLong(currentTime) }}</div>
        </div>

        <!-- 日历网格部分 -->
        <div class="calendar-container">
            <div class="calendar-header">
                <div class="current-month" @click="toggleView">
                    {{ yearMonthDisplay }}
                    <i class="chevron-right"></i>
                </div>
                <div class="calendar-controls">
                    <button class="control-btn" @click="changeMonth(-1)">
                        <i class="chevron-up"></i>
                    </button>
                    <button class="control-btn" @click="changeMonth(1)">
                        <i class="chevron-down"></i>
                    </button>
                </div>
            </div>

            <div class="view-content-wrapper">
                <Transition :name="viewTransitionName" mode="out-in">
                    <div :key="currentView">
                        <!-- 月份视图 -->
                        <div v-if="currentView === 'month'">
                            <div class="calendar-weekdays">
                                <span v-for="day in weekDays" :key="day">{{ day }}</span>
                            </div>

                            <div class="calendar-grid reveal-grid" @mousemove="handleMouseMove">
                                <div v-for="(date, index) in calendarDays" :key="index" class="calendar-day" :class="{
                                    'not-current': !date.isCurrentMonth,
                                    'is-today': date.isToday,
                                    'is-selected': isSelected(date),
                                    'has-events': hasSchedule(date)
                                }" @click="selectDate(date)">
                                    <span class="day-text">{{ date.day }}</span>
                                    <div v-if="hasSchedule(date)" class="event-dot"></div>
                                </div>
                            </div>
                        </div>

                        <!-- 年视图 -->
                        <div v-else-if="currentView === 'year'" class="year-grid reveal-grid"
                            @mousemove="handleMouseMove">
                            <div v-for="(month, index) in months" :key="month" class="year-month-item" :class="{
                                'is-this-month': index === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear(),
                                'is-selected': index === viewDate.getMonth()
                            }" @click="selectMonth(index)">
                                {{ month }}
                            </div>
                        </div>

                        <!-- 十年视图 -->
                        <div v-else class="decade-grid reveal-grid" @mousemove="handleMouseMove">
                            <div v-for="year in years" :key="year" class="year-month-item" :class="{
                                'is-this-year': year === new Date().getFullYear(),
                                'not-current': year < Math.floor(viewDate.getFullYear() / 10) * 10 || year > Math.floor(viewDate.getFullYear() / 10) * 10 + 9,
                                'is-selected': year === viewDate.getFullYear()
                            }" @click="selectYear(year)">
                                {{ year }}
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>

            <div class="calendar-footer">
                <div class="agenda-header">
                    <div class="agenda-toggle" @click="goToToday">今天</div>
                    <div class="selected-day-agenda">{{ formatDateShort(selectedDate) }}</div>
                </div>
                <div class="agenda-input-wrapper">
                    <input type="text" placeholder="添加日程或提醒" class="agenda-input" v-model="newEventContent"
                        @keyup.enter="addNewEvent" />
                </div>
                <div class="agenda-list">
                    <div v-if="currentSchedules.length === 0" class="agenda-item empty">暂无日程</div>
                    <div v-for="event in currentSchedules" :key="event.id" class="agenda-item-active">
                        <span class="event-content">{{ event.content }}</span>
                        <button class="delete-event" @click="removeSchedule(event.id)">
                            <i class="close-icon"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSystemStore } from '../stores/system';
import { useScheduleStore } from '../stores/schedule';
import { storeToRefs } from 'pinia';

const systemStore = useSystemStore();
const scheduleStore = useScheduleStore();
const { currentTime } = storeToRefs(systemStore);

const viewDate = ref(new Date());
const selectedDate = ref(new Date());
const currentView = ref<'month' | 'year' | 'decade'>('month');
const viewTransitionName = ref('view-fade');
const newEventContent = ref('');

const currentSchedules = computed(() => {
    return scheduleStore.getEventsByDate(selectedDate.value);
});

const addNewEvent = () => {
    if (newEventContent.value.trim()) {
        scheduleStore.addEvent(newEventContent.value, selectedDate.value);
        newEventContent.value = '';
    }
};

const removeSchedule = (id: string) => {
    scheduleStore.removeEvent(id);
};

const hasSchedule = (dateObj: any) => {
    return scheduleStore.hasEvents(dateObj.date);
};

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDateLong = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
};

const formatDateShort = (date: Date) => {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    return isToday ? '今天' : date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
};

const yearMonthDisplay = computed(() => {
    if (currentView.value === 'month') {
        return `${viewDate.value.getFullYear()}年${viewDate.value.getMonth() + 1}月`;
    } else if (currentView.value === 'year') {
        return `${viewDate.value.getFullYear()}年`;
    } else {
        const startYear = Math.floor(viewDate.value.getFullYear() / 10) * 10;
        return `${startYear}-${startYear + 9}`;
    }
});

const changeMonth = (delta: number) => {
    viewTransitionName.value = delta > 0 ? 'view-slide-up' : 'view-slide-down';
    if (currentView.value === 'month') {
        viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + delta, 1);
    } else if (currentView.value === 'year') {
        viewDate.value = new Date(viewDate.value.getFullYear() + delta, 0, 1);
    } else {
        viewDate.value = new Date(viewDate.value.getFullYear() + delta * 10, 0, 1);
    }
};

const goToToday = () => {
    viewTransitionName.value = 'view-fade';
    const today = new Date();
    viewDate.value = new Date(today);
    selectedDate.value = new Date(today);
    currentView.value = 'month';
};

const isSelected = (dateObj: any) => {
    if (currentView.value !== 'month') return false;
    return dateObj.date.getDate() === selectedDate.value.getDate() &&
        dateObj.date.getMonth() === selectedDate.value.getMonth() &&
        dateObj.date.getFullYear() === selectedDate.value.getFullYear();
};

const selectDate = (dateObj: any) => {
    selectedDate.value = new Date(dateObj.date);

    if (!dateObj.isCurrentMonth) {
        const viewMonth = viewDate.value.getFullYear() * 12 + viewDate.value.getMonth();
        const targetMonth = dateObj.date.getFullYear() * 12 + dateObj.date.getMonth();
        const monthOffset = targetMonth - viewMonth;
        changeMonth(monthOffset);
    }
};

const calendarDays = computed(() => {
    const year = viewDate.value.getFullYear();
    const month = viewDate.value.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    const today = new Date();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, lastDateOfPrevMonth - i);
        days.push({
            day: d.getDate(),
            date: d,
            isCurrentMonth: false,
            isToday: false
        });
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
        const d = new Date(year, month, i);
        days.push({
            day: i,
            date: d,
            isCurrentMonth: true,
            isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear()
        });
    }

    const remain = 42 - days.length;
    for (let i = 1; i <= remain; i++) {
        const d = new Date(year, month + 1, i);
        days.push({
            day: i,
            date: d,
            isCurrentMonth: false,
            isToday: false
        });
    }

    return days;
});

const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const selectMonth = (index: number) => {
    viewTransitionName.value = 'view-zoom-in';
    viewDate.value = new Date(viewDate.value.getFullYear(), index, 1);
    currentView.value = 'month';
};

const years = computed(() => {
    const startYear = Math.floor(viewDate.value.getFullYear() / 10) * 10;
    const arr = [];
    for (let i = -1; i < 11; i++) {
        arr.push(startYear + i);
    }
    return arr;
});

const selectYear = (year: number) => {
    viewTransitionName.value = 'view-zoom-in';
    viewDate.value = new Date(year, viewDate.value.getMonth(), 1);
    currentView.value = 'year';
};

const toggleView = () => {
    viewTransitionName.value = 'view-zoom-out';
    if (currentView.value === 'month') {
        currentView.value = 'year';
    } else if (currentView.value === 'year') {
        currentView.value = 'decade';
    }
};

const handleMouseMove = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
    }
};
</script>

<style scoped>
.calendar-wrapper {
    width: 360px;
    background: rgba(30, 30, 30, 0.85);
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    font-family: "Segoe UI", Arial, sans-serif;
    user-select: none;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    /* 主题颜色变量 */
    --accent-color: #785f3b;
    --accent-hover: #8e7146;
    --accent-light: rgba(120, 95, 59, 0.2);
}

/* 浅色主题 */
.calendar-wrapper.light-theme {
    background: rgba(242, 242, 242, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #333;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    --accent-color: #027353;
    --accent-hover: #028e67;
    --accent-light: rgba(2, 115, 83, 0.2);
}

.calendar-wrapper.light-theme .calendar-clock-section {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.calendar-wrapper.light-theme .full-date {
    color: var(--accent-color);
}

.calendar-wrapper.light-theme .calendar-clock-section {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.calendar-wrapper.light-theme .current-month:hover,
.calendar-wrapper.light-theme .control-btn:hover,
.calendar-wrapper.light-theme .year-month-item:hover {
    background: rgba(0, 0, 0, 0.05);
}

.calendar-wrapper.light-theme .control-btn {
    color: #333;
}

.calendar-wrapper.light-theme .chevron-up::before,
.calendar-wrapper.light-theme .chevron-down::before,
.calendar-wrapper.light-theme .reveal-grid {
    background: radial-gradient(circle 100px at var(--mouse-x, -100px) var(--mouse-y, -100px),
            rgba(0, 0, 0, 0.08),
            transparent);
}

.calendar-wrapper.light-theme .year-month-item.not-current,
.calendar-wrapper.light-theme .calendar-day.not-current {
    color: rgba(0, 0, 0, 0.4);
}

.calendar-wrapper.light-theme .calendar-day:hover {
    border-color: rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.03);
}

.calendar-wrapper.light-theme .calendar-day.is-today {
    color: #fff;
}

.calendar-wrapper.light-theme .calendar-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.calendar-wrapper.light-theme .agenda-toggle {
    color: var(--accent-color);
}

.calendar-wrapper.light-theme .selected-day-agenda {
    color: rgba(0, 0, 0, 0.5);
}

.calendar-wrapper.light-theme .agenda-input {
    background: #f9f9f9;
    border: 1px solid rgba(0, 0, 0, 0.2);
    color: #333;
}

.calendar-wrapper.light-theme .agenda-input:focus {
    border-color: var(--accent-color);
    background: #fafafa;
}

.calendar-wrapper.light-theme .agenda-input::placeholder {
    color: rgba(0, 0, 0, 0.4);
}

.calendar-wrapper.light-theme .agenda-item {
    color: rgba(0, 0, 0, 0.6);
}

.calendar-wrapper.light-theme .agenda-item-active {
    background: rgba(0, 0, 0, 0.03);
    color: #333;
}

.calendar-wrapper.light-theme .agenda-item-active:hover {
    background: rgba(0, 0, 0, 0.08);
}

.calendar-wrapper.light-theme .delete-event {
    color: rgba(0, 0, 0, 0.5);
}

.calendar-wrapper.light-theme .delete-event:hover {
    color: #fff;
}

.close-icon::before {
    transform: translate(-50%, -50%) rotate(45deg);
}

.close-icon::after {
    transform: translate(-50%, -50%) rotate(-45deg);
}


/* 顶部钟表 */
.calendar-clock-section {
    padding: 30px 25px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.digital-clock {
    font-size: 42px;
    font-weight: 200;
    line-height: 1;
    margin-bottom: 5px;
}

.full-date {
    font-size: 14px;
    color: var(--accent-color);
    font-weight: 400;
}


/* 日历容器 */
.calendar-container {
    padding: 15px 10px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    margin-bottom: 10px;
}

.current-month {
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background 0.2s;
}

.current-month:hover {
    background: rgba(255, 255, 255, 0.1);
}

.chevron-right::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-left: 1px solid #fff;
    border-top: 1px solid #fff;
}

.chevron-right::before {
    width: 6px;
    height: 6px;
    border-width: 1.5px;
    transform: rotate(135deg);
    opacity: 0.6;
}

.calendar-wrapper.light-theme .chevron-right::before {
    border-color: #333;
}

.calendar-controls {
    display: flex;
    gap: 2px;
}

.control-btn {
    background: transparent;
    border: none;
    color: #fff;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.8;
    transition: background 0.2s;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    opacity: 1;
}

.chevron-up::before {
    transform: rotate(45deg);
    margin-top: 4px;
}

.chevron-down::before {
    transform: rotate(225deg);
    margin-bottom: 4px;
}


/* 视图过渡 */
.view-content-wrapper {
    min-height: 280px;
    position: relative;
    overflow: hidden;
}

.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 5px;
}

.calendar-grid {
    grid-template-columns: repeat(7, 1fr);
}


/* 网格与揭示效果 */
.reveal-grid {
    display: grid;
    position: relative;
    background: radial-gradient(circle 100px at var(--mouse-x, -100px) var(--mouse-y, -100px),
            rgba(255, 255, 255, 0.12),
            transparent);
}

.calendar-day {
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: default;
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    border: 2px solid transparent;
    transition: background 0.2s, border-color 0.2s;
}

.calendar-day:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
}

.calendar-day.not-current {
    color: rgba(255, 255, 255, 0.4);
}

.calendar-day.is-today {
    background-color: var(--accent-color);
    border-color: var(--accent-color);
    font-weight: 600;
}

.calendar-day.is-today:hover {
    background-color: var(--accent-hover);
    border-color: var(--accent-hover);
}

.calendar-day.is-today.is-selected {
    background-color: var(--accent-color);
    border: 2px solid var(--accent-color);
    box-shadow: inset 0 0 0 2px #fff;
    z-index: 2;
}

.calendar-day.is-selected:not(.is-today) {
    border-color: var(--accent-color);
    background-color: var(--accent-light);
}

/* 事件指标 */
.event-dot {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background-color: var(--accent-color);
    border-radius: 50%;
}

.calendar-day.is-today .event-dot {
    background-color: #fff;
}


/* 年视图 */
.year-grid,
.decade-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    padding: 10px 5px;
}

.year-month-item {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
}

.year-month-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
}

.year-month-item.is-this-month,
.year-month-item.is-this-year {
    border-color: var(--accent-color);
    font-weight: 600;
}

.year-month-item.is-selected {
    background-color: var(--accent-color);
    color: white;
}

.year-month-item.not-current {
    color: rgba(255, 255, 255, 0.4);
}


/* 页脚 / 议程 */
.calendar-footer {
    margin-top: 5px;
    padding: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.agenda-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.agenda-toggle {
    font-size: 13px;
    color: var(--accent-color);
    cursor: pointer;
    transition: color 0.2s;
}

.agenda-toggle:hover {
    color: var(--accent-hover);
    text-decoration: underline;
}

.selected-day-agenda {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
}

.agenda-input-wrapper {
    margin-bottom: 15px;
}

.agenda-input {
    width: 100%;
    background: rgba(255, 255, 255, 0);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 12px;
    font-size: 13px;
    color: #fff;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
}

.agenda-input:focus {
    border-color: var(--accent-color);
    background: rgba(255, 255, 255, 0.1);
}

.agenda-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.agenda-list {
    padding-left: 2px;
}

.agenda-item {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.agenda-item.empty {
    padding: 5px 2px;
}

.agenda-item-active {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.05);
    margin-bottom: 4px;
    border-left: 3px solid var(--accent-color);
    font-size: 13px;
    transition: background 0.2s;
}

.agenda-item-active:hover {
    background: rgba(255, 255, 255, 0.1);
}

.event-content {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 10px;
}

.delete-event {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s, background 0.2s;
    border-radius: 2px;
}

.delete-event:hover {
    color: #fff;
    background: rgba(255, 0, 0, 0.3);
}

.close-icon {
    position: relative;
    width: 10px;
    height: 10px;
}

.close-icon::before,
.close-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 1px;
    background-color: currentColor;
}


.view-fade-enter-active,
.view-fade-leave-active {
    transition: opacity 0.2s;
}

.view-fade-enter-from,
.view-fade-leave-to {
    opacity: 0;
}


.view-zoom-in-enter-active,
.view-zoom-in-leave-active,
.view-zoom-out-enter-active,
.view-zoom-out-leave-active,
.view-slide-up-enter-active,
.view-slide-up-leave-active,
.view-slide-down-enter-active,
.view-slide-down-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-zoom-in-enter-from {
    transform: scale(1.1);
    opacity: 0;
}

.view-zoom-in-leave-to {
    transform: scale(0.9);
    opacity: 0;
}

.view-zoom-out-enter-from {
    transform: scale(0.9);
    opacity: 0;
}

.view-zoom-out-leave-to {
    transform: scale(1.1);
    opacity: 0;
}


.view-slide-up-enter-from {
    transform: translateY(20px);
    opacity: 0;
}

.view-slide-up-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}

.view-slide-down-enter-from {
    transform: translateY(-20px);
    opacity: 0;
}

.view-slide-down-leave-to {
    transform: translateY(20px);
    opacity: 0;
}
</style>