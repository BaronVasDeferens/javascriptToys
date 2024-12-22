
const ControlInput = Object.freeze({
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
});

// --------------------
// ----- ENTITIES -----
// --------------------

class Entity {

    id = "";
    x = 0;
    y = 0;

    isAlive = true;
    isPhased = false;

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
    constructor(id, x, y, image, alpha) {
        super(id, x, y);
        this.alpha = alpha;
        this.image = image;
    }

    render(context) {
        context.globalAlpha = this.alpha;
        context.drawImage(this.image, this.x, this.y);
        context.globalAlpha = 1.0;
    }
}

export class Wizard extends Entity {

    constructor(id, x, y, image) {
        super(id, x, y);
        this.image = image;
    }

    render(context) {
        if (this.isPhased) {
            var offset = Math.floor(Math.random() * 3) + 1;
            context.globalAlpha = 0.25;
            context.drawImage(this.image, this.x + offset, this.y);
            context.drawImage(this.image, this.x - offset, this.y);
            context.globalAlpha = 1.0;
        } else {
            super.render(context);
        }
    }
}


export var MonsterType = Object.freeze({
    RAT_BASIC: "RAT",
    RAT_MAN: "RAT_MAN",
    WASP_BASIC: "WASP_BASIC",
    WASP_CHASER: "WASP_CHASER",
    BLOB: "BLOB",
    GHOST_BASIC: "GHOST_BASIC",
    GHOST_CHASER: "GHOST_CHASER"
});


export var MonsterMovementBehavior = Object.freeze({
    IMMOBILE: 0,
    RANDOM: 1,
    CHASE_PLAYER: 2,
    REPLICATE: 3,
    FLEE_PLAYER: 4,
});


export class Monster extends Entity {

    isLethal = true;                // When true, the monster kills the wizard if they occupy the same space
    isBlocking = false;             // When true, the wizard cannot occupy the same space.

    isBlockedByHazard = true;      // When true, the monster cannot occupy the same space as a HAZARD.
    isBlockedByObstacle = true;     // When true, the monster cannot occupy the same space as an OBSTACLE
    isBlockedByCollectable = true;  // When true, the monster cannot occupy the same space as a COLLECATBLE
    isBlockedByPortal = true;       // When true, the monster cannot occupy the same space as a PORTAL.

    replicationsRemaining = 0;      // When the behavior is replicating, this is the number of mx number of times it may replicate

    // Graphic representation
    isVisible = true;
    isPhasedGraphic = false;        // should show up as "phased" (blurry and incorporeal)


    constructor(id, x, y, behavior, image) {
        super(id, x, y);
        this.behavior = behavior;
        this.image = image;
    }

    setMover(mover) {
        this.mover = mover;
    }

    render(context) {
        if (this.isVisible) {
            if (this.isPhasedGraphic) {
                var offset = Math.floor(Math.random() * 3) + 1;
                context.globalAlpha = 0.25;
                context.drawImage(this.image, this.x + offset, this.y);
                context.drawImage(this.image, this.x - offset, this.y);
                context.globalAlpha = 1.0;
            } else {
                context.drawImage(this.image, this.x, this.y);
            }
        }
    }
}

export class CollectableMonster extends Monster {

    isLethal = false;
    isSecret = false;       // When true, cannot be collected
    isPhased = false;       // When true, wizard must ALSO be phased in order to collect

    behavior = MonsterMovementBehavior.FLEE_PLAYER;

    constructor(x, y, image) {
        super(`lamp`, x, y);
        this.image = image;
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

    width = 96;
    height = 96;

    isExpended = false;

    constructor(x, y, action, image, numberBind) {
        super(action, x, y);
        this.x = x;
        this.y = y;
        this.action = action;
        this.image = image;
        this.numberBind = numberBind;
    }

    containsClick(clickX, clickY) {
        return (clickX >= this.x && clickX <= this.x + this.width) && (clickY >= this.y && clickY <= this.y + this.height);
    }
}


export class TemporaryEntity {

    constructor(x, y, image, alpha, expiresOnGameState) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.alpha = alpha;
        this.expiresOnGameState = expiresOnGameState;
    }

    render(context) {
        context.globalAlpha = this.alpha;
        context.drawImage(this.image, this.x, this.y);
        context.globalAlpha = 1.0;
    }
}

/** EFFECT TIMERS */

class EffectTimer {
    constructor(effectType, cycles) {
        this.effectType = effectType;
        this.cycles = cycles;
    }
}


/**
 * Effect Timer: Freeze
 * Used in the "bind/freeze" spell effect. Lets the game engine know that the monsters
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

/**
 * Effect Timer: Phase
 * Used in the "phase" spell effect. Lets the game engine know that the
 * wizard is out-of-phase.
 */
export class EffectTimerProcog extends EffectTimer {

    isAlive = true;

    constructor(effectType, cycles, affectedEntities) {
        super(effectType, cycles);
        this.affectedEntities = affectedEntities;
        this.affectedEntities.forEach(ent => {
            ent.isSecret = false;
            ent.isVisible = true;
            ent.isPhasedGraphic = true;
        })
    }

    update() {
        this.cycles--;
        if (this.cycles <= 0) {
            this.isAlive = false;
            this.affectedEntities.forEach( ent => {
                ent.isVisible = false;
            })
        }
    }
}

/**
 * Effect Timer: Precog
 * Used in the "precog" spell effect. Lets the game engine know that the
 * spell is in effect.
 */
export class EffectTimerPhase extends EffectTimer {

    isAlive = true;

    constructor(effectType, cycles, wizard) {
        super(effectType, cycles);
        this.wizard = wizard;
        this.wizard.isPhased = true;
    }

    update() {
        this.cycles--;
        if (this.cycles <= 0) {
            this.isAlive = false;
            this.wizard.isPhased = false;
        }
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

export class SpecialEffectPrecognition {

    opacityLevel = 1.0;

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    render(context) {

        if (this.opacityLevel > 0.01) {
            this.opacityLevel = this.opacityLevel - 0.01;

            context.globalAlpha = this.opacityLevel;
            context.fillStyle = "white";
            context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            context.globalAlpha = 1.0;
        }
    }
}

export class SpecialEffectPhase {

    opacityLevel = 1.0;

    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    render(context) {
        if (this.opacityLevel > 0.01) {
            this.opacityLevel = this.opacityLevel - 0.01;
            context.globalAlpha = this.opacityLevel;
            context.fillStyle = "green";
            context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            context.globalAlpha = 1.0;
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

export class SpecialEffectScoreDisplay {

    constructor(x, y, moves, treasureTotal, finalScore) {
        this.x = x;
        this.y = y;
        this.moves = moves;
        this.treasureTotal = treasureTotal;
        this.finalScore = finalScore;
    }

    render(context) {
        context.fillStyle = "#FF0000";
        context.fillRect(this.x, this.y, 300, 300);
        context.fillStyle = "#FFFFFF";
        context.fillText("MOVES", this.x + 100, this.y + 25);
        context.fillText(this.moves, this.x + 125, this.y + 50);
        context.fillText("TREASURE", this.x + 80, this.y + 75);
        context.fillText(this.treasureTotal, this.x + 125, this.y + 100);
        context.fillText("SCORE", this.x + 100, this.y + 125);
        context.fillText(this.finalScore, this.x + 125, this.y + 150);
    }
}


// -----------------------
// -------- MOVER --------
// -----------------------

export class Mover {

    direction = null;

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