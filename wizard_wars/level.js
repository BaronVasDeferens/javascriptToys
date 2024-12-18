import { AssetLoader, ImageAsset } from './AssetLoader.js';
import { Card, Collectable, EffectTimerFreeze, Hazard, Monster, MonsterMovementBehavior, Mover, Obstacle, Portal, SpecialEffectDeath, SpecialEffectDescend, SpecialEffectFreeze, SpecialEffectRandomize, ImageDisplayEntity, Wizard, SpecialEffectScoreDisplay, MonsterType, SpecialEffectPrecognition, TemporaryEntity, SpecialEffectPhase, EffectTimerPhase, CollectableMonster } from './entity.js';


export const TileType = Object.freeze({
    PLAYER_START: 0,
    STAIRS_DOWN: 1,
    OBSTACLE: 2,
    HAZARD: 3,
    MONSTER: 4,
    COLLECTABLE: 5
});

export const LevelType = Object.freeze({
    MEADOW: 0,
    DUNGEON: 1,
    HAVEN: 2
})

export class Level {

    numRows = 10;
    numCols = 10;
    tileSize = 64;

    levelNumber = 0;
    levelType = LevelType.MEADOW;
    floorTileSetName = "MARBLE_PINK";
    obstacleTileSetName = "PILLARS";
    hazardTileSetName = "PITS";

    playerWizard = null;
    portal = null;

    entities = [];
    collectables = [];
    obstacles = [];
    hazards = [];

    numRandomObstacles = 0;
    numHazards = 0;
    numMonstersBasic = 0;
    numMonstersScary = 0;
    numCollectables = 0;
    numCollectableMonsters = 0;

    tiles = [];

    initialize(assetLoader) {

        // Wizard
        var wizardDefinition = this.tiles.filter((t) => { return t.type == TileType.PLAYER_START })[0];
        this.playerWizard = new Wizard(
            "wizard", wizardDefinition.x * this.tileSize, wizardDefinition.y * this.tileSize, assetLoader.getImage(wizardDefinition.image)
        );
        this.entities.push(this.playerWizard);

        // Portal
        var portalDefinition = this.tiles.filter((t) => { return t.type == TileType.STAIRS_DOWN })[0];
        this.portal = new Portal(this.levelNumber + 1, portalDefinition.x * this.tileSize, portalDefinition.y * this.tileSize, assetLoader.getImage(portalDefinition.image));

        // Obstacles
        var obstacleSet = this.tiles.filter((t) => { return t.type == TileType.OBSTACLE });
        var obstacleImages = assetLoader.getTilesetForName(this.obstacleTileSetName);

        console.log(obstacleImages.length)

        obstacleSet.forEach((obs) => {
            this.obstacles.push(
                new Obstacle(`obstacle_${obs.x}_${obs.y}`, obs.x * this.tileSize, obs.y * this.tileSize, obstacleImages[this.randomIntInRange(0, obstacleImages.length)])
            );
        });

        // if (obstacleSet.length == 0 && this.numRandomObstacles > 0) {
        //     for (var i = 0; i < this.numRandomObstacles; i++) {
        //         var location = this.getSingleUnoccupiedGrid();
        //         this.obstacles.push(
        //             new Obstacle(
        //                 `obstacle_${i}`, location.x * this.tileSize, location.y * this.tileSize, obstacleImages[this.randomIntInRange(0, obstacleImages.length)])
        //         );
        //     }
        // } else {
            
        // }



        // Add hazards
        // for (var i = 0; i < numHazards; i++) {
        //     var location = getSingleUnoccupiedGrid();
        //     hazards.push(
        //         new Hazard(
        //             `hazard_${i}`, location.x * tileSize, location.y * tileSize, assetLoader.getImage(ImageAsset.HAZARD_PIT_1))
        //     )
        // }
    }

    getSingleUnoccupiedGrid() {
        var allTiles = [];
        for (var cols = 0; cols < this.numCols; cols++) {
            for (var rows = 0; rows < this.numRows; rows++) {
                allTiles.push({ x: cols, y: rows });
            }
        }

        var occupiedGrids = getAllOccupiedGrids();

        occupiedGrids.forEach(occupied => {
            allTiles = allTiles.filter(grid => { return JSON.stringify(grid) !== JSON.stringify(occupied) });
        });

        shuffle(allTiles);
        return allTiles[0];
    }

    getAllOccupiedGrids() {
        var occupiedGrids = [];

        var allEntities = this.entities.concat(this.collectables).concat(this.obstacles).concat(this.hazards);
        allEntities.forEach(entity => {
            occupiedGrids.push({ x: Math.floor(entity.x / this.tileSize), y: Math.floor(entity.y / this.tileSize) })
        });

        return occupiedGrids;
    }

    /* --- CONVENIENCE METHODS --- */
    randomIntInRange(min, max) {
        return parseInt(Math.random() * max + min);
    };

    shuffle(array) {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
    }

}

export class Level_0 extends Level {

    levelNumber = 0;

    tiles = [

        {
            x: 5,
            y: 3,
            type: TileType.PLAYER_START,
            image: ImageAsset.WIZARD_2
        },

        {
            x: 5,
            y: 5,
            type: TileType.STAIRS_DOWN,
            image: ImageAsset.STAIRS_DOWN_1
        },

        {
            x: 4,
            y: 5,
            type: TileType.OBSTACLE,
            image: null
        },

        {
            x: 6,
            y: 5,
            type: TileType.OBSTACLE,
            image: null
        },
    ];

    constructor(assetLoader) {
        super(assetLoader);
    }

}

export class LevelManager {

}