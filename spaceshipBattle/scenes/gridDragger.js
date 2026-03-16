import { Scene, SceneType } from "./scene.js";
import { ImageAsset } from "../assets.js";
import { Entity } from "../entity.js"
import { MovementDriver } from "../driver.js"

/**
 * GRID MAP SCENE
 * Movement and combat on a grid-based battlefield
 */
export class GridDraggerScene extends Scene {

    gridMap = null;
    entities = [];

    drivers = [];

    GamePhase = Object.freeze({
        IDLE: "IDLE",
        PLAYER_ENTITY_SELECTED: "PLAYER_ENTITY_SELECTED"
    });

    phase = this.GamePhase.IDLE;

    selectedEntity = null;
    selectedEntityGhost = null;

    constructor(tileSize, canvas, assetManager, soundPlayer) {

        super(SceneType.GRID_DRAGGER, canvas, assetManager, soundPlayer);

        this.tileSize = tileSize;
        this.gridMap = new GridMap(
            tileSize,
            canvas,
            assetManager
        );

        let creaturesImages = [
            ImageAsset.DINOSAUR_1,
            ImageAsset.DINOSAUR_2,
            ImageAsset.ALIEN_1,
            ImageAsset.ALIEN_2,
            ImageAsset.ALIEN_3
        ];

        this.shuffleArray(creaturesImages);

        creaturesImages.forEach(imageAssetId => {
            this.entities.push(
                new Entity(
                    this.randomInRange(tileSize, this.canvas.width - tileSize),
                    this.randomInRange(tileSize, this.canvas.height - tileSize),
                    assetManager.getImage(imageAssetId)
                )
            )
        });

    }

    randomInRange(min, max) {
        let range = Math.abs(max - min);
        return Math.floor(Math.random() * range) + min
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }


    update(deltaMillis) {
        if (this.drivers.length > 0) {
            this.drivers[0].update(deltaMillis);
        }

        this.drivers = this.drivers.filter(driver => {
            return !driver.isFinished
        });
    }


    render(context) {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.gridMap.render(context);
        this.entities.forEach(entity => {
            entity.render(context);
        });

        if (this.selectedEntityGhost != null) {
            this.selectedEntityGhost.render(context);
        }
    }

    onMouseDown(click) {

        if (this.phase == this.GamePhase.IDLE && this.selectedEntity == null) {
            // find the entity under the mouse click
            let candidate = this.entities.filter(entity => {
                return entity.wasClicked(click)
            })[0];

            if (candidate != null) {
                this.phase = this.GamePhase.PLAYER_ENTITY_SELECTED;
                this.selectedEntity = candidate;
                let coords = this.selectedEntity.getCenteredCoordsOnMouse(click);
                this.selectedEntityGhost = new Entity(coords.x, coords.y, this.selectedEntity.image);
                this.selectedEntity.setAlpha(0.25);
            }
        }
    }

    onMouseUp(click) {

        switch (this.phase) {
            case this.GamePhase.IDLE:
                break;

            case this.GamePhase.PLAYER_ENTITY_SELECTED:

                // Place the selected entity...
                this.selectedEntity.setAlpha(1.0);
                this.drivers.push(

                    new MovementDriver(
                        this.selectedEntity,
                        this.selectedEntityGhost.x,
                        this.selectedEntityGhost.y,
                        1000,
                        function () {
                            console.log("Done!")
                        }
                    )
                )

                this.selectedEntity = null;
                this.selectedEntityGhost = null
                this.phase = this.GamePhase.IDLE;
                break;

            default:
                break;
        }


    }

    onMouseMove(event) {

        switch (this.phase) {

            case this.GamePhase.IDLE:
                break;

            case this.GamePhase.PLAYER_ENTITY_SELECTED:
                let coords = this.selectedEntity.getCenteredCoordsOnMouse(event);
                this.selectedEntityGhost.x = coords.x;
                this.selectedEntityGhost.y = coords.y;
                break;

            default:
                break;
        }
    }

    onKeyPressed(event) {

    }

}

class GridSquare {

    x = 0;
    y = 0;
    tileSize = 64;


    isOccupied = false;
    isObstructed = false;


    constructor(x, y, tileSize, assetManager) {
        this.x = x;
        this.y = y;
        this.size = tileSize;
        this.imageObstructed = assetManager.getImage(ImageAsset.FLOOR_OBSTRUCTION);      // THIS IS WASTEFUL! LOLOL
        this.imageClear = assetManager.getImage(ImageAsset.FLOOR);
    }

    setColor(color) {
        this.color = color;
    }

