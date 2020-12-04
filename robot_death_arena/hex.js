export class Hex {

    color = 'blue'
    isSelected = false;

    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    setColor(newColor) {
        this.color = newColor;
    }

}