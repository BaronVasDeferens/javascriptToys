import { AssetManager, ImageAsset, SoundAsset } from "../assets.js";
import { Entity } from "../entity/entity.js";
import { EntityOpacityType } from "../entity/entity.js";
import { PlayerEntity } from "../entity/entity_player.js"
import { SpellEffect } from "../entity/entity_spell.js";


export class EventEntity extends Entity {

    isOneShot = true;
    onTrigger = () => { console.log("no event") };

    spellEffects = new Set();

    constructor(tileSize, assetManager, onTrigger) {
        super(tileSize, assetManager);
        this.onTrigger = onTrigger;
    }

    checkTrigger(entity) {
        if (this.isActive == true && entity != null && entity instanceof PlayerEntity) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.isActive = false;
            }
            return true;
        } else {
            return false;
        }
    }
    
}




export class TreasureCollectableEvent extends EventEntity {

    constructor(tileSize, assetManager, onTrigger) {
        super(tileSize, assetManager, onTrigger);
        let coinTiles = [
            ImageAsset.COIN_1,
            ImageAsset.COIN_2,
            ImageAsset.COIN_3,
            ImageAsset.COIN_4
        ];
        let tile = coinTiles[Math.floor(coinTiles.length * Math.random())];
        this.setImage(tile);
    }

    applySpellEffect(effect) {

        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a treasure makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.opacity = EntityOpacityType.INVISIBLE;
                } else {
                    this.spellEffects.delete(effect);
                    this.opacity = EntityOpacityType.VISIBLE;
                }
                break;

            default:
                break;
        }
    }

}

export class ChestCollectableEvent extends EventEntity {

    imageAssetId = ImageAsset.TREASURE_CHEST_SMALL;
    alpha = 0.0;

    constructor(tileSize, assetManager, onTrigger) {
        super(tileSize, assetManager, onTrigger);
        this.setImage(this.imageAssetId);
    }

    applySpellEffect(effect) {

        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a treasure makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.opacity = EntityOpacityType.INVISIBLE;
                } else {
                    this.spellEffects.delete(effect);
                    this.opacity = EntityOpacityType.VISIBLE;
                }
                break;

            default:
                break;
        }
    }

    render(context, mazeWindowX, mazeWindowY) {

        if (this.isActive == false) {
            return
        }

        context.globalAlpha = this.alpha;
        context.drawImage(
            this.image,
            this.x,
            this.y
        );
    }

}

export class PortalStaircaseEvent extends EventEntity {

    isLocked = true;

    constructor(tileSize, assetManager, onTrigger) {
        super(tileSize, assetManager, onTrigger);
        this.setImage(ImageAsset.PORTAL_DOOR_CLOSED);
    }

    setIsLocked(isLocked) {
        this.isLocked = isLocked;
        if (isLocked) {
            this.setImage(ImageAsset.PORTAL_DOOR_CLOSED);
        } else {
            this.setImage(ImageAsset.PORTAL_DOOR_OPEN);
        }
    }

    checkTrigger(entity) {
        if (entity != null && entity instanceof PlayerEntity) {
            if (this.isLocked == false) {
                this.onTrigger();
            }
        }
    }

    applySpellEffect(effect) {
        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a portal makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.opacity = EntityOpacityType.INVISIBLE;
                } else {
                    this.spellEffects.delete(effect);
                    this.opacity = EntityOpacityType.VISIBLE;
                }
                break;

            default:
                break;
        }
    }
}

export class SnailTrailEvent extends EventEntity {

    maxTurnsBeforeDissolve = 5;
    turnsBeforeDissolve = 5;
    alpha = 1.0;

    constructor(tileSize, assetManager, onTrigger) {

        super(tileSize, assetManager, onTrigger);

        let assetIds = [
            ImageAsset.MONSTER_SNAIL_TRAIL_1,
            ImageAsset.MONSTER_SNAIL_TRAIL_2,
            ImageAsset.MONSTER_SNAIL_TRAIL_3,
            ImageAsset.MONSTER_SNAIL_TRAIL_4,
            ImageAsset.MONSTER_SNAIL_TRAIL_5
        ];
        let index = Math.floor(assetIds.length * Math.random());
        this.setImage(assetIds[index]);
    }

    render(context, mazeWindowX, mazeWindowY) {

        if (!this.isActive) {
            return
        }

        context.globalAlpha = this.alpha;
        context.drawImage(
            this.image,
            this.x,
            this.y
        )

    }

    applySpellEffect(effect) {

        // ??? What happens ???

    }

    onTurnConclusion() {
        this.turnsBeforeDissolve--;
        this.alpha = this.turnsBeforeDissolve / this.maxTurnsBeforeDissolve;
        if (this.turnsBeforeDissolve <= 0) {
            this.isActive = false;
        }
    }

    checkTrigger(entity) {
        if (this.isActive == true 
            && entity != null 
            && entity instanceof PlayerEntity
            && entity.isTransmuted == false
        ) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.turnsBeforeDissolve = this.maxTurnsBeforeDissolve;
            }
        }
    }


}