<script setup lang="ts">
import { createLerp, distanceSquared, easeOutCubic,  easeInCubic} from '@/maths';
import { ref, watchEffect } from 'vue';
import {rgbToHsl, line } from '@/canvasUtils';
import type { IsPositionable, SpatialHash } from '@/spatialHash';
import {createSpatialHash, searchInRadius, addObject} from '@/spatialHash';



type Particle = {
    pos: [number, number];
    size: number;
    color: [number, number, number];
    colorHSL: [number, number, number];
    speed: [number, number]
}

type Link = {
    from: Particle;
    to: Particle;
}

type DilationMatrix = {
    matrixInBinary: number;
    size: number;
}

function copyParticleOtherPosition(particle: Particle, newPos: [number, number]): Particle {
    return {...particle, pos: newPos};
}

const availableColors:[number, number, number][] = [
    [225, 0, 169],
    [255, 30, 0],
    [0, 226, 59],
    [188, 249, 0]
]

const debugEnabled = ref(false);

const resImage = 256;
const backgroundCanvasResolution: [number, number] = [2560, 1440];
const linkCanvasResolution: [number, number] = [resImage, resImage];
const resRatio = [backgroundCanvasResolution[0]/ linkCanvasResolution[0], backgroundCanvasResolution[1]/ linkCanvasResolution[1]];
const density = 40;

const numberOfParticles = ref(30);
const maxSpeed = 3;
const minSpeed = 0.25;
const gridSizeSpatialHash = 100;
let particles: Particle[] = [];
const closenessRadius = 200;
const closenessRadiusSquared = closenessRadius * closenessRadius;
const speedRadius = 10;

const canvas = ref(null as unknown as HTMLCanvasElement);
const linkCanvas = document.createElement('canvas');
linkCanvas.width = backgroundCanvasResolution[0];
linkCanvas.height = backgroundCanvasResolution[1];

let animationRequest: number;
let spatialHash: SpatialHash;
watchEffect(() => {
    if (canvas.value) {
        calculateResolution();
        calculateNumberOfParticles(canvas.value);
        const ctx = canvas.value.getContext('2d')!;
        particles = createParticles(availableColors, numberOfParticles.value, canvas.value);
        spatialHash = createSpatialHash(backgroundCanvasResolution, gridSizeSpatialHash);
        particles.forEach(particle => addObject(spatialHash, particle));
        particles.forEach(particle => drawParticle(ctx, particle));
        if (!animationRequest) {
            animationRequest = window.requestAnimationFrame(animate);
        }
        
    }
});

function calculateNumberOfParticles(canvas: HTMLCanvasElement) {
    const {width, height} = canvas;
    numberOfParticles.value = Math.floor((density/1000000) * width * height);
}

function calculateResolution() {
    if (canvas.value) {
        const {innerHeight, innerWidth} = window;
        canvas.value.height = backgroundCanvasResolution[1] > innerHeight ? innerHeight: backgroundCanvasResolution[1];
        canvas.value.width = backgroundCanvasResolution[0] > innerWidth ? innerWidth: backgroundCanvasResolution[0];

        linkCanvas.width = backgroundCanvasResolution[0];
        linkCanvas.height = backgroundCanvasResolution[1];
    } 
}


function randomInCanvas(canvas: HTMLCanvasElement): [number, number] {
    const x = Math.floor(Math.random() * canvas.width + 1);
    const y = Math.floor(Math.random() * canvas.height + 1);
    return [x,y];
}

function randomSpeed(maxSpeed: number, minSpeed: number): [number, number] {
    const scaledMinSpeed = minSpeed / (maxSpeed*2);
    const lerpSpeed = createLerp([-maxSpeed, maxSpeed])(x => {
        let y = 0;
        if (x > -scaledMinSpeed && x < scaledMinSpeed) {
            if (x > 0) {
                y = scaledMinSpeed;
            } else {
                y = -scaledMinSpeed;
            }
        } else {
            y = 1 - (2 * x - 1) * (2 * x - 1);
        }
        return y;
    });
    let vx = lerpSpeed(Math.random());
    let vy = lerpSpeed(Math.random());
    return [vx, vy];
}

function randomColor(availableColors: [number, number, number][]): [number, number, number] {
    const index = Math.floor(Math.random() * availableColors.length);
    return availableColors[index];
}

function createParticles(availableColors: [number, number, number][], numberOfParticles: number, canvas: HTMLCanvasElement): Particle[] {
    const particles = [];
    for(let i = 0; i < numberOfParticles; i++) {
        const color = randomColor(availableColors); 
        particles.push({
            color,
            colorHSL: rgbToHsl(...color),
            pos: randomInCanvas(canvas),
            size: 10,
            speed: randomSpeed(maxSpeed, minSpeed)
        })
    }
    return particles;
}

