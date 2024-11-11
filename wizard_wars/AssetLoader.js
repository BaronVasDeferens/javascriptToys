/**
 * ---------------------------------- ASSET LOADER ----------------------------
 */

export class AssetLoader {
    loadAssets(imageLoader, callback) {
        imageLoader.loadImages(() => { callback(); });
    }
}

/**
 * --------------------------------- IMAGES -----------------------------------
 */

export var ImageAsset = Object.freeze({

    WIZARD_1: "resources/tiles/64x64/tile_3807.png",
    WIZARD_2: "resources/tiles/64x64/tile_3795.png",

    MONSTER_1: "resources/tiles/64x64/tile_4127.png",
    MONSTER_2: "resources/tiles/64x64/tile_4165.png",

    GOLD_COIN_1: "resources/tiles/64x64/tile_2601.png",
    GOLD_COIN_STACK_1: "resources/tiles/64x64/tile_2602.png",
    GOLD_COIN_STACK_2: "resources/tiles/64x64/tile_2603.png",
    GOLD_COIN_STACK_3: "resources/tiles/64x64/tile_2604.png",

    OBSTACLE_PILLAR_1: "resources/tiles/64x64/tile_781.png",
    OBSTACLE_PILLAR_2: "resources/tiles/64x64/tile_782.png",
    OBSTACLE_PILLAR_3: "resources/tiles/64x64/tile_783.png",
    OBSTACLE_PILLAR_4: "resources/tiles/64x64/tile_784.png",
    OBSTACLE_PILLAR_5: "resources/tiles/64x64/tile_785.png",
    OBSTACLE_PILLAR_6: "resources/tiles/64x64/tile_786.png",

    ACTION_CARD_UP: "resources/cards/card_up.png",
    ACTION_CARD_DOWN: "resources/cards/card_down.png",
    ACTION_CARD_LEFT: "resources/cards/card_left.png",
    ACTION_CARD_RIGHT: "resources/cards/card_right.png",

    // Floor tiles
    // TILE_GRASSY_STONE_FLOOR_1: "resources/tile1.png",
    // TILE_GRASSY_STONE_FLOOR_2: "resources/tile2.png",
    // TILE_GRASSY_STONE_FLOOR_3: "resources/tile3.png",
    // TILE_GRASSY_STONE_FLOOR_4: "resources/tile4.png",
    // TILE_GRASSY_STONE_FLOOR_5: "resources/tile5.png",
    // TILE_GRASSY_STONE_FLOOR_6: "resources/tile6.png",
    // TILE_GRASSY_STONE_FLOOR_7: "resources/tile7.png",
    // TILE_GRASSY_STONE_FLOOR_8: "resources/tile8.png",


    // TILE_GREY_ROCK_1: "resources/tiles/64x64/tile_167.png",
    // TILE_GREY_ROCK_2: "resources/tiles/64x64/tile_169.png",
    // TILE_GREY_ROCK_3: "resources/tiles/64x64/tile_173.png",
    // TILE_GREY_ROCK_4: "resources/tiles/64x64/tile_175.png",
    // TILE_GREY_ROCK_5: "resources/tiles/64x64/tile_177.png",
    // TILE_GREY_ROCK_6: "resources/tiles/64x64/tile_179.png",

    TILE_FLESH_GROUND_1: "resources/tiles/64x64/tile_202.png",
    TILE_FLESH_GROUND_2: "resources/tiles/64x64/tile_203.png",
    TILE_FLESH_GROUND_3: "resources/tiles/64x64/tile_204.png",
    TILE_FLESH_GROUND_4: "resources/tiles/64x64/tile_205.png",
    TILE_FLESH_GROUND_5: "resources/tiles/64x64/tile_206.png",
    TILE_FLESH_GROUND_6: "resources/tiles/64x64/tile_207.png",
    TILE_FLESH_GROUND_7: "resources/tiles/64x64/tile_208.png",
    TILE_FLESH_GROUND_8: "resources/tiles/64x64/tile_209.png",
    TILE_FLESH_GROUND_9: "resources/tiles/64x64/tile_210.png",

    // TILE_MAGIC_GROUND_1: "resources/tiles/64x64/tile_292.png",
    // TILE_MAGIC_GROUND_2: "resources/tiles/64x64/tile_293.png",
    // TILE_MAGIC_GROUND_3: "resources/tiles/64x64/tile_294.png",
    // TILE_MAGIC_GROUND_4: "resources/tiles/64x64/tile_295.png",
    // TILE_MAGIC_GROUND_5: "resources/tiles/64x64/tile_296.png",
    // TILE_MAGIC_GROUND_6: "resources/tiles/64x64/tile_297.png",
    // TILE_MAGIC_GROUND_7: "resources/tiles/64x64/tile_298.png",
    // TILE_MAGIC_GROUND_8: "resources/tiles/64x64/tile_299.png",
    // TILE_MAGIC_GROUND_9: "resources/tiles/64x64/tile_300.png",
    // TILE_MAGIC_GROUND_10: "resources/tiles/64x64/tile_301.png",
    // TILE_MAGIC_GROUND_11: "resources/tiles/64x64/tile_302.png",
    // TILE_MAGIC_GROUND_12: "resources/tiles/64x64/tile_303.png",

    // TILE_MAGIC_DARK_GROUND_1: "resources/tiles/64x64/tile_186.png",
    // TILE_MAGIC_DARK_GROUND_2: "resources/tiles/64x64/tile_187.png",
    // TILE_MAGIC_DARK_GROUND_3: "resources/tiles/64x64/tile_188.png",
    // TILE_MAGIC_DARK_GROUND_4: "resources/tiles/64x64/tile_189.png",
    // TILE_MAGIC_DARK_GROUND_5: "resources/tiles/64x64/tile_190.png",
    // TILE_MAGIC_DARK_GROUND_6: "resources/tiles/64x64/tile_191.png",
    // TILE_MAGIC_DARK_GROUND_7: "resources/tiles/64x64/tile_192.png",
    // TILE_MAGIC_DARK_GROUND_8: "resources/tiles/64x64/tile_193.png",
    // TILE_MAGIC_DARK_GROUND_9: "resources/tiles/64x64/tile_194.png",
    // TILE_MAGIC_DARK_GROUND_10: "resources/tiles/64x64/tile_195.png",

    TILE_MARBLE_GROUND_1: "resources/tiles/64x64/tile_385.png",
    TILE_MARBLE_GROUND_2: "resources/tiles/64x64/tile_386.png",
    TILE_MARBLE_GROUND_3: "resources/tiles/64x64/tile_387.png",
    TILE_MARBLE_GROUND_4: "resources/tiles/64x64/tile_388.png",
    TILE_MARBLE_GROUND_5: "resources/tiles/64x64/tile_389.png",
    TILE_MARBLE_GROUND_6: "resources/tiles/64x64/tile_390.png",
    TILE_MARBLE_GROUND_7: "resources/tiles/64x64/tile_391.png",
    TILE_MARBLE_GROUND_8: "resources/tiles/64x64/tile_392.png",
    TILE_MARBLE_GROUND_9: "resources/tiles/64x64/tile_393.png",
    TILE_MARBLE_GROUND_10: "resources/tiles/64x64/tile_394.png"
});

