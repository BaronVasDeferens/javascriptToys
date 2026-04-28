import { Entity } from "./entity.js";
import { ImageAsset } from "../assets.js";
import { Spell, SpellEffect } from "./entity_spell.js";

export const MonsterBehavior = Object.freeze({
    NONE: 0,
    RANDOM: 10,                     // Moves to a random adjacent square
    CHASE_LINE_OF_SIGHT: 20,        // Moves toward the player if it can draw LOS to him    
    CHASE_OMNISCIENT: 30,           // Moves toward the player regardless of LOS
    FLEE_LINE_OF_SIGHT: 40,         // Moves away from the player when in LOS
    FLEE_OMNISICIENT: 50            // Moves away from the player regardless of LOS
});

export const MonsterMobility = Object.freeze({
    CORPOREAL: 0,                   // Cannot move into blocked/impassable squares      
});

export const MonsterVisibility = Object.freeze({
    VISIBLE: 1.0,
    TRANSPARENT_THREE_QUARTERS: 0.75,
    TRANSPARENT_HALF: 0.5,
    TRANSPARENT_QUARTER: 0.25,
    INVISIBLE: 0.0
});

const monsterVisiblityArray = [
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

    render(context, mazeWindowX, mazeWindowY) {

        context.globalAlpha = this.imageOpacity;

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

        context.globalAlpha = 1.0;

    }
}

export class MonsterPinkEye extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_PINK_EYE;
    behavior = MonsterBehavior.CHASE_LINE_OF_SIGHT;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_PINK_EYE, assetManager);
    }
}

export class MonsterScorpion extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_SCORPION;
    behavior = MonsterBehavior.RANDOM;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SCORPION, assetManager);
    }
}

export class MonsterSpider extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_SPIDER;
    behavior = MonsterBehavior.RANDOM;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SPIDER, assetManager);
    }
}

export class MonsterWraith extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_WRAITH;
    behavior = MonsterBehavior.RANDOM;

    isVisible = true;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_WRAITH, assetManager);
    }

    setVisibility(isVisible) {
        this.isVisible = isVisible;
    }

    render(context, mazeWindowX, mazeWindowY) {

        // The wraith is only visible on screen when NOT in the wizard's LoS

        if (this.isVisible == true) {
            context.globalAlpha = MonsterVisibility.TRANSPARENT_HALF;
        } else {
            context.globalAlpha = MonsterVisibility.INVISIBLE;
        }

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