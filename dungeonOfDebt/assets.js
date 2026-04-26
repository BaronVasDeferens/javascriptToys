/**
 * ---------------------------------- ASSET LOADER ----------------------------
 */

const relativePath = "resources/";

export class AssetManager {

    constructor(audioContext) {
        this.audioContext = audioContext;
        this.imageLoader = new ImageLoader();
        this.soundLoader = new SoundLoader(audioContext);
        this.fontLoader = new FontLoader();
    }

    loadAssets(callback) {

        this.imageLoader.loadImages(() => {
            this.fontLoader.loadFonts();
            this.soundLoader.loadSounds(() => {
                callback();
            });
        });
    }

    getImage(imageAsset) {
        return this.imageLoader.getImage(imageAsset);
    }

    getSound(soundAsset, isLoop) {
        return this.soundLoader.getSound(soundAsset, isLoop);
    }

    getBuffer(soundAsset) {
        return this.soundLoader.getBuffer(soundAsset);
    }

    getFont(fontAsset) {
        return this.fontLoader.getFont(fontAsset);
    }
}

/**
 * --------------------------------- IMAGES -----------------------------------
 */

export var ImageAsset = Object.freeze({

    INTRO_LOGO: "logo.png",

    SPELL_ZONE_CROSS: "spells/zone_cross_small.png",
    SPELL_ZONE_CROSS_INVERTED: "spells/zone_cross_inverted.png",
    SPELL_ZONE_COLUMN: "spells/zone_column_full.png",
    SPELL_ZONE_ROW: "spells/zone_row_full.png",
    SPELL_ZONE_WIZARD_ONLY: "spells/zone_wizard_only.png",
    SPELL_CANCEL: "spells/cancel.png",

    SPELL_CARD_BLAZE: "spells/spell_blaze.png",
    SPELL_CARD_FREEZE: "spells/spell_freeze.png",
    SPELL_CARD_PHASE: "spells/spell_phase.png",
    SPELL_CARD_INVERT: "spells/spell_invert.png",

    SPELL_EFFECT_FROZEN: "spells/spell_effect_frozen.png",

    WIZARD_1: "entity/wizard_zx.png",

    MONSTER_EYE_SMALL: "entity/monster_pink_eye_sm_zx.png",
    MONSTER_SPIDER_1: "entity/monster_spider_1zx.png",
    MONSTER_INSECT_1: "entity/monster_insect_zx.png",
    MONSTER_FLY_1: "entity/monster_fly_sm_zx.png",

    MONSTER_SCORPION_SMALL: "entity/monster_scorpion_sm_zx.png",

    MONSTER_TROLL: "entity/monster_troll_zx.png",
    MONSTER_WRAITH: "entity/monster_wraith_zx.png",

    TREASURE_CHEST_LARGE: "entity/chest_large_zx.png",
    TREASURE_CHEST_SMALL: "entity/chest_small_zx.png",

    COIN_1: "entity/coin_1_zx.png",
    COIN_2: "entity/coin_2_zx.png",
    COIN_3: "entity/coin_3_zx.png",
    COIN_4: "entity/coin_4_zx.png",

    FLOOR_STONE_1: "tiles/floor/stone_1.png",
    FLOOR_STONE_2: "tiles/floor/stone_2.png",
    FLOOR_STONE_3: "tiles/floor/stone_3.png",
    FLOOR_STONE_4: "tiles/floor/stone_4.png",

    FLOOR_ZX_19: "tiles/floor/1119.png",
    FLOOR_ZX_20: "tiles/floor/1120.png",
    FLOOR_ZX_21: "tiles/floor/1121.png",
    FLOOR_ZX_22: "tiles/floor/1122.png",
    FLOOR_ZX_23: "tiles/floor/1123.png",
    FLOOR_ZX_24: "tiles/floor/1124.png",
    FLOOR_ZX_25: "tiles/floor/1125.png",
    FLOOR_ZX_26: "tiles/floor/1126.png",
    FLOOR_ZX_27: "tiles/floor/1127.png",


    FLOOR_DARK_STONE_1: "tiles/floor/stone_dark_1.png",
    FLOOR_DARK_STONE_2: "tiles/floor/stone_dark_2.png",
    FLOOR_DARK_STONE_3: "tiles/floor/stone_dark_3.png",
    FLOOR_DARK_STONE_4: "tiles/floor/stone_dark_4.png",


});

export class ImageLoader {

    imageSubDir = "images/"

    imageMap = new Map();

    loadImages(callback) {

        var loadedImages = 0;
        let totalImages = Object.keys(ImageAsset).length;

        console.log(`Loading ${totalImages} images...`);

        for (const key in ImageAsset) {

            var assetLocation = relativePath + this.imageSubDir + ImageAsset[key];
            let img = new Image();
            this.imageMap.set(ImageAsset[key], img);

            img.onload = function () {
                loadedImages++;
                if (loadedImages == totalImages) {
                    callback();
                }
            }

            img.src = assetLocation;        // <-- this triggers the load
        };
    }

    getImage(imgAsset) {
        return this.imageMap.get(imgAsset);
    };
}


/**
 * ----------------------------- SOUNDS ---------------------------------
 */

export var SoundAsset = Object.freeze({
    WIZARD_WALK: "wizard_walk.wav",
    WIZARD_CAST_SPELL: "wizard_cast_spell.wav",
    COIN_1: "coin_1.wav",
    COIN_2: "coin_2.wav",
    COIN_3: "coin_3.wav",
    GAME_OVER: "game_over.wav"
});


export class SoundLoader {

    soundSubDir = "sounds/"

    decodedBufferMap = new Map();

    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    async loadSounds(callback) {

        let soundsTotal = Object.keys(SoundAsset).length;

        console.log(`Loading ${soundsTotal} sounds...`);

        for (const key in SoundAsset) {
            let asset = relativePath + this.soundSubDir + SoundAsset[key];
            let response = await fetch(asset);
            let buffer = await response.arrayBuffer();
            let decodedBuffer = await this.audioContext.decodeAudioData(buffer);
            this.decodedBufferMap.set(SoundAsset[key], decodedBuffer);
        };

        callback();
    }

    getBuffer(soundAsset) {
        return this.decodedBufferMap.get(soundAsset);
    }

    getSound(soundAsset, isLoop) {
        let buffer = this.getBuffer(soundAsset);
        let source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);

        if (isLoop == true) {
            source.loop = true;
            source.loopStart = 0;
            source.loopEnd = buffer.length;
        }

        return source;
    };
}

// ------------------------------ FONTZ -----------------------------------

export var FontAsset = Object.freeze({
    PRIMARY: "micronian.ttf"
});

export class FontLoader {

    fontSubDir = "fonts/"

    fontMap = new Map();

    async loadFonts() {

        let fontsTotal = Object.keys(FontAsset).length;
        console.log(`Loading ${fontsTotal} fonts...`);

        for (const key in FontAsset) {
            let asset = relativePath + this.fontSubDir + FontAsset[key];
            let response = await fetch(asset);
            let arrayBuffer = await response.arrayBuffer();
            let buffer = arrayBuffer.transfer();
            this.fontMap.set(key, buffer);
        };
    }

    getFont(fontName) {
        return this.fontMap.get(fontName);
    }

}