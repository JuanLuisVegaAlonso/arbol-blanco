<script setup lang="ts">
import { createLerp } from '@/maths';
import { ref, watchEffect } from 'vue';

type Particle = {
    pos: [number, number];
    size: number;
    color: [number, number, number];
    speed: [number, number]
}

type Link = {
    from: Particle;
    to: Particle;
    gradient: CanvasGradient;
}

const availableColors:[number, number, number][] = [
    [255, 255, 0],
    [255, 0, 0],
    [255, 0, 255],
    [0, 255, 255],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0]
]

const maxRes = [1920, 1080];
const numberOfParticles = 50;
const maxSpeed = 1.25;
const particles: Particle[] = [];
const closenessRadius = 200;
const closenessRadiusSquared = closenessRadius * closenessRadius;
const speedRadius = 10;


const closenessWeigth = 70;
const speedWeigth = 30;

const canvas = ref(null as unknown as HTMLCanvasElement);

watchEffect(() => {
    console.log(canvas.value);
    if (canvas.value) {
        calculateResolution()
        const ctx = canvas.value.getContext('2d')!;
        //ctx.globalCompositeOperation = "destination-out";
        createParticles();
        particles.forEach(drawParticle);
        window.requestAnimationFrame(animate);
    }
});

function calculateResolution() {
    if (canvas.value) {
        const {innerHeight, innerWidth} = window;
        canvas.value.height = maxRes[1] > innerHeight ? innerHeight: maxRes[1];
        canvas.value.width = maxRes[0] > innerWidth ? innerWidth: maxRes[0];
        console.log({innerWidth, innerHeight});


        const ctx = canvas.value.getContext('2d')!;
        //ctx.shadowBlur = 40;
    } 
}


function randomInCanvas(): [number, number] {
    const x = Math.floor(Math.random() * canvas.value.width + 1);
    const y = Math.floor(Math.random() * canvas.value.height + 1);
    return [x,y];
}

function randomSpeed(): [number, number] {
    const vx = Math.random() * maxSpeed * 2 - maxSpeed;
    const vy = Math.random() * maxSpeed * 2 - maxSpeed;
    return [vx, vy];
}

function randomColor(): [number, number, number] {
    const index = Math.floor(Math.random() * availableColors.length);
    return availableColors[index];
}

function createParticles() {
    for(let i = 0; i < numberOfParticles; i++) {
        particles.push({
            color: randomColor(),
            pos: randomInCanvas(),
            size: 10,
            speed: randomSpeed()
        })
    }
}

function distanceSquared(pointOne: [number, number], pointTwo: [number, number]) {
    const x = pointTwo[0] - pointOne[0];
    const y = pointTwo[1] - pointOne[1];
    return x*x +y*y;
}

function toRgba(color: [number,number,number], alpha: number) {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function loopBoundary(particle: Particle) {

    if (particle.pos[0] < 0) {
        particle.pos[0] = canvas.value.width;
    }
    if (particle.pos[0] > canvas.value.width) {
        particle.pos[0] = 0;
    }
    if (particle.pos[1] < 0) {
        particle.pos[1] = canvas.value.height;
    }
    if (particle.pos[1] > canvas.value.height) {
        particle.pos[1] = 0;
    }
}

function updateParticle(particle: Particle) {
    particle.pos = [particle.pos[0]  + particle.speed[0], particle.pos[1] + particle.speed[1]];
    loopBoundary(particle);
}

function getLinks(): Link[] {
    //TODO Optimize this in the future
    const ctx = canvas.value.getContext('2d')!;
    
    const links: Link[] = [];
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dist = distanceSquared(particles[i].pos, particles[j].pos);
            if (dist < closenessRadiusSquared) {
                const gradient = ctx.createLinearGradient(...particles[i].pos, ...particles[j].pos);
                const alpha = (createLerp([0, 1])( x => 1 - x*x)(dist /closenessRadiusSquared) );
                gradient.addColorStop(0, toRgba(particles[i].color ,alpha));
                gradient.addColorStop(1, toRgba(particles[j].color, alpha));
                links.push({
                    from: particles[i],
                    to: particles[j],
                    gradient,
                })
            } 
        } 
    }
    return links;
}

function drawParticle(particle: Particle) {
    const ctx = canvas.value.getContext('2d')!;
    const color = `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(particle.pos[0] - particle.size/2, particle.pos[1] - particle.size/2, particle.size, particle.size);
}

function drawCircle(x: number,y: number,radius: number) {
    const ctx = canvas.value.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(x,y, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawLink(link: Link) {
    const ctx = canvas.value.getContext('2d')!;
    ctx.strokeStyle = link.gradient;
    ctx.beginPath();
    ctx.moveTo(...link.from.pos);
    ctx.lineTo(...link.to.pos);
    ctx.stroke(); 

}
function drawParticleDebug(particle: Particle) {
    const ctx = canvas.value.getContext('2d')!;
    ctx.strokeStyle = `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, 1)`;
    drawCircle(...particle.pos, speedRadius);
    drawCircle(...particle.pos, closenessRadius);
}
function animate() {
    const ctx = canvas.value.getContext('2d')!;
    ctx.clearRect(0,0,canvas.value.width, canvas.value.height);
    particles.forEach(updateParticle);
    getLinks().forEach(drawLink)
    //particles.forEach(drawParticle);
    //particles.forEach(drawParticleDebug);
    window.requestAnimationFrame(animate);
}

let playerParticle: Particle | void;
window.addEventListener('mouseenter', event => {
    
});
window.addEventListener('mousemove', event => {
    if (playerParticle) { 
        playerParticle.pos = [(event.clientX / canvas.value.clientWidth) * canvas.value.width, (event.clientY / canvas.value.clientHeight) *  canvas.value.height];
    } else {
        playerParticle = {
        pos: [(event.clientX / canvas.value.clientWidth) * canvas.value.width, (event.clientY / canvas.value.clientHeight) *  canvas.value.height],
        color: [255,255,255],
        size: 10,
        speed: [0,0]
    };
    particles.push(playerParticle)
    }
})
window.addEventListener('mouseout', event => {
    if (playerParticle) {
        particles.splice(particles.indexOf(playerParticle), 1);
        playerParticle = undefined;
    }
})

window.addEventListener('resize', event => {
    calculateResolution();
});
</script>
<template>
    <canvas id="background" ref="canvas">

    </canvas>
</template>
<style scoped>
canvas {
    bottom: 0;
    left: 0;
    position: fixed;
    z-index: -99999;
    width: 100vw;
    height: 100vh;
}
</style>