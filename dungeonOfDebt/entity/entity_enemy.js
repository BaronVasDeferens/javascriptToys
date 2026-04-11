import { Entity } from "./entity.js";
import { ImageAsset } from "../assets.js";
import { SpellEffect } from "./entity_spell.js";

const MonsterBehavior = Object.freeze({
    RANDOM: 10,                     // Moves to a random adjacent square
    CHASE_LINE_OF_SIGHT: 20,        // Moves toward the player if it can draw LOS to him    
    CHASE_OMNISCIENT: 30            // Moves toward the player regardless of LOS
})

export class EnemyEntity extends Entity {

    x = 0;
    y = 0;

    image = null;
    overlayImage = null;

    room = null;

    spellEffects = new Set();

    constructor(tileSize, assetManager) {
        super(0, 0, tileSize);
        this.tileSize = tileSize;
        this.assetManager = assetManager;
        this.image = assetManager.getImage(ImageAsset.MONSTER_EYE_SMALL);
    }

    setRoom(room) {
        this.room = room;
        this.room.occupant = this;
        this.x = this.room.col * this.tileSize;
        this.y = this.room.row * this.tileSize;
    }

    addSpellEffect(effect) {
        this.spellEffects.add(effect);

        switch (effect) {

            case SpellEffect.FREEZE:
                this.overlayImage = this.assetManager.getImage(ImageAsset.SPELL_EFFECT_FROZEN);
                break;

            default:
                break;
        }
    }

    removeSpellEffect(effect) {
        this.spellEffects.remove(effect);
    }

    clearAllSpellEffects() {
        this.spellEffects.clear();
    }

    render(context, mazeWindowX, mazeWindowY) {

        context.drawImage(
            this.image,
            this.x + ((this.tileSize - this.image.width) / 2),
            this.y + ((this.tileSize - this.image.height) / 2)
        );


        if (this.overlayImage != null) {
            context.drawImage(
                this.overlayImage,
                this.x + ((this.tileSize - this.overlayImage.width) / 2),
                this.y + ((this.tileSize - this.overlayImage.height) / 2)
            )
        }

    }

}