/**
 * ---------------------------------- ASSET LOADER ----------------------------
 */

export class AssetLoader {
    loadAssets(imageLoader, soundLoader, callback) {
        imageLoader.loadImages(() => { soundLoader.loadSounds(() => { callback(); }); });
    }
}

/**
 * --------------------------------- IMAGES -----------------------------------
 */

export var ImageAsset = Object.freeze({
    INTRO: "resources/logo.png",

    // Environment
    FLOOR_TILE: "resources/floor_tile.png",
    FLOOR_TILE_OBSTRUCTED: "resources/obstructed_tile.png",

    // Sprites
    BLOB_STRIP: "resources/blob_new_strip.png",
    BLOB_DEATH_STRIP: "resources/blob_death_strip.png",
    SOLDIER_STRIP: "resources/soldier_new_strip.png",

    // Action panels: Soldier firing / Blob dying
    SOLDIER_FIRING: "resources/soldier_firing_2.png",
    BLOB_DYING: "resources/blob_dead_4.png",
    RESULT_BLOB_DEATH: "resources/result_blob_death.png",
    RESULT_SOLDIER_MISS: "resources/result_miss.png",
    BLOB_SURVIVES: "resources/blob_survives_1.png",

    // Action panels: Blob attacking / Soldier dying
    BLOB_ATTACKING: "resources/blob_attack_1.png",
    SOLDIER_DYING: "resources/blob_attack_2.png",
    RESULT_SOLDIER_DEATH: "resources/result_human_death.png",

    DEFEAT_1: "resources/defeat_1.png",
    DEFEAT_2: "resources/defeat_2.png",
});

export class ImageLoader {

    imageMap = new Map();

    loadImages(callback) {

        let readinessCheck = new Map();

        for (const key in ImageAsset) {
            var assetLocation = ImageAsset[key];
            let img = new Image();
            this.imageMap.set(assetLocation, img);
            img.onload = function () {
                console.log(`Image ${img.src} loaded`);
                readinessCheck.set(img.src, true);
                let values = Array.from(readinessCheck.values());
                let isReady = values.every(v => v === true );
                if (isReady == true) {
                    console.log(`Image loading complete!`);
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
}


/**
 * ----------------------------- SOUNDS ---------------------------------
 */

export var SoundAsset = Object.freeze({
    INTRO: "resources/sounds/intro.wav",
    
    BLOB_MOVE_1: "resources/sounds/blob_move_1.wav",
    BLOB_MOVE_2: "resources/sounds/blob_move_2.wav",
    BLOB_SMG_DEATH: "resources/sounds/blob_smg_dies.wav",
    BLOB_WHIP: "resources/sounds/blob_whip.wav",

    SOLDIER_MOVE_1: "resources/sounds/soldier_move_1.wav",
    SMG_1: "resources/sounds/smg.wav"
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
