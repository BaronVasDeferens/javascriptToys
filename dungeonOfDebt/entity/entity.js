import { SpellEffect } from "./entity_spell.js";
import { AssetManager, ImageAsset } from "../assets.js";



export const EntityMovementType = Object.freeze({
    NONE: 0, // Does not move
    RANDOM: 10, // Moves to a random adjacent square,
    RANDOM_ROOK: 11, // Moves the maximum horizontal or vertical distance
    CHASE_LINE_OF_SIGHT: 20, // Moves toward the player if it can draw LOS to him    
    CHASE_OMNISCIENT: 30, // Moves toward the player regardless of LOS
    FLEE_LINE_OF_SIGHT: 40, // Moves away from the player when in LOS
    FLEE_OMNISCIENT: 50, // Moves away from the player regardless of LOS
    ONLY_WHEN_PUSHED: 60, // Moves only when the wizard pushes it
});

export const EntityContactEffectType = Object.freeze({
    // Coming into contact with this monster...
    NOTHING: 0, // Nothing happens.
    LETHAL: 10, // Kills the wizard
    PENALTY_FINANCIAL: 20, // Deducts from the wizard's gold
    PENALTY_ZONE: 30, // Removes a spell zone; wizard unable to use that zone
    PENALTY_EFFECT: 40, // Removes a spell effect; wizard unable to that that spell
    TRIGGER_EVENT: 50 // Something happens when the wizard makes contact (gains a key, for example)
});

export const EntityOpacityType = Object.freeze({
    VISIBLE: 1.0,
    TRANSPARENT_THREE_QUARTERS: 0.75,
    TRANSPARENT_HALF: 0.5,
    TRANSPARENT_QUARTER: 0.25,
    INVISIBLE: 0.0
});


export class Entity {

    id = crypto.randomUUID();

    x = 0;
    y = 0;

    isActive = true;

    movementType = EntityMovementType.NONE;

    tileSize = 64;

    image = null;
    imageAssetId = null;
    offsetX = 0;
    offsetY = 0;
    alpha = 1.0;
    opacity = EntityOpacityType.VISIBLE;

    overlayImage = null;

    spellEffects = new Map();           // SpellEffectType -> number of turns
    isFrozen = false;
    isInverted = false;
    isTransmuted = false;

    constructor(tileSize, assetManager) {
        this.tileSize = tileSize;
        this.assetManager = assetManager;
    }

    setImage(imageAssetId) {
        this.image = this.assetManager.getImage(imageAssetId);
        this.offsetX = (this.tileSize - this.image.width) / 2;
        this.offsetY = (this.tileSize - this.image.height) / 2; 
    }

    render(context, mazeWindowX, mazeWindowY) {

        if (this.isActive == false) {
            return
        }

        context.globalAlpha = this.opacity;
        context.drawImage(
            this.image,
            this.x, //  + this.offsetX,
            this.y //  + this.offsetY
        );
    }

    addSpellEffect(effect, turns) {

    }

    removeSpellEffect(effect) {

    }

    clearAllSpellEffects() {
        this.spellEffects.clear();
    }

    onPlayerContact(player) {

    }

    onTurnConclusion() {

    }

    setOpacity(opacity) {
        this.opacity = opacity;
    }

    setAlpha(alpha) {
        this.alpha = alpha;
    }

    update(delta) {

    }

    playSound(soundPlayer) {
        
    }
}





