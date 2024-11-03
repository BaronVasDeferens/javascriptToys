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

    // Floors
    FLOOR_TILE_1: "resources/floor1.png",
    FLOOR_TILE_2: "resources/floor2.png",
    FLOOR_TILE_3: "resources/floor3.png",
    FLOOR_TILE_4: "resources/floor4.png",
    FLOOR_TILE_5: "resources/floor5.png",
    FLOOR_TILE_6: "resources/floor6.png",
    FLOOR_TILE_7: "resources/floor7.png",
    FLOOR_TILE_8: "resources/floor8.png",
    FLOOR_TILE_9: "resources/floor9.png"
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
