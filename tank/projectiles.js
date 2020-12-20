export class Projectile {

    x = 0;
    y = 0;
    angle = 0;
    speed = 0;

    radius = 5;
    isLive = true;

    constructor(params) {
        this.x = params.x;
        this.y = params.y;
        this.angle = params.angle;
        this.speed = params.speed;
    }

    updatePosition() {
        let deltaX = Math.cos((this.angle - 90) * Math.PI / 180) * this.speed;
        let deltaY = Math.sin((this.angle - 90) * Math.PI / 180) * this.speed;
        this.x += deltaX;
        this.y += deltaY;
    }

    drawProjectile(context) {
        context.fillStyle = "#FF0000"
        context.beginPath();
        context.ellipse(this.x, this.y, this.radius, this.radius, 2 * Math.PI, 2 * Math.PI, false);
        context.fill();
    }
}

export class TracerRound {

    radius = 2;

    originX = 0;
    originY = 0;
    turretOrientDegrees = 0;
    terminalX = 0;
    terminalY = 0;
    colors = ["#FF0000", "#FC6203", "#FCA503", "#FC6F03", "#FC3503"];

    constructor(params) {
        this.originX = params.x;
        this.originY = params.y;
        this.turretOrientDegrees = params.turretOrientDegrees;
        // this.terminalX = params.terminalX;
        // this.terminalY = params.terminalY;
    }

    drawTracerRound(context) {

        let tempRadius = this.radius + ((Math.random() * 7) + 1);
        let color = this.colors[Math.floor(Math.random() * this.colors.length)];
        let degrees = this.turretOrientDegrees + (Math.random() * 0.75) - (Math.random() * 0.75);
        let lineLength = 1000;

        if (Math.random() * 100 > 90) {
            context.strokeStyle = color;
            context.beginPath();

            context.moveTo(this.originX, this.originY);
            context.lineTo(
                this.originX + Math.cos((degrees - 90) * Math.PI / 180) * lineLength,
                this.originY + Math.sin((degrees - 90) * Math.PI / 180) * lineLength);
            context.stroke();
        }

        context.beginPath();
        context.fillStyle = color;
        context.ellipse(this.originX, this.originY, tempRadius, tempRadius, 2 * Math.PI, 2 * Math.PI, false);
        context.fill();
    }

}