function loopBoundary(boundary: [number, number], particle: Particle) {

    if (particle.pos[0] < 0) {
        particle.pos[0] = boundary[0];
    }
    if (particle.pos[0] > boundary[0]) {
        particle.pos[0] = 0;
    }
    if (particle.pos[1] < 0) {
        particle.pos[1] = boundary[1];
    }
    if (particle.pos[1] > boundary[1]) {
        particle.pos[1] = 0;
    }
}

function updateParticle(canvas: HTMLCanvasElement, particle: Particle) {
    particle.pos = [particle.pos[0]  + particle.speed[0],particle.pos[1] + particle.speed[1]];
    const boundary = [canvas.width, canvas.height] as [number, number];
    loopBoundary(boundary, particle);
}


function linkFromParticles(particleOne: Particle, particleTwo: Particle): Link {
    return {
        from: particleOne,
        to: particleTwo,
    }
}


function getLinks(canvas: HTMLCanvasElement, spatialHash: SpatialHash): Link[] {
    //TODO Optimize this in the future
    const links: Link[] = [];

    for (let i = 0; i < particles.length; i++) {
        const particleOne = particles[i];
        for (let z = 0; z < 9; z++) {
            // -1 to center the dilation matrix
            const xDilation = ((z % 3) - 1) * canvas.width;
            const yDilation = (Math.floor(z /3) - 1) * canvas.height;
            const outsidePos = [particleOne.pos[0] + xDilation, particleOne.pos[1] + yDilation] as [number, number];
            const nearParticles = searchInRadius(spatialHash,  outsidePos, closenessRadius);
            for (let j = 0; j < nearParticles.length; j++) {
                const particleTwo = nearParticles[j] as Particle;
                if (particleOne !== particleTwo) {
                    const outsidePosInverse = [particleTwo.pos[0] - xDilation, particleTwo.pos[1] - yDilation] as [number, number];
                    links.push(linkFromParticles(copyParticleOtherPosition(particleOne, outsidePos), particleTwo));
                    if (xDilation !== 0 || yDilation !==0 ){
                        links.push(linkFromParticles(copyParticleOtherPosition(particleTwo, outsidePosInverse), particleOne));
                    }
                }
            }
        }
    }
    

    return links;
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
    const color = `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(particle.pos[0] - particle.size/2), Math.floor(particle.pos[1] - particle.size/2), particle.size, particle.size);
}

function drawCircle(ctx: CanvasRenderingContext2D,  x: number,y: number,radius: number) {
    ctx.beginPath();
    ctx.arc(x,y, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawLinks(ctx: CanvasRenderingContext2D, links: Link[]) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    for(let i = 0; i < links.length; i++ ) {
        ctx.moveTo(Math.floor(links[i].from.pos[0]), Math.floor(links[i].from.pos[1]));
        ctx.lineTo(Math.floor(links[i].to.pos[0]), Math.floor(links[i].to.pos[1]));
    }
    ctx.stroke(); 
}


function generateGradientImage(ctx: CanvasRenderingContext2D, links: Link[], gradientWidth: DilationMatrix = {matrixInBinary: 0b111_111_111, size: 3}): ImageData {
    const lerper = createLerp([0, 1])(x => x);
    const alphaLerp = createLerp([255, 0])(easeInCubic);
    const scaledClosenessRadiousSquared = closenessRadiusSquared / (resRatio[0] * resRatio[1]);
    let gradientImage = ctx.createImageData(...linkCanvasResolution);
    const gradientMatrixSize = gradientWidth.size * gradientWidth.size;

    for(let link of links) {
        const fromScaled = [Math.round(link.from.pos[0] / resRatio[0]), Math.round(link.from.pos[1] / resRatio[1])] as [number, number];
        const toScaled = [Math.round(link.to.pos[0] / resRatio[0]), Math.round(link.to.pos[1] / resRatio[1])] as [number, number];
        const totalDist = distanceSquared(fromScaled, toScaled);
        const toScreen = (x: number, y: number) => {
            const distFrom = distanceSquared(fromScaled, [ x, y]);
            const distTo = distanceSquared([ x,  y], toScaled);
            const portionColorTo= lerper(distFrom/totalDist);
            const portionColorFrom = lerper(distTo/totalDist);
            const rgba = [
                Math.abs(portionColorFrom * link.from.color[0] + portionColorTo * link.to.color[0]),
                Math.abs(portionColorFrom * link.from.color[1] + portionColorTo * link.to.color[1]),
                Math.abs(portionColorFrom * link.from.color[2] + portionColorTo * link.to.color[2]),
                Math.abs(alphaLerp(totalDist/scaledClosenessRadiousSquared))
            ];
            const middlDilationMatrix = 1;
            for (let i = 0; i < gradientMatrixSize; i++) {
                const xDilation = (i % 3) - middlDilationMatrix;
                const yDilation = Math.floor(i /3) - middlDilationMatrix;
                const binaryIndex = Math.pow(2, i);
                const dilation = (gradientWidth.matrixInBinary & binaryIndex) / binaryIndex;
                gradientImage.data[(y + yDilation) * linkCanvasResolution[0] * 4 + (x + xDilation) * 4] =  Math.floor(rgba[0]) * dilation;
                gradientImage.data[(y + yDilation) * linkCanvasResolution[0] * 4 + (x + xDilation) * 4 + 1] = Math.floor(rgba[1]) * dilation;
                gradientImage.data[(y + yDilation) * linkCanvasResolution[0] * 4 + (x + xDilation) * 4 + 2] = Math.floor(rgba[2]) * dilation;
                gradientImage.data[(y + yDilation) * linkCanvasResolution[0] * 4 + (x + xDilation) * 4 + 3] = Math.floor(rgba[3]) * dilation;
            }
            
        };
        line(...fromScaled, ...toScaled, toScreen );
    }
    return gradientImage;
}


function drawGradient(ctx: CanvasRenderingContext2D, gradientImage: ImageData) {
    ctx.putImageData(gradientImage,0,0);
    // Now we have an unscaled version of our ImageData
    // let's make the compositing mode to 'copy' so that our next drawing op erases whatever was there previously
    // just like putImageData would have done
    ctx.globalCompositeOperation = 'copy';
    // now we can draw ourself over ourself.
    ctx.drawImage(linkCanvas,
    0,0, ...linkCanvasResolution, // grab the ImageData part
    0,0, ...backgroundCanvasResolution // scale it
    );
    ctx.globalCompositeOperation = 'lighter';
}
function drawParticleDebug(particle: Particle) {
    const ctx = canvas.value.getContext('2d')!;
    ctx.strokeStyle = `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, 1)`;
    drawCircle(ctx, ...particle.pos, speedRadius);
    drawCircle(ctx, ...particle.pos, closenessRadius);
}
function animate() {
    const ctx = canvas.value.getContext('2d')!;
    const ctxLinks = linkCanvas.getContext('2d')!;
    
    //particles.forEach(drawParticleDebug);
    particles.forEach(particle => updateParticle(canvas.value, particle));
    spatialHash = createSpatialHash(backgroundCanvasResolution, gridSizeSpatialHash);
    particles.forEach(particle => addObject(spatialHash, particle));
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0,0,canvas.value.width, canvas.value.height);
    particles.forEach(particle => drawParticle(ctx, particle));
    ctx.fillStyle = "rgba(24,24,24,1)";
    const links = getLinks(canvas.value, spatialHash);
    const gradientImage = generateGradientImage(ctxLinks, links);
    drawGradient(ctxLinks, gradientImage);
    ctxLinks.globalCompositeOperation = 'destination-in';
    drawLinks(ctxLinks, links);
    ctx.globalCompositeOperation = 'lighten';
    ctx.drawImage(ctxLinks.canvas, 0, 0); 
    //particles.forEach(drawParticle);
    
    animationRequest = window.requestAnimationFrame(animate);
}

let playerParticle: Particle | void;
window.addEventListener('mousemove', event => {
    if (playerParticle) { 
        playerParticle.pos = [(event.clientX / canvas.value.clientWidth) * canvas.value.width, (event.clientY / canvas.value.clientHeight) *  canvas.value.height];
    } else {
        playerParticle = {
        pos: [(event.clientX / canvas.value.clientWidth) * canvas.value.width, (event.clientY / canvas.value.clientHeight) *  canvas.value.height],
        color: [255,255,255],
        colorHSL: rgbToHsl(255,255,255),
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
    calculateNumberOfParticles(canvas.value);
    particles = createParticles(availableColors, numberOfParticles.value, canvas.value);
});

window.addEventListener('keyup', event => {
    if (event.key === "F12") {
        debugEnabled.value = !debugEnabled.value;    
    }
})
</script>
<template>
    <canvas id="background" ref="canvas">

    </canvas>
    <div id="debugInfo" v-if="debugEnabled">
        <span>numberOfParticles : {{numberOfParticles}}</span>
    </div>
</template>
<style scoped>
canvas {
    bottom: 0;
    left: 0;
    position: fixed;
    z-index: -99999;
    width: 100vw;
    height: 100vh;
    cursor: none;
}
#debugInfo {
    position: fixed;
    top: 0;
    left: 0;
    background-color: white;
    color: black;
}
</style>