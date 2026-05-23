import { AssetManager, ImageAsset, SoundAsset } from "../assets.js";
import { MonsterVisibility } from "../entity/entity_monster.js";
import { PlayerEntity } from "../entity/entity_player.js"
import { SpellEffect } from "../entity/entity_spell.js";


export class MazeEvent {

    id = crypto.randomUUID();

    x = 0;
    y = 0;

    onTrigger = null;

    alpha = 1.0;

    isVisible = true;
    isOneShot = true;
    isActive = true;

    spellEffects = new Set();

    constructor(onTrigger) {
        this.onTrigger = onTrigger;
    }

    setAlpha(alpha) {
        this.alpha = alpha;
    }

    setVisibility(visibility) {
        this.visibility = visibility;
    }
    setIsVisible(isVisible) {
        this.isVisible = isVisible;
    }

    render(context, mazeWindowX, mazeWindowY) {
        if (this.isActive == true && this.isVisible == true) {
            context.globalAlpha = this.alpha;
            context.drawImage(
                this.image,
                this.x,
                this.y
            )
        }
    }

    applySpellEffect(effect) {

    }

    onTurnConclusion() {

    }

    triggerEvent(entity) {

    }

}

export class TreasureCollectableEvent extends MazeEvent {

    coinTiles = [
        ImageAsset.COIN_1,
        ImageAsset.COIN_2,
        ImageAsset.COIN_3,
        ImageAsset.COIN_4
    ];

    image = null;
    alpha = 1.0;

    constructor(onTrigger, assetManager) {
        super(onTrigger);
        let tile = this.coinTiles[Math.floor(this.coinTiles.length * Math.random())];
        this.image = assetManager.getImage(tile);
    }

    triggerEvent(entity) {
        if (this.isActive == true && entity != null && entity instanceof PlayerEntity) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.isActive = false;
            }
        }
    }

    applySpellEffect(effect) {
        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a treasure makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.setIsVisible(false);
                } else {
                    this.spellEffects.delete(effect);
                    this.setIsVisible(true);
                }
                break;

            default:
                break;
        }
    }

}

export class ChestCollectableEvent extends MazeEvent {

    image = null;
    alpha = 1.0;

    constructor(onTrigger, assetManager) {
        super(onTrigger);
        this.image = assetManager.getImage(ImageAsset.TREASURE_CHEST_SMALL);
    }

    triggerEvent(entity) {
        if (this.isActive == true && entity != null && entity instanceof PlayerEntity) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.isActive = false;
            }
        }
    }

    applySpellEffect(effect) {
        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a treasure makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.setIsVisible(false);
                } else {
                    this.spellEffects.delete(effect);
                    this.setIsVisible(true);
                }
                break;

            default:
                break;
        }
    }
}

export class PortalStaircaseEvent extends MazeEvent {

    isLocked = true;

    constructor(onTrigger, assetManager) {
        super(onTrigger);
        this.assetManager = assetManager;
        this.image = this.assetManager.getImage(ImageAsset.PORTAL_DOOR_CLOSED);
    }

    setIsLocked(isLocked) {
        this.isLocked = isLocked;
        if (isLocked) {
            this.image = this.assetManager.getImage(ImageAsset.PORTAL_DOOR_CLOSED);
        } else {
            this.image = this.assetManager.getImage(ImageAsset.PORTAL_DOOR_OPEN);
        }
    }

    triggerEvent(entity) {
        if (entity != null && entity instanceof PlayerEntity) {
            if (this.isLocked == false) {
                this.onTrigger();
            }
        }
    }

    applySpellEffect(effect) {
        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a key makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.setIsVisible(false);
                } else {
                    this.spellEffects.delete(effect);
                    this.setIsVisible(true);
                }
                break;

            default:
                break;
        }
    }
}

export class SnailTrailEvent extends MazeEvent {

    maxTurnsBeforeDissolve = 5;
    turnsBeforeDissolve = 5;

    imageAsset = null;

    constructor(onTrigger, assetManager) {

        super(onTrigger);

        let assetIds = [
            ImageAsset.MONSTER_SNAIL_TRAIL_1,
            ImageAsset.MONSTER_SNAIL_TRAIL_2,
            ImageAsset.MONSTER_SNAIL_TRAIL_3,
            ImageAsset.MONSTER_SNAIL_TRAIL_4,
            ImageAsset.MONSTER_SNAIL_TRAIL_5
        ];
        let index = Math.floor(assetIds.length * Math.random());
        this.image = assetManager.getImage(assetIds[index]);
    }

    render(context, mazeWindowX, mazeWindowY) {

        if (this.visibility == MonsterVisibility.INVISIBLE) {
            return;
        }

        if (this.isActive == true && this.isVisible == true) {
            context.globalAlpha = this.alpha;
            context.drawImage(
                this.image,
                this.x,
                this.y
            )
        }
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

    triggerEvent(entity) {

        if (this.isActive == true && entity != null && entity instanceof PlayerEntity) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.isActive = false;
            }
        }
    }


}