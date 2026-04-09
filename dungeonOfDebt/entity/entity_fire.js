import { Entity } from "./entity.js";

export class EntityFire extends Entity{

    index = 0;

    isAlive = true;

    animationRate = 1000 / 16;
    lastRenderMillis = Date.now();

    constructor(x, y, randomStartIndex, period, assetManager) {

        this.x = x;
        this.y = y;
        this.period = period;

        this.imageArray = [
            assetManager.getImage(ImageAsset.FIRE_0),
            assetManager.getImage(ImageAsset.FIRE_1),
            assetManager.getImage(ImageAsset.FIRE_2),
            assetManager.getImage(ImageAsset.FIRE_3),
            assetManager.getImage(ImageAsset.FIRE_4),
            assetManager.getImage(ImageAsset.FIRE_5),
            assetManager.getImage(ImageAsset.FIRE_6),
            assetManager.getImage(ImageAsset.FIRE_7),
            assetManager.getImage(ImageAsset.FIRE_8),
            assetManager.getImage(ImageAsset.FIRE_9),
            assetManager.getImage(ImageAsset.FIRE_10),
            assetManager.getImage(ImageAsset.FIRE_11),
            assetManager.getImage(ImageAsset.FIRE_12),
            assetManager.getImage(ImageAsset.FIRE_13),
            assetManager.getImage(ImageAsset.FIRE_14),
            assetManager.getImage(ImageAsset.FIRE_15),
            assetManager.getImage(ImageAsset.FIRE_16),
            assetManager.getImage(ImageAsset.FIRE_17),
            assetManager.getImage(ImageAsset.FIRE_18),
            assetManager.getImage(ImageAsset.FIRE_19),
            assetManager.getImage(ImageAsset.FIRE_20),
            assetManager.getImage(ImageAsset.FIRE_21),
            assetManager.getImage(ImageAsset.FIRE_22),
            assetManager.getImage(ImageAsset.FIRE_23),
            assetManager.getImage(ImageAsset.FIRE_24),
            assetManager.getImage(ImageAsset.FIRE_25),
            assetManager.getImage(ImageAsset.FIRE_26),
            assetManager.getImage(ImageAsset.FIRE_27),
            assetManager.getImage(ImageAsset.FIRE_28),
            assetManager.getImage(ImageAsset.FIRE_29),
            assetManager.getImage(ImageAsset.FIRE_30),
            assetManager.getImage(ImageAsset.FIRE_31),
            assetManager.getImage(ImageAsset.FIRE_32),
            assetManager.getImage(ImageAsset.FIRE_33),
            assetManager.getImage(ImageAsset.FIRE_34),
            assetManager.getImage(ImageAsset.FIRE_35),
            assetManager.getImage(ImageAsset.FIRE_36),
            assetManager.getImage(ImageAsset.FIRE_37),
            assetManager.getImage(ImageAsset.FIRE_38),
            assetManager.getImage(ImageAsset.FIRE_39),
            assetManager.getImage(ImageAsset.FIRE_40),
            assetManager.getImage(ImageAsset.FIRE_41),
            assetManager.getImage(ImageAsset.FIRE_42),
            assetManager.getImage(ImageAsset.FIRE_43),
            assetManager.getImage(ImageAsset.FIRE_44),
            assetManager.getImage(ImageAsset.FIRE_45),
            assetManager.getImage(ImageAsset.FIRE_46),
            assetManager.getImage(ImageAsset.FIRE_47),
            assetManager.getImage(ImageAsset.FIRE_48),
            assetManager.getImage(ImageAsset.FIRE_49),
            assetManager.getImage(ImageAsset.FIRE_50),
            assetManager.getImage(ImageAsset.FIRE_51),
            assetManager.getImage(ImageAsset.FIRE_52),
            assetManager.getImage(ImageAsset.FIRE_53),
            assetManager.getImage(ImageAsset.FIRE_54),
            assetManager.getImage(ImageAsset.FIRE_55),
            assetManager.getImage(ImageAsset.FIRE_56),
            assetManager.getImage(ImageAsset.FIRE_57),
            assetManager.getImage(ImageAsset.FIRE_58),
            assetManager.getImage(ImageAsset.FIRE_59)
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