export class Hex {

    color = 'blue'
    isSelected = false;

    origin = null;                      // the first point in the hexagon
    halfSize = 0;

    constructor(row, col, hexSize) {
        this.row = row;
        this.col = col;
        this.hexSize = hexSize;
        this.halfSize = this.hexSize / 2;

        this.origin = {
            x: this.halfSize + (this.col * (this.hexSize + this.halfSize)),
            y: (row * 2 * (this.hexSize * 0.8660)) + (((this.col % 2)) * Math.floor(0.8660 * this.hexSize))
        };

        console.log(`${row} ${this.col} : ${JSON.stringify(this.origin)}`)
    }

    setColor(newColor) {
        this.color = newColor;
    }

    render(context) {
        // context.beginPath();

        // context.lineTo(this.origin.x, this.origin.y);
        // context.lineTo(this.origin.x + this.hexSize / 2 + this.hexSize, this.origin.y);
        // context.lineTo(this.origin.x + 2 * this.hexSize, (.8660 * this.hexSize + this.origin.y));
        // context.lineTo(this.origin.x + this.hexSize / 2 + this.hexSize, (.8660 * 2.0 * this.hexSize + this.origin.y));
        // context.lineTo(this.origin.x + this.hexSize / 2, (.8660 * 2.0 * this.hexSize + this.origin.y));
        // context.lineTo(this.origin.x, this.origin.y + (.8660 * this.hexSize));
        // context.closePath();


        context.beginPath();
  
        context.moveTo(this.origin.x, this.origin.y);
        // AB
        context.lineTo(this.origin.x + this.hexSize, this.origin.y);
        // BC
        context.lineTo(this.origin.x + this.hexSize + this.halfSize, this.origin.y + (this.hexSize * 0.8660));
        // CD
        context.lineTo(this.origin.x + this.hexSize, this.origin.y + (2 * this.hexSize * 0.8660));
        // DE
        context.lineTo(this.origin.x, this.origin.y + (2 * this.hexSize * 0.8660));
        // EF
        context.lineTo(this.origin.x - this.halfSize, this.origin.y + (this.hexSize * 0.8660))

        context.closePath();
        context.strokeStyle = 'blue';
        context.stroke();

        context.fillStyle = "#ff0000"
        context.fillRect(this.origin.x + this.halfSize, this.origin.y + (this.hexSize * 0.8660), 2, 2);

        // if (this.isSelected == true) {
        //     context.fillStyle = 'red';
        //     context.fill();
        // } else {
        //     context.strokeStyle = 'blue';
        //     context.stroke();
        // }
    }

}