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
        } else {
            clickedHex = this.computeHexForClickedSeam(click);
        }

        return clickedHex;
    }

    computeColumnForClick(click) {

        let clickX = click.offsetX;

        let columnNumber = null;
        let halfSize = this.hexSize / 2;

        for (let i = 0; i < this.cols; i++) {
            let hex = this.map[0][i];

            if (clickX > hex.points[0].x && clickX < hex.points[1].x) {
                // Determine if the click is fully within the hex (not in the seam);
                // if the click is squarely in the center area of the hex, we have our column
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

    computeHexForClickedSeam(click) {
        let clickedHex = null;

        let clickX = click.offsetX;
        let clickY = click.offsetY;

        let approxRow = Math.floor(clickY / (2 * 0.8660 * this.hexSize));
        if (approxRow >= this.rows) {
            approxRow = this.rows - 1;
        } else if (approxRow < 0) {
            approxRow = 0;
        }

        console.log(`approxRow: ${approxRow}`)

        for (let i = 0; i < this.cols; i++) {

            let hex = this.map[approxRow][i];

            // Determine whether the click falls into the seam...
            if (clickX < hex.points[0].x && clickX > hex.points[5].x) {
                // Click's X value falls between points A and F (left);
                // Determine if it is in the upper or lower triangle:
                if (clickY < hex.center.y) {
                    console.log(`${hex.row} ${hex.col} left upper`)
                } else {
                    console.log(`${hex.row} ${hex.col} left lower`)
                }

            } else if (clickX > hex.points[1].x && clickX < hex.points[2].x) {
                // Click's X value falls between points B and C (right);
                // Determine if it is in the upper or lower triangle:
                if (clickY < hex.center.y) {
                    console.log(`${hex.row} ${hex.col} right upper`)
                } else {
                    console.log(`${hex.row} ${hex.col} right lower`)
                }
            }
        }

        return clickedHex;
    }
}