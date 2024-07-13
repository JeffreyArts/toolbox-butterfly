import { createWebHistory, createRouter } from "vue-router"
import Home from "./home/home.vue"
import ActiveSurface from "./active-surface.vue"
import ActiveSurfaceCatterpillar from "./active-surface-catterpillar.vue"
import PaperBlobSmooth from "./paper-blob-smooth.vue"
import CatterpillarBlob from "./catterpillar-blob.vue"
import CatterpillarFalling from "./catterpillar-falling.vue"
import CatterpillarMoving from "./catterpillar-moving.vue"
import CatterpillarMoving2 from "./catterpillar-moving-2.vue"
import CatterpillarMoving3 from "./catterpillar-moving-3.vue"
import CatterpillarMoving4 from "./catterpillar-moving-4.vue"
import CatterpillarEyes from "./catterpillar-eyes.vue"
import CatterpillarMouth from "./catterpillar-mouth.vue"
import Door from "./door.vue"
import Mouth from "./mouth.vue"
import PhysicsDiv from "./physics-div.vue"
import PhysicsDivTranslate from "./physics-div-translate.vue"
import PhysicsCanvas from "./physics-canvas.vue"
import PhysicsMatterRender from "./physics-matter-render.vue"
import PhysicsMatterPaper from "./physics-matter-paper.vue"
import Screenshot from "./screenshot.vue"
import FlagColors from "./flag-colors.vue"
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
        path: "/active-surface-catterpillar",
        name: "Active surface catterpillar",
        component: ActiveSurfaceCatterpillar,
    },
    {
        path: "/catterpillar-falling",
        name: "Catterpillar falling",
        component: CatterpillarFalling,
    },
    {
        path: "/catterpillar-blob",
        name: "Catterpillar blob",
        component: CatterpillarBlob,
    },
    {
        path: "/catterpillar-moving",
        name: "Catterpillar moving",
        component: CatterpillarMoving,
    },
    {
        path: "/catterpillar-moving-2",
        name: "Catterpillar moving 2",
        component: CatterpillarMoving2,
    },
    {
        path: "/catterpillar-moving-3",
        name: "Catterpillar moving 3",
        component: CatterpillarMoving3,
    },
    {
        path: "/catterpillar-moving-4",
        name: "Catterpillar moving 4",
        component: CatterpillarMoving4,
    },
    {
        path: "/catterpillar-eyes",
        name: "Catterpillar eyes",
        component: CatterpillarEyes,
    },
    {
        path: "/catterpillar-mouth",
        name: "Catterpillar mouth",
        component: CatterpillarMouth,
    },
    {
        path: "/door",
        name: "Door",
        component: Door,
    },
    {
        path: "/flag-colors",
        name: "Flag colors",
        component: FlagColors,
    },
    {
        path: "/mouth",
        name: "Mouth",
        component: Mouth,
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
    },
    {
        path: "/screenshot",
        name: "Screenshot",
        component: Screenshot,
    },
    {
        path: "/options-overview",
        name: "Options overview",
        component: OptionsOverview,
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router