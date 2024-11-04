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

    // Floors
    FLOOR_TILE_1: "resources/floor1_4.png",
    FLOOR_TILE_2: "resources/floor2_4.png",
    FLOOR_TILE_3: "resources/floor3_4.png",
    FLOOR_TILE_4: "resources/floor4_4.png",
    FLOOR_TILE_5: "resources/floor5_4.png",
    FLOOR_TILE_6: "resources/floor6_4.png",
    FLOOR_TILE_7: "resources/floor7_4.png",
    FLOOR_TILE_8: "resources/floor8_4.png",
    FLOOR_TILE_9: "resources/floor9_4.png",

    TILE_1: "resources/tile1.png",
    TILE_2: "resources/tile2.png",
    TILE_3: "resources/tile3.png",
    TILE_4: "resources/tile4.png",
    TILE_5: "resources/tile5.png",
    TILE_6: "resources/tile6.png",
    TILE_7: "resources/tile7.png",
    TILE_8: "resources/tile8.png",

    TILE_FLESH_GROUND_1: "resources/tiles/64x64/tile_202.png",
    TILE_FLESH_GROUND_2: "resources/tiles/64x64/tile_203.png",
    TILE_FLESH_GROUND_3: "resources/tiles/64x64/tile_204.png",
    TILE_FLESH_GROUND_4: "resources/tiles/64x64/tile_205.png",
    TILE_FLESH_GROUND_5: "resources/tiles/64x64/tile_206.png",
    TILE_FLESH_GROUND_6: "resources/tiles/64x64/tile_207.png",
    TILE_FLESH_GROUND_7: "resources/tiles/64x64/tile_208.png",
    TILE_FLESH_GROUND_8: "resources/tiles/64x64/tile_209.png",
    TILE_FLESH_GROUND_9: "resources/tiles/64x64/tile_210.png",

    TILE_MAGIC_GROUND_1: "resources/tiles/64x64/tile_292.png",
    TILE_MAGIC_GROUND_2: "resources/tiles/64x64/tile_293.png",
    TILE_MAGIC_GROUND_3: "resources/tiles/64x64/tile_294.png",
    TILE_MAGIC_GROUND_4: "resources/tiles/64x64/tile_295.png",
    TILE_MAGIC_GROUND_5: "resources/tiles/64x64/tile_296.png",
    TILE_MAGIC_GROUND_6: "resources/tiles/64x64/tile_297.png",
    TILE_MAGIC_GROUND_7: "resources/tiles/64x64/tile_298.png",
    TILE_MAGIC_GROUND_8: "resources/tiles/64x64/tile_299.png",
    TILE_MAGIC_GROUND_9: "resources/tiles/64x64/tile_300.png",
    TILE_MAGIC_GROUND_10: "resources/tiles/64x64/tile_301.png",
    TILE_MAGIC_GROUND_11: "resources/tiles/64x64/tile_302.png",
    TILE_MAGIC_GROUND_12: "resources/tiles/64x64/tile_303.png",

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

    imageMap = new Map();

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
