import { AssetLoader, ImageAsset, SoundAsset } from './AssetLoader.js';
import { Card, Collectable, EffectTimerFreeze, Hazard, Monster, MonsterMovementBehavior, Mover, Obstacle, Portal, SpecialEffectDeath, SpecialEffectDescend, SpecialEffectFreeze, SpecialEffectRandomize, ImageDisplayEntity, Wizard, SpecialEffectScoreDisplay, MonsterType, SpecialEffectPrecognition, TemporaryEntity, SpecialEffectPhase, EffectTimerPhase, CollectableMonster } from './entity.js';


export const EntityType = Object.freeze({
    PLAYER_START: 0,
    PORTAL: 1,
    OBSTACLE: 2,
    HAZARD: 3,
    MONSTER: 4,
    COLLECTABLE: 5,
    COLLECT_MONSTER_RING: 6,
    COLLECT_MONSTER_KEY: 7
});

export const LevelType = Object.freeze({
    SURFACE: 0,
    DUNGEON: 1,
    HAVEN: 2
})

export class Level {

    levelNumber = 0;

    numRows = 10;
    numCols = 10;
    tileSize = 64;

    levelType = LevelType.SURFACE;
    floorTileSetName = "CRYPT";
    obstacleTileSetName = "PILLARS";
    hazardTileSetName = "PITS";

    backgroundMusicPlay = true;
    backgroundMusicTitle = SoundAsset.BGM;

    requiresKeyToExit = false;

    playerWizard = null;

    portals = [];
    entities = [];
    collectables = [];
    obstacles = [];
    hazards = [];

    numObstaclesRandom = 0;
    numHazardsRandom = 0;
    numCollectablesRandom = 0;

    numMonstersBasic = 0;
    numMonstersScary = 0;
    numMonstersCollectable = 0;

    // Definitions: the entity definitions (including portals) for this level
    definitions = [];

    constructor(levelNumber) {
        this.levelNumber = levelNumber;
    }


    // Populates the level with a challenging number of monsters, collectables, hazards, and obstacles.
    setRandomValues() {
        this.numObstaclesRandom = 3 + (Math.floor(this.levelNumber / 2));
        this.numHazardsRandom = 2 + (Math.floor(this.levelNumber / 3));
        this.numCollectablesRandom = this.levelNumber + 3;

        // Default monster population
        this.numMonstersScary = Math.floor(this.levelNumber / 3);
        this.numMonstersBasic = 2 + this.levelNumber - this.numMonstersScary;

        if (this.levelNumber % 3 == 0) {
            this.numMonstersCollectable = 1;
        } else {
            this.numMonstersCollectable = 0;
        }
    }


