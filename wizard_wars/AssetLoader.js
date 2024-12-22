/**
 * ---------------------------------- ASSET LOADER ----------------------------
 */

export class AssetLoader {

    soundLoader = new SoundLoader();
    imageLoader = new ImageLoader();

    constructor() {
        console.log("AssetLoader created...");
    }

    loadAssets(callback) {
        this.soundLoader.loadSounds(() => {
            this.imageLoader.loadImages(() => { callback(); });
        });
    }

    getSound(asset) {
        return this.soundLoader.getSound(asset);
    }

    getImage(asset) {
        return this.imageLoader.getImage(asset);
    }

    getTilesetForName(asset) {
        return this.imageLoader.getTilesetForName(asset);
    }
}

/**
 * --------------------------------- IMAGES -----------------------------------
 */

export var ImageAsset = Object.freeze({

    WIZARD_1: "resources/tiles/64x64/tile_3807.png",
    WIZARD_2: "resources/tiles/64x64/tile_3795.png",

    MONSTER_WASP_RED: "resources/tiles/64x64/tile_4127.png",
    MONSTER_WASP_YELLOW: "resources/tiles/64x64/tile_4165.png",

    MONSTER_RAT_SMALL: "resources/tiles/64x64/tile_4089.png",
    MONSTER_RAT_MAN: "resources/tiles/64x64/tile_3776.png",

    MONSTER_BLOB_1: "resources/tiles/64x64/blob_2.png",

    MONSTER_EYE_1: "resources/tiles/64x64/tile_4336.png",

    MONSTER_GHOST_1: "resources/tiles/64x64/tile_4726.png",
    MONSTER_GHOST_2: "resources/tiles/64x64/tile_4749.png",

    GOLD_COIN_1: "resources/tiles/64x64/tile_2601.png",
    GOLD_COIN_STACK_1: "resources/tiles/64x64/tile_2602.png",
    GOLD_COIN_STACK_2: "resources/tiles/64x64/tile_2603.png",
    GOLD_COIN_STACK_3: "resources/tiles/64x64/tile_2604.png",

    TREASURE_KEY: "resources/tiles/64x64/tile_2615.png",
    TREASURE_LAMP: "resources/tiles/64x64/tile_2616.png",
    TREASURE_RING: "resources/tiles/64x64/tile_2733.png",


    OBSTACLE_PILLAR_1: "resources/tiles/64x64/tile_781.png",
    OBSTACLE_PILLAR_2: "resources/tiles/64x64/tile_782.png",
    OBSTACLE_PILLAR_3: "resources/tiles/64x64/tile_783.png",
    OBSTACLE_PILLAR_4: "resources/tiles/64x64/tile_784.png",
    OBSTACLE_PILLAR_5: "resources/tiles/64x64/tile_785.png",
    OBSTACLE_PILLAR_6: "resources/tiles/64x64/tile_786.png",

    HAZARD_LAVA_1: "resources/tiles/64x64/tile_384.png",
    HAZARD_PIT_1: "resources/tiles/64x64/tile_827.png",

    STAIRS_DOWN_1: "resources/tiles/64x64/tile_676.png",

    GRAPHIC_TITLE_CARD: "resources/cards/graphic_title_card.png",

    CARD_SPELL_FREEZE: "resources/cards/96x96/spell_freeze.png",
    CARD_SPELL_RANDOMIZE: "resources/cards/96x96/spell_randomize.png",
    CARD_SPELL_PRECOGNITION: "resources/cards/96x96/spell_precognition.png",
    CARD_SPELL_PHASE: "resources/cards/96x96/spell_phase.png",

    TILE_MARBLE_GROUND_1: "resources/tiles/64x64/tile_385.png",
    TILE_MARBLE_GROUND_2: "resources/tiles/64x64/tile_386.png",
    TILE_MARBLE_GROUND_3: "resources/tiles/64x64/tile_387.png",
    TILE_MARBLE_GROUND_4: "resources/tiles/64x64/tile_388.png",
    TILE_MARBLE_GROUND_5: "resources/tiles/64x64/tile_389.png",
    TILE_MARBLE_GROUND_6: "resources/tiles/64x64/tile_390.png",
    TILE_MARBLE_GROUND_7: "resources/tiles/64x64/tile_391.png",
    TILE_MARBLE_GROUND_8: "resources/tiles/64x64/tile_392.png",
    TILE_MARBLE_GROUND_9: "resources/tiles/64x64/tile_393.png",
    TILE_MARBLE_GROUND_10: "resources/tiles/64x64/tile_394.png",

    TILE_MARBLE_PINK_1: "resources/tiles/64x64/tile_577.png",
    TILE_MARBLE_PINK_2: "resources/tiles/64x64/tile_578.png",
    TILE_MARBLE_PINK_3: "resources/tiles/64x64/tile_579.png",
    TILE_MARBLE_PINK_4: "resources/tiles/64x64/tile_580.png",
    TILE_MARBLE_PINK_5: "resources/tiles/64x64/tile_581.png",
    TILE_MARBLE_PINK_6: "resources/tiles/64x64/tile_582.png",
    TILE_MARBLE_PINK_7: "resources/tiles/64x64/tile_583.png",
    TILE_MARBLE_PINK_8: "resources/tiles/64x64/tile_584.png",
    TILE_MARBLE_PINK_9: "resources/tiles/64x64/tile_585.png",
    TILE_MARBLE_PINK_10: "resources/tiles/64x64/tile_586.png",

    TILE_SKULLS_1: "resources/tiles/64x64/tile_562.png",
    TILE_SKULLS_2: "resources/tiles/64x64/tile_564.png",
    TILE_SKULLS_3: "resources/tiles/64x64/tile_566.png",
    TILE_SKULLS_4: "resources/tiles/64x64/tile_568.png",

    TILE_RED_MOON_1: "resources/tiles/64x64/tile_570.png",
    TILE_RED_MOON_2: "resources/tiles/64x64/tile_571.png",
    TILE_RED_MOON_3: "resources/tiles/64x64/tile_572.png",
    TILE_RED_MOON_4: "resources/tiles/64x64/tile_573.png",
    TILE_RED_MOON_5: "resources/tiles/64x64/tile_574.png",
    TILE_RED_MOON_6: "resources/tiles/64x64/tile_575.png",
    TILE_RED_MOON_7: "resources/tiles/64x64/tile_575.png"

});

