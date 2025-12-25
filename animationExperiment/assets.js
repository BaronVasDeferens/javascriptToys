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

    EXPLOSION_0: "explosion_0.png",
    EXPLOSION_1: "explosion_1.png",
    EXPLOSION_2: "explosion_2.png",
    EXPLOSION_3: "explosion_3.png",
    EXPLOSION_4: "explosion_4.png",
    EXPLOSION_5: "explosion_5.png",
    EXPLOSION_6: "explosion_6.png",
    EXPLOSION_7: "explosion_7.png",
    EXPLOSION_8: "explosion_8.png",
    EXPLOSION_9: "explosion_9.png",
    EXPLOSION_10: "explosion_10.png",
    EXPLOSION_11: "explosion_11.png",
    EXPLOSION_12: "explosion_12.png",
    EXPLOSION_13: "explosion_13.png",
    EXPLOSION_14: "explosion_14.png",
    EXPLOSION_15: "explosion_15.png",

    FIRE_0: "fire/0.png",
    FIRE_1: "fire/1.png",
    FIRE_2: "fire/2.png",
    FIRE_3: "fire/3.png",
    FIRE_4: "fire/4.png",
    FIRE_5: "fire/5.png",
    FIRE_6: "fire/6.png",
    FIRE_7: "fire/7.png",
    FIRE_8: "fire/8.png",
    FIRE_9: "fire/9.png",
    FIRE_10: "fire/10.png",
    FIRE_11: "fire/11.png",
    FIRE_12: "fire/12.png",
    FIRE_13: "fire/13.png",
    FIRE_14: "fire/14.png",
    FIRE_15: "fire/15.png",
    FIRE_16: "fire/16.png",
    FIRE_17: "fire/17.png",
    FIRE_18: "fire/18.png",
    FIRE_19: "fire/19.png",
    FIRE_20: "fire/20.png",
    FIRE_21: "fire/21.png",
    FIRE_22: "fire/22.png",
    FIRE_23: "fire/23.png",
    FIRE_24: "fire/24.png",
    FIRE_25: "fire/25.png",
    FIRE_26: "fire/26.png",
    FIRE_27: "fire/27.png",
    FIRE_28: "fire/28.png",
    FIRE_29: "fire/29.png",
    FIRE_30: "fire/30.png",
    FIRE_31: "fire/31.png",
    FIRE_32: "fire/32.png",
    FIRE_33: "fire/33.png",
    FIRE_34: "fire/34.png",
    FIRE_35: "fire/35.png",
    FIRE_36: "fire/36.png",
    FIRE_37: "fire/37.png",
    FIRE_38: "fire/38.png",
    FIRE_39: "fire/39.png",
    FIRE_40: "fire/40.png",
    FIRE_41: "fire/41.png",
    FIRE_42: "fire/42.png",
    FIRE_43: "fire/43.png",
    FIRE_44: "fire/44.png",
    FIRE_45: "fire/45.png",
    FIRE_46: "fire/46.png",
    FIRE_47: "fire/47.png",
    FIRE_48: "fire/48.png",
    FIRE_49: "fire/49.png",
    FIRE_50: "fire/50.png",
    FIRE_51: "fire/51.png",
    FIRE_52: "fire/52.png",
    FIRE_53: "fire/53.png",
    FIRE_54: "fire/54.png",
    FIRE_55: "fire/55.png",
    FIRE_56: "fire/56.png",
    FIRE_57: "fire/57.png",
    FIRE_58: "fire/58.png",
    FIRE_59: "fire/59.png"
});

export class ImageLoader {

    imageMap = new Map();

    loadImages(callback) {

        var loadedImages = 0;
        let totalImages = Object.keys(ImageAsset).length;

        console.log(`Loading ${totalImages} images...`);

        for (const key in ImageAsset) {

            var assetLocation = relativePath + ImageAsset[key];
            let img = new Image();
            this.imageMap.set(ImageAsset[key], img);

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
    MACHINEGUN_1: "machinegun_1.wav",
    MACHINEGUN_2: "machinegun_2.wav",
});


export class SoundLoader {

    decodedBufferMap = new Map();

    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    async loadSounds(callback) {

        let soundsTotal = Object.keys(SoundAsset).length;

        console.log(`Loading ${soundsTotal} sounds...`);

        for (const key in SoundAsset) {
            let asset = relativePath + SoundAsset[key];
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

    fontMap = new Map();

    async loadFonts() {

        let fontsTotal = Object.keys(FontAsset).length;
        console.log(`Loading ${fontsTotal} fonts...`);

        for (const key in FontAsset) {
            let asset = relativePath + FontAsset[key];
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