import { ImageAsset, SoundAsset } from "./assets.js";



export class Entity {

    x = 0;
    y = 0;

    image = null;
    alpha = 1.0;

    deltaX = 0;             // pixels per second
    deltaY = 0;             // pixels per second

    isOffScreen = false;
    isAlive = true;

    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.imageHeight = image.height;
        this.imageWidth = image.width;
    }

    wasClicked(click) {
        let x = click.offsetX;
        let y = click.offsetY;

        if (x > this.x && x < this.x + this.image.width) {
            if (y > this.y && y < this.y + this.image.height) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    setAlpha(alpha) {
        this.alpha = alpha;
    }

    setSpeedDelta(dX, dY) {
        this.deltaX = dX;
        this.deltaY = dY;
    }

    isCollideWithEntity(otherEntity) {
        return (otherEntity.x + otherEntity.imageWidth >= this.x)
            && (otherEntity.x <= this.x + this.imageWidth)
            && (otherEntity.y + otherEntity.imageHeight >= this.y)
            && (otherEntity.y <= this.y + this.imageHeight)
    }

    getCenteredCoordsOnMouse(event) {
        return {
            x: event.offsetX - (this.image.width / 2),
            y: event.offsetY - (this.image.height / 2)
        }
    }

    update(delta) {
        this.x += (delta / 1000) * this.deltaX;
        this.y += (delta / 1000) * this.deltaY;
    }

    render(context) {
        context.globalAlpha = this.alpha;
        context.drawImage(this.image, this.x, this.y);
        context.globalAlpha = 1.0;
    }
}


export class EntityExplosion {

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

export class EntityFire {

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
