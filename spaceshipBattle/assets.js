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

    FLOOR: "tiles/grid/floor.png",
    FLOOR_OBSTRUCTION: "tiles/grid/floor_obstruction.png",

    EXPLOSION_0: "tiles/explosion/explosion_0.png",
    EXPLOSION_1: "tiles/explosion/explosion_1.png",
    EXPLOSION_2: "tiles/explosion/explosion_2.png",
    EXPLOSION_3: "tiles/explosion/explosion_3.png",
    EXPLOSION_4: "tiles/explosion/explosion_4.png",
    EXPLOSION_5: "tiles/explosion/explosion_5.png",
    EXPLOSION_6: "tiles/explosion/explosion_6.png",
    EXPLOSION_7: "tiles/explosion/explosion_7.png",
    EXPLOSION_8: "tiles/explosion/explosion_8.png",
    EXPLOSION_9: "tiles/explosion/explosion_9.png",
    EXPLOSION_10: "tiles/explosion/explosion_10.png",
    EXPLOSION_11: "tiles/explosion/explosion_11.png",
    EXPLOSION_12: "tiles/explosion/explosion_12.png",
    EXPLOSION_13: "tiles/explosion/explosion_13.png",
    EXPLOSION_14: "tiles/explosion/explosion_14.png",
    EXPLOSION_15: "tiles/explosion/explosion_15.png",

    FIRE_0: "tiles/fire/0.png",
    FIRE_1: "tiles/fire/1.png",
    FIRE_2: "tiles/fire/2.png",
    FIRE_3: "tiles/fire/3.png",
    FIRE_4: "tiles/fire/4.png",
    FIRE_5: "tiles/fire/5.png",
    FIRE_6: "tiles/fire/6.png",
    FIRE_7: "tiles/fire/7.png",
    FIRE_8: "tiles/fire/8.png",
    FIRE_9: "tiles/fire/9.png",
    FIRE_10: "tiles/fire/10.png",
    FIRE_11: "tiles/fire/11.png",
    FIRE_12: "tiles/fire/12.png",
    FIRE_13: "tiles/fire/13.png",
    FIRE_14: "tiles/fire/14.png",
    FIRE_15: "tiles/fire/15.png",
    FIRE_16: "tiles/fire/16.png",
    FIRE_17: "tiles/fire/17.png",
    FIRE_18: "tiles/fire/18.png",
    FIRE_19: "tiles/fire/19.png",
    FIRE_20: "tiles/fire/20.png",
    FIRE_21: "tiles/fire/21.png",
    FIRE_22: "tiles/fire/22.png",
    FIRE_23: "tiles/fire/23.png",
    FIRE_24: "tiles/fire/24.png",
    FIRE_25: "tiles/fire/25.png",
    FIRE_26: "tiles/fire/26.png",
    FIRE_27: "tiles/fire/27.png",
    FIRE_28: "tiles/fire/28.png",
    FIRE_29: "tiles/fire/29.png",
    FIRE_30: "tiles/fire/30.png",
    FIRE_31: "tiles/fire/31.png",
    FIRE_32: "tiles/fire/32.png",
    FIRE_33: "tiles/fire/33.png",
    FIRE_34: "tiles/fire/34.png",
    FIRE_35: "tiles/fire/35.png",
    FIRE_36: "tiles/fire/36.png",
    FIRE_37: "tiles/fire/37.png",
    FIRE_38: "tiles/fire/38.png",
    FIRE_39: "tiles/fire/39.png",
    FIRE_40: "tiles/fire/40.png",
    FIRE_41: "tiles/fire/41.png",
    FIRE_42: "tiles/fire/42.png",
    FIRE_43: "tiles/fire/43.png",
    FIRE_44: "tiles/fire/44.png",
    FIRE_45: "tiles/fire/45.png",
    FIRE_46: "tiles/fire/46.png",
    FIRE_47: "tiles/fire/47.png",
    FIRE_48: "tiles/fire/48.png",
    FIRE_49: "tiles/fire/49.png",
    FIRE_50: "tiles/fire/50.png",
    FIRE_51: "tiles/fire/51.png",
    FIRE_52: "tiles/fire/52.png",
    FIRE_53: "tiles/fire/53.png",
    FIRE_54: "tiles/fire/54.png",
    FIRE_55: "tiles/fire/55.png",
    FIRE_56: "tiles/fire/56.png",
    FIRE_57: "tiles/fire/57.png",
    FIRE_58: "tiles/fire/58.png",
    FIRE_59: "tiles/fire/59.png"
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
    MACHINEGUN_1: "machinegun_1.wav",
    MACHINEGUN_2: "machinegun_2.wav",
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