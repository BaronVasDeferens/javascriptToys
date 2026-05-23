import { Entity } from "./entity.js";
import { ImageAsset } from "../assets.js";
import { Spell, SpellEffect } from "./entity_spell.js";


/**
 *  MONSTER ATTRIBUTES
 */

export const MonsterNature = Object.freeze({
    MORTAL: 10,                     // Flesh and blood, can be slain
    IMMORTAL: 20,                   // Flesh and blood, but cannot be slain
    UNDEAD: 30,                     // Cursed to roam the mortal world in death
});

export const MonsterPhysicality = Object.freeze({
    CORPOREAL: 0,                   // Cannot move into blocked/impassable squares; cannot pass through another entity
    INCORPOREAL: 10,                // Passes through blocks      
});

export const MonsterMovement = Object.freeze({
    NONE: 0,                        // Does not move
    RANDOM: 10,                     // Moves to a random adjacent square,
    RANDOM_ROOK: 11,                // Moves the maximum horizontal or vertical distance
    CHASE_LINE_OF_SIGHT: 20,        // Moves toward the player if it can draw LOS to him    
    CHASE_OMNISCIENT: 30,           // Moves toward the player regardless of LOS
    FLEE_LINE_OF_SIGHT: 40,         // Moves away from the player when in LOS
    FLEE_OMNISCIENT: 50,            // Moves away from the player regardless of LOS

    ONLY_WHEN_PUSHED: 60,           // Moves only when the wizard pushes it
});

export const MonsterContactEffect = Object.freeze({
    // Coming into contact with this monster...
    NOTHING: 0,                     // Nothing happens.
    LETHAL: 10,                     // Kills the wizard
    PENALTY_FINANCIAL: 20,          // Deducts from the wizard's gold
    PENALTY_ZONE: 30,               // Removes a spell zone; wizard unable to use that zone
    PENALTY_EFFECT: 40,             // Removes a spell effect; wizard unable to that that spell
    TRIGGER_EVENT: 50               // Something happens when the wizard makes contact (gains a key, for example)
});

export const MonsterVisibility = Object.freeze({
    VISIBLE: 1.0,
    TRANSPARENT_THREE_QUARTERS: 0.75,
    TRANSPARENT_HALF: 0.5,
    TRANSPARENT_QUARTER: 0.25,
    INVISIBLE: 0.0
});

const monsterVisibilityArray = [
    MonsterVisibility.VISIBLE,
    MonsterVisibility.TRANSPARENT_THREE_QUARTERS,
    MonsterVisibility.TRANSPARENT_HALF,
    MonsterVisibility.TRANSPARENT_QUARTER,
    MonsterVisibility.INVISIBLE
];






export class MonsterEntity extends Entity {

    isAlive = true;                                 // Whether this entity is active on the board

    imageAssetId = ImageAsset.MONSTER_PINK_EYE;
    imageOpacity = 1.0;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = MonsterMovement.NONE;
    visibility = MonsterVisibility.VISIBLE;
    contactEffect = MonsterContactEffect.LETHAL;

    constructor(tileSize, imageAsset, assetManager) {
        super(tileSize, assetManager);
        this.imageAssetId = imageAsset;
        this.image = assetManager.getImage(this.imageAssetId);
    }

    getMovementBehavior() {
        return this.movement;
    }

    setVisibility(visibility) {
        this.visibility = visibility;
    }

    onTurnConclusion() {

        let expiredEffects = new Set();
        let keys = this.spellEffects.keys()

        keys.forEach(key => {
            let current = this.spellEffects.get(key) - 1;
            this.spellEffects.set(key, current);

            if (current <= 0) {
                expiredEffects.add(key)
            }
        });

        expiredEffects.forEach(key => {
            this.removeSpellEffect(key);
        })

    }

    onPlayerContact(player) {

    }

    render(context, mazeWindowX, mazeWindowY) {

        context.globalAlpha = this.visibility;

        context.drawImage(
            this.image,
            this.x + ((this.tileSize - this.image.width) / 2),
            this.y + ((this.tileSize - this.image.height) / 2)
        );

        if (this.overlayImage != null) {
            context.globalAlpha = (this.spellEffects.get(SpellEffect.FREEZE) / 6);  // TODO: fix this later
            context.drawImage(
                this.overlayImage,
                this.x + ((this.tileSize - this.overlayImage.width) / 2),
                this.y + ((this.tileSize - this.overlayImage.height) / 2)
            )
        }
    }
}

export class MonsterGhost extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_GHOST;

    physicality = MonsterPhysicality.INCORPOREAL;
    nature = MonsterNature.UNDEAD;
    movement = MonsterMovement.RANDOM;
    visibility = MonsterVisibility.TRANSPARENT_HALF;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_GHOST, assetManager);
    }
}

export class MonsterMammoth extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_MAMMOTH;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = MonsterMovement.NONE;
    visibility = MonsterVisibility.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_MAMMOTH, assetManager);
    }

    getMovementBehavior() {
        if (this.spellEffects.has(SpellEffect.TRANSMUTE)) {
            return MonsterMovement.FLEE_LINE_OF_SIGHT;
        } else {
            return this.movement;
        }
    }
}

