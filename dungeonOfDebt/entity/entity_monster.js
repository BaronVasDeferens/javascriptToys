import { Entity, EntityContactEffectType, EntityMovementType, EntityOpacityType, EntityType } from "./entity.js";
import { ImageAsset, SoundAsset } from "../assets.js";
import { Spell, SpellEffect } from "./entity_spell.js";
import { PlayerEntity } from "./entity_player.js";
import { EventEntity, SnailTrailEvent, GoldCoinCollectableEvent, ChestCollectableEvent } from "../event/event.js";
import { EntityRoomManager } from "../scenes/EntityRoomManager.js";


/**
 *  MONSTER ATTRIBUTES
 */

export const MonsterNature = Object.freeze({
    MORTAL: 10,                     // Flesh and blood, can be slain
    IMMORTAL: 20,                   // Flesh and blood, but cannot be slain
    UNDEAD: 30,                     // Cursed to roam the mortal world in death
});

export const MonsterPhysicality = Object.freeze({
    CORPOREAL: 0,                   // Cannot move into blocked/impassable squares; cannot pass through another entity
    INCORPOREAL: 10,                // Passes through blocks      
});

const monsterVisibilityArray = [
    EntityOpacityType.VISIBLE,
    EntityOpacityType.TRANSPARENT_THREE_QUARTERS,
    EntityOpacityType.TRANSPARENT_HALF,
    EntityOpacityType.TRANSPARENT_QUARTER,
    EntityOpacityType.INVISIBLE
];





export class MonsterEntity extends Entity {

    imageAssetId = 0;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = EntityMovementType.NONE;
    visibility = EntityOpacityType.VISIBLE;
    contactEffect = EntityContactEffectType.LETHAL;

    isVisibleToPlayer = false;


    constructor(tileSize, imageAsset, assetManager) {
        super(tileSize, assetManager);
        this.imageAssetId = imageAsset;
        this.image = assetManager.getImage(this.imageAssetId);
    }

    setIsVisibleToPlayer(visible) {
        this.isVisibleToPlayer = visible;
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
                break;

            case SpellEffect.TRANSMUTE:
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

            case SpellEffect.TRANSMUTE:
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

    getMovementBehavior() {
        return this.movement;
    }

    getCurrentSeekTarget(entityManager) {
        return entityManager.getPlayer();
    }

    onTurnConclusion(entityManager) {

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

        if (!this.isActive) {
            return
        }

        context.globalAlpha = this.opacity;

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

    physicality = MonsterPhysicality.INCORPOREAL;
    nature = MonsterNature.UNDEAD;
    movement = EntityMovementType.RANDOM;
    visibility = EntityOpacityType.TRANSPARENT_HALF;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_GHOST, assetManager);
    }

    render(context, mazeWindowX, mazeWindowY) {

        if (!this.isActive) {
            return
        }

        if (this.alpha == 1.0) {
            context.globalAlpha = this.visibility;
        } else {
            context.globalAlpha = this.alpha;
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

export class MonsterGoldFrog extends MonsterEntity {

    entityType = EntityType.GOLD_FROG;

    imageAsset = ImageAsset.MONSTER_GOLD_FROG;
    imageAssetId = ImageAsset.MONSTER_GOLD_FROG;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = EntityMovementType.CHASE_OMNISCIENT;
    visibility = EntityOpacityType.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_GOLD_FROG, assetManager);
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
                break;

            case SpellEffect.TRANSMUTE:
                // Frog is already frog
                break;

            default:
                break;
        }
    }

    getCurrentSeekTarget(entityManager) {

        let currentTarget = null;

        let targets = entityManager.getActiveEvents().filter(event => {
            return (event instanceof GoldCoinCollectableEvent || event instanceof ChestCollectableEvent) && (event.isActive == true)
        });

        if (targets[0] != null) {
            currentTarget = targets[0];
        } else {
            currentTarget = entityManager.getActiveMonsters().filter(monster => {
                return (monster instanceof KeyFleeing) && monster.isActive == true
            })[0];
        }

        if (currentTarget == null) {
            this.movement = EntityMovementType.NONE;
        }

        return currentTarget;

    }

}

