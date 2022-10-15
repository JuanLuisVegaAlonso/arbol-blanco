

<script setup lang="ts">
import { ref, watch } from 'vue';


let props = defineProps({
    text: {
        type: String,
        required: true
    },
    amplitude: {
        type: Number,
        default: 10
    },
    deltaDesfase: {
        type: Number,
        default: 3
    },
    desfase: {
        type: Number,
        default: -Math.PI
    },
    deltaDesfaseEntreLetras: {
        type: Number,
        default: 0
    },
    increaseDesfaseEntreLetras: {
        type: Number,
        default: 0.25
    },
    waveFunction: {
        type: Function,
        default: (x: number) => Math.sin(x)
    }
})

let letters = ref([] as String[]);

watch(() => props.text, (text) => {
    letters.value = text.split("");
}, {immediate: true});




let root=ref(null as any);

const translate = (pos: number) => `translateY(${pos}px)`;

watch(root, rt => {
    root = rt;
    requestAnimationFrame(animate);
} )

let desfase = - Math.PI;
let deltaDesfase = (Math.PI / 180) * props.deltaDesfase;
let deltaDesfaseEntreLetras = (Math.PI / 180) * props.deltaDesfaseEntreLetras;
let increaseDesfaseEntreLetras = (Math.PI / 180) * props.increaseDesfaseEntreLetras;

let amplitude = props.amplitude;

let waveFunction = props.waveFunction; 


function animate(time: DOMHighResTimeStamp) {
    
    desfase += deltaDesfase;
    
    if (desfase > Math.PI) {
        desfase = -Math.PI;
    }

    deltaDesfaseEntreLetras +=  increaseDesfaseEntreLetras;

    if (deltaDesfaseEntreLetras > Math.PI) {
        deltaDesfaseEntreLetras = -Math.PI;
    }
    const html = root as  unknown as HTMLElement;

    if (html.children) {
        for (let i = 0; i < html.children.length; i++ ) {
            (html.children[i] as HTMLElement).style.transform= translate(waveFunction(desfase + (deltaDesfaseEntreLetras * i)) * amplitude);
        }
    }
    requestAnimationFrame(animate);
}

</script>

<template>
    <div id="animatext-wrapper" ref="root">
        <span v-for="letter in letters">{{letter}}</span>
    </div>
</template>

<style scoped>
    #animatext-wrapper {
        position: relative;
        display: flex;
    }
    span {
        min-width: 1em;
    }
    
</style>