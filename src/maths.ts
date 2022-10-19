export const createLerp = (domain: [number, number]) => (domainFunction: (t: number) => number ) => (t: number) => {
    return domain[0] + domainFunction(t) * (domain[1] - domain[0]);
}

export const clamp = (domain: [number, number]) => (valueToClamp: number) => {
    let clamped: number = valueToClamp;
    if (valueToClamp < domain[0]) {
        clamped = domain[0];
    } else if (valueToClamp > domain[1]) {
        clamped = domain[1];
    }
    return clamped;
}

export type point = {x: number, y: number}
export const bezier = function(p0: point, p1: point, p2: point, p3: point){
   let cX = 3 * (p1.x - p0.x),
      bX = 3 * (p2.x - p1.x) - cX,
      aX = p3.x - p0.x - cX - bX;

  let cY = 3 * (p1.y - p0.y),
      bY = 3 * (p2.y - p1.y) - cY,
      aY = p3.y - p0.y - cY - bY;

      return (t: number) => {
        let x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
        let y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;

        return {x: x, y: y};
      }
  
}

export const logisticCurve = (delta: number, maxDistance: number): number => {
    return ( 1/2*Math.tanh(Math.abs(delta)/(maxDistance*2))) * 2 * maxDistance * Math.sign(delta);
}

// https://easings.net/#easeOutCubic
export function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
    
}

export function easeInCubic(x: number): number {
    return x * x * x;
}