export class MonsterMammoth extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_MAMMOTH;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = EntityMovementType.NONE;
    visibility = EntityOpacityType.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_MAMMOTH, assetManager);
    }

    getMovementBehavior() {
        if (this.spellEffects.has(SpellEffect.TRANSMUTE)) {
            return EntityMovementType.FLEE_LINE_OF_SIGHT;
        } else {
            return this.movement;
        }
    }
}

export class MonsterMosquitoGiant extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_MOSQUITO_GIANT;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = EntityMovementType.RANDOM_ROOK;
    visibility = EntityOpacityType.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_MOSQUITO_GIANT, assetManager);
    }
}

export class MonsterMummy extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_MUMMY;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.UNDEAD;
    movement = EntityMovementType.CHASE_OMNISCIENT;
    visibility = EntityOpacityType.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_MUMMY, assetManager);
    }

    getMovementBehavior() {
        return this.movement;
    }
}

export class MonsterPinkEye extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_PINK_EYE;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = EntityMovementType.CHASE_LINE_OF_SIGHT;
    visibility = EntityOpacityType.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_PINK_EYE, assetManager);
    }

    getMovementBehavior() {
        if (this.spellEffects.has(SpellEffect.TRANSMUTE)) {
            return EntityMovementType.FLEE_LINE_OF_SIGHT;
        } else {
            return this.movement;
        }
    }
}

export class MonsterScorpion extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_SCORPION;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = EntityMovementType.RANDOM;
    visibility = EntityOpacityType.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SCORPION, assetManager);
    }

    getMovementBehavior() {
        if (this.spellEffects.has(SpellEffect.TRANSMUTE)) {
            return EntityMovementType.FLEE_LINE_OF_SIGHT;
        } else {
            return this.movement;
        }
    }
}

export class MonsterShadowMan extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_SHADOW_MAN;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.UNDEAD;
    movement = EntityMovementType.CHASE_LINE_OF_SIGHT;
    visibility = EntityOpacityType.TRANSPARENT_HALF;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SHADOW_MAN, assetManager);
    }

    onPlayerContact(player) {
        this.isVisibleToPlayer = false;
    }

    render(context, mazeWindowX, mazeWindowY) {

        if (this.alpha == 1.0) {
            // The Shadow Man is only visible on screen when NOT in the wizard's LoS
            if (this.isVisibleToPlayer == true && this.isFrozen == false) {
                this.visibility = EntityOpacityType.INVISIBLE;
            } else {
                this.visibility = EntityOpacityType.TRANSPARENT_HALF;
            }
            context.globalAlpha = this.visibility;
        } else {
            context.globalAlpha = this.alpha;
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

export class MonsterSnail extends MonsterEntity {

    imageAssetId = ImageAsset.MONSTER_SNAIL;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = EntityMovementType.RANDOM;
    visibility = EntityOpacityType.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_SNAIL, assetManager);
    }

    getMovementBehavior() {
        return this.movement
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
                break;

            case SpellEffect.TRANSMUTE:
                this.isTransmuted = true;
                this.image = this.assetManager.getImage(ImageAsset.FROG);
                this.movement = EntityMovementType.FLEE_LINE_OF_SIGHT;
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

            case SpellEffect.TRANSMUTE:
                this.image = this.assetManager.getImage(this.imageAssetId);
                this.isTransmuted = false;
                this.movement = EntityMovementType.RANDOM;
                break;
            default:
                break;
        }

        if (this.spellEffects.size == 0) {
            this.overlayImage = null;
        }
    }

    onMoveBegin(entityManager, soundPlayer) {

        // The Snail drops a slime event on the space its current space (typically as it is about to leave)

        if (this.isTransmuted == true) {
            return;
        }

        let monsterRoom = entityManager.getRoomForEntity(this);
        let event = entityManager.getEventForRoom(monsterRoom);
        let player = entityManager.getPlayer();

        if (event == null || event.isActive == false) {
            entityManager.setEventRoom(
                new SnailTrailEvent(
                    this.tileSize,
                    this.assetManager,
                    (entity) => {
                        player.isActive = false;
                    }
                ),
                monsterRoom
            )
        }

    }

    onTurnConclusion() {
        super.onTurnConclusion();
    }

}

