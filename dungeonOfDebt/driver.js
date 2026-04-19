


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
        console.log("starting overlay: " + this.coefficient)
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

export class ImageUpdateDriver {

    totalTimeMillis = 0;
    isFinished = false;

    opacity = 1.0;

    constructor(image, durationMillis, onComplete) {
        this.image = image;
        this.durationMillis = durationMillis;
        this.onComplete = onComplete;
    }

    update(updateMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.totalTimeMillis += updateMillis;

        this.opacity = this.totalTimeMillis / this.durationMillis;
        this.image.style.filter = `brightness(${this.opacity})`;

        if (this.totalTimeMillis >= this.durationMillis) {
            this.isFinished = true;
            this.onComplete();
        }

    }


}