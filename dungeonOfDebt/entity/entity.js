import { SpellEffect } from "./entity_spell.js";
import { AssetManager, ImageAsset } from "../assets.js";


export class Entity {

    x = 0;
    y = 0;

    tileSize = 64;

    room = null;

    image = null;
    imageAssetId = null;
    overlayImage = null;

    isAlive = true;

    spellEffects = new Map();

    isFrozen = false;
    isInverted = false;
    isTransmuted = false;

    constructor(tileSize, assetManager) {
        this.tileSize = tileSize;
        this.assetManager = assetManager;
    }

    setRoom(room) {

        this.room = room;
        this.x = this.room.col * this.tileSize;
        this.y = this.room.row * this.tileSize;
    }

    addSpellEffect(effect, turns) {

        this.spellEffects.set(effect, turns);

        switch (effect) {

            case SpellEffect.FREEZE:
                this.isFrozen = true;
                this.overlayImage = this.assetManager.getImage(ImageAsset.SPELL_EFFECT_FROZEN);
                break;

            case SpellEffect.INVERT:
                this.isInverted = true;
                this.overlayImage = this.room.image;
                break;

            case SpellEffect.TRANSMUTATION:
                this.isTransmuted = true;
                this.image = this.assetManager.getImage(ImageAsset.FROG);
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

            case SpellEffect.INVERT:
                this.isInverted = false;
                break;

            case SpellEffect.TRANSMUTATION:
                this.image = this.assetManager.getImage(this.imageAssetId);
                this.isTransmuted = false;
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