export class ImageLoader {

    tileSets = new Map();
    imageMap = new Map();

    constructor() {

        this.tileSets.set("MARBLE", [
            ImageAsset.TILE_MARBLE_GROUND_1,
            ImageAsset.TILE_MARBLE_GROUND_2,
            ImageAsset.TILE_MARBLE_GROUND_3,
            ImageAsset.TILE_MARBLE_GROUND_4,
            ImageAsset.TILE_MARBLE_GROUND_5,
            ImageAsset.TILE_MARBLE_GROUND_6,
            ImageAsset.TILE_MARBLE_GROUND_7,
            ImageAsset.TILE_MARBLE_GROUND_8,
            ImageAsset.TILE_MARBLE_GROUND_9,
            ImageAsset.TILE_MARBLE_GROUND_10
        ]);

        this.tileSets.set("MARBLE_PINK", [
            ImageAsset.TILE_MARBLE_PINK_1,
            ImageAsset.TILE_MARBLE_PINK_2,
            ImageAsset.TILE_MARBLE_PINK_3,
            ImageAsset.TILE_MARBLE_PINK_4,
            ImageAsset.TILE_MARBLE_PINK_5,
            ImageAsset.TILE_MARBLE_PINK_6,
            ImageAsset.TILE_MARBLE_PINK_7,
            ImageAsset.TILE_MARBLE_PINK_8,
            ImageAsset.TILE_MARBLE_PINK_9,
            ImageAsset.TILE_MARBLE_PINK_10
        ]);

        this.tileSets.set("SKULLS", [
            ImageAsset.TILE_SKULLS_1,
            ImageAsset.TILE_SKULLS_2,
            ImageAsset.TILE_SKULLS_3,
            ImageAsset.TILE_SKULLS_4
        ]);

        this.tileSets.set("RED_MOON", [
            ImageAsset.TILE_RED_MOON_1,
            ImageAsset.TILE_RED_MOON_2,
            ImageAsset.TILE_RED_MOON_3,
            ImageAsset.TILE_RED_MOON_4,
            ImageAsset.TILE_RED_MOON_5,
            ImageAsset.TILE_RED_MOON_6,
            ImageAsset.TILE_RED_MOON_7
        ]);

        this.tileSets.set("GOLDSTACKS", [
            ImageAsset.GOLD_COIN_STACK_1,
            ImageAsset.GOLD_COIN_STACK_2,
            ImageAsset.GOLD_COIN_STACK_3
        ]);

        this.tileSets.set("PILLARS", [
            ImageAsset.OBSTACLE_PILLAR_1,
            ImageAsset.OBSTACLE_PILLAR_2,
            ImageAsset.OBSTACLE_PILLAR_3,
            ImageAsset.OBSTACLE_PILLAR_4,
            ImageAsset.OBSTACLE_PILLAR_5,
            ImageAsset.OBSTACLE_PILLAR_6
        ]);

        this.tileSets.set("PITS", [
            ImageAsset.HAZARD_PIT_1
        ]);
    }

