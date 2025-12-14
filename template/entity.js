import { ImageAsset, SoundAsset } from "./assets.js";



export class Entity {
    x = 0;
    y = 0;
    image = null;
    alpha = 1.0;

    deltaX = 0;             // pixels per second
    deltaY = 64;             // pixels per second

    isOffScreen = false;
    isAlive = true;

    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.imageHeight = image.height;
        this.imageWidth = image.width;
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


export class EntityEnemy extends Entity {

    constructor(x, y, image, dX, dY, canvasWidth, canvasHeight) {
        super(x, y, image);
        this.dX = dX;
        this.dY = dY;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    update() {
        this.x += this.dX;
        this.y += this.dY;

        if (this.x < (0 - this.imageWidth) || this.x > this.canvasWidth || this.y < (0 - this.imageHeight) || this.y > this.canvasHeight) {
            this.isOffScreen = true;
        }
    }
}


// occupant (takes up space)
// glutton
// adherent (follows road)
// instigator (rammer)

export class EntityRoadFollower extends EntityEnemy {

    alpha = 1.0;

    dX = 0;
    dY = 0;

    isAlive = true;

    isOffScreen = false;

    constructor(x, y, image) {
        super(x, y, image);
    }

    update(nowMillis, roadManager) {

        super.update();

        // try and follow the road
        // for the next section that the car is about to occpy,
        // find the center of the road

        let nextRoadSection = roadManager.findRoadSectionsForEntityPosition(this);
        let targetX = this.x;

        if (nextRoadSection != null && nextRoadSection[0] != null) {
            targetX = roadManager.getCenterOfRoadForSection(nextRoadSection[0]);
        }

        if (targetX > this.x) {
            this.x += 2
        } else if (targetX < this.x) {
            this.x -= 2;
        }

    }
}



export class EntityBlinker extends Entity {

    constructor(x, y, imageLoader, periodMillis) {
        this.x = x;
        this.y = y;
        this.image = imageLoader.getImage(ImageAsset.DECAL_CAR_1);
        this.periodMillis = periodMillis;
        this.onMillis = Date.now() + periodMillis;
        this.offMillis = this.onMillis + periodMillis;
    }

    render(context) {

        let now = Date.now();

        if (now > this.onMillis && now <= this.offMillis) {
            context.drawImage(
                this.image,
                this.x,
                this.y
            )
        } else {

            if (now > this.offMillis && now < this.offMillis + this.periodMillis) {
                // this is during the "off" period
            } else if (now > this.onMillis && now > this.offMillis) {
                this.onMillis = this.offMillis + this.periodMillis;
                this.offMillis = this.onMillis + this.periodMillis;
            }

        }
    }

}


export class EntityExplosion {

    index = 0;

    isAlive = true;

    constructor(entity, dX, dY, imageLoader) {

        this.x = entity.x;
        this.y = entity.y;
        this.dX = dX;
        this.dY = dY;

        this.imageArray = [
            imageLoader.getImage(ImageAsset.EXPLOSION_0),
            imageLoader.getImage(ImageAsset.EXPLOSION_1),
            imageLoader.getImage(ImageAsset.EXPLOSION_2),
            imageLoader.getImage(ImageAsset.EXPLOSION_3),
            imageLoader.getImage(ImageAsset.EXPLOSION_4),
            imageLoader.getImage(ImageAsset.EXPLOSION_5),
            imageLoader.getImage(ImageAsset.EXPLOSION_6),
            imageLoader.getImage(ImageAsset.EXPLOSION_7),
            imageLoader.getImage(ImageAsset.EXPLOSION_8),
            imageLoader.getImage(ImageAsset.EXPLOSION_9),
            imageLoader.getImage(ImageAsset.EXPLOSION_10),
            imageLoader.getImage(ImageAsset.EXPLOSION_11),
            imageLoader.getImage(ImageAsset.EXPLOSION_12),
            imageLoader.getImage(ImageAsset.EXPLOSION_13),
            imageLoader.getImage(ImageAsset.EXPLOSION_14),
            imageLoader.getImage(ImageAsset.EXPLOSION_15)
        ];
    }

    update(nowMillis) {

        this.x += this.dX;
        this.y += this.dY;
        this.index++;
        if (this.index >= this.imageArray.length) {
            this.isAlive = false;
        }
    }

    render(context) {
        if (this.isAlive == true) {
            context.drawImage(this.imageArray[this.index], this.x, this.y)
        }
    }


}


export class Projectile extends Entity {

    constructor(x, y, dX, dY, imageLoader) {
        super(x, y, imageLoader.getImage(ImageAsset.PLAYER_PROJECTILE_1));
        this.dX = dX;
        this.dY = dY;
    }

    update() {

        this.x += this.dX;
        this.y += this.dY;

        if (this.y <= 0) {
            this.isAlive = false;
            this.isOffScreen = true;
        }
    }
}

export class Timer {

    isActive = true;

    constructor(startMillis, finishMillis, onEveryUpdate, onFinish) {
        this.startMillis = startMillis
        this.finishMillis = finishMillis;
        this.onEveryUpdate = onEveryUpdate;
        this.onFinish = onFinish;
    }

    update(nowMillis) {

        if (this.isActive == true) {

            this.onEveryUpdate();

            if (nowMillis >= this.finishMillis) {
                this.onFinish();
                this.isActive = false;
            }
        }
    }

}

export class TimedLooper {

    isActive = true;

    constructor(periodMillis, onWakeUp) {
        this.periodMillis = periodMillis;
        this.onWakeUp = onWakeUp;
        this.startMillis = Date.now() + periodMillis;
    }

    update(nowMillis) {

        if (this.isActive == true) {
            if (nowMillis >= this.startMillis) {
                this.onWakeUp();
                this.startMillis = nowMillis + this.periodMillis;
            }
        }
    }

}