import { Hex } from "./hex.js";

export class HexMap {

    hexSize = 50;

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

        console.log(click)

        let clickedHex = null;

        let clickX = click.offsetX;
        let clickY = click.offsetY;

        let minColumn = Math.floor(Math.floor(clickX / (this.hexSize / 2)) / 4);
        let maxColumn = minColumn + 1;

        let minColHex = this.getHex(0, minColumn);
        if (clickX <= minColHex.points[1].x) {
            maxColumn = minColumn;
        }

        if (maxColumn == minColumn) {
            // When the min and max are the same, we know that we are in the "click column."
            clickedHex = this.getHexesForColumn(maxColumn).filter(hex => {
                return (clickY >= hex.origin.y) && (clickY <= hex.points[4].y)
            })[0];
        } else {
            // When the min and maxColumn are different, the click was in the seam between two columns
        }



        // let minColumn = Math.floor(Math.floor(clickX / (this.hexSize / 2)) / 4);
        // let maxColumn =minColumn + 1;
        // console.log(`clickX: ${clickX} minCol: ${minColumn} maxCol: ${maxColumn}`); 

        // let headerHex = this.getHex(0, minColumn);
        // let minColX = headerHex.points[1].x;
        // let leftmost
        // let isClickInSeam = false;
        // console.log(`minColX: ${minColX}`)
        // if (clickX >= ) && clickX <= (minColX + (this.hexSize / 2))) {
        //     isClickInSeam = true;
        // }

        // console.log(`isClickInSeam: ${isClickInSeam}`);
        // console.log(`headerHex (r,c): (${headerHex.row}, ${headerHex.col})`)

        // let clickedHex = this.map.flat().filter(hex => {
        //     return click.offsetX >= hex.origin.x
        //         && click.offsetX <= hex.points[1].x
        //         && click.offsetY >= hex.origin.y
        //         && click.offsetY <= hex.points[4].y
        // })[0];

        return clickedHex;
    }
}