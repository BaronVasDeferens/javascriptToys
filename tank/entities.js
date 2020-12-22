export class Tank {

    tankImage = new Image();
    turretImage = new Image();

    bodyOrientDegrees = 0;
    turretOrientDegrees = 0;

    movementUnits = 1; // 0.5;
    projectileSpeed = 10;

    constructor(x, y, movementUnits) {
        this.x = x;
        this.y = y;
        this.movementUnits = movementUnits;
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



export class Robot {

    robotImage = new Image();
    x = 0;
    y = 0;

    orientation = 0;

    movementIncrement = 0.25;  // 0.25 is good

    constructor(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.orientation = orientation;

        this.robotImage.src = "./images/robot_1.png";
    }

    updatePosition(target) {

        if (this.frameDamage > 0) {
            this.frameDamage -= this.healingRate;
            return;
        }

        if (this.x > target.x) {
            this.x -= this.movementIncrement;
        } else if (this.x < target.x) {
            this.x += this.movementIncrement;
        }

        if (this.y > target.y) {
            this.y -= this.movementIncrement;
        } else if (this.y < target.y) {
            this.y += this.movementIncrement;
        }

        // Face the robot toward the tank; adjust rotation based on position relative to the tank
        let xDiff = (target.x - this.x);
        let yDiff = (target.y - this.y);
        let rotationAdjust = 270;
        if (xDiff < 0) {
            rotationAdjust = 270;
        } else {
            rotationAdjust = 90;
        }

        this.orientation = rotationAdjust + (Math.atan(yDiff / xDiff) * 180 / Math.PI);
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.orientation * Math.PI / 180);
        context.drawImage(this.robotImage, -(this.robotImage.width / 2), -(this.robotImage.height / 2));
        context.restore();
        // this.drawOrientationEllipse(context);
    }

    // For debuggin'
    drawOrientationEllipse(context) {
        context.strokeStyle = "#0000FF"
        context.beginPath();
        let lineLength = 25;
        context.ellipse(this.x, this.y, lineLength, lineLength, 2 * Math.PI, 2 * Math.PI, false);
        context.moveTo(this.x, this.y);
        context.lineTo(
            this.x + Math.cos((this.orientation - 90) * Math.PI / 180) * lineLength,
            this.y + Math.sin((this.orientation - 90) * Math.PI / 180) * lineLength);
        context.stroke();
    }

    detectProjectileHit(x, y) {
        let radius = 15;
        if (Math.abs(x - this.x) <= radius && Math.abs(y - this.y) <= radius) {
            return true;
        } else {
            return false;
        }
    }

    detectTracerHit(params) {

        let tanResult = Math.tan((params.turretOrientDegrees - 90) * Math.PI / 180);
        let distanceRatio = (this.y - params.y) / (this.x - params.x);

        let bothSignedSame = (distanceRatio > 0 && tanResult > 0) || (distanceRatio < 0 && tanResult < 0);

        if (bothSignedSame && Math.abs(distanceRatio - tanResult) < 0.1) {
            return true;
        } else {
            return false;
        }
    }

}