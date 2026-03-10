<template>
    <div class="tile-container" :class="{ 'is-dark': systemStore.theme === 'dark' }">
        <draggable v-for="(list, index) in areaLists" :key="index" v-model="areaLists[index]"
            :class="['tile-area', `tile-area-${index + 1}`]" group="tiles" handle=".tile-group-header" item-key="id"
            :animation="200" ghost-class="ghost" drag-class="dragging-item" fallback-class="dragging-item"
            :force-fallback="true" fallback-on-body="true" :fallback-tolerance="3" :swap-threshold="0.7">
            <template #item="{ element }">
                <div class="tile-group">
                    <div class="tile-group-header">{{ element.title }}</div>

                    <div class="tile-content">
                        <draggable v-model="element.apps" group="apps" item-key="id" :animation="200" class="tile-grid"
                            ghost-class="ghost-tile" drag-class="dragging-tile" :fallback-tolerance="3">
                            <template #item="{ element: app }">
                                <div class="app-tile" :style="{ backgroundColor: app.bgColor }"
                                    @click="systemStore.openWindow(app.componentName as any, app.name)">
                                    <div class="app-tile-icon">
                                        <img :src="app.icon" :alt="app.name" draggable="false" />
                                    </div>
                                    <div class="app-tile-name">{{ app.name }}</div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </template>
        </draggable>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { useSystemStore } from '@/stores/system';

const systemStore = useSystemStore();

// 单个磁贴应用的数据接口
interface AppTile {
    id: string;
    name: string;
    icon: string;
    componentName: string;
}

// 磁贴组的数据接口
interface TileItem {
    id: number;
    title: string;
    apps: AppTile[];
}

// 辅助函数：根据 APP_CONFIG 生成模拟的磁贴数据
const getAppTile = (componentName: string,): AppTile | null => {
    const appConfig = systemStore.APP_CONFIG.find(app => app.componentName === componentName);
    if (!appConfig) return null;
    return {
        id: `tile-${appConfig.componentName}-${Math.random().toString(36).substr(2, 9)}`, // 生成唯一ID防止key冲突
        name: appConfig.title,
        icon: appConfig.icon,
        componentName: appConfig.componentName,
    };
};

const areaLists = ref<TileItem[][]>([
    [
        {
            id: 1,
            title: '基础应用',
            apps: [
                getAppTile('Microsoft Edge',),
                getAppTile('File Explorer',),
                getAppTile('WinSetting',),
                getAppTile('WinAbout',)
            ].filter(Boolean) as AppTile[]
        },
        {
            id: 2,
            title: '工具',
            apps: [
                getAppTile('Txtreader',),
                getAppTile('Windows Terminal',)
            ].filter(Boolean) as AppTile[]
        },
        {
            id: 3,
            title: '生产力',
            apps: [
                getAppTile('Mincrosoft Excel',),
                getAppTile('Mincrosoft PowerPoint',),
                getAppTile('Mincrosoft Access',)
            ].filter(Boolean) as AppTile[]
        },
    ],
    [],
    []
]);
</script>

<style scoped>
.tile-container {
    display: flex;
    width: 100%;
    height: 100vh;
    /* background-color: rgb(255, 230, 198); */
    flex-direction: row;
    overflow: hidden;
    padding-top: 10px;
    gap: 15px;
}
/* 公用区域样式 */
.tile-area {
    display: flex;
    width: 308px;
    height: 100%;
    flex-shrink: 0;
    flex-direction: column;
    gap: 20px;
    transition: background-color 0.3s;
}
.tile-group {
    width: 308px;
    background-color: transparent;
}
.tile-group-header {
    display: flex;
    width: 308px;
    height: 40px;
    /* background-color: rgb(216, 38, 38);  */
    color: #333;
    font-weight: bold;
    align-items: center;
    font-size: 13px;
    padding-left: 5px;
}
.tile-group-header:hover {
    background-color: rgba(255, 255, 255, 0.2);
}
.tile-content {
    padding: 0;
    margin-top: 4px;
    min-height: 104px;
    /* background-color: cadetblue; */
}
.tile-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    height: 100%;
}
.app-tile {
    width: 100px;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: default;
    transition: transform 0.1s, box-shadow 0.1s;
    user-select: none;
    background-color: rgba(255, 255, 255, 0.40);
}
.app-tile:hover {
    z-index: 1;
}
.app-tile:active {
    transform: scale(0.98);
}
.app-tile-icon img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    margin-bottom: 5px;
}
.app-tile-name {
    font-size: 12px;
    text-align: center;
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: absolute;
    bottom: 5px;
    left: 5px;
    text-align: center;
    color: black;
}
.ghost {
    opacity: 0 !important;
    background: #c8ebfb !important;
    height: 40px !important;
    overflow: hidden;
    transition: opacity 0s linear 0.5s !important;
}
.tile-area .ghost {
    opacity: 0.5 !important;
}
.dragging-item .tile-content {
    display: none !important;
}
.dragging-item {
    height: 40px !important;
    overflow: hidden;
    opacity: 1 !important;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    transform: scale(1.02);
    cursor: grabbing !important;
    z-index: 9999;
    background-color: rgba(201, 201, 201, 0.678);
}
.ghost .tile-content {
    display: none !important;
}
.ghost-tile {
    opacity: 0.3;
    background-color: #ccc !important;
    height: 100px !important;
}
.dragging-tile {
    opacity: 1 !important;
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    cursor: grabbing;
}


.tile-container.is-dark .tile-group-header {
    color: white;
}
.tile-container.is-dark .app-tile-name {
    color: white;
}
.tile-container.is-dark .app-tile {
    background-color: rgba(255, 255, 255, 0.15);
}
.tile-container.is-dark .app-tile:hover {
    background-color: rgba(255, 255, 255, 0.25);
}
</style>