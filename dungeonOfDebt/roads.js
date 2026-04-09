import { ImageAsset } from "./assets.js";


export var RoadTileType = Object.freeze({
    PAVEMENT: 0,
    SHOULDER: 1,
    OFF_ROAD: 2,
    POTHOLE_PAVED: 3,
    OBSTACLE_PAVED: 4,
    OBSTACLE_SHOULDER: 5,
    OBSTACLE_OFF_ROAD: 6,

    SHOULDER_BEND_0: 7,
    SHOULDER_BEND_90: 8,
    SHOULDER_BEND_180: 9,
    SHOULDER_BEND_270: 10

});

export var DecalType = Object.freeze({
    EMPTY: 0,

    GRASS_1: 1,
    GRASS_2: 2,
    GRASS_3: 3,
    GRASS_4: 4,

    PLANT_1: 6,
    PLANT_2: 7,

    ROCK_1: 8,

    CAR_1: 9,
    CAR_2: 10,
    CAR_3: 11,
    CAR_4: 12,

    BONE_1: 13,
    BONE_2: 14,
    BONE_3: 15,
    BONE_4: 16,
    BONE_5: 17
});

const decalsHarmless = [
    DecalType.GRASS_1,
    DecalType.GRASS_2,
    DecalType.GRASS_3,
    DecalType.GRASS_4,
    DecalType.PLANT_1,
    DecalType.PLANT_2,

    DecalType.BONE_1,
    DecalType.BONE_2,
    DecalType.BONE_3,
    DecalType.BONE_4,
    DecalType.BONE_5
];

const decalsHarmful = [
    DecalType.ROCK_1,
    DecalType.CAR_1,
    DecalType.CAR_2,
    DecalType.CAR_3,
    DecalType.CAR_4,
];

// ------------------------------ ROAD SECTION --------------------------------------

/**
 * A horizontal slice of road
 */
export class RoadSection {

    yOffset = 0;                // distance from the top of the screen
    isOffScreen = false;        // whether or not to cull this section

    roadTileTypeArray = [];
    decalTypeArray = [];

    // Harmful obstacles' indexes are tracked here; true if present, otherwise false
    obstacleIndexes = [];

    constructor(
        yOffset,              // used to compute initial yOffset 
        maxRows,                // used to compute whether the tile is off screen
        widthTiles,             // width of this section (in tiles)
        pavedWidthTiles,        // the width of the paved (drivable) area (in tiles)
        pavedIndexBegin,        // 0-indexed location of the first paved tile
        shoulderWidthTiles,     // the number of shoulder tiles per side, in addition to the width of the paved section
        tileSize,               // size of the tiles (in pixels)
        lowerNeighbor    // this is the rod section directly BELOW this one (if any); used to calculate the corners
    ) {
        this.yOffset = yOffset;
        this.maxRows = maxRows;
        this.widthInTiles = widthTiles;
        this.pavedWidthTiles = pavedWidthTiles;
        this.pavedIndexBegin = pavedIndexBegin;
        this.shoulderWidthTiles = shoulderWidthTiles;
        this.tileSize = tileSize;

        this.roadCenter = ((pavedWidthTiles * tileSize) / 2) + (pavedIndexBegin * tileSize)

        for (let i = 0; i < this.widthInTiles; i++) {

            this.obstacleIndexes[i] = 0;
            this.decalTypeArray[i] = DecalType.EMPTY;

            // Determine the position of paved tiles, shoulder tiles, and off-road tiles
            if (i >= pavedIndexBegin && i <= (pavedIndexBegin + pavedWidthTiles)) {
                this.roadTileTypeArray[i] = RoadTileType.PAVEMENT;
                this.decalTypeArray[i] = DecalType.EMPTY;
            } else if (i == pavedIndexBegin - 1 || i == pavedIndexBegin + pavedWidthTiles + 1) {
                this.roadTileTypeArray[i] = RoadTileType.SHOULDER;
                this.decalTypeArray[i] = DecalType.EMPTY;
            } else {
                this.roadTileTypeArray[i] = RoadTileType.OFF_ROAD;

                let chance = Math.floor(Math.random() * this.widthInTiles);

                switch (chance) {
                    case 0:
                        // Add a harmless decal
                        let safeDecalIndex = Math.floor(Math.random() * decalsHarmless.length);
                        let safeDecalType = Object.values(DecalType)[decalsHarmless[safeDecalIndex] - 1];
                        this.decalTypeArray[i] = safeDecalType;
                        break;
                    case 1:
                        // Add an obstacle
                        let decalIndex = Math.floor(Math.random() * (decalsHarmful.length));
                        let decalType = Object.values(DecalType)[decalsHarmful[decalIndex] - 1];
                        this.obstacleIndexes[i] = decalType;
                        break;
                    default:
                        this.obstacleIndexes[i] = 0;
                        break;
                }
            }
        }

        // Compute the corner tile (if any)

        // FIXME: this is miguided. the corner values need to be computed before WAY ahead of time!
        // FIXME: super low-leverage, don;t focus on this now

        // if (lowerNeighbor != null) {
        //     if (pavedIndexBegin == lowerNeighbor.pavedIndexBegin - 1) {
        //         this.roadTileTypeArray[pavedIndexBegin] = RoadTileType.SHOULDER_BEND_90;
        //     }
        // }
    }

