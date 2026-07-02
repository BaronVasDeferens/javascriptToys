import { Hex } from "./hex.js";

export class HexMap {

    map = new Array();

    hexSize = 48;

    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;

        for (var i = 0; i < rows; i++) {
            this.map[i] = new Array(cols);
            for (var j = 0; j < cols; j++) {
                this.map[i][j] = new Hex(i, j, this.hexSize);
            }
        }
    }

    draw(context) {
        this.map.flat().forEach(hex => {
            hex.render(context)
        });
    }

    increaseSize() {
        this.hexSize += 2;
        this.map.flat().forEach(hex => {
            hex.setSize(this.hexSize);
        });
    }

    decreaseSize() {
        this.hexSize -= 2;
        this.map.flat().forEach(hex => {
            hex.setSize(this.hexSize);
        });
    }

    findHexAtClick(click) {

        let clickedHex = this.map.flat().filter( hex => {
            return click.x >= hex.origin.x 
            && click.x <= hex.points[1].x
            && click.y >= hex.origin.y
            && click.y <= hex.points[4].y
        })[0];

        return clickedHex;
    }
}