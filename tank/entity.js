export class TankEntity {

    tankImage = new Image();
    turretImage = new Image();

    position = 0;
    turretPosition = 0;
    movementUnits = 2;

    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.tankImage.src="images/my_tank.png"; 
        this.turretImage.src = "images/my_turret.png";
    }

    moveForward() {
        // This business with (this.position - 90) has to do with where Javascript thinks "zero" is on the unit circle;
        // According to JS, zero starts at 3 o'clock; 90 is at 6 o'clock, etc
        let deltaX = Math.floor(Math.cos((this.position - 90) * Math.PI / 180) * this.movementUnits);
        let deltaY = Math.floor(Math.sin((this.position - 90) * Math.PI / 180) * this.movementUnits);
        this.updatePosition(deltaX, deltaY);
    }

    updatePosition(dx, dy){
        this.x += dx;
        this.y += dy;
    }

    updateOrientationByDelta(delta) {
        this.position += delta;
        this.position = Math.abs((360 + this.position) % 360);
        this.rotateTurretByDelta(delta);
    }

    rotateTurretByDelta(delta) {
        this.turretPosition += delta;
        this.turretPosition = Math.abs((360 + this.turretPosition) % 360);
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y );
        context.rotate(this.position * Math.PI / 180);
        context.drawImage(this.tankImage, -(this.tankImage.width / 2), - (this.tankImage.height / 2));
        context.restore();

        //this.drawOrientationEllipse(context);
        this.drawTurret(context);
    }

    drawOrientationEllipse(context) {
        context.strokeStyle = "#0000FF"
        context.beginPath();
        let lineLength = 100;
        context.ellipse(this.x, this.y, lineLength, lineLength, 2 * Math.PI, 2 * Math.PI, false);
        context.moveTo(this.x, this.y);
        context.lineTo(
            this.x + Math.cos((this.position - 90) * Math.PI / 180) * lineLength,
            this.y + Math.sin((this.position - 90) * Math.PI / 180) * lineLength); 
        context.stroke();
    }

    drawLineTurret(context) {
        context.strokeStyle = "#0000FF"
        context.beginPath();
        let lineLength = 100;
        context.moveTo(this.x, this.y);
        context.lineTo(
            this.x + Math.cos((this.turretPosition - 90) * Math.PI / 180) * lineLength,
            this.y + Math.sin((this.turretPosition - 90) * Math.PI / 180) * lineLength); 
        context.stroke();
    }

    drawTurret(context) {
        context.save();
        context.translate(this.x, this.y );
        context.rotate(this.turretPosition * Math.PI / 180);
        context.drawImage(this.turretImage, - (this.turretImage.width / 2), - (this.turretImage.height / 2));
        context.restore();
    }
}