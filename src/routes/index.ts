import { createWebHistory, createRouter } from "vue-router"
import Home from "./home/home.vue"
import ActiveSurface from "./active-surface.vue"
import PhysicsDiv from "./physics-div.vue"
import PhysicsCanvas from "./physics-canvas.vue"
import OptionsOverview from "./options-overview/options-overview.vue"

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/active-surface",
        name: "Active surface",
        component: ActiveSurface,
    },
    {
        path: "/options-overview",
        name: "Options overview",
        component: OptionsOverview,
    },
    {
        path: "/physics-div",
        name: "Physics <div> position",
        component: PhysicsDiv,
    },
    {
        path: "/physics-canvas",
        name: "Physics Canvas API",
        component: PhysicsCanvas,
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router