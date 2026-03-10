<template>
    <div class="app-list-container" :class="{ 'is-dark': systemStore.theme === 'dark' }" ref="listContainer">
        <Transition name="win-switch" mode="out-in" @enter="handleEnter">
            <div v-if="isPickerOpen" class="alphabet-picker" key="picker">
                <div class="picker-content-wrapper">
                    <div class="picker-grid">
                        <div v-for="char in alphabet" :key="char"
                            :class="['picker-item', { 'active': availableLetters.includes(char) }]"
                            @click="scrollToLetter(char)">
                            <span class="char-text">{{ char }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="list-view-wrapper" key="list">
                <div class="app-list-container-top" @click="togglePicker">
                    <div class="app-list-container-top-name">最近使用</div>
                </div>

                <div v-for="group in groupedApps" :key="group.letter" :id="'group-' + group.letter" class="app-group">
                    <div class="group-letter" @click="togglePicker">{{ group.letter }}</div>

                    <div v-for="app in group.items" :key="app.componentName" class="app-list-item"
                        @click="handleAppClick(app)">
                        <div class="app-item-icon">
                            <img :src="app.icon" :alt="app.title" />
                        </div>
                        <div class="app-item-info">
                            <span class="app-item-title">{{ app.title }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { useSystemStore } from '../stores/system';

const systemStore = useSystemStore();
const emit = defineEmits(['close-menu']);
const listContainer = ref<HTMLElement | null>(null);
const isPickerOpen = ref(false);
const pendingScrollChar = ref<string | null>(null);
const alphabet = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const getFirstLetter = (str: string): string => {
    if (!str) return '#';
    const firstChar = str.charAt(0);
    if (/[a-zA-Z]/.test(firstChar)) return firstChar.toUpperCase();
    const dict: Record<string, string> = {
        'A': '阿', 'B': '八', 'C': '擦', 'D': '搭', 'E': '蛾', 'F': '发', 'G': '个',
        'H': '哈', 'I': '级', 'J': '级', 'K': '卡', 'L': '啦', 'M': '妈', 'N': '拿',
        'O': '哦', 'P': '啪', 'Q': '期', 'R': '然', 'S': '撒', 'T': '塌',
        'W': '挖', 'X': '昔', 'Y': '压', 'Z': '匝'
    };
    const letters = Object.keys(dict).sort();
    for (let i = letters.length - 1; i >= 0; i--) {
        const letter = letters[i];
        if (letter && firstChar.localeCompare(dict[letter] ?? '', 'zh-CN') >= 0) return letter;
    }
    return '#';
};
const groupedApps = computed(() => {
    const groups: Record<string, any[]> = {};
    systemStore.APP_CONFIG.forEach(app => {
        const letter = getFirstLetter(app.title);
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(app);
    });
    return Object.keys(groups).sort((a, b) => a === '#' ? -1 : a.localeCompare(b)).map(letter => ({
        letter,
        items: groups[letter]?.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN')) || []
    }));
});
const availableLetters = computed(() => groupedApps.value.map(g => g.letter));
const togglePicker = () => {
    isPickerOpen.value = !isPickerOpen.value;
};

const scrollToLetter = (char: string) => {
    if (!availableLetters.value.includes(char)) return;
    pendingScrollChar.value = char;
    isPickerOpen.value = false;
};
const handleEnter = async () => {
    if (pendingScrollChar.value && listContainer.value) {
        await nextTick();
        const targetId = `group-${pendingScrollChar.value}`;
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const targetOffsetTop = targetElement.offsetTop;
            const containerPaddingTop = 10;
            const finalScrollTop = targetOffsetTop + containerPaddingTop;
            listContainer.value.scrollTo({
                top: finalScrollTop,
                behavior: 'auto' 
            });
        }
        pendingScrollChar.value = null;
    }
};
const handleAppClick = (app: any) => {
    systemStore.openWindow(app.componentName, app.title);
    emit('close-menu');
};
</script>

<style scoped>
.app-list-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 10px 0;
    background: transparent;
    overflow-y: overlay;
    overflow-x: hidden;
}
.app-list-container::-webkit-scrollbar {
    width: 12px;
}
.app-list-container::-webkit-scrollbar-thumb {
    background-color: transparent;
    background-clip: padding-box;
    border: 5px solid transparent;
    transition: background-color 0.2s, border 0.1s;
}
.app-list-container:hover::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
}
.app-list-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.6) !important;
    border-width: 2px !important;
    transition: background-color 0.2s 1s, border-width 0.1s 1s;
}
.app-list-container::-webkit-scrollbar-thumb:active {
    background-color: rgba(255, 255, 255, 0.8) !important;
    border-width: 2px !important;
}
@supports not selector(::-webkit-scrollbar) {
    .app-list-container {
        scrollbar-width: none;
    }

    .app-list-container:hover {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
    }
}
/* 深色主题适配 */
.app-list-container.is-dark .char-text,
.app-list-container.is-dark .app-list-container-top-name,
.app-list-container.is-dark .group-letter,
.app-list-container.is-dark .app-item-title {
    color: white;
}
.app-list-container.is-dark .picker-item {
    color: white;
}
.app-list-container.is-dark .picker-item.active {
    background: rgba(255, 255, 255, 0.2);
}
.app-list-container.is-dark .picker-item.active:hover {
    outline: 2px solid rgba(255, 255, 255, 0.4);
}
.app-list-container.is-dark .app-list-item:hover,
.app-list-container.is-dark .group-letter:hover,
.app-list-container.is-dark .app-list-container-top:hover {
    background-color: rgba(255, 255, 255, 0.1);
}


