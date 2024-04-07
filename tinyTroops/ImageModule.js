export var ImageAsset = Object.freeze({
    DEFEAT_1: "resources/defeat_1.png",
    DEFEAT_2: "resources/defeat_2.png",
    INTRO: "resources/logo.png"
});

export class ImageModule {

    imageMap = new Map();

    loadImages(callback) {

        let readinessCheck = new Map();

        for (const key in ImageAsset) {
            var assetLocation = ImageAsset[key];
            let img = new Image();
            this.imageMap.set(assetLocation, img);
            img.onload = function () {
                console.log(`${img.src} loaded: ${img.width} x ${img.height}`);
                readinessCheck.set(img.src, true);
                console.log(readinessCheck);
                let values = Array.from(readinessCheck.values());
                let isReady = values.every(v => v === true );
                if (isReady == true) {
                    console.log(`LOADING FINISHED!`);
                    callback();
                }
            }
            img.src = assetLocation;
            readinessCheck.set(img.src, false);
        };
    }

    getImage(imgAsset) {
        console.log(`returning ${imgAsset} : ${this.imageMap.get(imgAsset)}`)
        return this.imageMap.get(imgAsset);
    };
}

