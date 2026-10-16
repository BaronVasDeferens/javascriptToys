import { ImageAsset, SoundAsset } from "./assets.js";

// All of the per-frame pixel constants in this file (dX/dY, steering nudges, etc.)
// were originally tuned assuming a steady 60fps requestAnimationFrame tick, with
// movement applied once per update() call regardless of how much real time had
// passed. FRAME_MS is that assumed reference frame duration: multiplying a
// per-frame constant by (deltaMillis / FRAME_MS) reproduces the original motion
// at 60fps while staying correct (platform/framerate independent) at any other
// frame rate.
export const FRAME_MS = 1000 / 60;



export class Entity {
    x = 0;
    y = 0;
    image = null;
    alpha = 1.0;

    isOffScreen = false;
    isAlive = true;

    hitBoxPercent = 0.80;

    hitBoxOffsetX = 0;
    hitBoxOffsetY = 0;
    hitBoxWidth = 0;
    hitBoxHeight = 0;

    hitBox = null;

    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.imageHeight = image.height;
        this.imageWidth = image.width;

        this.hitBoxOffsetX = Math.floor(this.imageWidth * (1 - this.hitBoxPercent) / 2);
        this.hitBoxOffsetY = Math.floor(this.imageHeight * (1 - this.hitBoxPercent) / 2);
        this.hitBoxWidth = Math.floor(this.imageWidth * this.hitBoxPercent);
        this.hitBoxHeight = Math.floor(this.imageHeight * this.hitBoxPercent);

        this.hitBox = this.computeHitBox();
    }

    updatePositionByDelta(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
        this.hitBox = this.computeHitBox();
    }

    isCollideWithEntity(otherEntity) {

        let myHitBox = this.hitBox;
        let theirHitBox = otherEntity.computeHitBox();

        /*
                return (otherEntity.x + otherEntity.imageWidth >= this.x)
            && (otherEntity.x <= this.x + this.imageWidth)
            && (otherEntity.y + otherEntity.imageHeight >= this.y)
            && (otherEntity.y <= this.y + this.imageHeight)
        
        */

        return (theirHitBox.x + theirHitBox.width >= myHitBox.x)
            && (theirHitBox.x <= myHitBox.x + myHitBox.width)
            && (theirHitBox.y + theirHitBox.height >= myHitBox.y)
            && (theirHitBox.y <= myHitBox.y + myHitBox.height)
    }

    computeHitBox() {

        let startX = this.x + this.hitBoxOffsetX;
        let startY = this.y + this.hitBoxOffsetY;

        return {
            x: startX,
            y: startY,
            width: this.hitBoxWidth,
            height: this.hitBoxHeight,
        }
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

    update(deltaMillis) {
        let frameScale = deltaMillis / FRAME_MS;
        this.updatePositionByDelta(this.dX * frameScale, this.dY * frameScale);

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

    update(deltaMillis, roadManager) {

        super.update(deltaMillis);

        // try and follow the road
        // for the next section that the car is about to occupy,
        // find the center of the road

        let nextRoadSection = roadManager.findRoadSectionsForEntityPosition(this);
        let targetX = this.x;

        if (nextRoadSection != null && nextRoadSection[0] != null) {
            targetX = roadManager.getCenterOfRoadForSection(nextRoadSection[0]);
        }

        let frameScale = deltaMillis / FRAME_MS;

        if (targetX > this.x) {
            this.updatePositionByDelta(2 * frameScale, 0);
            // this.x += 2 * frameScale
        } else if (targetX < this.x) {
            this.updatePositionByDelta(-2 * frameScale, 0);
            // this.x -= 2 * frameScale;
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

    // Accumulates real elapsed time between animation-frame advances, so the
    // explosion plays back at a constant real-world speed (~FRAME_MS per sprite
    // frame, matching its original "one sprite frame per 60fps tick" pacing)
    // regardless of how often update() is actually called.
    elapsedMillis = 0;

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

    updatePositionByDelta(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }

    update(deltaMillis) {

        let frameScale = deltaMillis / FRAME_MS;
        this.updatePositionByDelta(this.dX * frameScale, this.dY * frameScale);

        this.elapsedMillis += deltaMillis;
        while (this.elapsedMillis >= FRAME_MS && this.isAlive == true) {
            this.elapsedMillis -= FRAME_MS;
            this.index++;
            if (this.index >= this.imageArray.length) {
                this.isAlive = false;
            }
        }
    }

    render(context) {
        if (this.isAlive == true) {
            context.drawImage(this.imageArray[this.index], this.x, this.y)
        }
    }


}


export class Projectile extends Entity {

    hitBoxPercent = 1.0;

    constructor(x, y, dX, dY, timestamp, imageLoader) {
        super(x, y, imageLoader.getImage(ImageAsset.PLAYER_PROJECTILE_1));
        this.dX = dX;
        this.dY = dY;
        this.timestamp = timestamp;
    }

    update(deltaMillis) {

        let frameScale = deltaMillis / FRAME_MS;
        this.updatePositionByDelta(this.dX * frameScale, this.dY * frameScale);

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