export class MonsterMosquitoGiant extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_MOSQUITO_GIANT;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = MonsterMovement.RANDOM_ROOK;
    visibility = MonsterVisibility.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_MOSQUITO_GIANT, assetManager);
    }
}

export class MonsterMummy extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_MUMMY;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.UNDEAD;
    movement = MonsterMovement.CHASE_OMNISCIENT;
    visibility = MonsterVisibility.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_MUMMY, assetManager);
    }

    getMovementBehavior() {
        return this.movement;
    }
}

export class MonsterPinkEye extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_PINK_EYE;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = MonsterMovement.CHASE_LINE_OF_SIGHT;
    visibility = MonsterVisibility.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_PINK_EYE, assetManager);
    }

    getMovementBehavior() {
        if (this.spellEffects.has(SpellEffect.TRANSMUTE)) {
            return MonsterMovement.FLEE_LINE_OF_SIGHT;
        } else {
            return this.movement;
        }
    }
}

export class MonsterScorpion extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_SCORPION;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = MonsterMovement.RANDOM;
    visibility = MonsterVisibility.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SCORPION, assetManager);
    }

    getMovementBehavior() {
        if (this.spellEffects.has(SpellEffect.TRANSMUTE)) {
            return MonsterMovement.FLEE_LINE_OF_SIGHT;
        } else {
            return this.movement;
        }
    }
}



export class MonsterSnail extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_SNAIL;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = MonsterMovement.RANDOM;
    visibility = MonsterVisibility.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SNAIL, assetManager);
    }

    getMovementBehavior() {
        return this.movement
    }

    onTurnConclusion() {
        super.onTurnConclusion();
    }

    render(context, windowOffsetX, windowOffsetY) {
        context.drawImage(
            this.image,
            this.x + ((this.tileSize - this.image.width) / 2),
            this.y + ((this.tileSize - this.image.height) / 2)
        );
    }

}

export class MonsterTroll extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_TROLL;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = MonsterMovement.CHASE_OMNISCIENT;
    visibility = MonsterVisibility.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_TROLL, assetManager);
    }
}

export class MonsterVengefulSpirit extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_VENGEFUL_SPIRIT;

    physicality = MonsterPhysicality.INCORPOREAL;
    nature = MonsterNature.UNDEAD;
    movement = MonsterMovement.CHASE_OMNISCIENT;
    visibility = MonsterVisibility.TRANSPARENT_HALF;
    contactEffect = MonsterContactEffect.TRIGGER_EVENT;


    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_VENGEFUL_SPIRIT, assetManager);
    }

}

export class MonsterWraith extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_WRAITH;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.UNDEAD;
    movement = MonsterMovement.RANDOM;
    visibility = MonsterVisibility.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_WRAITH, assetManager);
    }

    render(context, mazeWindowX, mazeWindowY) {

        // The wraith is only visible on screen when NOT in the wizard's LoS

        context.globalAlpha = this.visibility;
        context.drawImage(
            this.image,
            this.x + ((this.tileSize - this.image.width) / 2),
            this.y + ((this.tileSize - this.image.height) / 2)
        );

        if (this.overlayImage != null) {

            context.globalAlpha = (this.spellEffects.get(SpellEffect.FREEZE) / 6);  // TODO: fix this later
            context.drawImage(
                this.overlayImage,
                this.x + ((this.tileSize - this.overlayImage.width) / 2),
                this.y + ((this.tileSize - this.overlayImage.height) / 2)
            )
        }
    }
}



export class MonsterCollectable extends MonsterEntity {

    imageAsset = null;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = MonsterMovement.NONE;
    visibility = MonsterVisibility.VISIBLE;
    contactEffect = MonsterContactEffect.TRIGGER_EVENT;

    onContact = () => { };

    constructor(tileSize, imageAsset, assetManager, onContact) {
        super(tileSize, imageAsset, assetManager);
        this.imageAsset = imageAsset;
        this.onContact = onContact;
    }
}

export class KeyNormal extends MonsterCollectable {

    imageAsset = ImageAsset.DUNGEON_KEY_SMALL;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = MonsterMovement.NONE;
    visibility = MonsterVisibility.VISIBLE;
    contactEffect = MonsterContactEffect.TRIGGER_EVENT;

    constructor(tileSize, assetManager, onContact) {
        super(tileSize, ImageAsset.DUNGEON_KEY_SMALL, assetManager, onContact);
    }
}

export class KeyFleeing extends MonsterCollectable {

    imageAsset = ImageAsset.DUNGEON_KEY_SMALL;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = MonsterMovement.FLEE_LINE_OF_SIGHT;
    visibility = MonsterVisibility.VISIBLE;
    contactEffect = MonsterContactEffect.TRIGGER_EVENT;

    constructor(tileSize, assetManager, onContact) {
        super(tileSize, ImageAsset.DUNGEON_KEY_SMALL, assetManager, onContact);
    }
}

export class TreasureChestMassive extends MonsterCollectable {

    imageAsset = ImageAsset.TREASURE_CHEST_LARGE;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = MonsterMovement.ONLY_WHEN_PUSHED;
    visibility = MonsterVisibility.VISIBLE;
    contactEffect = MonsterContactEffect.TRIGGER_EVENT;

    constructor(tileSize, assetManager, onContact) {
        super(tileSize, ImageAsset.TREASURE_CHEST_LARGE, assetManager, onContact);
    }
}