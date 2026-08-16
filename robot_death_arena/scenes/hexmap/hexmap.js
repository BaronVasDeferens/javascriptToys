import { ImageAsset } from "../../resources/ResourceManager.js";
import { Hex } from "./hex.js";

export class HexMap {

    rows = 10;
    cols = 10;
    hexSize = 42;
    zoomFactor = 4;

    isDebug = false;

    // hexes: multi-dimensional array of hexes [rows][cols]
    hexes = [];

    // hexesFlat: a flat list of hexes
    hexesFlat = [];

    // Zones: groups of contiguous hexes
    zones = new Set();
    numZones = 5;
    zoneMaxSize = 18;


    constructor(rows, cols, hexSize, resourceManager, canvas) {
        this.rows = rows;
        this.cols = cols;
        this.hexSize = hexSize;
        this.resourceManager = resourceManager;
        this.canvas = canvas;
        this.boundingRectangle = canvas.getBoundingClientRect();
        this.initialize();
    }

    initialize() {

        let imageIds = [
            ImageAsset.JUNGLE_1,
            ImageAsset.JUNGLE_2,
            ImageAsset.JUNGLE_3,
            ImageAsset.JUNGLE_4,
            ImageAsset.JUNGLE_5,
            ImageAsset.JUNGLE_6,
        ];

        this.map = [];
        for (let i = 0; i < this.rows; i++) {
            this.hexes[i] = new Array(this.rows);
            for (let j = 0; j < this.cols; j++) {
                this.hexes[i][j] = new Hex(i, j, this.hexSize, this.resourceManager.getImage(imageIds[Math.floor(imageIds.length * Math.random())]));
            }
        }
        this.hexesFlat = this.hexes.flat();

        // Compute zones
        this.zones = new Set();
        let startHexes = this.hexes.flat();
        this.shuffleArray(startHexes);

        for (let i = 0; i < this.numZones; i++) {
            this.zones.add(
                new Zone(
                    `zone ${i}`,
                    startHexes.pop(),
                    this.zoneMaxSize,
                    this.generateRandomColor()
                )
            )
        }

        this.zones.values().forEach(zone => {
            this.computeContiguousZone(zone)
        })

        console.log("--------------------------------------------------------------------")
    }

    computeContiguousZone(zone) {

        let contestedTotal = 0;
        let contestedMax = 20;

        let otherZones = [];
        this.zones.values().forEach(zn => {
            if (zn.name != zone.name) {
                otherZones.push(zn)
            }
        })

        console.log(`currentZone: ${zone.name}: size ${zone.size()} : ${zone.color}`)
        otherZones.forEach(other => {
            console.log(`       other: ${other.name} : size ${other.size()}`)
        })

        let selected = new Set();
        let frontier = new Set();
        let bailOut = false;

        selected.add(zone.startHex);
        this.getAdjacentHexes(zone.startHex).forEach(hex => frontier.add(hex));

        while ((selected.size < zone.maxSize) && (bailOut == false)) {

            let candidates = [...frontier.values()];
            this.shuffleArray(candidates);
            let candidate = candidates.pop();

            if (candidate == null) {
                bailOut = true;
                console.error("no candidate")
                break;
            }

            let presentInOtherZone = otherZones.some(otherZone => {
                return otherZone.hasHex(candidate)
            });

            if (presentInOtherZone == true) {
                contestedTotal++;
                if (contestedTotal >= contestedMax) {
                    bailOut = true;
                    console.log(`bailing out!`)
                }
                continue;
            }

            if (selected.has(candidate) == false) {
                selected.add(candidate);
                frontier.delete(candidate);
                this.getAdjacentHexes(candidate).forEach(hex => frontier.add(hex));

                if (this.isDebug) {
                    console.log(`added: ${candidate.row} ${candidate.col}`)
                }

            }
        }

        selected.values().forEach(hex => {
            hex.zoneColor = zone.color;
            zone.addHex(hex);
        });
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

        context.globalAlpha = 0.75;

        this.hexesFlat.forEach(hex => {
            hex.render(context)
        });
    }

    setDebug(isDebug) {
        this.isDebug = isDebug;
        this.hexesFlat.forEach(hex => {
            hex.isDebug = isDebug
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

    getRandomHex() {
        return this.getHex(
            Math.floor(Math.random() * this.rows),
            Math.floor(Math.random() * this.cols)
        )
    }

    generateRandomColor() {
        let hexDigits = "0123456789ABCDEF";
        let colorCode = "#"
        for (let j = 0; j < 6; j++) {
            colorCode += hexDigits.charAt(Math.floor(Math.random() * hexDigits.length));
        }
        return colorCode;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

}

export class Zone {

    name = "unnamed zone";
    startHex = null;
    maxSize = 99;
    color = "#FF0000";
    hexes = [];

    constructor(name, startHex, maxSize, color) {
        this.name = name;
        this.startHex = startHex;
        this.maxSize = maxSize;
        this.color = color;

        this.hexes.push(startHex)
    }

    addHex(hex) {
        if (this.hexes.every(other => {
            return other.id != hex.id
        })) {
            this.hexes.push(hex)
        }
    }

    hasHex(hex) {

        // console.log(`checking ${hex.id}`)
        // this.hexes.forEach(hx => {
        //     console.log(`       ${hx.id}`)
        // })


        return this.hexes.some(other => {
            return other.id == hex.id
        })
    }

    size() {
        return this.hexes.length
    }
}