
class Vertex {
    x = 0;
    y = 0;
    radius = 5;
    size = 100;
    color = "#d2d4d2"

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    render(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.ellipse(
            this.x * this.size,
            this.y * this.size,
            this.radius,
            this.radius,
            2 * Math.PI,
            2 * Math.PI,
            false);
        context.fill();
    }
}

class Piece {
    x = 0;
    y = 0;

    size = 50;
    color = "#ff8c00";
    face = 0; // 1=top 2=right 3=bottom 4=left 



    constructor(x, y, color, face) {
        this.x = x;
        this.y = y;
        this.color = color;

        if (face != undefined) {
            this.face = face;
        }
    }

    render(context) {
        context.fillStyle = this.color;
        context.fillRect((this.x * 100) - 25, (this.y * 100) - 25, this.size, this.size);

        if (this.face != 0) {
            context.fillStyle = "#0000FF";
            context.beginPath();
            context.moveTo(this.x * 100, this.y * 100);

            switch (this.face) {
                case 1:
                    context.lineTo(this.x * 100, this.y * 100 - 25);
                    break;
                case 2:
                    context.lineTo(this.x * 100 + 25, this.y * 100);
                    break;
                case 3:
                    context.lineTo(this.x * 100, this.y * 100 + 25);
                    break;
                case 4:
                    context.lineTo(this.x * 100 - 25, this.y * 100);
                    break;
            }

            context.stroke();
        }
    }

    renderAtPoint(x, y, context) {
        context.fillStyle = this.color;
        context.fillRect(x - 25, y - 25, this.size, this.size);

        if (this.face != 0) {
            context.fillStyle = "#0000FF";
            context.beginPath();
            context.moveTo(x, y);

            switch (this.face) {

                case 1:
                    context.lineTo(x, y - 25);
                    break;
                case 2:
                    context.lineTo(x + 25, y );
                    break;
                case 3:
                    context.lineTo(x, y + 25);
                    break;
                case 4:
                    context.lineTo(x - 25, y );
                    break;
            }

            context.stroke();
        }
    }

    containsClick(clickX, clickY) {
        return (clickX >= ((this.x * 100) - 25)
            && clickX <= (this.x * 100) + 25)
            && clickY >= ((this.y * 100) - 25)
            && clickY <= (this.y * 100) + 25;
    }
}

const GameState = Object.freeze({
    IDLE: "IDLE",
    MOVING_PIECE: "MOVING_PIECE",
});


/**
 * DETETCT CLICK (DOWN)
 */
document.addEventListener('mousedown', (e) => {
    pieces.forEach(piece => {
        if (piece.containsClick(e.offsetX, e.offsetY)) {
            selectedPiece = piece;
            state = GameState.MOVING_PIECE;
        }
    });

    if (selectedPiece == null) {
        state = GameState.IDLE;
    }

    console.log(`state: ${state}`);
});

/**
 * DETECT CLICK (UP)
 */
document.addEventListener('mouseup', (e) => {

    if (selectedPiece != null) {

        // find closest vertex
        candidateX = Math.round(e.offsetX / 100);
        candidateY = Math.round(e.offsetY / 100);

        // Check for occupancy
        let occupied = pieces.some(piece => {
            return piece.x == candidateX && piece.y == candidateY
        });

        if (!occupied) {
            selectedPiece.x = candidateX;
            selectedPiece.y = candidateY;
            console.log(`moved piece to ${selectedPiece.x},${selectedPiece.y}`);
        }
        selectedPiece = null;
        state = GameState.IDLE;
        render();
    }
});

/**
 * DETECT MOUSE MOVEMENT
 */
document.addEventListener('mousemove', (e) => {
    if (selectedPiece != null) {
        render();
        selectedPiece.renderAtPoint(e.offsetX, e.offsetY, context);
    }
});


/**
 * 
 * 
 * GAME FUNCTIONS
 * 
 * 
 */

var vertices = new Array();
var pieces = new Array();
var state = GameState.IDLE;
var selectedPiece = null;

const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

var setup = function () {

    // Define the corner vertices
    var removeThese = Array.from([
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 6, y: 1 },
        { x: 7, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 6, y: 2 },
        { x: 7, y: 2 },
        { x: 1, y: 6 },
        { x: 2, y: 6 },
        { x: 6, y: 6 },
        { x: 7, y: 6 },
        { x: 1, y: 7 },
        { x: 2, y: 7 },
        { x: 6, y: 7 },
        { x: 7, y: 7 }]);

    // Set up the vertices
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 7; j++) {
            // Filter out the corner vertices
            let skipMe = removeThese.filter(skip => {
                return skip.x == i + 1 && skip.y == j + 1
            }).length > 0;

            if (!skipMe) {
                vertices.push(new Vertex(i + 1, j + 1));
            }
        }
    }

    // Set up the Fox
    pieces.push(new Piece(4, 5, "#f5b318"));

    // Add the geese
    
    // TOP
    pieces.push(new Piece(3, 1, "#1871f5", 3));
    pieces.push(new Piece(4, 1, "#1871f5", 3));
    pieces.push(new Piece(5, 1, "#1871f5", 3));
    pieces.push(new Piece(3, 2, "#1871f5", 3));
    pieces.push(new Piece(4, 2, "#1871f5", 3));
    pieces.push(new Piece(5, 2, "#1871f5", 3));
    pieces.push(new Piece(3, 3, "#1871f5", 3));
    pieces.push(new Piece(4, 3, "#1871f5", 3));
    pieces.push(new Piece(5, 3, "#1871f5", 3));

    pieces.push(new Piece(1, 3, "#1871f5", 3));
    pieces.push(new Piece(2, 3, "#1871f5", 3));
    pieces.push(new Piece(1, 4, "#1871f5", 3));
    pieces.push(new Piece(1, 5, "#1871f5", 3));

    pieces.push(new Piece(6, 3, "#1871f5", 3));
    pieces.push(new Piece(7, 3, "#1871f5", 3));
    pieces.push(new Piece(7, 4, "#1871f5", 3));
    pieces.push(new Piece(7, 5, "#1871f5", 3));

    render();
}();



function render() {

    context.fillStyle = "#00402d";
    context.fillRect(0, 0, canvas.width, canvas.height);

    vertices.forEach(vtx => {
        vtx.render(context);
    });


    pieces.forEach(piece => {
        if (piece != selectedPiece) {
            piece.render(context);
        }
    });

}