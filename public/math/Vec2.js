export class Vec2 {
    constructor(x = 0, y = y) {
        this.x = x;
        this.y = y;
    }
}

export function vec2(x, y) {
    return new Vec2(x, y);
}