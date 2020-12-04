export class TankEntity {
    constructor(x,y,size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    updatePosition(dx, dy){
        this.x += dx;
        this.y += dy;
    }

    draw(context) {
        context.fillStyle = "#0000FF";
        context.fillRect(this.x,this.y,this.size, this.size);
    }
}