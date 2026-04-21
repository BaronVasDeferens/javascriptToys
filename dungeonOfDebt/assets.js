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

    WIZARD_1: "entity/wizard_1.png",
    MONSTER_EYE_SMALL: "entity/monster_eye_small.png",
    MONSTER_SPIDER_1: "entity/monster_spider_1.png",
    
    TREASURE_CHEST_LARGE: "entity/chest_large.png",
    TRAESURE_CHEST_SMALL: "entity/chest_small.png",

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