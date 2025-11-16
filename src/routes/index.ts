import ActiveSurface from "./active-surface.vue"
import ActiveSurfaceCatterpillar from "./active-surface-catterpillar.vue"
import BodypartTexture from "./bodypart-texture.vue"
import CatterpillarBlob from "./catterpillar-blob.vue"
import CatterpillarEyes from "./catterpillar-eyes.vue"
import CatterpillarFalling from "./catterpillar-falling.vue"
import CatterpillarMouth from "./catterpillar-mouth.vue"
import CatterpillarMoving from "./catterpillar-moving.vue"
import CatterpillarMoving2 from "./catterpillar-moving-2.vue"
import CatterpillarMoving3 from "./catterpillar-moving-3.vue"
import CatterpillarMoving4 from "./catterpillar-moving-4.vue"
import ColorSampler from "./color-sampler.vue"
import Door from "./door.vue"
import DoorV2 from "./door-v2.vue"
import FlagColors from "./flag-colors.vue"
import Home from "./home/home.vue"
import IconRoute from "./icon.vue"
import LayoutRoute from "./layout-route.vue"
import Mouth from "./mouth.vue"
import OptionsOverview from "./options-overview/options-overview.vue"
import PageTransitions from "./page-transitions.vue"
import PaperBlobSmooth from "./paper-blob-smooth.vue"
import PhysicsCanvas from "./physics-canvas.vue"
import PhysicsDiv from "./physics-div.vue"
import PhysicsDivTranslate from "./physics-div-translate.vue"
import PhysicsMatterPaper from "./physics-matter-paper.vue"
import PhysicsMatterRender from "./physics-matter-render.vue"
import Screenshot from "./screenshot.vue"
import SpeechBubble from "./speech-bubble.vue"
import svgForeignObject from "./svg-foreign-object.vue"
import { createWebHistory, createRouter } from "vue-router"

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/active-surface",
        name: "Active surface",
        component: ActiveSurface
    },
    {
        path: "/active-surface-catterpillar",
        name: "Active surface catterpillar",
        component: ActiveSurfaceCatterpillar
    },
    {
        path: "/bodypart-texture",
        name: "Bodypart texture",
        component: BodypartTexture
    },
    {
        path: "/catterpillar-blob",
        name: "Catterpillar blob",
        component: CatterpillarBlob
    },
    {
        path: "/catterpillar-eyes",
        name: "Catterpillar eyes",
        component: CatterpillarEyes
    },
    {
        path: "/catterpillar-falling",
        name: "Catterpillar falling",
        component: CatterpillarFalling
    },
    {
        path: "/catterpillar-mouth",
        name: "Catterpillar mouth",
        component: CatterpillarMouth
    },
    {
        path: "/catterpillar-moving",
        name: "Catterpillar moving",
        component: CatterpillarMoving
    },
    {
        path: "/catterpillar-moving-2",
        name: "Catterpillar moving 2",
        component: CatterpillarMoving2
    },
    {
        path: "/catterpillar-moving-3",
        name: "Catterpillar moving 3",
        component: CatterpillarMoving3
    },
    {
        path: "/catterpillar-moving-4",
        name: "Catterpillar moving 4",
        component: CatterpillarMoving4
    },
    {
        path: "/color-sampler",
        name: "Color sampler",
        component: ColorSampler
    },
    {
        path: "/door",
        name: "Door",
        component: Door
    },
    {
        path: "/door-v2",
        name: "Door V2",
        component: DoorV2
    },
    {
        path: "/flag-colors",
        name: "Flag colors",
        component: FlagColors
    },
    {
        path: "/layout",
        name: "Layout",
        component: LayoutRoute
    },
    {
        path: "/mouth",
        name: "Mouth",
        component: Mouth
    },
    {
        path: "/options-overview",
        name: "Options overview",
        component: OptionsOverview
    },
    {
        path: "/page-transitions",
        name: "Page transitions",
        component: PageTransitions
    },
    {
        path: "/paperjs-blob-smooth",
        name: "PaperJS Blob (smooth)",
        component: PaperBlobSmooth
    },
    {
        path: "/physics-canvas",
        name: "Physics Canvas API",
        component: PhysicsCanvas
    },
    {
        path: "/physics-div-position",
        name: "Physics <div> position",
        component: PhysicsDiv
    },
    {
        path: "/physics-div-translate",
        name: "Physics <div> translate",
        component: PhysicsDivTranslate
    },
    {
        path: "/physics-matterjs-paperjs",
        name: "Physics Matter-JS PaperJS",
        component: PhysicsMatterPaper
    },
    {
        path: "/physics-matterjs-render",
        name: "Physics Matter-JS Render",
        component: PhysicsMatterRender
    },
    {
        path: "/screenshot",
        name: "Screenshot",
        component: Screenshot
    },
    {
        path: "/site-icons",
        name: "Site icons",
        component: IconRoute
    },
    {
        path: "/speech-bubble",
        name: "Speech bubble",
        component: SpeechBubble
    },
    {
        path: "/svg-foreign-object",
        name: "SVG Foreign Object",
        component: svgForeignObject
    }
]

////////////////////////////////////////////////////////////////////////
// IMPORTANT NOTICE
// The code above will be updated via the `yarn new-route` command
// Be cautious when you make custom modifications (it should just work, 
// but just pay extra attention during your commits)
//
// - Jeffrey Arts, July 2024
////////////////////////////////////////////////////////////////////////



const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
