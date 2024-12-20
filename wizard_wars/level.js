import { AssetLoader, ImageAsset } from './AssetLoader.js';
import { Card, Collectable, EffectTimerFreeze, Hazard, Monster, MonsterMovementBehavior, Mover, Obstacle, Portal, SpecialEffectDeath, SpecialEffectDescend, SpecialEffectFreeze, SpecialEffectRandomize, ImageDisplayEntity, Wizard, SpecialEffectScoreDisplay, MonsterType, SpecialEffectPrecognition, TemporaryEntity, SpecialEffectPhase, EffectTimerPhase, CollectableMonster } from './entity.js';


export const EntityType = Object.freeze({
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

    numObstaclesRandom = 0;
    numHazardsRandom = 0;
    numCollectablesRandom = 0;

    numMonstersBasic = 0;
    numMonstersScary = 0;
    numCollectableMonsters = 0;

    tiles = [];

    constructor(levelNumber) {
        this.levelNumber = levelNumber
    }

    initialize(assetLoader) {

        // All of the pre-defined entities shall be placed FIRST, followed by the randomly-placed
        // entities; we want to avoid accidentally placing a random entity in a tile where one
        // is defined later.

        // Wizard (defined / undefined)
        var wizardDefinition = this.tiles.filter((t) => { return t.type == EntityType.PLAYER_START })[0];

        if (wizardDefinition != null) {
            this.playerWizard = new Wizard(
                "wizard", wizardDefinition.x * this.tileSize, wizardDefinition.y * this.tileSize, assetLoader.getImage(wizardDefinition.image)
            );
        } else {
            var location = this.getSingleUnoccupiedGrid();
            this.playerWizard = new Wizard(
                "wizard", location.x * this.tileSize, location.y * this.tileSize, assetLoader.getImage(ImageAsset.WIZARD_1)
            );
        }

        this.entities.push(this.playerWizard);

        // Portal (defined / undefined)
        var portalDefinition = this.tiles.filter((t) => { return t.type == EntityType.STAIRS_DOWN })[0];

        if (portalDefinition != null) {
            this.portal = new Portal(this.levelNumber + 1, portalDefinition.x * this.tileSize, portalDefinition.y * this.tileSize, assetLoader.getImage(portalDefinition.image));
        } else {
            var location = this.getSingleUnoccupiedGrid();
            this.portal = new Portal(this.levelNumber + 1, location.x * this.tileSize, location.y * this.tileSize, assetLoader.getImage(ImageAsset.STAIRS_DOWN_1));
        }

        // Obstacles (defined)
        var obstacleImages = assetLoader.getTilesetForName(this.obstacleTileSetName);
        var obstacleSet = this.tiles.filter((t) => { return t.type == EntityType.OBSTACLE });
        obstacleSet.forEach((obs) => {
            var obstacleImage;
            if (obs.image != null) {
                obstacleImage = assetLoader.getImage(obs.image);
            } else {
                obstacleImage = obstacleImages[this.randomIntInRange(0, obstacleImages.length)];
            }
            this.obstacles.push(
                new Obstacle(`obstacle_${obs.x}_${obs.y}`, obs.x * this.tileSize, obs.y * this.tileSize, obstacleImage)
            );
        });

        // Hazards (defined)
        var hazardImages = assetLoader.getTilesetForName(this.hazardTileSetName);
        var hazardSet = this.tiles.filter((t) => { return t.type == EntityType.HAZARD });
        hazardSet.forEach((haz) => {
            var hazardImage;
            if (haz.image != null) {
                hazardImage = assetLoader.getImage(haz.image);
            } else {
                hazardImage = hazardImages[this.randomIntInRange(0, hazardImages.length)];
            }

            this.hazards.push(
                new Hazard(`hazard_${haz.x}_${haz.y}`, haz.x * this.tileSize, haz.y * this.tileSize, hazardImage)
            );
        });

        // Collectables (defined)
        var coinImages = assetLoader.getTilesetForName("GOLDSTACKS");
        var collectableSet = this.tiles.filter((t) => { return t.type == EntityType.COLLECTABLE });
        collectableSet.forEach((collect) => {
            this.collectables.push(
                new Collectable(`gold`, collect.x * this.tileSize, collect.y * this.tileSize, coinImages[this.randomIntInRange(0, coinImages.length)])
            );
        })

        // Monsters (defined)
        this.tiles.filter((t) => {
            return t.type == EntityType.MONSTER
        }).forEach((monster) => {
            this.entities.push(
                this.createMonster(monster.class, monster.x * this.tileSize, monster.y * this.tileSize, assetLoader)
            );
        });

        // --- RANDOM ELEMENTS ---

        var location = this.getSingleUnoccupiedGrid();

        // Obstacles (random)
        for (var i = 0; i < this.numObstaclesRandom; i++) {
            location = this.getSingleUnoccupiedGrid();
            this.obstacles.push(
                new Obstacle(
                    `obstacle_${i}`, location.x * this.tileSize, location.y * this.tileSize, obstacleImages[this.randomIntInRange(0, obstacleImages.length)])
            );
        }

        // Hazards (random)
        for (var i = 0; i < this.numHazardsRandom; i++) {
            location = this.getSingleUnoccupiedGrid();
            this.hazards.push(
                new Hazard(
                    `hazard_${i}`, location.x * this.tileSize, location.y * this.tileSize, hazardImages[this.randomIntInRange(0, hazardImages.length)])
            )
        }

        // Collectables (random)
        for (var i = 0; i < this.numCollectablesRandom; i++) {
            location = this.getSingleUnoccupiedGrid();
            this.collectables.push(
                new Collectable(`gold_${i}`, location.x * this.tileSize, location.y * this.tileSize, coinImages[this.randomIntInRange(0, coinImages.length)])
            );
        }

        // Monsters: BASIC (random)
        for (var i = 0; i < this.numMonstersBasic; i++) {
            location = this.getSingleUnoccupiedGrid();
            this.entities.push(
                this.createMonster(
                    MonsterType.RAT,
                    location.x * this.tileSize,
                    location.y * this.tileSize,
                    assetLoader)
            );
        }

        // Monsters: SCARY (random)
        for (var i = 0; i < this.numMonstersScary; i++) {
            location = this.getSingleUnoccupiedGrid();
            let chance = Math.floor(Math.random() * 10);

            switch (chance) {
                case 0:
                case 1:
                case 2:
                    this.entities.push(
                        this.createMonster(MonsterType.RAT_MAN, location.x * this.tileSize, location.y * this.tileSize, assetLoader)
                    );
                    break;
                case 3:
                case 4:
                    // Add seeking wasp
                    this.entities.push(
                        this.createMonster(MonsterType.WASP_CHASER, location.x * this.tileSize, location.y * this.tileSize, assetLoader)
                    );
                    break;
                case 5:
                case 6:
                    // Add replicating blob
                    var monster = this.createMonster(MonsterType.BLOB, location.x * this.tileSize, location.y * this.tileSize, assetLoader);
                    monster.replicationsRemaining = 1;
                    this.entities.push(monster);
                    break;
                case 7:
                case 8:
                    // Add ghost (basic)
                    var monster = this.createMonster(MonsterType.GHOST_BASIC, location.x * this.tileSize, location.y * this.tileSize, assetLoader);
                    this.entities.push(monster);
                    break;
                case 9:
                    // Add ghost (chaser)
                    var monster = this.createMonster(MonsterType.GHOST_CHASER, location.x * this.tileSize, location.y * this.tileSize, assetLoader);
                    this.entities.push(monster);
                    break;
            }
        }
    }

    getSingleUnoccupiedGrid() {
        var allTiles = [];
        for (var cols = 0; cols < this.numCols; cols++) {
            for (var rows = 0; rows < this.numRows; rows++) {
                allTiles.push({ x: cols, y: rows });
            }
        }

        var occupiedGrids = this.getAllOccupiedGrids();

        occupiedGrids.forEach(occupied => {
            allTiles = allTiles.filter(grid => { return JSON.stringify(grid) !== JSON.stringify(occupied) });
        });

        this.shuffle(allTiles);
        return allTiles[0];
    }

    getAllOccupiedGrids() {
        var occupiedGrids = [];

        var allEntities = this.entities.concat(this.collectables).concat(this.obstacles).concat(this.hazards).concat(this.portal);
        allEntities.forEach((entity) => {
            occupiedGrids.push(
                {
                    x: Math.floor(entity.x / this.tileSize),
                    y: Math.floor(entity.y / this.tileSize)
                })
        });

        return occupiedGrids;
    }

    createMonster(type, x, y, assetLoader) {
        var monster;
        switch (type) {
            case MonsterType.RAT:
                monster = new Monster(
                    "rat", x, y, MonsterMovementBehavior.RANDOM, assetLoader.getImage(ImageAsset.MONSTER_RAT_SMALL)
                );
                monster.isBlockedByHazard = true;
                monster.isBlockedByObstacle = true;
                monster.isBlockedByCollectable = true;
                monster.isBlockedByPortal = true;
                return monster;

            case MonsterType.RAT_MAN:
                monster = new Monster(
                    "rat_man", x, y, MonsterMovementBehavior.CHASE_PLAYER, assetLoader.getImage(ImageAsset.MONSTER_RAT_MAN)
                );
                monster.isBlockedByHazard = true;
                monster.isBlockedByObstacle = true;
                monster.isBlockedByCollectable = true;
                monster.isBlockedByPortal = true;
                return monster;

            case MonsterType.WASP_BASIC:
                monster = Monster(
                    `wasp`, x, y, MonsterMovementBehavior.RANDOM, assetLoader.getImage(ImageAsset.MONSTER_WASP_YELLOW)
                );
                monster.isBlockedByHazard = false;
                monster.isBlockedByObstacle = true;
                monster.isBlockedByCollectable = true;
                monster.isBlockedByPortal = true;
                return monster;

            case MonsterType.WASP_CHASER:
                monster = new Monster(
                    `wasp_chaser`, x, y, MonsterMovementBehavior.CHASE_PLAYER, assetLoader.getImage(ImageAsset.MONSTER_WASP_RED)
                );
                monster.isBlockedByHazard = false;
                monster.isBlockedByObstacle = true;
                monster.isBlockedByCollectable = true;
                monster.isBlockedByPortal = true;
                return monster;

            case MonsterType.BLOB:
                monster = new Monster(
                    `blob`, x, y, MonsterMovementBehavior.REPLICATE, assetLoader.getImage(ImageAsset.MONSTER_BLOB_1)
                );
                monster.isBlockedByHazard = true;
                monster.isBlockedByObstacle = true;
                monster.isBlockedByCollectable = true;
                monster.isBlockedByPortal = true;
                return monster;

            case MonsterType.GHOST_BASIC:
                monster = new Monster(
                    `ghost`, x, y, MonsterMovementBehavior.RANDOM, assetLoader.getImage(ImageAsset.MONSTER_GHOST_1)
                );
                monster.isBlockedByHazard = false;
                monster.isBlockedByObstacle = false;
                monster.isBlockedByCollectable = false;
                monster.isBlockedByPortal = false;
                return monster;

            case MonsterType.GHOST_CHASER:
                monster = new Monster(
                    `ghost`, x, y, MonsterMovementBehavior.CHASE_PLAYER, assetLoader.getImage(ImageAsset.MONSTER_GHOST_2)
                );
                monster.isBlockedByHazard = false;
                monster.isBlockedByObstacle = false;
                monster.isBlockedByCollectable = false;
                monster.isBlockedByPortal = false;
                return monster;
        }

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

    numObstaclesRandom = 2;
    numHazardsRandom = 2;
    numCollectablesRandom = 9;

    numMonstersBasic = 1;
    numMonstersScary = 0;
    numCollectableMonsters = 0;

    tiles = [

        {
            x: 5,
            y: 3,
            type: EntityType.PLAYER_START,
            image: ImageAsset.WIZARD_2
        },

        {
            x: 5,
            y: 5,
            type: EntityType.STAIRS_DOWN,
            image: ImageAsset.STAIRS_DOWN_1
        },

        {
            x: 4,
            y: 5,
            type: EntityType.OBSTACLE,
            image: null,
        },

        {
            x: 6,
            y: 5,
            type: EntityType.OBSTACLE,
            image: null,
        },

        {
            x: 5,
            y: 6,
            type: EntityType.HAZARD,
            image: null,
        },

        {
            x: 1,
            y: 1,
            type: EntityType.COLLECTABLE,
            image: null
        },

        {
            x: 9,
            y: 9,
            type: EntityType.MONSTER,
            class: MonsterType.GHOST_CHASER,
            image: null
        },

        {
            x: 0,
            y: 9,
            type: EntityType.MONSTER,
            class: MonsterType.GHOST_CHASER,
            image: null
        }

    ];

    constructor(assetLoader) {
        super(assetLoader);
    }

}

export class LevelManager {

}