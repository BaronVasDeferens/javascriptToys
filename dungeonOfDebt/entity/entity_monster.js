import { Entity } from "./entity.js";
import { ImageAsset } from "../assets.js";
import { Spell, SpellEffect } from "./entity_spell.js";


/**
 *  MONSTER ATTRIBUTES
 */

export const MonsterBehavior = Object.freeze({
    NONE: 0,                        // Does not move
    RANDOM: 10,                     // Moves to a random adjacent square
    CHASE_LINE_OF_SIGHT: 20,        // Moves toward the player if it can draw LOS to him    
    CHASE_OMNISCIENT: 30,           // Moves toward the player regardless of LOS
    FLEE_LINE_OF_SIGHT: 40,         // Moves away from the player when in LOS
    FLEE_OMNISCIENT: 50             // Moves away from the player regardless of LOS
});

export const MonsterContactEffect = Object.freeze({
    LETHAL: 10,                     // Kills the wizard when in contact.
})

export const MonsterMobility = Object.freeze({
    CORPOREAL: 0,                   // Cannot move into blocked/impassable squares
    INCORPOREAL: 10,                // Passes through blocks      
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

    imageAssetId = ImageAsset.MONSTER_PINK_EYE;
    imageOpacity = 1.0;

    behavior = MonsterBehavior.NONE;
    mobility = MonsterMobility.CORPOREAL;
    visibility = MonsterVisibility.VISIBLE;
    contactEffect = MonsterContactEffect.LETHAL;

    constructor(tileSize, imageAsset, assetManager) {
        super(tileSize, assetManager);
        this.imageAssetId = imageAsset;
        this.image = assetManager.getImage(this.imageAssetId);
    }

    getMovementBehavior() {
        if (this.spellEffects.has(SpellEffect.TRANSMUTATION)) {
            return MonsterBehavior.FLEE_LINE_OF_SIGHT;
        } else {
            return this.behavior;
        }
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

    onPlayerContact() {

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

export class MonsterMammoth extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_MAMMOTH;
    behavior = MonsterBehavior.NONE;
    visibility = MonsterVisibility.VISIBLE;
    mobility = MonsterMobility.CORPOREAL;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_MAMMOTH, assetManager);
    }
}

export class MonsterPinkEye extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_PINK_EYE;
    behavior = MonsterBehavior.CHASE_LINE_OF_SIGHT;
    visibility = MonsterVisibility.VISIBLE;
    mobility = MonsterMobility.CORPOREAL;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_PINK_EYE, assetManager);
    }
}

export class MonsterScorpion extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_SCORPION;
    behavior = MonsterBehavior.RANDOM;
    visibility = MonsterVisibility.VISIBLE;
    mobility = MonsterMobility.CORPOREAL;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SCORPION, assetManager);
    }
}

export class MonsterWraith extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_WRAITH;
    behavior = MonsterBehavior.RANDOM;
    visibility = MonsterVisibility.VISIBLE;
    mobility = MonsterMobility.CORPOREAL;

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

export class MonsterGhost extends MonsterEntity {
    imageAsset = ImageAsset.MONSTER_GHOST;
    behavior = MonsterBehavior.RANDOM;
    visibility = MonsterVisibility.TRANSPARENT_HALF;
    mobility = MonsterMobility.INCORPOREAL;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_GHOST, assetManager);
    }
}