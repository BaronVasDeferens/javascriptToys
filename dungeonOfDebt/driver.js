


export class Driver {

    isFinished = false;
    totalTimeMillis = 0;

    constructor(durationMillis, onUpdate, onComplete) {
        this.durationMillis = durationMillis;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
    }

    update(deltaMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.onUpdate();

        this.totalTimeMillis += deltaMillis;

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

export class SpellEffectOverlayDriver extends Driver {

    alpha = 1.0;

    constructor(overlay, durationMillis, onUpdate, onComplete) {
        super(durationMillis, onUpdate, onComplete);
        this.overlay = overlay;
    }

    update(deltaMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.overlay.alpha -= (deltaMillis / this.durationMillis);

        this.totalTimeMillis += deltaMillis;

        if (this.totalTimeMillis >= this.durationMillis) {
            this.isFinished = true;
            this.onComplete();
        }
    }


}