    containsPoint(x, y) {
        if (x > this.x && x < this.x + this.size) {
            if (y > this.y && y < this.y + this.size) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    getCenterCoords() {
        let xCenter = (this.x * this.size) + (this.size / 2);
        let yCenter = (this.y * this.size) + (this.size / 2);
        return { x: xCenter, y: yCenter };
    }

    getOnScreenPos() {
        return {
            x: this.x * this.size,
            y: this.y * this.size,
            size: this.size
        };
    }

    render(context) {
        if (this.isObstructed) {
            context.drawImage(this.imageObstructed, this.x * this.size, this.y * this.size);
        } else {
            context.drawImage(this.imageClear, this.x * this.size, this.y * this.size);
        }
    }
}

/**
 * --------------------------------- GRID MAP ----------------------------------
 */


class GridMap {

    rows = 5;
    columns = 5;
    soldiers = [];
    blobs = [];
    gridSquares = [];

    constructor(tileSize, canvas, assetManager) {

        this.tileSize = tileSize;
        this.canvas = canvas;
        this.assetManager = assetManager;

        this.cols = Math.floor(canvas.width / tileSize);
        this.rows = Math.floor(canvas.height / tileSize);

        for (let i = 0; i < this.cols; i++) {
            this.gridSquares[i] = new Array(0);
            for (let j = 0; j < this.rows; j++) {
                this.gridSquares[i].push(
                    new GridSquare(i, j, tileSize, assetManager)
                );
            }
        }

        this.allSquares = this.gridSquares.flat(arr => {
            arr.flat();
        }).flat();

        this.clearConnections();

    }


    clearConnections() {
        this.connections = [];
    }

    computeConnections() {

        let shuffledGrids = this.gridSquares.flat(arr => {
            arr.flat();
        }).flat();

        this.shuffleArray(shuffledGrids);

        this.connections = [];

        while (shuffledGrids.length > 0) {

            let start = shuffledGrids.pop();

            for (let i = 0; i < 3; i++) {

                let neighbors = this.getAdjacentSquares(start, true);
                this.shuffleArray(neighbors);
                let candidate = neighbors.pop();

                let startCenter = start.getCenterCoords()
                let endCenter = candidate.getCenterCoords();

                this.connections.push(
                    {
                        x1: startCenter.x,
                        y1: startCenter.y,
                        x2: endCenter.x,
                        y2: endCenter.y
                    }
                )

                let index = neighbors.indexOf(candidate);
                if (index > -1) {
                    neighbors.splice(index, 1);
                }

                index = shuffledGrids.indexOf(candidate);
                if (index > -1) {
                    shuffledGrids.splice(index, 1);
                }

                start = candidate;
            }

        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getAdjacentSquares(center, includeDiagonals) {

        if (includeDiagonals == null) {
            includeDiagonals = false;
        }

        let neighbors = [];

        if (center.x + 1 < this.cols && this.gridSquares[center.x + 1][center.y] != undefined) {
            neighbors.push(this.gridSquares[center.x + 1][center.y]);
        }

        if (center.x - 1 >= 0 && this.gridSquares[center.x - 1][center.y] != undefined) {
            neighbors.push(this.gridSquares[center.x - 1][center.y]);
        }

        if (center.y + 1 < this.rows && this.gridSquares[center.x][center.y + 1] != undefined) {
            neighbors.push(this.gridSquares[center.x][center.y + 1]);
        }

        if (center.y - 1 >= 0 && this.gridSquares[center.x][center.y - 1] != undefined) {
            neighbors.push(this.gridSquares[center.x][center.y - 1]);
        }

        if (includeDiagonals == true) {

            if (center.x + 1 < this.cols
                && center.y + 1 < this.rows
                && this.gridSquares[center.x + 1][center.y + 1] != undefined
            ) {
                neighbors.push(this.gridSquares[center.x + 1][center.y + 1]);
            }

            if (center.x - 1 >= 0
                && center.y + 1 < this.rows
                && this.gridSquares[center.x - 1][center.y + 1] != undefined) {
                neighbors.push(this.gridSquares[center.x - 1][center.y + 1]);
            }

            if (center.x + 1 < this.cols
                && center.y - 1 >= 0
                && this.gridSquares[center.x + 1][center.y - 1] != undefined) {
                neighbors.push(this.gridSquares[center.x + 1][center.y - 1]);
            }

            if (center.x - 1 >= 0
                && center.y - 1 >= 0
                && this.gridSquares[center.x - 1][center.y - 1] != undefined) {
                neighbors.push(this.gridSquares[center.x][center.y - 1]);
            }
        }

        return neighbors;
    }


    render(context) {
        this.allSquares.forEach(square => {
            square.render(context);
        })

        this.connections.forEach(connection => {
            context.strokeStyle = "#FF0000";
            context.lineWidth = 1.0;
            context.globalAlpha = 1.0;
            context.save();
            context.beginPath();
            context.moveTo(connection.x1, connection.y1);
            context.lineTo(connection.x2, connection.y2);
            context.stroke();
            context.restore();
            context.globalAlpha = 1.0;
        })

    }

    getGridSquare(col, row) {
        return this.gridSquares.filter((sq) => {
            if (sq.x == col && sq.y == row) {
                return true;
            } else {
                return false;
            }
        })[0];
    }

    getGridSquareAtClick(click) {
        // columns: x
        // rows : y

        let column = Math.floor(click.x / this.tileSize);
        let row = Math.floor(click.y / this.tileSize);

        if (column > this.cols || row > this.rows) {
            return;
        }

        return this.gridSquares[column].find(sq => sq.y === row);
    }
}