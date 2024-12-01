
// --------------------
// ----- ENTITIES -----
// --------------------

class Entity {

    id = "";
    x = 0;
    y = 0;

    isAlive = true;
    gridSquare = null;

    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    update(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }

    render(context) {
        context.drawImage(this.image, this.x, this.y);
    }
}

export class ImageDisplayEntity extends Entity {
    constructor(id,x,y,image) {
        super(id,x,y);
        this.image = image;
    }
}

export class Wizard extends Entity {
    constructor(id, x, y, image) {
        super(id, x, y);
        this.image = image;
    }
}

export var MonsterMovementBehavior = Object.freeze({
    RANDOM: 1,
    CHASE_PLAYER: 2,
    REPLICATE: 3
});

export class Monster extends Entity {

    isLethal = true;                // When true, the monster kills the wizard if they occupy the same space
    isBlocking = false;             // When true, the wizard cannot occupy the same space.
    replicationsRemaining = 0;      // When the behavior is replicating, this is the number of mx number of times it may replicate

    constructor(id, x, y, behavior, image) {
        super(id, x, y);
        this.behavior = behavior;
        this.image = image;
    }

    setMover(mover) {
        this.mover = mover;
    }

}

export class Obstacle extends Entity {
    isLethal = false;
    constructor(id, x, y, image) {
        super(id, x, y);
        this.image = image;
    }
}

export class Hazard extends Entity {
    isLethal = true;
    constructor(id, x, y, image) {
        super(id, x, y);
        this.image = image;
    }
}

export class Portal extends Entity {
    constructor(toLevelNumber, x, y, image) {
        super(`portal_${toLevelNumber}`, x, y);
        this.toLevelNumber = toLevelNumber;
        this.image = image;
    }
}


export class Collectable extends Entity {
    isCollected = false;

    constructor(id, x, y, image) {
        super(id, x, y);
        this.image = image;
    }
}

export class Card extends Entity {

    width = 300;
    height = 340;

    isExpended = false;

    constructor(x, y, action, image) {
        super(action, x, y);
        this.x = x;
        this.y = y;
        this.action = action;
        this.image = image;
    }

    containsClick(clickX, clickY) {
        return (clickX >= this.x && clickX <= this.x + this.width) && (clickY >= this.y && clickY <= this.y + this.height);
    }
}


class EffectTimer {
    constructor(effectType, cycles){
        this.effectType = effectType;
        this.cycles = cycles;
    }
}


/**
 * Effect Timer: Freeze
 * Used in the "bind/freeze" spell effect. Let's the game engine know that the monsters
 * should not move for a period of time.
 */
export class EffectTimerFreeze extends EffectTimer {

    isAlive = true;

    constructor(effectType, cycles) {
        super(effectType, cycles);
    }

    update() {
        this.cycles--;
        if (this.cycles <= 0) {
            this.isAlive = false;
        }
    }

    render(context, entities, tileSize) {
        entities.forEach(ent => {
            context.globalAlpha = 0.1 * this.cycles;
            context.fillStyle = "blue";
            context.fillRect(ent.x, ent.y, tileSize, tileSize);
        });

        context.globalAlpha = 1.0;
    }
}

// ---------------------------
// ----- SPECIAL EFFECTS -----
// ---------------------------

export class SpecialEffectFreeze {

    opacityLevel = 1.0;

    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    render(context) {
        if (this.opacityLevel > 0.01) {
            this.opacityLevel = this.opacityLevel - 0.01;
            context.globalAlpha = this.opacityLevel;
            context.fillStyle = "blue";
            context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            context.globalAlpha = 1.0;
        }
    }
}

export class SpecialEffectDescend {

    constructor(canvasWidth, canvasHeight, portalX, portalY, tileSize, changesPerTick) {
        this.keyholeX = portalX + (tileSize / 2);
        this.keyholeY = portalY + (tileSize / 2);
        this.radiusChangePerTick = changesPerTick;
        this.keyholeRadius = Math.max(canvasWidth, canvasHeight);
        this.minRadius = 0;
        this.maxRadius = Math.max(canvasWidth, canvasHeight);
    }

    render(context) {
        context.save();
        context.globalCompositeOperation = "destination-in"; // This makes the keyhole transparent
        context.beginPath();
        context.arc(this.keyholeX, this.keyholeY, this.keyholeRadius, 0, Math.PI * 2);
        context.fill();
        context.restore();

        // Shrink the keyhole radius
        if ((this.keyholeRadius - this.radiusChangePerTick) > this.minRadius) {
            this.keyholeRadius -= this.radiusChangePerTick;
        } else {
            this.radiusChangePerTick = 1;
        }
    }
}

export class SpecialEffectRandomize {

    triggered = false;
    opacityLevel = 1.0;

    constructor(canvasWidth, canvasHeight, func) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.func = func;
    }

    render(context) {
        if (this.opacityLevel > 0.01) {
            this.opacityLevel = this.opacityLevel - 0.01;

            context.globalAlpha = this.opacityLevel;
            context.fillStyle = "red";
            context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            context.globalAlpha = 1.0;
        }



        if (this.triggered == false) {
            this.func();
            this.triggered = true;
        }
    }
}

export class SpecialEffectDeath {

    opacityLevel = 0.0;

    constructor(canvasWidth, canvasHeight, player, killer) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.player = player;
        this.killer = killer;
    }

    render(context) {
        if (this.opacityLevel < 1.0) {
            this.opacityLevel = this.opacityLevel + 0.01;
        } else {
            this.opacityLevel = 1.0;
        }

        context.globalAlpha = this.opacityLevel;
        context.fillStyle = "black";
        context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        context.globalAlpha = 1.0;

        if (this.killer instanceof Hazard) {
            this.killer.render(context);
        } else {
            this.player.render(context);
            this.killer.render(context);
        }
    }
}
// -----------------------
// -------- MOVER --------
// -----------------------

export class Mover {
    constructor(entity, destinationX, destinationY, deltaX, deltaY, callback) {
        this.entity = entity;
        this.destinationX = destinationX;
        this.destinationY = destinationY;
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        this.callback = callback;

        this.isAlive = true
    }

    update() {
        this.entity.update(this.deltaX, this.deltaY);
        if (this.entity.x == this.destinationX && this.entity.y == this.destinationY) {
            this.isAlive = false;
            this.callback();
        }
    }
}