    addRoadObstacle() {
        let pavedTiles = [];
        this.roadTileTypeArray.forEach((tileType, index) => {
            if (tileType == RoadTileType.PAVEMENT || tileType == RoadTileType.SHOULDER) {
                pavedTiles.push(index);
            }
        });

        let obstacleLocationIndex = pavedTiles[Math.floor(pavedTiles.length * Math.random())];
        let decalIndex = Math.floor(Math.random() * (decalsHarmful.length));
        let decalType = Object.values(DecalType)[decalsHarmful[decalIndex] - 1];
        this.obstacleIndexes[obstacleLocationIndex] = decalType;
    }

    updatePosition(distancePixels) {
        if (this.isOffScreen == true) {
            return;
        }

        this.yOffset += distancePixels;
        if (this.yOffset >= (this.maxRows * this.tileSize)) {
            this.isOffScreen = true;
        }
    }

    isOffRoad(entity) {
        let indexA = Math.floor(entity.x / this.tileSize);
        let indexB = Math.floor((entity.x + entity.imageWidth) / this.tileSize);
        return this.roadTileTypeArray[indexA] != RoadTileType.PAVEMENT || this.roadTileTypeArray[indexB] != RoadTileType.PAVEMENT
    }

    isCollideWithObstacle(entity) {
        // For any given section, an entity can be in up to two tiles simulataneously; check both possibilities
        let indexA = Math.floor(entity.x / this.tileSize);
        let indexB = Math.floor((entity.x + entity.imageWidth) / this.tileSize);
        return this.obstacleIndexes[indexA] != 0 || this.obstacleIndexes[indexB] != 0;
    }

    render(context, tilesIndexByType, decalsIndexedByType) {

        this.roadTileTypeArray.forEach((tileType, index) => {
            context.drawImage(
                tilesIndexByType[tileType],
                index * this.tileSize,
                this.yOffset);

            if (this.obstacleIndexes[index] != 0) {
                context.drawImage(
                    decalsIndexedByType[this.obstacleIndexes[index]],
                    index * this.tileSize,
                    this.yOffset
                )
            }
        });

        this.decalTypeArray.forEach((decalTypeId, index) => {
            if (decalTypeId != DecalType.EMPTY) {
                context.drawImage(
                    decalsIndexedByType[decalTypeId],
                    index * this.tileSize,
                    this.yOffset);
            }
        });
    }
}


/**
 * ------------------------------------ ROAD MANAGER ----------------------------------
 */

export class RoadManager {

    /**
     * Road Sections:
     * The road is comproised of a set of n RoadSections, where n = heightInTiles + 1
     * The uppermost visible section is at index 0.
     * As sections are updated, they move downward and are checked to see if they are "off screen."
     * Off screen sections are removed and a new section is pushed onto the top of the section array
     * above the visible portion of the screen.
     */

    roadSections = [];

    // Tiles Indexed By Type:
    // There are a finite number of road and obstacle tiles. Each road tile (image) is stored
    // in this array, index by its type id (eg index 1 is the "shoulder" tile). 
    // See RoadTileType
    tilesIndexedByType = [];

    // Decals
    // Like the road tiles, this is an array of images, indexed by DecalType
    decalsIndexedByType = [];

    pavedWidthTiles = 5;
    pavedIndexBegin = 4;
    shoulderWidthTiles = 1;

    speedInPixels = 0;
    retiredSections = 0;

