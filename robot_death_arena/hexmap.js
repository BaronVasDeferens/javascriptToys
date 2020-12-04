import { Hex } from "./hex.js";

export class HexMap {

    map = new Array();
    hexSize = 50;

    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;

        for (var i = 0; i < rows; i++) {
            this.map[i] = new Array(cols);
            for (var j = 0; j < cols; j++) {
                this.map[i][j] = new Hex(i, j);
            }
        }
    }

    draw(context) {

        var beginDrawingFromX = (0.5 * this.hexSize);
        var beginDrawingFromY = (0.5 * this.hexSize);

        var x = beginDrawingFromX;
        var y = beginDrawingFromY;

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {

                if (j % 2 != 0) {
                    y = beginDrawingFromY + (.8660 * this.hexSize);
                } else {
                    y = beginDrawingFromY;
                }
                
                var hex = this.map[i][j];

                context.beginPath();

                context.lineTo(x + this.hexSize / 2, y);
                context.lineTo(x + this.hexSize / 2 + this.hexSize, y);
                context.lineTo(x + 2 * this.hexSize, (.8660 * this.hexSize + y));
                context.lineTo(x + this.hexSize / 2 + this.hexSize, (.8660 * 2.0 * this.hexSize + y));
                context.lineTo(x + this.hexSize / 2, (.8660 * 2.0 * this.hexSize + y));
                context.lineTo(x, y + (.8660 * this.hexSize));
                context.closePath();

                if (hex.isSelected == true) {
                    context.fillStyle = 'red';
                    context.fill();
                } else {
                    context.strokeStyle = 'blue';
                    context.stroke();
                }

                x = x + (this.hexSize / 2) + this.hexSize;
                
            }

            beginDrawingFromY += (2 * (.8660 * this.hexSize));

            x = beginDrawingFromX;
            y += (2.0 * .8660 * this.hexSize);

            if (i % 2 != 0) {
                y = beginDrawingFromY + (.8660 * this.hexSize);
            }else {
                y = beginDrawingFromY;
            }
        }
    }

    findHex(click) {

        var clickX = parseInt(click.x / this.hexSize);
        var clickY = parseInt(click.y / this.hexSize);

        console.log(" " + clickX + "," + clickY)

        var target = this.map[clickX][clickY];
        target.isSelected = !(target.isSelected);
    }



}