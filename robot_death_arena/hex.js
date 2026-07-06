export class Hex {

    color = 'blue'
    isSelected = false;

    origin = null;                      // the first point in the hexagon
    points = [];

    halfSize = 0;

    constructor(row, col, hexSize) {
        this.row = row;
        this.col = col;
        this.setSize(hexSize);
        this.computePoints;
    }

    computePoints() {
        this.points = [];

        // Compute the leftmost top point...
        this.origin = {
            x: this.halfSize + (this.col * (this.hexSize + this.halfSize)),
            y: (this.row * 2 * (this.hexSize * 0.8660)) + (((this.col % 2)) * Math.floor(0.8660 * this.hexSize))
        };

        // ...then compute the points ONCE
        this.points.push({ x: this.origin.x, y: this.origin.y });
        this.points.push({ x: this.origin.x + this.hexSize, y: this.origin.y });
        this.points.push({ x: this.origin.x + this.hexSize + this.halfSize, y: this.origin.y + (this.hexSize * 0.8660) });
        this.points.push({ x: this.origin.x + this.hexSize, y: this.origin.y + (2 * this.hexSize * 0.8660) });
        this.points.push({ x: this.origin.x, y: this.origin.y + (2 * this.hexSize * 0.8660) });
        this.points.push({ x: this.origin.x - this.halfSize, y: this.origin.y + (this.hexSize * 0.8660) });
    }

    getExtrema() {
        return {
            minX: this.points[5].x,
            maxX: this.points[2].x
        }
    }

    setSize(newSize) {
        this.hexSize = newSize;
        this.halfSize = this.hexSize / 2;
        this.computePoints();
    }

    setColor(newColor) {
        this.color = newColor;
    }

    render(context) {

        // Draw hex
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        context.lineTo(this.points[1].x, this.points[1].y);
        context.lineTo(this.points[2].x, this.points[2].y);
        context.lineTo(this.points[3].x, this.points[3].y);
        context.lineTo(this.points[4].x, this.points[4].y);
        context.lineTo(this.points[5].x, this.points[5].y);
        context.closePath();

        if (this.isSelected) {
            context.fillStyle = "#FF0000"
            context.fill();
        }
        context.strokeStyle = 'blue';
        context.lineWidth = 2;
        context.stroke();

        // Draw center point
        context.fillStyle = "#ff0000"
        context.fillRect(this.origin.x + this.halfSize, this.origin.y + (this.hexSize * 0.8660), 2, 2);
    }

}