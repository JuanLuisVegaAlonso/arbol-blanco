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

const maxRes = [900, 900];
const density = 30;
let numberOfParticles = 30;
const maxSpeed = 1.25;
const minSpeed = 1;
let particles: Particle[] = [];
const closenessRadius = 200;
const closenessRadiusSquared = closenessRadius * closenessRadius;
const speedRadius = 10;

let aditionalCuadrants: [number, number][];

const canvas = ref(null as unknown as HTMLCanvasElement);

watchEffect(() => {
    console.log(canvas.value);
    if (canvas.value) {
        calculateResolution();
        calculateNumberOfParticles();
        const ctx = canvas.value.getContext('2d')!;
        //ctx.globalCompositeOperation = "destination-out";
        createParticles();
        particles.forEach(drawParticle);
        window.requestAnimationFrame(animate);
    }
});

function calculateNumberOfParticles() {
    const {width, height} = canvas.value;
    numberOfParticles = Math.floor((density/1000000) * width * height);
}

function calculateResolution() {
    if (canvas.value) {
        const {innerHeight, innerWidth} = window;
        canvas.value.height = maxRes[1] > innerHeight ? innerHeight: maxRes[1];
        canvas.value.width = maxRes[0] > innerWidth ? innerWidth: maxRes[0];
        console.log({innerWidth, innerHeight});


        aditionalCuadrants = calculateAditionalQuadrants();
        const ctx = canvas.value.getContext('2d')!;
        //ctx.shadowBlur = 10;
    } 
}


function randomInCanvas(): [number, number] {
    const x = Math.floor(Math.random() * canvas.value.width + 1);
    const y = Math.floor(Math.random() * canvas.value.height + 1);
    return [x,y];
}

function randomSpeed(): [number, number] {
    let vx = Math.random() * maxSpeed * 2 - maxSpeed;
    let vy = Math.random() * maxSpeed * 2 - maxSpeed;
    if (Math.abs(vx) < minSpeed) {
        vx = minSpeed * Math.sign(vx);
    }
    if (Math.abs(vy) < minSpeed) {
        vy = minSpeed * Math.sign(vy);
    }
    return [vx, vy];
}

function randomColor(): [number, number, number] {
    const index = Math.floor(Math.random() * availableColors.length);
    return availableColors[index];
}

function createParticles() {
    particles = [];
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
    particle.pos = [Math.floor(particle.pos[0]  + particle.speed[0]), Math.floor(particle.pos[1] + particle.speed[1])];
    loopBoundary(particle);
}




function linkFromParticles(particleOne: Particle, particleTwo: Particle, dist: number) {
    const ctx = canvas.value.getContext('2d')!;
    const gradient = ctx.createLinearGradient(...particleOne.pos, ...particleTwo.pos);
                const alpha = (createLerp([0, 1])( x => 1 - x*x)(dist /closenessRadiusSquared) );
                gradient.addColorStop(0, toRgba(particleOne.color ,alpha));
                gradient.addColorStop(1, toRgba(particleTwo.color, alpha));

    return {
            from: particleOne,
            to: particleTwo,
            gradient,
    }
}


/*
-+ 0+ ++
-0 00 +0
-- 0- +-
*/

function copyParticleOtherPosition(particle: Particle, newPos: [number, number]): Particle {
    return {...particle, pos: newPos};
}

function calculateAditionalQuadrants(): [number, number][] {
    const {width, height} = canvas.value;
    return [
        [-width, height], [0, height], [width, height],
        [-width, 0],  [width, 0],
        [-width, -height], [0, -height], [width, -height],
    ];
}


function outsideLinks(particleOne: Particle, particleTwo: Particle) {
    return aditionalCuadrants.reduce((acc, quadrant) => {
        
        const outsidePos = [particleOne.pos[0] + quadrant[0], particleOne.pos[1] + quadrant[1]] as [number, number];
        const outsidePosInverse = [particleTwo.pos[0] - quadrant[0], particleTwo.pos[1] - quadrant[1]] as [number, number];
        const distOne =  distanceSquared(outsidePos, particleTwo.pos)
        if (distOne < closenessRadiusSquared) {
            acc = [...acc, linkFromParticles(copyParticleOtherPosition(particleOne, outsidePos), particleTwo, distOne), linkFromParticles(copyParticleOtherPosition(particleTwo, outsidePosInverse), particleOne, distOne)];
        }
        return acc;
    }, []  as Link[]);
}

function getLinks(): Link[] {
    //TODO Optimize this in the future
    const ctx = canvas.value.getContext('2d')!;
    
    const links: Link[] = [];
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dist = distanceSquared(particles[i].pos, particles[j].pos);
            if (dist < closenessRadiusSquared) {
                links.push(linkFromParticles(particles[i], particles[j], dist));
            } 
            links.push(...outsideLinks(particles[i], particles[j]))
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
    ctx.globalCompositeOperation = 'source-out';
    ctx.fillStyle = "rgba(24,24,24,0.00001)";
    ctx.fillRect(0,0,canvas.value.width, canvas.value.height);
    ctx.globalCompositeOperation = 'destination-atop';
    ctx.fillRect(0,0,canvas.value.width, canvas.value.height);
    //ctx.clearRect(0,0,canvas.value.width, canvas.value.height);
    ctx.globalCompositeOperation = 'lighter';
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
    calculateNumberOfParticles();
    createParticles();
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