import { Entity } from "./entity.js";
import { ImageAsset } from "../assets.js";
import { Spell, SpellEffect } from "./entity_spell.js";

export const MonsterBehavior = Object.freeze({
    RANDOM: 10,                     // Moves to a random adjacent square
    CHASE_LINE_OF_SIGHT: 20,        // Moves toward the player if it can draw LOS to him    
    CHASE_OMNISCIENT: 30            // Moves toward the player regardless of LOS
})

export class EnemyEntity extends Entity {

    x = 0;
    y = 0;

    imageAsset = ImageAsset.MONSTER_EYE_SMALL;
    behavior = MonsterBehavior.CHASE_LINE_OF_SIGHT;

    image = null;
    overlayImage = null;

    room = null;

    spellEffects = new Map();

    constructor(tileSize, assetManager) {
        super(0, 0, tileSize);
        this.tileSize = tileSize;
        this.assetManager = assetManager;
        this.image = assetManager.getImage(this.imageAsset);
    }

    setRoom(room) {
        if (this.room != null) {
            this.room.occupant = null;
        }

        this.room = room;
        this.x = this.room.col * this.tileSize;
        this.y = this.room.row * this.tileSize;
    }

    addSpellEffect(effect, turns) {

        this.spellEffects.set(effect, turns);

        switch (effect) {

            case SpellEffect.FREEZE:
                this.overlayImage = this.assetManager.getImage(ImageAsset.SPELL_EFFECT_FROZEN);
                break;

            default:
                break;
        }
    }

    removeSpellEffect(effect) {
        this.spellEffects.delete(effect);
        if (this.spellEffects.size == 0) {
            this.overlayImage = null;
        }
    }

    clearAllSpellEffects() {
        this.spellEffects.clear();
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