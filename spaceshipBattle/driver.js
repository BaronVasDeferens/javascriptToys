export class MovementDriver {

    isFinished = false;
    progress = 0;
    totalTimeMillis = 0;

    constructor(entity, destinationX, destinationY, durationMillis, onComplete) {
        this.entity = entity;
        this.destinationX = destinationX;
        this.destinationY = destinationY;
        this.durationMillis = durationMillis;
        this.onComplete = onComplete;

        this.totalDistanceX = (this.destinationX - this.entity.x);
        this.totalDistanceY = (this.destinationY - this.entity.y);
        this.speedX = this.totalDistanceX / this.durationMillis;
        this.speedY = this.totalDistanceY / this.durationMillis;
    }

    update(deltaMillis) {

        if (this.isFinished == true) {
            return;
        }

        this.totalTimeMillis += deltaMillis;
        //let percentUpdate = this.totalTimeMillis / this.durationMillis;

        this.entity.x += (this.speedX * deltaMillis);
        this.entity.y += (this.speedY * deltaMillis);

        //console.log(`${deltaMillis} :: ${this.totalTimeMillis} / ${this.durationMillis} = ${percentUpdate}`)

        if (this.totalTimeMillis >= this.durationMillis) {
            this.isFinished = true;
            this.onComplete();
        }
    }


}