    constructor(widthInTiles, heightInTiles, tileSize, assetLoader) {

        console.log(`creating road: ${widthInTiles} x ${heightInTiles} tileSize:${tileSize}`);

        this.widthInTiles = widthInTiles;
        this.heightInTiles = heightInTiles;
        this.tileSize = tileSize;
        this.assetLoader = assetLoader;
    }

    init() {

        // Tile management
        // Tile loading must be deferred until the assetLoader has finished loading assets...
        this.tilesIndexedByType[RoadTileType.PAVEMENT] = this.assetLoader.getImage(ImageAsset.BLACK);
        this.tilesIndexedByType[RoadTileType.SHOULDER] = this.assetLoader.getImage(ImageAsset.TILE_93);
        this.tilesIndexedByType[RoadTileType.OFF_ROAD] = this.assetLoader.getImage(ImageAsset.TILE_94);
        this.tilesIndexedByType[RoadTileType.POTHOLE_PAVED] = this.assetLoader.getImage(ImageAsset.TILE_95);
        this.tilesIndexedByType[RoadTileType.OBSTACLE_PAVED] = this.assetLoader.getImage(ImageAsset.TILE_95);
        this.tilesIndexedByType[RoadTileType.OBSTACLE_SHOULDER] = this.assetLoader.getImage(ImageAsset.TILE_95);
        this.tilesIndexedByType[RoadTileType.OBSTACLE_OFF_ROAD] = this.assetLoader.getImage(ImageAsset.TILE_95);

        this.tilesIndexedByType[RoadTileType.SHOULDER_BEND_0] = this.assetLoader.getImage(ImageAsset.TILE_SHOULDER_0);
        this.tilesIndexedByType[RoadTileType.SHOULDER_BEND_90] = this.assetLoader.getImage(ImageAsset.TILE_SHOULDER_90);
        this.tilesIndexedByType[RoadTileType.SHOULDER_BEND_180] = this.assetLoader.getImage(ImageAsset.TILE_SHOULDER_180);
        this.tilesIndexedByType[RoadTileType.SHOULDER_BEND_270] = this.assetLoader.getImage(ImageAsset.TILE_SHOULDER_270);

        // Decals
        this.decalsIndexedByType[DecalType.GRASS_1] = this.assetLoader.getImage(ImageAsset.DECAL_GRASS_1);
        this.decalsIndexedByType[DecalType.GRASS_2] = this.assetLoader.getImage(ImageAsset.DECAL_GRASS_2);
        this.decalsIndexedByType[DecalType.GRASS_3] = this.assetLoader.getImage(ImageAsset.DECAL_GRASS_3);
        this.decalsIndexedByType[DecalType.GRASS_4] = this.assetLoader.getImage(ImageAsset.DECAL_GRASS_4);

        this.decalsIndexedByType[DecalType.PLANT_1] = this.assetLoader.getImage(ImageAsset.DECAL_PLANT_1);
        this.decalsIndexedByType[DecalType.PLANT_2] = this.assetLoader.getImage(ImageAsset.DECAL_PLANT_2);

        this.decalsIndexedByType[DecalType.ROCK_1] = this.assetLoader.getImage(ImageAsset.DECAL_ROCK_1);

        this.decalsIndexedByType[DecalType.CAR_1] = this.assetLoader.getImage(ImageAsset.DECAL_CAR_1);
        this.decalsIndexedByType[DecalType.CAR_2] = this.assetLoader.getImage(ImageAsset.DECAL_CAR_2);
        this.decalsIndexedByType[DecalType.CAR_3] = this.assetLoader.getImage(ImageAsset.DECAL_CAR_3);
        this.decalsIndexedByType[DecalType.CAR_4] = this.assetLoader.getImage(ImageAsset.DECAL_CAR_4);

        this.decalsIndexedByType[DecalType.BONE_1] = this.assetLoader.getImage(ImageAsset.DECAL_BONES_1);
        this.decalsIndexedByType[DecalType.BONE_2] = this.assetLoader.getImage(ImageAsset.DECAL_BONES_2);
        this.decalsIndexedByType[DecalType.BONE_3] = this.assetLoader.getImage(ImageAsset.DECAL_BONES_3);
        this.decalsIndexedByType[DecalType.BONE_4] = this.assetLoader.getImage(ImageAsset.DECAL_BONES_4);
        this.decalsIndexedByType[DecalType.BONE_5] = this.assetLoader.getImage(ImageAsset.DECAL_BONES_5);

        this.setRoadProperties(this.widthInTiles, this.heightInTiles, this.pavedWidthTiles, this.pavedIndexBegin)

    }

