import { SpellEffect } from "./entity_spell.js";
import { ImageAsset } from "../assets.js";


export class Entity {

    x = 0;
    y = 0;

    tileSize = 64;

    room = null;

    image = null;
    overlayImage = null;

    isAlive = true;

    spellEffects = new Map();
    isFrozen = false;

    constructor(tileSize, assetManager) {
        this.tileSize = tileSize;
        this.assetManager = assetManager;
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
                this.isFrozen = true;
                break;

            default:
                break;
        }
    }

    removeSpellEffect(effect) {

        this.spellEffects.delete(effect);

        switch (effect) {

            case SpellEffect.FREEZE:
                this.isFrozen = false;
                break;

            default:
                break;
        }

        if (this.spellEffects.size == 0) {
            this.overlayImage = null;
        }
    }

    clearAllSpellEffects() {
        this.spellEffects.clear();
    }

    onTurnConclusion() {

    }

    setAlpha(alpha) {
        this.alpha = alpha;
    }

    update(delta) {

    }

    render(context) {

    }
}
