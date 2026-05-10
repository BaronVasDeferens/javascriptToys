import { SoundAsset } from "../assets.js";



export class Driver {

    isFinished = false;
    totalTimeMillis = 0;
    percentComplete = 0.00;

    constructor(durationMillis, onUpdate, onComplete) {
        this.durationMillis = durationMillis;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
    }

    update(deltaMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.totalTimeMillis += deltaMillis;
        this.percentComplete = this.totalTimeMillis / this.durationMillis;

        this.onUpdate(this.percentComplete);

        if (this.totalTimeMillis >= this.durationMillis) {
            this.isFinished = true;
            this.onComplete();
        }
    }
}


export class EntityMovementDriver extends Driver {

    progress = 0;

    constructor(entity, destinationRoom, durationMillis, onUpdate, onComplete) {
        super(durationMillis, onUpdate, onComplete);
        this.entity = entity;
        this.destinationX = destinationRoom.col * destinationRoom.roomSize;
        this.destinationY = destinationRoom.row * destinationRoom.roomSize;
        this.destinationRoom = destinationRoom;

        this.totalDistanceX = (this.destinationX - this.entity.x);
        this.totalDistanceY = (this.destinationY - this.entity.y);
        this.speedX = this.totalDistanceX / this.durationMillis;
        this.speedY = this.totalDistanceY / this.durationMillis;
    }

    update(deltaMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.onUpdate();

        this.totalTimeMillis += deltaMillis;
        //let percentUpdate = this.totalTimeMillis / this.durationMillis;

        this.entity.x += (this.speedX * deltaMillis);
        this.entity.y += (this.speedY * deltaMillis);

        //console.log(`${deltaMillis} :: ${this.totalTimeMillis} / ${this.durationMillis} = ${percentUpdate}`)

        if (this.totalTimeMillis >= this.durationMillis) {
            this.isFinished = true;
            this.onComplete(this.entity, this.destinationRoom);
        }
    }

}

export class MultiEntityMovementDriver {

    progress = 0;
    drivers = [];

    constructor(drivers, onUpdate, onComplete) {
        this.drivers = drivers;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
    }

    update(deltaMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.drivers.forEach(driver => {
            driver.update(deltaMillis);
        })

        //console.log(`${deltaMillis} :: ${this.totalTimeMillis} / ${this.durationMillis} = ${percentUpdate}`)

        if (this.drivers.every(driver => { return driver.isFinished == true })) {
            this.isFinished = true;
            this.onComplete();
        }
    }

}

export class OverlayDriver extends Driver {

    coefficient = -1;

    constructor(overlay, alphaStart, alphaEnd, durationMillis, onUpdate, onComplete) {
        super(durationMillis, onUpdate, onComplete);
        this.overlay = overlay;
        this.coefficient = alphaEnd - alphaStart;
    }

    update(deltaMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.totalTimeMillis += deltaMillis;

        if (this.coefficient < 0) {
            this.overlay.alpha = 1 - (this.totalTimeMillis / this.durationMillis);
        } else {
            this.overlay.alpha = (this.totalTimeMillis / this.durationMillis);
        }

        if (this.overlay.alpha < 0) {
            this.overlay.alpha = 0.0;
        } else if (this.overlay.alpha > 1) {
            this.overlay.alpha = 1;
        }

        if (this.totalTimeMillis >= this.durationMillis) {
            this.isFinished = true;
            this.onComplete();
        }
    }
}

export class EntityImageOpacityUpdateDriver extends Driver {

    totalTimeMillis = 0;
    isFinished = false;

    coefficient = -1;

    constructor(entity, alphaStart, alphaEnd, durationMillis, onComplete) {
        super(durationMillis, () => { }, onComplete);
        this.entity = entity;
        this.coefficient = alphaEnd - alphaStart;
    }

    update(deltaMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.totalTimeMillis += deltaMillis;

        if (this.coefficient < 0) {
            this.entity.setAlpha(1 - (this.totalTimeMillis / this.durationMillis));
        } else {
            this.entity.setAlpha(this.totalTimeMillis / this.durationMillis);
        }

        if (this.entity.alpha < 0) {
            this.entity.setAlpha(0.0);
        } else if (this.entity.alpha > 1) {
            this.entity.setAlpha(1.0);
        }

        if (this.totalTimeMillis >= this.durationMillis) {
            this.isFinished = true;
            this.onComplete();
        }

    }

}

// export class Renderable {

//     x = 0;
//     y = 0;
//     image = null;
//     driver = null;

//     alpha = 1.0;

//     constructor(x, y, image, tileSize, driver) {
//         this.x = x;
//         this.y = y;
//         this.image = image;
//         this.tileSize = tileSize;
//         this.driver = driver;
//     }

//     render(context) {
//         context.globalAlpha = this.alpha;
//         context.drawImage(
//             this.image,
//             this.x + ((this.tileSize - this.image.width) / 2),
//             this.y + ((this.tileSize - this.image.height) / 2)
//         );
//     }

// }

