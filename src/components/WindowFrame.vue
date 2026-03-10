<template>
    <div class="window-frame">
        <div class="window-draggable-area" @mousedown="handleHeaderMouseDown">
            <slot name="header">
                <div class="default-header">
                    <div class="default-title">
                    </div>
                    <WindowControls :window-id="windowId" :is-maximized="isMaximized" />
                </div>
            </slot>
        </div>

        <div class="window-content-wrapper">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import WindowControls from './WindowControls.vue';

const props = defineProps<{
    title?: string;
    windowId: number;
    isMaximized: boolean;
}>();

const emit = defineEmits<{
    (e: 'drag-start', event: MouseEvent): void
}>();

const handleHeaderMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
        emit('drag-start', e);
    }
};
</script>

<style scoped>
.window-frame {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}
.window-draggable-area {
    width: 100%;
    flex-shrink: 0;
}
.default-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0);
    height: 40px;
    padding-left: 10px;
}
.default-title {
    font-size: 12px;
    user-select: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.window-content-wrapper {
    flex: 1;
    height: 0;
    position: relative;
    /* background-color: #fff; */
}
</style>