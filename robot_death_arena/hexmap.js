import { Hex } from "./hex.js";

export class HexMap {

    hexSize = 48;

    map = [];
    allHexes = [];

    constructor(rows, cols, hexSize) {
        this.rows = rows;
        this.cols = cols;
        this.hexSize = hexSize;
        this.initialize();
    }

    initialize() {
        this.map = [];
        for (let i = 0; i < this.rows; i++) {
            this.map[i] = new Array(this.rows);
            for (var j = 0; j < this.cols; j++) {
                this.map[i][j] = new Hex(i, j, this.hexSize);
            }
        }
        this.allHexes = this.map.flat();
    }

    render(context) {
        this.allHexes.forEach(hex => {
            hex.render(context)
        });
    }

    increaseSize() {
        this.hexSize += 2;
        this.allHexes.forEach(hex => {
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

        let clickedHex = this.map.flat().filter(hex => {
            return click.offsetX >= hex.origin.x
                && click.offsetX <= hex.points[1].x
                && click.offsetY >= hex.origin.y
                && click.offsetY <= hex.points[4].y
        })[0];

        return clickedHex;
    }
}