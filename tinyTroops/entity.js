class Entity {

    // randomRange(min, max) {
    //     return Math.floor(Math.random() * max) + min;
    // }
}


export class Dot extends Entity {

    centerX = 0;
    centerY = 0;
    size = 50;
    color = "#FF0000";

    constructor(x,y,size, color) {
        super();
        this.centerX = x;
        this.centerY = y;
        this.size = size;
        this.color = color;
    }

    render(context) {

        context.strokeStyle = this.color;
        context.beginPath();

        context.ellipse(this.centerX, this.centerY, this.size, this.size, 2 * Math.PI, 2 * Math.PI, false);
        // context.moveTo(this.x, this.y);
        // context.lineTo(
        //     this.x + Math.cos((this.orientation - 90) * Math.PI / 180) * lineLength,
        //     this.y + Math.sin((this.orientation - 90) * Math.PI / 180) * lineLength);
        context.stroke();

    }

}