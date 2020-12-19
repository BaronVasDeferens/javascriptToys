export class TankEntity {

    tankImage = new Image();
    turretImage = new Image();

    bodyOrientDegrees = 0;
    turretOrientDegrees = 0;

    movementUnits = 1;
    projectileSpeed = 20;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tankImage.src = "images/my_tank_2.png";
        this.turretImage.src = "images/my_turret.png";
    }

    reverse() {
        this.movementUnits *= -1;
    }

    moveForward() {
        // This business with (this.bodyOrientDegrees - 90) has to do with where Javascript thinks "zero" is on the unit circle;
        // According to JS, zero starts at 3 o'clock; 90 is at 6 o'clock, etc
        let deltaX = Math.cos((this.bodyOrientDegrees - 90) * Math.PI / 180) * this.movementUnits;
        let deltaY = Math.sin((this.bodyOrientDegrees - 90) * Math.PI / 180) * this.movementUnits;
        this.updatePosition(deltaX, deltaY);
    }

    updatePosition(dx, dy) {
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

    tracerRoundParams() {
        return {
            x: this.x,
            y: this.y,
            turretOrientDegrees: this.turretOrientDegrees
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.bodyOrientDegrees * Math.PI / 180);
        context.drawImage(this.tankImage, -(this.tankImage.width / 2), - (this.tankImage.height / 2));
        context.restore();

        this.drawTurret(context);
        // this.drawOrientationEllipse(context);
    }

    drawTurret(context) {
        context.save();
        context.translate(this.x, this.y);
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

export class Robot {

    x = 0;
    y = 0;
    orientation = 0;
    size = 25;

    constructor(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.orientation = orientation;
    }

    draw(context) {
        context.fillStyle = "#000000"
        context.fillRect(this.x - (this.size / 2), this.y - (this.size / 2), this.size, this.size);
    }

    detectProjectileHit(x,y) {

        if (Math.abs(x - this.x) <= 10 && Math.abs(y - this.y) < 10) {
            console.log(Math.abs(x - this.x));
            console.log(Math.abs(y - this.y));
            return true;
        } else {
            return false;
        }
    }

    detectTracerHit(params) {

        let tanResult = Math.tan( (params.turretOrientDegrees - 90) * Math.PI / 180 );
        let distanceRatio = (this.y - params.y) / (this.x - params.x);

        let bothSignedSame = (distanceRatio > 0 && tanResult > 0) || (distanceRatio < 0 && tanResult < 0);

        if (bothSignedSame && Math.abs(distanceRatio - tanResult) < 0.1) {
            // console.log("HIT!!")
            // console.log("turret angle: " + (params.turretOrientDegrees - 90));
            // console.log("tan result: " + tanResult);
            // console.log("dist ratio: " + distanceRatio);
            return true;
        } else {
            return false;
        }
    }

}