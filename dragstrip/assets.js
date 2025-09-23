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
    SOLDIER: "resources/soldier_1.png",
    ENEMY: "resources/enemy_1.png"
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
    SOLDIER_MOVE: "resources/move_1.wav"
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
