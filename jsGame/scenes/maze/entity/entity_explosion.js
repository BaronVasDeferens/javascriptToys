import { Entity } from "./entity.js";

export class EntityExplosion extends Entity {

    index = 0;

    isAlive = true;

    animationRate = 0;
    lastRenderMillis = Date.now();

    constructor(x, y, randomStartIndex, period, assetManager) {

        this.x = x;
        this.y = y;
        this.period = period;

        this.imageArray = [
            assetManager.getImage(ImageAsset.EXPLOSION_0),
            assetManager.getImage(ImageAsset.EXPLOSION_1),
            assetManager.getImage(ImageAsset.EXPLOSION_2),
            assetManager.getImage(ImageAsset.EXPLOSION_3),
            assetManager.getImage(ImageAsset.EXPLOSION_4),
            assetManager.getImage(ImageAsset.EXPLOSION_5),
            assetManager.getImage(ImageAsset.EXPLOSION_6),
            assetManager.getImage(ImageAsset.EXPLOSION_7),
            assetManager.getImage(ImageAsset.EXPLOSION_8),
            assetManager.getImage(ImageAsset.EXPLOSION_9),
            assetManager.getImage(ImageAsset.EXPLOSION_10),
            assetManager.getImage(ImageAsset.EXPLOSION_11),
            assetManager.getImage(ImageAsset.EXPLOSION_12),
            assetManager.getImage(ImageAsset.EXPLOSION_13),
            assetManager.getImage(ImageAsset.EXPLOSION_14),
            assetManager.getImage(ImageAsset.EXPLOSION_15)
        ];

        if (this.period == null) {
            this.period = 1000;
        }

        if (randomStartIndex == true) {
            this.index = this.randomInRange(0, this.imageArray.length)
        } else {
            this.index = 0;
        }

        this.animationRate = this.period / this.imageArray.length;
    }

    update(delta) {
        let indicies = Math.floor((Date.now() - this.lastRenderMillis) / this.animationRate)

        if (indicies > 0) {
            this.index += indicies;
            this.index = this.index % this.imageArray.length;
            this.lastRenderMillis = Date.now();
        }
    }

    render(context) {
        if (this.isAlive == true) {
            context.drawImage(this.imageArray[this.index], this.x, this.y)
        }
    }

    randomInRange(min, max) {
        let range = Math.abs(max - min);
        return Math.floor(Math.random() * range) + min
    }

}