    setRoadProperties(widthInTiles, heightInTiles, pavedWidthTiles, pavedIndexBegin) {
        this.widthInTiles = widthInTiles;
        this.heightInTiles = heightInTiles;
        this.pavedWidthTiles = pavedWidthTiles;
        this.pavedIndexBegin = pavedIndexBegin;

        this.roadSections = [];

        // Generate road sections
        for (var i = 0; i < (this.heightInTiles + 1); i++) {

            let lowerNeighbor = this.roadSections[i - 1];

            this.roadSections.push(
                new RoadSection(
                    i * this.tileSize,
                    this.heightInTiles,
                    this.widthInTiles,
                    this.pavedWidthTiles,
                    this.pavedIndexBegin,
                    this.shoulderWidthTiles,
                    this.tileSize,
                    lowerNeighbor
                )
            )
        }
    }

    updateSpeed(speedInPixels) {
        this.speedInPixels = speedInPixels;
    }

    update(levelManager) {

        this.roadSections.forEach(section => {
            section.updatePosition(this.speedInPixels);
        });

        // Examine the last section in the array and determine if it is no longer visible
        // and generate a new section if the last one is now off-screen
        let index = this.roadSections.length - 1;
        let lastSection = this.roadSections[index];
        if (lastSection.isOffScreen == true) {

            if (levelManager != null) {
                levelManager.incrementSection();
            }

            let newSection = new RoadSection(
                this.roadSections[0].yOffset - this.tileSize,                 
                this.heightInTiles,
                this.widthInTiles,
                this.pavedWidthTiles,
                this.pavedIndexBegin,
                this.shoulderWidthTiles,
                this.tileSize,
                this.shoulderBendTiles
            );

            // Add an obstacles every n sections
            this.retiredSections++;
            if (this.retiredSections % 19 == 0) {
                newSection.addRoadObstacle();
            }

            this.roadSections.pop();
            this.roadSections = [newSection].concat(this.roadSections);

            // Modify the road
            if (this.retiredSections % (this.heightInTiles / 2) == 0) {
                let chance = Math.floor(Math.random() * 10);
                switch (chance) {
                    case 0:
                    case 1:
                    case 2:
                        this.shiftRoad(1);
                        break;
                    case 3:
                    case 4:
                    case 5:
                        this.shiftRoad(-1);
                        break;
                    case 6:
                    case 7:
                        this.modifyWidth(1);
                        break;
                    case 8:
                    case 9:
                        this.modifyWidth(-1);
                        break;
                    default:
                        break;
                }
            }
        }

        if (levelManager != null) {
            this.updateSpeed(levelManager.getCurrentLevel().speed);
        }

    }

    shiftRoad(shiftBy) {

        let newStartIndex = this.pavedIndexBegin + shiftBy;

        // There must always be at least ONE off-road tile on either side 
        // of the road. 
        if (newStartIndex <= this.shoulderWidthTiles
            || (newStartIndex + this.pavedWidthTiles + this.shoulderWidthTiles + 1) >= this.widthInTiles) {
            newStartIndex = this.pavedIndexBegin;
        }
        this.pavedIndexBegin = newStartIndex;

        // console.log(`new index: ${newStartIndex}`)
    }

    modifyWidth(adjustByTiles) {

        let newWidth = this.pavedWidthTiles + adjustByTiles;

        // The width must be a minimum of 1 tile wide, plus any shoulder
        if (newWidth < 1
            || (newWidth + this.pavedIndexBegin + this.shoulderWidthTiles + 1) >= this.widthInTiles) {
            newWidth = this.pavedWidthTiles;
        }

        this.pavedWidthTiles = newWidth;
        // console.log(`new width: ${newWidth}`)
    }

    findRoadSectionsForEntityPosition(entity) {

        let inRows = this.roadSections.filter(section => {
            let isInUpper = (section.yOffset <= entity.y) && (entity.y <= section.yOffset + section.tileSize);
            let isInLower = ((entity.y + entity.imageHeight) >= section.yOffset) && ((entity.y + entity.imageHeight) <= section.yOffset + section.tileSize);
            return isInUpper || isInLower;
        });

        return inRows;
    }

    getCenterOfRoadForSection(section) {
        return section.roadCenter;
    }

    render(context) {
        this.roadSections.forEach(section => {
            section.render(context, this.tilesIndexedByType, this.decalsIndexedByType);
        });
    }

}