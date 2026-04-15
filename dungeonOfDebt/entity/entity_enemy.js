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
})

export class MonsterEntity extends Entity {

    imageAsset = ImageAsset.MONSTER_EYE_SMALL;
    behavior = MonsterBehavior.NONE;

    constructor(tileSize, imageAsset, assetManager) {
        super(tileSize, assetManager);
        this.imageAsset = imageAsset;
        this.image = assetManager.getImage(this.imageAsset);
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

            context.globalAlpha = 1.0;
        }

    }
}

export class MonsterPinkEye extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_EYE_SMALL;
    behavior = MonsterBehavior.CHASE_LINE_OF_SIGHT;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_EYE_SMALL, assetManager);
    }

}

export class MonsterSpider extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_SPIDER_1;
    behavior = MonsterBehavior.RANDOM;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SPIDER_1, assetManager);
    }
}