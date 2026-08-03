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


export class EntityMotionDriver extends Driver {

    progress = 0;

    constructor(entity, destinationHex, durationMillis, onUpdate, onComplete) {
        super(durationMillis, onUpdate, onComplete);
        this.entity = entity;
        this.destinationX = destinationHex.center.x - (entity.image.width / 2);
        this.destinationY = destinationHex.center.y - (entity.image.height / 2);
        this.destinationHex = destinationHex;

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
            this.onComplete(this.entity, this.destinationHex);
        }
    }

}

export class EntityMovementMultiDriver {

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