.alphabet-picker {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    z-index: 100;
    display: flex;
    flex-direction: column;
}
.picker-content-wrapper {
    width: 100%;
    height: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
}
.picker-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    width: 100%;
    max-width: 280px;
    align-items: center;
}
.picker-item {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0);
    color: rgb(255, 255, 255);
    font-size: 14px;
    cursor: default;
    transition: transform 0.1s;
}
.picker-item.active {
    background: #ffffff58;
    color: white;
    cursor: pointer;
}
.picker-item.active:hover {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    z-index: 2;
}
.picker-item.active:active {
    transform: scale(0.9);
}
.char-text {
    font-weight: 400;
    color: rgba(0, 0, 0, 0.8);
}


.list-view-wrapper {
    width: 100%;
}
.app-list-container-top {
    display: flex;
    width: 100%;
    height: 38px;
    cursor: pointer;
    align-items: center;
}
.app-list-container-top-name {
    font-size: 13px;
    margin-left: 10px;
    color: rgb(0, 0, 0);
}
.app-list-container-top:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.group-letter {
    color: rgb(0, 0, 0);
    font-size: 14px;
    height: 38px;
    padding-left: 20px;
    position: relative;
    top: 0;
    z-index: 2;
    cursor: pointer;
    display: flex;
    align-items: center;
    background-color: transparent;
    flex-shrink: 0;
    overflow: hidden;
}
.group-letter:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: rgb(0, 0, 0);
}
.app-list-item {
    display: flex;
    align-items: center;
    padding: 0 15px;
    height: 38px;
    cursor: pointer;
    position: relative;
    z-index: 1;
}
.app-list-item:hover {
    background-color: rgba(255, 255, 255, 0.15);
}
.app-item-icon {
    width: 22px;
    height: 22px;
    margin-right: 12px;
    display: flex;
    align-items: center;
}
.app-item-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.app-item-title {
    color: rgb(0, 0, 0);
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}


.win-switch-enter-active,
.win-switch-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.win-switch-enter-from {
    opacity: 0;
    transform: scale(0.92);
}
.win-switch-leave-to {
    opacity: 0;
    transform: scale(1.05);
}
</style>