    loadImages(callback) {

        var loadedImages = 0;
        let totalImages = Object.keys(ImageAsset).length;

        console.log(`Loading ${totalImages} images...`);

        for (const key in ImageAsset) {

            var assetLocation = ImageAsset[key];
            let img = new Image();
            this.imageMap.set(assetLocation, img);
            
            img.onload = function () {
                loadedImages++;
                if (loadedImages == totalImages) {
                    console.log(`...images loaded!`);
                    callback();
                }
            }

            img.src = assetLocation;        // <-- this triggers the load
        };
    }

    getImage(imgAsset) {
        return this.imageMap.get(imgAsset);
    };

    getTileSetNames(name) {
        return this.tileSets.get(name);
    }

    getTilesetForName(name) {
        return this.getTileSetNames(name).map(tile => this.getImage(tile));
    }

    /** ------------ CONVENIENCE METHODS ------------ */
    randomInt(max) {
        return parseInt(Math.random() * max);
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


/**
 * ----------------------------- SOUNDS ---------------------------------
 * 
 * Lots of good sounds from this guy: https://freesound.org/people/cabled_mess/
 * 
 */

export var SoundAsset = Object.freeze({
    COIN_1: "resources/sounds/coin_1.wav",
    COIN_2: "resources/sounds/coin_2.wav",
    COIN_3: "resources/sounds/coin_3.wav",
    BONUS: "resources/sounds/bonus_2.wav",

    PLAYER_DIES: "resources/sounds/player_dies.wav",

    MOVE_1: "resources/sounds/move_1.wav",
    MOVE_2: "resources/sounds/move_2.wav",

    DESCEND: "resources/sounds/descend.wav",

    SPELL_THUNDER_1: "resources/sounds/spell_thunder_1.wav",

    SUCCESS: "resources/sounds/success.wav",

    BGM: "resources/sounds/bgm.wav",
    SAFE_AT_LAST : "resources/sounds/safe_at_last.wav"
});

export class SoundLoader {

    soundMap = new Map();

    loadSounds(callback) {

        let soundsTotal = Object.keys(SoundAsset).length;
        var soundsLoaded = 0;

        console.log(`Loading ${soundsTotal} sounds...`);

        for (const key in SoundAsset) {
            var assetLocation = SoundAsset[key];
            let snd = new Audio();
            snd.preload = "auto";
            this.soundMap.set(assetLocation, snd);

            snd.onloadeddata = function () {
                soundsLoaded++;
                if (soundsLoaded == soundsTotal) {
                    console.log("...sounds loaded!");
                    callback();
                }
            }

            snd.src = assetLocation;            // <-- triggers the sound load
        };
    }

    getSound(sndAsset) {
        return this.soundMap.get(sndAsset);
    };
}
