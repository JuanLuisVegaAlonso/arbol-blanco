import { distanceSquared } from "./maths";

export type Position = [number, number];
export type IsPositionable ={
    pos: Position
}
export type SpatialHash = {
    buckets: {[key: number]: IsPositionable[]};
    cellSize: number;
}

function hashScaledPosition(positionScaled: Position, cellSize: number): number {
    return positionScaled[1] * cellSize + positionScaled[0];
}

export function hashPosition(positionable: IsPositionable, cellSize: number): number {
    const xScaled = Math.floor(positionable.pos[0]  / cellSize) ;
    const yScaled = Math.floor(positionable.pos[1] / cellSize );
    return hashScaledPosition([xScaled, yScaled],cellSize);
}

export function unhashHash(cellSize: number, hash: number): Position {
    return [
        (hash % cellSize) * cellSize,
        Math.floor(hash / cellSize) * cellSize
    ]
}
export function createSpatialHash(gridSize: Position, cellSize: number): SpatialHash {
    const totalSize = gridSize[0] * gridSize[1];
    if (totalSize % cellSize != 0) {
        throw new Error("The grid must be divisible by the cell size");
    }
    return {
        cellSize,
        buckets: {}
    }
}

export function addObject(spatialHash: SpatialHash, object: IsPositionable) {
    const positionHash = hashPosition(object, spatialHash.cellSize);
    let bucket = spatialHash.buckets[positionHash];
    if (!bucket) {
        bucket = [];
    }
    bucket.push(object);
    spatialHash.buckets[positionHash] = bucket;
}

export function searchInRadius(spatialHash: SpatialHash, from: Position,  radius: number): IsPositionable[] {
    
    if (radius < 0) {
        throw new Error("Can't search for a negative radius");
    }
    const cuadrants = [
        [-1, 1],[1, 1],
        [-1, -1],[1, -1]
    ];
    const radiusSquared = radius* radius;
    const {cellSize}  = spatialHash;
    const scaledRadius = Math.floor(radius / spatialHash.cellSize) ;
    // like an integral
    const scaledX = Math.floor(from[0] / spatialHash.cellSize);
    const scaledY = Math.floor(from[1] / spatialHash.cellSize);
    let currentX = Math.floor(from[0] / spatialHash.cellSize);
    const maxX = currentX + scaledRadius;
    
    const positionables: IsPositionable[] = [];
    while (currentX <= maxX ) {
        const maxY = Math.floor((Math.sqrt(radius*radius - (currentX * cellSize - scaledX*cellSize) * (currentX * cellSize - scaledX*cellSize)) + scaledY * cellSize) / cellSize);
        for (let currentY = scaledY; currentY < maxY; currentY++) {
            for (let q = 0; q < cuadrants.length; q++) {
                const bucket = spatialHash.buckets[hashScaledPosition([(scaledX + ((currentX  - scaledX) * cuadrants[q][0])), ( scaledY + (currentY - scaledY )* cuadrants[q][1])], spatialHash.cellSize)];
                if (bucket) {
                    positionables.push(...bucket);
                }
            }
        }
        for (let q = 0; q < cuadrants.length; q++) {
            const bucket = spatialHash.buckets[hashScaledPosition([ (scaledX + ((currentX  - scaledX) * cuadrants[q][0])), ( scaledY + ((maxY) - scaledY )* cuadrants[q][1])], spatialHash.cellSize)];
            if (bucket) {
                for(let bucketIndex= 0; bucketIndex < bucket.length; bucketIndex++) {
                    const positionable = bucket[bucketIndex];
                    const dist = distanceSquared(from, positionable.pos);
                    if (dist <= radiusSquared) {
                        positionables.push(positionable);
                    }
                }
                
            }
        }
        
        currentX++;
    }

    return positionables;
}