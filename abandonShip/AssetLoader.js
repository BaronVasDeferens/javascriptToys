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
    FLOOR_OBSTRUCTION_1: "resources/floor_tile_obstruction_1.png",

    // Sprites
    BLOB_STRIP: "resources/blob_new_strip.png",
    BLOB_DEATH_STRIP: "resources/blob_death_strip.png",
    SOLDIER_STRIP: "resources/soldier_new_strip.png",
    SOLDIER_DEATH_STRIP: "resources/soldier_death_strip.png",
    SOLDIER_PLACEHOLDER: "resources/soldier_placeholder.png",
    BLOB_PLACEHOLDER: "resources/blob_placeholder.png",

    // Interstitials / turn changes
    INTERSTITIAL_PLAYER_TURN: "resources/turn_player.png",
    INTERSTITIAL_ENEMY_TURN: "resources/turn_enemy.png",

    // Action panels: Soldier firing / Blob dying
    SOLDIER_FIRING: "resources/soldier_firing_2.png",
    BLOB_DYING: "resources/blob_dead_4.png",
    RESULT_BLOB_DEATH: "resources/result_blob_death.png",
    RESULT_SOLDIER_MISS: "resources/result_miss_3.png",
    BLOB_SURVIVES: "resources/blob_survives_1.png",

    // Action panels: Blob attacking / Soldier dying
    BLOB_ATTACKING: "resources/blob_attack_1.png",
    SOLDIER_DYING: "resources/blob_attack_2.png",
    RESULT_SOLDIER_DEATH: "resources/result_human_death.png",

    // SPECIAL EFFECTS
    FIRE: "resources/fire.png",

    // End game
    DEFEAT_1: "resources/defeat_1.png",
    DEFEAT_2: "resources/defeat_2.png",
    DEFEAT_3: "resources/defeat_3.png",
    DEFEAT_4: "resources/defeat_4.png",

    VICTORY_1: "resources/victory_1.png"
});

export class ImageLoader {

    imageMap = new Map();

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
    SOLDIER_SCREAM: "resources/sounds/soldier_scream_1.wav",

    SOLDIER_MOVE_1: "resources/sounds/soldier_move_1.wav",
    SMG_1: "resources/sounds/smg.wav",
    RICOCHET_1: "resources/sounds/ricochet_1.wav"
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
            snd.load();
        };
    }

    getSound(sndAsset) {
        return this.soundMap.get(sndAsset).cloneNode();
    };
}