    initialize(assetLoader) {

        var location = null;

        // All of the pre-defined entities shall be placed FIRST, followed by the randomly-placed
        // entities; we want to avoid accidentally placing a random entity in a tile where one
        // is defined later.

        // Wizard (defined / undefined)
        var wizardDefinition = this.definitions.filter((t) => { return t.type == EntityType.PLAYER_START })[0];

        if (wizardDefinition != null) {
            this.playerWizard = new Wizard(
                "wizard", wizardDefinition.x * this.tileSize, wizardDefinition.y * this.tileSize, assetLoader.getImage(wizardDefinition.image)
            );
        } else {
            location = this.getSingleUnoccupiedGrid();
            this.playerWizard = new Wizard(
                "wizard", location.x * this.tileSize, location.y * this.tileSize, assetLoader.getImage(ImageAsset.WIZARD_2)
            );
        }

        this.entities.push(this.playerWizard);

        // Portals (defined / undefined)
        var stairsDownDefinition = this.definitions.filter((t) => { return t.type == EntityType.PORTAL })[0];

        if (stairsDownDefinition == null) {
            location = this.getSingleUnoccupiedGrid();
            this.portals.push(new Portal(this.levelNumber + 1, location.x * this.tileSize, location.y * this.tileSize, assetLoader.getImage(ImageAsset.STAIRS_DOWN_1), SoundAsset.DESCEND));
        } else {
            var portalDefinitions = this.definitions.filter((t) => { return t.type == EntityType.PORTAL });
            portalDefinitions.forEach(portal => {

                var newPortal = null;
                if (portal.randomLocation == true) {
                    location = this.getSingleUnoccupiedGrid();
                    newPortal = new Portal(portal.toLevelNumber, location.x * this.tileSize, location.y * this.tileSize, assetLoader.getImage(portal.image), portal.soundEffectName);
                } else {
                    newPortal = new Portal(portal.toLevelNumber, portal.x * this.tileSize, portal.y * this.tileSize, assetLoader.getImage(portal.image), portal.soundEffectName);
                }

                if (portal.isVisible == false) {
                    var tiles = assetLoader.getTilesetForName(this.floorTileSetName);
                    this.shuffle(tiles);
                    newPortal.setHiddenImage(tiles[0]);
                    newPortal.isVisible = false;
                }

                if (portal.requiresKey != null) {
                    newPortal.requiresKey = portal.requiresKey;
                }

                this.portals.push(newPortal);
            });
        }

        // Obstacles (defined)
        var obstacleImages = assetLoader.getTilesetForName(this.obstacleTileSetName);
        var obstacleSet = this.definitions.filter((t) => { return t.type == EntityType.OBSTACLE });
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
        var hazardSet = this.definitions.filter((t) => { return t.type == EntityType.HAZARD });
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

        // Collectables: Gold (defined)
        var coinImages = assetLoader.getTilesetForName("GOLDSTACKS");
        var collectableSet = this.definitions.filter((t) => { return t.type == EntityType.COLLECTABLE });
        collectableSet.forEach((collect) => {
            this.collectables.push(
                new Collectable(`gold`, collect.x * this.tileSize, collect.y * this.tileSize, coinImages[this.randomIntInRange(0, coinImages.length)])
            );
        })

        // Monsters (defined)
        this.definitions.filter((t) => {
            return t.type == EntityType.MONSTER
        }).forEach((monster) => {

            var newMonster = null;
            if (monster.x == undefined || monster.y == undefined) {
                location = this.getSingleUnoccupiedGrid();
                newMonster = this.createMonster(monster.monsterClass, location.x * this.tileSize, location.y * this.tileSize, assetLoader);
            } else {
                newMonster = this.createMonster(monster.monsterClass, monster.x * this.tileSize, monster.y * this.tileSize, assetLoader);
            }
            this.entities.push(newMonster);
        });

        // Collectable Monster: Ring (defined)
        this.definitions.filter((t) => {
            return t.type == EntityType.COLLECT_MONSTER_RING
        }).forEach((ring) => {

            var newRing = null;
            if (ring.x == undefined || ring.y == undefined) {
                location = this.getSingleUnoccupiedGrid();
                newRing = new CollectableMonster(
                    location.x * this.tileSize,
                    location.y * this.tileSize,
                    assetLoader.getImage(ImageAsset.TREASURE_RING)
                );
            } else {
                newRing = new CollectableMonster(
                    ring.x * this.tileSize,
                    ring.y * this.tileSize,
                    assetLoader.getImage(ImageAsset.TREASURE_RING)
                );
            }

            if (ring.behavior != null) {
                newRing.behavior = ring.behavior;
            }

            if (ring.isPhased != null) {
                newRing.isPhased = ring.isPhased;
            }

            if (ring.isVisible != null) {
                newRing.isVisible = ring.isVisible;
            }

            this.entities.push(newRing);
        });

        // Collectable Monster: Key (defined)
        this.definitions.filter((t) => {
            return t.type == EntityType.COLLECT_MONSTER_KEY
        }).forEach((key) => {

            var newKey = null;
            if (key.x == undefined || key.y == undefined) {
                location = this.getSingleUnoccupiedGrid();
                newKey = new CollectableMonster(
                    location.x * this.tileSize,
                    location.y * this.tileSize,
                    assetLoader.getImage(ImageAsset.TREASURE_KEY)
                );
            } else {
                newKey = new CollectableMonster(
                    key.x * this.tileSize,
                    key.y * this.tileSize,
                    assetLoader.getImage(ImageAsset.TREASURE_KEY)
                );
            }

            if (key.behavior != null) {
                newKey.behavior = key.behavior;
            }

            if (key.isPhased != null) {
                newKey.isPhased = key.isPhased;
            }

            if (key.isVisible != null) {
                newKey.isVisible = key.isVisible;
            }

            newKey.setOnCollectCallback( () => {
                this.portals.forEach( prtl => {
                    prtl.requiresKey = false;       // picking up this key REVEALS and UNLOCKS ALL portals
                    prtl.isVisible = true;
                })
            });

            this.entities.push(newKey);
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

        // Monster: Collectable (random)
        for (var i = 0; i < this.numMonstersCollectable; i++) {
            location = this.getSingleUnoccupiedGrid();

            let chance = Math.floor(Math.random() * 10);

            switch (chance) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    var magicRing = new CollectableMonster(
                        location.x * this.tileSize,
                        location.y * this.tileSize,
                        assetLoader.getImage(ImageAsset.TREASURE_RING)
                    );
                    magicRing.isPhased = false;
                    magicRing.isSecret = false;
                    this.entities.push(magicRing);
                    break;
                default:
                    var phasedKey = new CollectableMonster(
                        location.x * this.tileSize,
                        location.y * this.tileSize,
                        assetLoader.getImage(ImageAsset.TREASURE_KEY)
                    );
                    phasedKey.behavior = MonsterMovementBehavior.IMMOBILE;
                    phasedKey.isSecret = true;
                    phasedKey.isVisible = false;
                    phasedKey.isPhased = true;
                    this.entities.push(phasedKey);
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

        var allEntities = this.entities.concat(this.collectables).concat(this.obstacles).concat(this.hazards).concat(this.portals);
        allEntities.filter((ent) => { return ent != null }).forEach((entity) => {
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
                monster.replicationsRemaining = 1;
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

export class LevelManager {

    levels = new Map();

    level_0 = {
        levelNumber: 0,
        note: "This is the 'hub' world at the beginning of the game",
        floorTileSetName: "MARBLE_PINK",
        backgroundMusicPlay: true,
        backgroundMusicTitle: SoundAsset.BGM,
        numCollectablesRandom: 0,
        numMonstersBasic: 1,
        definitions: [

            {
                x: 5,
                y: 0,
                type: EntityType.PORTAL,
                image: ImageAsset.MAGIC_PORTAL_1,
                toLevelNumber: 100,
                isVisible: true,
                requiresKey: false,
                soundEffectName: SoundAsset.PORTAL_1
            },

            {
                x: 5,
                y: 9,
                type: EntityType.PORTAL,
                image: ImageAsset.STAIRS_DOWN_1,
                toLevelNumber: 1,
                isVisible: true,
                requiresKey: false,
                soundEffectName: SoundAsset.DESCEND
            },

            {
                x: 5,
                y: 5,
                type: EntityType.PLAYER_START,
                image: ImageAsset.WIZARD_2
            },

            {
                x: 5,
                y: 7,
                type: EntityType.COLLECTABLE,
                image: ImageAsset.GOLD_COIN_STACK_1
            },

            {
                x: 3,
                y: 1,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 3,
                y: 3,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 3,
                y: 5,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 3,
                y: 7,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 3,
                y: 9,
                type: EntityType.OBSTACLE,
                image: null,
            },


            {
                x: 7,
                y: 1,
                type: EntityType.OBSTACLE,
                image: null,
            },
            {
                x: 7,
                y: 3,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 7,
                y: 5,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 7,
                y: 7,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 7,
                y: 9,
                type: EntityType.OBSTACLE,
                image: null,
            },
        ]
    };

    /* TUTORIAL LEVELS */

    level_1 = {

        levelNumber: 1,
        note: "This level introduces the wizard to the freeze spell",
        floorTileSetName: "MARBLE",

        backgroundMusicPlay: true,
        backgroundMusicTitle: SoundAsset.BGM,

        numHazardsRandom: 0,
        numObstaclesRandom: 2,
        numCollectablesRandom: 3,

        numMonstersBasic: 0,
        numMonstersScary: 0,
        numMonstersCollectable: 0,

        definitions: [

            {
                x: 5,
                y: 0,
                type: EntityType.PLAYER_START,
                image: ImageAsset.WIZARD_2
            },

            {
                x: 5,
                y: 9,
                type: EntityType.PORTAL,
                image: ImageAsset.STAIRS_DOWN_1,
                toLevelNumber: 2,
                isVisible: true,
                requiresKey: false,
                soundEffectName: SoundAsset.DESCEND
            },

            {
                type: EntityType.COLLECT_MONSTER_RING,
                x: 5,
                y: 7
            },

            {
                type: EntityType.MONSTER,
                monsterClass: MonsterType.RAT,
            },

            {
                type: EntityType.MONSTER,
                monsterClass: MonsterType.RAT,
            },
        ]
    };

    level_2 = {

        levelNumber: 2,
        note: "This level introduced the wizard to advanced monsters",
        floorTileSetName: "MARBLE",

        backgroundMusicPlay: true,
        backgroundMusicTitle: SoundAsset.BGM,

        numObstaclesRandom: 3,
        numHazardsRandom: 0,
        numCollectablesRandom: 3,

        numMonstersBasic: 0,
        numMonstersScary: 0,
        numMonstersCollectable: 0,

        definitions: [
            {
                type: EntityType.MONSTER,
                monsterClass: MonsterType.RAT_MAN,
            },

            {
                type: EntityType.MONSTER,
                monsterClass: MonsterType.RAT,
            },
        ]
    };

    level_3 = {

        levelNumber: 3,
        note: "This level requires the player to hase through pillars in order to exit",
        floorTileSetName: "MARBLE",

        backgroundMusicPlay: true,
        backgroundMusicTitle: SoundAsset.BGM,

        numObstaclesRandom: 2,
        numHazardsRandom: 1,
        numCollectablesRandom: 3,

        numMonstersBasic: 3,
        numMonstersScary: 0,
        numMonstersCollectable: 0,

        definitions: [

            {
                x: 4,
                y: 8,
                type: EntityType.PORTAL,
                image: ImageAsset.STAIRS_DOWN_1,
                toLevelNumber: 4,
                isVisible: true,
                soundEffectName: SoundAsset.DESCEND
            },

            {
                x: 3,
                y: 8,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 5,
                y: 8,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 4,
                y: 7,
                type: EntityType.OBSTACLE,
                image: null,
            },

            {
                x: 4,
                y: 9,
                type: EntityType.OBSTACLE,
                image: null,
            }
        ]
    };

    level_4 = {

        levelNumber: 4,
        note: "This level requires you to find a key to open the stairs down",
        floorTileSetName: "MARBLE",

        backgroundMusicPlay: true,
        backgroundMusicTitle: SoundAsset.BGM,

        numObstaclesRandom: 4,
        numHazardsRandom: 1,
        numCollectablesRandom: 3,

        numMonstersBasic: 4,
        numMonstersScary: 0,
        numMonstersCollectable: 0,

        definitions: [
            {
                x: 0,
                y: 0,
                type: EntityType.PORTAL,
                randomLocation: true,
                isVisible: false,
                requiresKey: true,
                image: ImageAsset.STAIRS_DOWN_1,
                toLevelNumber: 5,
                soundEffectName: SoundAsset.DESCEND
            },

            {
                type: EntityType.COLLECT_MONSTER_KEY,
                isVisible: true,
                isPhased: false,
                behavior: MonsterMovementBehavior.IMMOBILE,
                image: ImageAsset.TREASURE_KEY,
            },
        ]
    };

    level_5 = {

        levelNumber: 5,
        note: "This level requires the wizard to find and collect the invisble and phased key",
        floorTileSetName: "SKULLS",

        backgroundMusicPlay: true,
        backgroundMusicTitle: SoundAsset.BGM,

        numObstaclesRandom: 4,
        numHazardsRandom: 1,
        numCollectablesRandom: 6,

        numMonstersBasic: 4,
        numMonstersScary: 0,
        numMonstersCollectable: 0,

        definitions: [
            {
                x: 0,
                y: 0,
                type: EntityType.PORTAL,
                randomLocation: true,
                isVisible: false,
                requiresKey: true,
                image: ImageAsset.STAIRS_DOWN_1,
                toLevelNumber: 6,
                soundEffectName: SoundAsset.DESCEND
            },

            {
                type: EntityType.COLLECT_MONSTER_KEY,
                isPhased: true,
                isVisible: false,
                behavior: MonsterMovementBehavior.IMMOBILE,
                image: ImageAsset.TREASURE_KEY,
            },
        ]

    };

    level_6 = {

        levelNumber: 6,
        note: "this is a 'safe' area which saves gold and unlocks progress",
        floorTileSetName: "CLEAN_STONE",

        backgroundMusicPlay: true,
        backgroundMusicTitle: SoundAsset.SAFE_AT_LAST,

        numObstaclesRandom: 0,
        numHazardsRandom: 0,
        numCollectablesRandom: 0,

        numMonstersBasic: 0,
        numMonstersScary: 0,
        numMonstersCollectable: 0,

        definitions: [
            {
                x: 5,
                y: 5,
                type: EntityType.PLAYER_START,
                image: ImageAsset.WIZARD_2
            },

            {
                x: 3,
                y: 5,
                type: EntityType.PORTAL,
                image: ImageAsset.STAIRS_UP_2,
                toLevelNumber: 0,
                isVisible: true,
                soundEffectName: SoundAsset.DESCEND
            },

            {
                x: 7,
                y: 5,
                type: EntityType.PORTAL,
                image: ImageAsset.STAIRS_DOWN_2,
                toLevelNumber: 7,
                isVisible: true,
                soundEffectName: SoundAsset.DESCEND
            },
        ]
    }

    level_100 = {
        levelNumber: 100,
        note: "this is a 'challenge' level",
        numCollectablesRandom: 5,
        numMonstersBasic: 0,
        numMonstersScary: 0,
        numHazardsRandom: 10,
        backgroundMusicPlay: true,
        backgroundMusicTitle: SoundAsset.TENSION,

        definitions: [
            {
                x: 5,
                y: 0,
                type: EntityType.PLAYER_START,
                image: ImageAsset.WIZARD_2
            },

            {
                x: 1,
                y: 1,
                type: EntityType.MONSTER,
                monsterClass: MonsterType.BLOB
            },

            {
                x: 8,
                y: 1,
                type: EntityType.MONSTER,
                monsterClass: MonsterType.BLOB
            },

            {
                x: 1,
                y: 8,
                type: EntityType.MONSTER,
                monsterClass: MonsterType.BLOB
            },

            {
                x: 8,
                y: 8,
                type: EntityType.MONSTER,
                monsterClass: MonsterType.BLOB
            },

            {
                x: 5,
                y: 9,
                type: EntityType.PORTAL,
                image: ImageAsset.MAGIC_PORTAL_1,
                toLevelNumber: 100,
                isVisible: true,
                soundEffectName: SoundAsset.PORTAL_1
            },
        ]
    };

    constructor() {
        // Level ZERO
        this.levels.set(0, this.level_0);
        this.levels.set(1, this.level_1);
        this.levels.set(2, this.level_2);
        this.levels.set(3, this.level_3);
        this.levels.set(4, this.level_4);
        this.levels.set(5, this.level_5);
        this.levels.set(6, this.level_6);
        this.levels.set(100, this.level_100);
    }

    getLevel(levelNumber) {
        var levelDetails = this.levels.get(levelNumber);
        if (levelDetails != null) {
            var level = new Level(levelNumber);
            level = Object.assign(level, levelDetails);
            return level;
        } else {
            console.log(`Level ${levelNumber} not found; generating random...`)
            var newLevel = new Level(levelNumber);
            newLevel.setRandomValues();
            return newLevel;
        }
    }
}