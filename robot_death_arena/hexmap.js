import { Hex } from "./hex.js";

export class HexMap {

    hexSize = 50;

    zoomFactor = 4;

    map = [];
    allHexes = [];

    constructor(rows, cols, hexSize, canvas) {
        this.rows = rows;
        this.cols = cols;
        this.hexSize = hexSize;
        this.boundingRectangle = canvas.getBoundingClientRect();
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

    getHex(row, col) {
        return this.map[row][col];
    }

    getHexesForColumn(whichColumn) {
        let hexes = [];
        for (let n = 0; n < this.rows; n++) {
            hexes.push(this.map[n][whichColumn])
        }

        return hexes;
    }

    render(context) {
        this.allHexes.forEach(hex => {
            hex.render(context)
        });
    }

    increaseSize() {
        this.hexSize += this.zoomFactor;
        this.allHexes.forEach(hex => {
            hex.setSize(this.hexSize);
        });
    }

    decreaseSize() {
        this.hexSize -= this.zoomFactor;
        this.allHexes.forEach(hex => {
            hex.setSize(this.hexSize);
        });
    }

    findHexAtClick(click) {

        console.log(click)

        let clickedHex = null;
        let column = this.computeColumnForClick(click);
        if (column != null) {
            clickedHex = this.computeHexForClickAndColumn(click, column);
        }

        return clickedHex;
    }

    computeColumnForClick(click) {

        let columnNumber = null;
        let halfSize = this.hexSize / 2;
        let clickX = click.offsetX;

        for (let i = 0; i < this.cols; i++) {
            let hex = this.map[0][i];
            if (clickX > hex.points[0].x && clickX < hex.points[1].x) {
                columnNumber = i;
                break;
            }
        }

        return columnNumber;
    }

    computeHexForClickAndColumn(click, column) {

        let clickedHex = null;
        let clickY = click.offsetY;

        let hexHeader = this.map[0][column];
        if (hexHeader == null) {
            return null
        }

        for (let i = 0; i < this.rows; i++) {
            let hex = this.map[i][column];
            if (clickY > hex.points[0].y && clickY < hex.points[4].y) {
                clickedHex = hex;
                break;
            }
        }

        return clickedHex;
    }
}