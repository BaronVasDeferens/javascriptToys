export class TankEntity {

    tankImage = new Image();
    turretImage = new Image();

    bodyOrientDegrees = 0;
    turretOrientDegrees = 0;
    
    movementUnits = 1;
    projectileSpeed = 20;

    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.tankImage.src="images/my_tank.png"; 
        this.turretImage.src = "images/my_turret.png";
    }

    moveForward() {
        // This business with (this.bodyOrientDegrees - 90) has to do with where Javascript thinks "zero" is on the unit circle;
        // According to JS, zero starts at 3 o'clock; 90 is at 6 o'clock, etc
        let deltaX = Math.cos((this.bodyOrientDegrees - 90) * Math.PI / 180) * this.movementUnits;
        let deltaY = Math.sin((this.bodyOrientDegrees - 90) * Math.PI / 180) * this.movementUnits;
        this.updatePosition(deltaX, deltaY);
    }

    updatePosition(dx, dy){
        this.x += dx;
        this.y += dy;
    }

    updateOrientationByDelta(delta) {
        this.bodyOrientDegrees += delta;
        this.bodyOrientDegrees = Math.abs((360 + this.bodyOrientDegrees) % 360);
        this.rotateTurretByDelta(delta);
    }

    rotateTurretByDelta(delta) {
        this.turretOrientDegrees += delta;
        this.turretOrientDegrees = Math.abs((360 + this.turretOrientDegrees) % 360);
    }

    projectileParams() {
        return {
            x: this.x,
            y: this.y,
            angle: this.turretOrientDegrees,
            speed: this.projectileSpeed
        };
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y );
        context.rotate(this.bodyOrientDegrees * Math.PI / 180);
        context.drawImage(this.tankImage, -(this.tankImage.width / 2), - (this.tankImage.height / 2));
        context.restore();

        this.drawTurret(context);
    }

    drawTurret(context) {
        context.save();
        context.translate(this.x, this.y );
        context.rotate(this.turretOrientDegrees * Math.PI / 180);
        context.drawImage(this.turretImage, - (this.turretImage.width / 2), - (this.turretImage.height / 2));
        context.restore();
    }

    // For debuggin'
    drawOrientationEllipse(context) {
        context.strokeStyle = "#0000FF"
        context.beginPath();
        let lineLength = 100;
        context.ellipse(this.x, this.y, lineLength, lineLength, 2 * Math.PI, 2 * Math.PI, false);
        context.moveTo(this.x, this.y);
        context.lineTo(
            this.x + Math.cos((this.bodyOrientDegrees - 90) * Math.PI / 180) * lineLength,
            this.y + Math.sin((this.bodyOrientDegrees - 90) * Math.PI / 180) * lineLength); 
        context.stroke();
    }
}

export class Projectile {

    radius = 5;

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