export class ImageLoader {

    tileSets = new Map();
    imageMap = new Map();

    constructor() {

        // this.tileSets.set("STONE", [
        //     ImageAsset.TILE_GRASSY_STONE_FLOOR_1,
        //     ImageAsset.TILE_GRASSY_STONE_FLOOR_2,
        //     ImageAsset.TILE_GRASSY_STONE_FLOOR_3,
        //     ImageAsset.TILE_GRASSY_STONE_FLOOR_4,
        //     ImageAsset.TILE_GRASSY_STONE_FLOOR_5,
        //     ImageAsset.TILE_GRASSY_STONE_FLOOR_6,
        //     ImageAsset.TILE_GRASSY_STONE_FLOOR_7,
        //     ImageAsset.TILE_GRASSY_STONE_FLOOR_8
        // ]);


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

        // this.tileSets.set("GREY_STONE", [
        //     ImageAsset.TILE_GREY_ROCK_1,
        //     ImageAsset.TILE_GREY_ROCK_2,
        //     ImageAsset.TILE_GREY_ROCK_3,
        //     ImageAsset.TILE_GREY_ROCK_4,
        //     ImageAsset.TILE_GREY_ROCK_5,
        //     ImageAsset.TILE_GREY_ROCK_6
        // ]);

        // this.tileSets.set("MAGIC_DARK", [
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_1,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_2,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_3,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_4,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_5,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_6,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_7,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_8,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_9,
        //     ImageAsset.TILE_MAGIC_DARK_GROUND_10
        // ]);

        this.tileSets.set("FLESH_GROUND", [
            ImageAsset.TILE_FLESH_GROUND_1,
            ImageAsset.TILE_FLESH_GROUND_2,
            ImageAsset.TILE_FLESH_GROUND_3,
            ImageAsset.TILE_FLESH_GROUND_4,
            ImageAsset.TILE_FLESH_GROUND_5,
            ImageAsset.TILE_FLESH_GROUND_6,
            ImageAsset.TILE_FLESH_GROUND_7,
            ImageAsset.TILE_FLESH_GROUND_8,
            ImageAsset.TILE_FLESH_GROUND_9
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
    }

    getTileSetNames(name) {
        return this.tileSets.get(name);
    }

    getTilesetForName(name) {
        return this.getTileSetNames(name).map(tile => this.getImage(tile));
    }

    loadImages(callback) {
        console.log("Loading images...");
        let readinessCheck = new Map();

        for (const key in ImageAsset) {
            var assetLocation = ImageAsset[key];
            let img = new Image();
            this.imageMap.set(assetLocation, img);
            img.onload = function () {
                readinessCheck.set(img.src, true);
                let values = Array.from(readinessCheck.values());
                let isReady = values.every(v => v === true);
                if (isReady == true) {
                    console.log(`...image loading complete!`);
                    callback();
                }
            }
            img.src = assetLocation;
            readinessCheck.set(img.src, false);
        };
    }

    getImage(imgAsset) {
        return this.imageMap.get(imgAsset);
    };

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
 */

export var SoundAsset = Object.freeze({

});


export class SoundLoader {

    soundMap = new Map();

    loadSounds(callback) {
        let readinessCheck = new Map();

        for (const key in SoundAsset) {
            var assetLocation = SoundAsset[key];
            let snd = new Audio();
            this.soundMap.set(assetLocation, snd);
            snd.onloadeddata = function () {
                console.log(`sound ${snd.src} loaded`);
                readinessCheck.set(snd.src, true);
                let values = Array.from(readinessCheck.values());
                let isReady = values.every(v => v === true);
                if (isReady == true) {
                    console.log(`Sound loading complete!`);
                    callback();
                }
            }
            snd.src = assetLocation;
            readinessCheck.set(snd.src, false);
        };
    }

    getSound(sndAsset) {
        return this.soundMap.get(sndAsset);
    };
}
