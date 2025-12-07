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
    TITLE: "title_temp_g.png",

    VISION_NIGHT_MODE: "vision_night.png",
    VISION_INFRARED_MODE: "vision_infrared.png",

    INFILTRATOR: "infiltrator_2.png",
    PLAYER_PROJECTILE_1: "player_projectile_1.png",

    ENEMY_SPIDER_1: "enemy_1.png",
    ENEMY_MUTANT_1: "enemy_2.png",
    ENEMY_TRUCK: "enemy_truck.png",

    BLACK: "black.png",

    DECAL_GRASS_1: "grass_1.png",
    DECAL_GRASS_2: "grass_2.png",
    DECAL_GRASS_3: "grass_3.png",
    DECAL_GRASS_4: "grass_4.png",

    DECAL_PLANT_1: "plant_1.png",
    DECAL_PLANT_2: "plant_2.png",

    DECAL_ROCK_1: "rock_1.png",

    DECAL_CAR_1: "car_1.png",
    DECAL_CAR_2: "car_2.png",
    DECAL_CAR_3: "car_3.png",
    DECAL_CAR_4: "car_4.png",

    DECAL_BONES_1: "bones_1.png",
    DECAL_BONES_2: "bones_2.png",
    DECAL_BONES_3: "bones_3.png",
    DECAL_BONES_4: "bones_4.png",
    DECAL_BONES_5: "bones_5.png",

    TILE_92: "tile_92b.png",
    TILE_93: "tile_93b.png",
    TILE_94: "tile_94b.png",
    TILE_95: "tile_95b.png",
    TILE_96: "tile_96.png",
    TILE_97: "tile_97.png",
    TILE_98: "tile_98.png",
    TILE_99: "tile_99.png",
    TILE_100: "tile_100.png",
    TILE_101: "tile_101.png",
    TILE_102: "tile_102.png",
    TILE_103: "tile_103.png",

    TILE_SHOULDER_0: "tile_shoulder_0.png",
    TILE_SHOULDER_90: "tile_shoulder_90.png",
    TILE_SHOULDER_180: "tile_shoulder_180.png",
    TILE_SHOULDER_270: "tile_shoulder_270.png",

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
    EXPLOSION_15: "explosion_15.png"
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
    THEME_1: "theme_1.wav",
    MACHINEGUN_1: "machinegun_1.wav",
    MACHINEGUN_2: "machinegun_2.wav",
    MACHINEGUN_TRAIL: "machinegun_trail.wav",
    EXPLOSION_1: "explosion_1.wav",
    CRASH_1: "crash_1.wav",
    CRASH_2: "crash_2.wav"
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
            this.decodedBufferMap.set(asset, decodedBuffer);
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