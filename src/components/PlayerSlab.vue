<script setup lang="ts">
import { reactive, watch, type RendererElement, type RendererNode, type VNode } from 'vue';
import Hammer from 'hammerjs';
import { createLerp, clamp } from '@/maths';
import { isArbolBlanco } from '@/arbol-blanco';


const maxSwipe = 128;
const imageSize = 32;
const maxMovement = Math.floor(imageSize * 1.5);
const shadowSize = 10;

const swipeDomain: [number, number] = [0, maxMovement];

const swipeLerpUnmodified = createLerp(swipeDomain);
const modifierSwipe = (dist: number) => Math.sqrt(dist);
const lerpSwipe = swipeLerpUnmodified(modifierSwipe);
const clampSwipe = clamp([-maxSwipe, maxSwipe]);

const swipeShadow = createLerp([0, shadowSize])((t: number) => 1 - t*t);

const proportionize = (value: number, maxValue: number) => value/maxValue;

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    isGM: Boolean,
    isArbolBlanco: Boolean,
    deltaX: {
        type: Number,
        required: true
    }
});

const emits = defineEmits(["swipeRight", "swipeLeft", "changeSecretWord", "newRound", "deltaX"]);

let alreadyFired = false;

const slabInnerStyle = reactive({
  transform: "none",
  boxShadow:"none",
  translateX: 0
});
const textStyle = reactive({
    transform: "none"
})

const animate = (proportionizedSignedDelta: number) => {
    const proportionizedDelta = Math.abs(proportionizedSignedDelta);
    const translateX = lerpSwipe(proportionizedDelta) * Math.sign(proportionizedSignedDelta);
    slabInnerStyle.transform = `translateX(${translateX}px)`;
    slabInnerStyle.boxShadow = `0px 0px ${swipeShadow(proportionizedDelta)}px ${swipeShadow(proportionizedDelta)}px rgba(0,0,0,0.75)`;
    slabInnerStyle.translateX = translateX;
}
const putInPlace = (isGM: boolean, isArbolBlanco: boolean) => {
    let translateX;
    if (isArbolBlanco) {
        translateX = maxMovement;
        slabInnerStyle.boxShadow = `0px 0px 0px 0px rgba(0,0,0,0.75)`;
    } else if (isGM) {
        translateX = -maxMovement;
        slabInnerStyle.boxShadow = `0px 0px 0px 0px rgba(0,0,0,0.75)`;
    } else {
        translateX = 0;
    }
    slabInnerStyle.translateX = translateX;
    slabInnerStyle.transform = `translateX(${translateX}px)`;
}
watch(() => ({isGM: props.isGM, isArbolBlanco: props.isArbolBlanco}), (current, old) => {
    let {isArbolBlanco, isGM}= current;
    putInPlace(isGM, isArbolBlanco);
});
watch(() => props.deltaX, current => {
    animate(current);
})
watch(() => slabInnerStyle.translateX, current => {
    textStyle.transform = `translateX(${-current}px)`;
})


function onMounted(event: VNode<RendererNode, RendererElement, {
    [key: string]: any;
}>) {
    if (event.el === null) return;
    const hammer = new Hammer(event.el as HTMLElement);
    hammer.on("panstart panmove panend", ev => {
        if (ev.type == "panstart") {
            alreadyFired = false;
        }
        if (ev.type == "panend" && !alreadyFired) {
            if (Math.abs(ev.deltaX) > maxSwipe/2) {
                if (ev.deltaX > 0) {
                    emits("swipeRight");
                    alreadyFired = true;
                } else if (ev.deltaX < 0) {
                    emits("swipeLeft");
                    alreadyFired = true;   
                }
            }
            putInPlace(props.isGM,props.isArbolBlanco);
        }
        if (ev.type == "panmove") {
            emits('deltaX', proportionize(clampSwipe(ev.deltaX) ,maxSwipe));
        }
    });
}


putInPlace(props.isGM, props.isArbolBlanco);

</script>

<template>
        <div class="slab">
            <div class="modifier behind left"><img src="buttonImages/arbolBlanco.png" alt="ArbolBlanco" :width="imageSize" :height="imageSize"/></div>
            <div class="modifier behind right"><img src="buttonImages/GM.png" alt="GM" :width="imageSize" :height="imageSize"/></div>
            <div class="slab-inner"  v-on:vnode-mounted="onMounted($event)" :style="slabInnerStyle">
                <span :style="textStyle">{{name}}</span>
            </div>
        </div>
</template>

<style scoped>
.slab {
    border: black solid;
    border-width: 2px 4px;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    width: 100%;
    position: relative;
    overflow: hidden;
    
    
}
.slab-inner {
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: white;
    min-height: 40px;
    cursor: pointer;
}

.slab span {
    margin-right: auto;
    margin-left: auto;
}

.slab:first-child {
    border-width: 4px 4px 2px 4px;
}

.slab:last-child {
    border-width: 2px 4px 4px 4px;
}

.slab>* {
    padding: 3px;
}

.modifier {
    min-width: 30px;
}

.behind {
    position: absolute;
}
.left {
    left: 3px;
}
.right {
    right: 3px;
}
img {
    image-rendering: pixelated;
}
</style>