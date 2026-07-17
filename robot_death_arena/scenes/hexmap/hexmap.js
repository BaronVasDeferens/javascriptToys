import { Hex } from "./hex.js";

export class HexMap {

    rows = 10;
    cols = 10;
    hexSize = 50;
    zoomFactor = 4;

    isDebug = false;

    // hexes: multi-dimensional array of hexes [rows][cols]
    hexes = [];

    // hexesFlat: a flat list of hexes
    hexesFlat = [];

    constructor(rows, cols, hexSize, canvas) {
        this.rows = rows;
        this.cols = cols;
        this.hexSize = hexSize;
        this.canvas = canvas;
        this.boundingRectangle = canvas.getBoundingClientRect();
        this.initialize();
    }

    initialize() {
        this.map = [];
        for (let i = 0; i < this.rows; i++) {
            this.hexes[i] = new Array(this.rows);
            for (var j = 0; j < this.cols; j++) {
                this.hexes[i][j] = new Hex(i, j, this.hexSize);
            }
        }
        this.hexesFlat = this.hexes.flat();
    }

    getHex(row, col) {
        try {
            return this.hexes[row][col];
        } catch (exception) {
            return null;
        }
    }

    render(context) {

        context.fillStyle = "#000000";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.hexesFlat.forEach(hex => {
            hex.render(context)
        });
    }

    toggleDebug() {
        this.isDebug = !this.isDebug;
        this.hexesFlat.forEach(hex => {
            hex.toggleDebug();
        })
    }

    increaseSize() {
        this.hexSize += this.zoomFactor;
        this.hexesFlat.forEach(hex => {
            hex.setSize(this.hexSize);
        });
    }

    decreaseSize() {
        this.hexSize -= this.zoomFactor;
        this.hexesFlat.forEach(hex => {
            hex.setSize(this.hexSize);
        });
    }

    findHexAtClick(click) {

        let clickX = click.offsetX;
        let clickY = click.offsetY;

        // Compute the approximate row and column, then take it and its adjacent rows and columns
        let approximateRow = Math.floor(clickY / (2 * (this.hexSize * 0.8660)));
        let rowIds = [
            approximateRow - 1,
            approximateRow,
            approximateRow + 1
        ].filter(num => {
            return (num >= 0) && (num < this.rows)
        });

        let approximateCol = Math.floor(clickX / ((3 / 2) * this.hexSize));
        let columnIds = [
            approximateCol - 1,
            approximateCol,
            approximateCol + 1
        ].filter(num => {
            return (num >= 0) && (num < this.cols)
        });

        let candidateHex = null;
        let priorDist = 1000000;

        // Compute the distance from the click to the center of each hex; the shortest 
        // path will determine which hex was clicked
        for (let i = 0; i < rowIds.length; i++) {

            for (let j = 0; j < columnIds.length; j++) {

                let hex = this.hexes[rowIds[i]][columnIds[j]];

                let distance = Math.sqrt(Math.pow(clickY - hex.center.y, 2) + Math.pow(clickX - hex.center.x, 2));

                if (distance < priorDist) {
                    candidateHex = hex
                    priorDist = distance;
                }
            }
        }

        return candidateHex;
    }

    getAdjacentHexes(hex) {

        switch (hex.col % 2) {
            
            case 0:
                return [
                    this.getHex(hex.row - 1, hex.col),
                    this.getHex(hex.row + 1, hex.col),
                    this.getHex(hex.row - 1, hex.col - 1),
                    this.getHex(hex.row, hex.col - 1),
                    this.getHex(hex.row - 1, hex.col + 1),
                    this.getHex(hex.row, hex.col + 1),
                ].filter(hx => {
                    return hx != null
                });

            default:
                return [
                    this.getHex(hex.row - 1, hex.col),
                    this.getHex(hex.row + 1, hex.col),
                    this.getHex(hex.row, hex.col - 1),
                    this.getHex(hex.row, hex.col + 1),
                    this.getHex(hex.row + 1, hex.col + 1),
                    this.getHex(hex.row + 1, hex.col - 1),
                ].filter(hx => {
                    return hx != null
                });
                break;
        }
    }

}