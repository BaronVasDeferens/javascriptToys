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

    // --- ENTITIES ----

    WIZARD_1: "entity/3794_zx.png",
    FROG: "entity/4071_zx.png",

    // MONSTERS

    MONSTER_AMOEBA: "entity/monsters/3778_zx.png",
    MONSTER_CENTIPEDE: "entity/monsters/4160_sm_zx.png",
    MONSTER_CENTIPEDE_GIANT: "entity/monsters/4160_zx.png",
    MONSTER_GHOST: "entity/monsters/4725_sm_zx.png",
    MONSTER_GOLD_FROG: "entity/monsters/4085_zx.png",
    MONSTER_MAMMOTH: "entity/monsters/4052_zx.png",
    MONSTER_MOSQUITO_GIANT: "entity/monsters/4079_zx.png",
    MONSTER_MUMMY: "entity/monsters/4737.png",
    MONSTER_PINK_EYE: "entity/monsters/3987_sm_zx.png",
    MONSTER_SCORPION: "entity/monsters/4082_sm_zx.png",
    MONSTER_SNAIL: "entity/monsters/4084.png",
    MONSTER_SNAIL_TRAIL_1: "entity/monsters/3266.png",
    MONSTER_SNAIL_TRAIL_2: "entity/monsters/3267.png",
    MONSTER_SNAIL_TRAIL_3: "entity/monsters/3268.png",
    MONSTER_SNAIL_TRAIL_4: "entity/monsters/3269.png",
    MONSTER_SNAIL_TRAIL_5: "entity/monsters/3270.png",
    MONSTER_TROLL: "entity/monsters/3945_zx.png",
    MONSTER_SHADOW_MAN: "entity/monsters/3825_zx.png",
    MONSTER_VENGEFUL_SPIRIT: "entity/monsters/4724_zx.png",

    // SPELL EFFECT OVERLAY

    SPELL_EFFECT_FROZEN: "spells/spell_effect_frozen.png",

    // --- COLLECTABLES ---

    TREASURE_CHEST_LARGE: "entity/collectables/5_zx.png",
    TREASURE_CHEST_SMALL: "entity/collectables/5_sm_zx.png",

    DUNGEON_KEY_SMALL: "entity/collectables/2614_sm_zx.png",
    DUNGEON_KEY_LARGE: "entity/collectables/2614_zx.png",

    COIN_1: "entity/collectables/2611_zx.png",
    COIN_2: "entity/collectables/2607_zx.png",
    COIN_3: "entity/collectables/2608_zx.png",
    COIN_4: "entity/collectables/2609_zx.png",
    COIN_SINGLE: "entity/collectables/2600_zx.png",

    // --- FLOOR TILES ---

    FLOOR_ZX_18: "tiles/floor/1118.png",
    FLOOR_ZX_19: "tiles/floor/1119.png",
    FLOOR_ZX_20: "tiles/floor/1120.png",
    FLOOR_ZX_21: "tiles/floor/1121.png",
    FLOOR_ZX_22: "tiles/floor/1122.png",
    FLOOR_ZX_23: "tiles/floor/1123.png",
    FLOOR_ZX_24: "tiles/floor/1124.png",
    FLOOR_ZX_25: "tiles/floor/1125.png",
    FLOOR_ZX_26: "tiles/floor/1126.png",
    FLOOR_ZX_27: "tiles/floor/1127.png",

    BLOCK_ZX_1: "tiles/floor/1010_zx.png",
    BLOCK_ZX_2: "tiles/floor/1011_zx.png",
    BLOCK_ZX_3: "tiles/floor/1012_zx.png",
    BLOCK_ZX_4: "tiles/floor/1013_zx.png",
    BLOCK_ZX_5: "tiles/floor/1014_zx.png",
    BLOCK_ZX_6: "tiles/floor/1015_zx.png",

    FLOOR_DARK_STONE_1: "tiles/floor/stone_dark_1.png",
    FLOOR_DARK_STONE_2: "tiles/floor/stone_dark_2.png",
    FLOOR_DARK_STONE_3: "tiles/floor/stone_dark_3.png",
    FLOOR_DARK_STONE_4: "tiles/floor/stone_dark_4.png",

    // STATUES
    STATUE_DEMON: "entity/monsters/806.png",

    // PORTALS

    PORTAL_DOOR_CLOSED: "tiles/portals/100.png",
    PORTAL_DOOR_OPEN: "tiles/portals/115.png",

    // --- UI COMPONENTS ---

    SPELL_ZONE_CROSS: "spells/zone_cross_small.png",
    SPELL_ZONE_CROSS_INVERTED: "spells/zone_cross_inverted.png",
    SPELL_ZONE_COLUMN: "spells/zone_column_full.png",
    SPELL_ZONE_ROW: "spells/zone_row_full.png",
    SPELL_ZONE_WIZARD_ONLY: "spells/zone_wizard_only.png",
    SPELL_CANCEL: "spells/cancel.png",

    SPELL_CARD_BLAZE: "spells/spell_blaze.png",
    SPELL_CARD_FREEZE: "spells/2032.png",
    SPELL_CARD_PHASE: "spells/spell_phase.png",
    SPELL_CARD_INVERT: "spells/spell_invert.png",
    SPELL_CARD_TRANSMUTATION: "spells/2028.png",
    SPELL_CARD_EXCHANGE: "spells/2190.png",

    SPELL_SECTION_OVERLAY: "spells/3235_zx.png",

    // --- MISC ---
    INTRO_LOGO: "logo.png",
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
    FROG_HOP: "frog.wav",

    UI_SELECTION: "selection_forward.wav",
    UI_CANCEL: "selection_backward.wav",
    UI_INVALID: "negative.wav",

    WIZARD_CAST_SPELL: "wizard_cast_spell.wav",

    COIN_1: "coin_1.wav",
    COIN_2: "coin_2.wav",
    COIN_3: "coin_3.wav",

    BONUS: "bonus.wav",
    SECRET_REVEALED: "reveal.wav",
    KICK: "kick.wav",
    ZIP: "zip.wav",
    SCRAPE_STONE: "scrape_stone.wav",

    KEY_ACQUIRED: "key_acquired.wav",
    KEY_ACQUIRED_DOOR_CREAKS: "key_acquired_door_creaks.wav",
    DESCEND_STAIRS: "descend_stairs.wav",

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