export class MonsterVengefulSpirit extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_VENGEFUL_SPIRIT;

    physicality = MonsterPhysicality.INCORPOREAL;
    nature = MonsterNature.UNDEAD;
    movement = EntityMovementType.CHASE_OMNISCIENT;
    visibility = EntityOpacityType.TRANSPARENT_HALF;
    contactEffect = EntityContactEffectType.LETHAL;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_VENGEFUL_SPIRIT, assetManager);
    }

    render(context, mazeWindowX, mazeWindowY) {

        if (!this.isActive) {
            return
        }

        if (this.alpha == 1.0) {
            context.globalAlpha = this.visibility;
        } else {
            context.globalAlpha = this.alpha;
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

export class MonsterTroll extends MonsterEntity {

    imageAsset = ImageAsset.MONSTER_TROLL;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.MORTAL;
    movement = EntityMovementType.CHASE_OMNISCIENT;
    visibility = EntityOpacityType.VISIBLE;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.MONSTER_TROLL, assetManager);
    }
}

// ----------------------------- COLLECTABLES --------------------------------

export class MonsterCollectable extends MonsterEntity {

    imageAsset = null;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = EntityMovementType.NONE;
    visibility = EntityOpacityType.VISIBLE;
    contactEffect = EntityContactEffectType.TRIGGER_EVENT;

    onContact = () => { console.log(`NO CONTACT SET!`) };

    constructor(tileSize, imageAsset, assetManager, onContact) {
        super(tileSize, imageAsset, assetManager);
        this.imageAsset = imageAsset;
        this.onContact = onContact;
    }
}

export class KeyNormal extends MonsterCollectable {

    imageAsset = ImageAsset.DUNGEON_KEY_SMALL;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = EntityMovementType.NONE;
    visibility = EntityOpacityType.VISIBLE;
    contactEffect = EntityContactEffectType.TRIGGER_EVENT;

    constructor(tileSize, assetManager, onContact) {
        super(tileSize, ImageAsset.DUNGEON_KEY_SMALL, assetManager, onContact);
    }

    onPlayerContact(player) {
        this.isActive = false;
    }
}

export class KeyFleeing extends MonsterCollectable {

    imageAsset = ImageAsset.DUNGEON_KEY_SMALL;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = EntityMovementType.FLEE_LINE_OF_SIGHT;
    visibility = EntityOpacityType.VISIBLE;
    contactEffect = EntityContactEffectType.TRIGGER_EVENT;

    constructor(tileSize, assetManager, onContact) {
        super(tileSize, ImageAsset.DUNGEON_KEY_SMALL, assetManager, onContact);
    }

    onPlayerContact(player) {
        if (this.isActive == true) {
            this.onContact();
            this.isActive = false;
        }
    }
}

// TODO: this isn't collectable...
export class StatueEntity extends MonsterCollectable {

    imageAsset = ImageAsset.STATUE_DEMON;

    physicality = MonsterPhysicality.CORPOREAL;
    nature = MonsterNature.IMMORTAL;
    movement = EntityMovementType.ONLY_WHEN_PUSHED;
    visibility = EntityOpacityType.VISIBLE;
    contactEffect = EntityContactEffectType.TRIGGER_EVENT;

    constructor(tileSize, assetManager) {
        super(tileSize, ImageAsset.STATUE_DEMON, assetManager);
    }

    onMoveBegin(entityManager, soundPlayer) {
        
        if (this.isTransmuted == true) {
            return;
        }

        soundPlayer.playOneShotWithDetuneRange(SoundAsset.SCRAPE_STONE, -25, 25);
    }

    onMoveComplete(entityManager) {

        if (this.isTransmuted == true) {
            return;
        }

        // Pushing a statue over a Snail Trail clears it
        let room = entityManager.getRoomForEntity(this);
        let event = entityManager.getEventForRoom(room);
        if (event != null && event instanceof SnailTrailEvent) {
            event.isActive = false;
        }
    }


}


