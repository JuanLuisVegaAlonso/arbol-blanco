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



// https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work
export function rgbToHsl(r: number, g: number, b: number): [number, number, number]{
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h =( max + min) / 2;
    let s = (max + min) / 2;
    let l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}


export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    var
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h, s, v = max;

    v = Math.floor(max / 255 * 100);
    if ( max != 0 )
        s = Math.floor(delta / max * 100);
    else {
        // black
        return [0, 0, 0];
    }

    if( r == max )
        h = ( g - b ) / delta;         // between yellow & magenta
    else if( g == max )
        h = 2 + ( b - r ) / delta;     // between cyan & yellow
    else
        h = 4 + ( r - g ) / delta;     // between magenta & cyan

    h = Math.floor(h * 60);            // degrees
    if( h < 0 ) h += 360;

    return [h, s, v];
}

// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
export function hslToRgb(h: number, s: number, l: number) :[number, number, number]{
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p: number, q: number, t: number){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}