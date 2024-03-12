import { createWebHistory, createRouter } from "vue-router"
import Home from "./home/home.vue"
import ActiveSurface from "./active-surface.vue"
import PaperBlobSmooth from "./paper-blob-smooth.vue"
import PhysicsDiv from "./physics-div.vue"
import PhysicsDivTranslate from "./physics-div-translate.vue"
import PhysicsCanvas from "./physics-canvas.vue"
import PhysicsMatterRender from "./physics-matter-render.vue"
import PhysicsMatterPaper from "./physics-matter-paper.vue"
import OptionsOverview from "./options-overview/options-overview.vue"
import svgForeignObject from "./svg-foreign-object.vue"

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
        path: "/physics-div-position",
        name: "Physics <div> position",
        component: PhysicsDiv,
    },
    {
        path: "/physics-div-translate",
        name: "Physics <div> translate",
        component: PhysicsDivTranslate,
    },
    {
        path: "/physics-canvas",
        name: "Physics Canvas API",
        component: PhysicsCanvas,
    },
    {
        path: "/physics-matterjs-render",
        name: "Physics Matter-JS Render",
        component: PhysicsMatterRender,
    },
    {
        path: "/physics-matterjs-paperjs",
        name: "Physics Matter-JS PaperJS",
        component: PhysicsMatterPaper,
    },
    {
        path: "/paperjs-blob-smooth",
        name: "PaperJS Blob (smooth)",
        component: PaperBlobSmooth,
    },
    {
        path: "/svg-foreign-object",
        name: "SVG Foreign Object",
        component: svgForeignObject,
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router