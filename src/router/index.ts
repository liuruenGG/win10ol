import { createRouter, createWebHistory } from 'vue-router'
import windows from '@/views/windows.vue'


const routes = [
    {
        path: '/',
        redirect: '/windows'
    },
    {
        path: '/windows',
        name: 'windows',
        component: windows
    },

]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})


export default router
