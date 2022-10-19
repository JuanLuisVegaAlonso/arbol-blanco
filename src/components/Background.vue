<script setup lang="ts">
import { createLerp, rgbToHsl, rgbToHsv, hslToRgb } from '@/maths';
import { ref, watchEffect } from 'vue';

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
    gradient: CanvasGradient;
}

const availableColors:[number, number, number][] = [
    [255, 0, 255],
    [255, 0, 0],
    [255, 0, 255],
    [0, 255, 255],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0]
]

const resCanvas = 1024;
const resImage = 16;
const resRatio = resCanvas/ resImage;

const maxRes: [number, number] = [resCanvas, resCanvas];
const maxResGradient: [number, number] = [resImage, resImage];

const density = 20;

let numberOfParticles = 30;
const maxSpeed = 1.75;
const minSpeed = 1;
let particles: Particle[] = [];
const closenessRadius = 200;
const colorRadius = Math.pow(200, 2);
const closenessRadiusSquared = closenessRadius * closenessRadius;
const speedRadius = 10;
let gradientImage: ImageData;

let aditionalCuadrants: [number, number][];

const canvas = ref(null as unknown as HTMLCanvasElement);
const linkCanvas = document.createElement('canvas');
linkCanvas.id="link-canvas"
linkCanvas.style.top = "0";
linkCanvas.style.left = "0";
linkCanvas.style.position = "absolute";
//document.body.appendChild(linkCanvas);
linkCanvas.width = maxRes[0];
linkCanvas.height = maxRes[1];


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
        const ctx = linkCanvas.getContext('2d')!;
        gradientImage = ctx.createImageData(...maxResGradient);

        linkCanvas.width = maxRes[0];
        linkCanvas.height = maxRes[1];
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
        const color = randomColor(); 
        particles.push({
            color,
            colorHSL: rgbToHsl(...color),
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
        [-width, 0], [0,0], [width, 0],
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
    const links: Link[] = [];
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
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

function drawLinks(links: Link[]) {
    const ctx = linkCanvas.getContext('2d')!;
    ctx.strokeStyle = "white";
    ctx.beginPath();
    for(let i = 0; i < links.length; i++ ) {
        ctx.moveTo(...links[i].from.pos);
        ctx.lineTo(...links[i].to.pos);
    }
    ctx.stroke(); 

}

function drawBitMap() {
    const ctx = linkCanvas.getContext('2d')!;
    const lerper = createLerp([1, 0])(x => 1 - ((1 - x) *(1 - x) *(1 - x)));
    for (let x = 0; x < maxResGradient[0]; x++) {
        for(let y = 0; y < maxResGradient[1]; y++) {
            let h = 0;
            let s = 0;
            let l = 0;
            const xScaled = resRatio * x;
            const yScaled = resRatio * y;
            let color;
            for (let particleIndex = 0; particleIndex < particles.length; particleIndex++) {
                for (let indexAdditionalQuadrant = 0; indexAdditionalQuadrant <aditionalCuadrants.length; indexAdditionalQuadrant++ ) {
                    
                    let dist = distanceSquared([xScaled + aditionalCuadrants[indexAdditionalQuadrant][0],yScaled + aditionalCuadrants[indexAdditionalQuadrant][1]], particles[particleIndex].pos);
                    if (dist >= colorRadius) {
                        dist = colorRadius;
                    }
                    const currentH = lerper(dist/ colorRadius) * particles[particleIndex].colorHSL[0];
                    const currentS = lerper(dist/ colorRadius) * particles[particleIndex].colorHSL[1];
                    const currentL = lerper(dist/ colorRadius) * particles[particleIndex].colorHSL[2];
                    if (h < currentH) {
                        h = currentH;
                        color = particles[particleIndex].color;
                    }
                    if (s < currentS) {
                        s = currentS;
                    }
                    if (l < currentL) {
                        l = currentL;
                    }
                }
            }

            
            const rgb = hslToRgb(h/255,1,0.5)

            gradientImage.data[y * maxResGradient[0] * 4 + x * 4] =  Math.abs(rgb[0]);
            gradientImage.data[y * maxResGradient[0] * 4 + x * 4 + 1] = Math.abs(rgb[1]);
            gradientImage.data[y * maxResGradient[0] * 4 + x * 4 + 2] = Math.abs(rgb[2]);
            gradientImage.data[y * maxResGradient[0] * 4 + x * 4 + 3] = 255;
        }
    }
    ctx.putImageData(gradientImage,0,0);
    // Now we have an unscaled version of our ImageData
    // let's make the compositing mode to 'copy' so that our next drawing op erases whatever was there previously
    // just like putImageData would have done
    ctx.globalCompositeOperation = 'copy';
    // now we can draw ourself over ourself.
    ctx.drawImage(linkCanvas,
    0,0, ...maxResGradient, // grab the ImageData part
    0,0, ...maxRes // scale it
    );
    ctx.globalCompositeOperation = 'lighter';
}
function drawParticleDebug(particle: Particle) {
    const ctx = canvas.value.getContext('2d')!;
    ctx.strokeStyle = `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, 1)`;
    drawCircle(...particle.pos, speedRadius);
    drawCircle(...particle.pos, closenessRadius);
}
function animate() {
    const ctx = canvas.value.getContext('2d')!;
    const ctxLinks = linkCanvas.getContext('2d')!;
    
    //ctx.clearRect(0,0,canvas.value.width, canvas.value.height);
    
    //ctx.globalCompositeOperation = 'destination-atop';
    //ctx.fillRect(0,0,canvas.value.width, canvas.value.height);
    //ctx.clearRect(0,0,canvas.value.width, canvas.value.height);
    //particles.forEach(drawParticleDebug);
    particles.forEach(updateParticle);
    
    
    ctx.globalCompositeOperation = 'source-over';
    //particles.forEach(drawParticle);
    ctx.fillStyle = "rgba(24,24,24,0.5)";
    //ctxLinks.globalCompositeOperation = 'source-in';
    drawBitMap();
    ctxLinks.globalCompositeOperation = 'destination-in';
    drawLinks(getLinks());
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(ctxLinks.canvas, 0, 0); 
    
    ctx.globalCompositeOperation = 'destination-out';
    //particles.forEach(drawParticle);
    ctx.fillRect(0,0,canvas.value.width, canvas.value.height);
    window.requestAnimationFrame(animate);
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
#test {
    width: 100px;
    height: 100px;
    position: absolute;
    top: 50%;
    left: 50%;
}
</style>