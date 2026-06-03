import { MonsterGoldFrog, MonsterScorpion, StatueEntity } from "./entity_monster.js";
import { GoldCoinCollectableEvent } from "./../event/event.js";
import { EntityType } from "./entity.js";

export class EntityFactory {

    constructor(tileSize, entityManager, assetManager, soundPlayer) {
        this.tileSize = tileSize;
        this.entityManager = entityManager;
        this.assetManager = assetManager;
        this.soundPlayer = soundPlayer;
    }

    createEntity(monsterType) {

        let monster = null;

        switch (monsterType) {

            case EntityType.GOLD_FROG:
                monster = new MonsterGoldFrog(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.SCORPION:
                monster = new MonsterScorpion(
                    this.tileSize,
                    this.assetManager
                );
                break;

            case EntityType.STATUE:
                monster = new StatueEntity(
                    this.tileSize,
                    this.assetManager
                );
                break;

            default:
                break;
        }


        return monster;

    }

}