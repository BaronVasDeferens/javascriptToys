import { KeyFleeing, MonsterGhost, MonsterGoldFrog, MonsterMosquitoGiant, MonsterPinkEye, MonsterScorpion, MonsterShadowMan, MonsterSnail, MonsterTroll, StatueEntity } from "./entity_monster.js";
import { GoldCoinCollectableEvent } from "./../event/event.js";
import { EntityType } from "./entity.js";
import { PortalStaircaseEvent } from "./../event/event.js";
import { SoundAsset } from "../assets.js";
import { PlayerEntity } from "./entity_player.js";

export class EntityFactory {

    coinSounds = [
        SoundAsset.COIN_1,
        SoundAsset.COIN_2,
        SoundAsset.COIN_3
    ];

    constructor(tileSize, entityManager, assetManager, soundPlayer) {
        this.tileSize = tileSize;
        this.entityManager = entityManager;
        this.assetManager = assetManager;
        this.soundPlayer = soundPlayer;
    }

    createEntity(monsterType, number) {

        let entity = null;

        switch (monsterType) {

            case EntityType.GHOST:
                entity = new MonsterGhost(
                    this.tileSize,
                    this.assetManager
                );
                break;
            
            case EntityType.GOLD_FROG:
                entity = new MonsterGoldFrog(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.MOSQUITO_GIANT:
                entity = new MonsterMosquitoGiant(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.PINK_EYE:
                entity = new MonsterPinkEye(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.SCORPION:
                entity = new MonsterScorpion(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.SHADOW_MAN:
                entity = new MonsterShadowMan(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.SNAIL:
                entity = new MonsterSnail(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.STATUE:
                entity = new StatueEntity(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.TREASURE_GOLD_COIN:

                entity = new GoldCoinCollectableEvent(
                    this.tileSize,
                    this.assetManager,
                    (collector, self) => {
                        // onCollect
                        if (collector instanceof PlayerEntity) {
                            this.soundPlayer.playOneShot(
                                this.coinSounds[Math.floor(this.coinSounds.length * Math.random())]
                            )
                        } else {
                            this.soundPlayer.playOneShot(SoundAsset.MONSTER_EATS);
                        }

                        self.isActive = false;
                    }
                )
                break;

            case EntityType.TROLL:
                entity = new MonsterTroll(
                    this.tileSize,
                    this.assetManager
                );
                break;

            default:
                break;
        }

        return entity;
    }

    createEntities(type, number) {
        let entities = [];
        for (let i = 0; i < number; i++) {
            entities.push(this.createEntity(type));
        }
        return entities;
    }


    createKeyPortal(context, toLevel) {

        let portal = new PortalStaircaseEvent(
            this.tileSize,
            this.assetManager,
            (entity, self) => {

                if (self.isLocked == true) {
                    return;
                }

                this.soundPlayer.playOneShot(SoundAsset.DESCEND_STAIRS);
                context.levelCurrent += 1;
                context.keyholeOut(
                    entity.x,
                    entity.y,
                    () => {
                        // onComplete
                        context.initialize();
                        context.computeMazeWindow();
                    });
            }
        );

        let key = new KeyFleeing(
            this.tileSize,
            this.assetManager,
            (player, self) => {
                // onPlayerContact
                if (self.isActive == true) {
                    this.soundPlayer.playOneShot(SoundAsset.KEY_ACQUIRED_DOOR_CREAKS);
                    portal.setIsLocked(false);
                    self.isActive = false;
                }
            },
        )

        return {
            key: key,
            portal: portal
        };
    }

}