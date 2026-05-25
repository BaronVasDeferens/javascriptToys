import { ImageAsset } from "../assets.js";
import { MonsterEntity, MonsterCollectable } from "../entity/entity_monster.js";
import { PlayerEntity } from "../entity/entity_player.js";
import { EventEntity } from "../event/event.js";

export class EntityRoomManager {

    player = null;
    playerRoomId = null;

    rooms = [];

    roomIdToRoom = new Map();
    roomIdToEntityId = new Map();
    roomIdToEventId = new Map();

    entities = [];                      // re-name to MONSTERS
    entityIdToEntity = new Map();
    entityIdToRoomId = new Map();

    events = [];
    eventIdToEvent = new Map();
    eventIdToRoomId = new Map();

    constructor(tileSize) {
        this.tileSize = tileSize;
        this.clear();
    }

    clear() {
        this.player = null;
        this.playerRoomId = null;

        this.entities = [];
        this.entityIdToEntity.clear();
        this.entityIdToRoomId.clear();

        this.rooms = [];
        this.roomIdToRoom.clear();
        this.roomIdToEntityId.clear();
        this.roomIdToEventId.clear();

        this.events = [];
        this.eventIdToEvent.clear();
        this.eventIdToRoomId.clear();
    }

    setRooms(rooms) {
        this.rooms = rooms;
        this.rooms.forEach(room => {
            this.roomIdToRoom.set(room.id, room);
        });
    }

    // ENTITY
    addEntity(entity) {
        this.entities.push(entity);
        this.entityIdToEntity.set(entity.id, entity);
    }

    setPlayer(player) {
        this.player = player;
        this.addEntity(player);
    }

    setEntityRoom(entity, room) {

        if (entity instanceof PlayerEntity) {
            this.playerRoomId = room.id;
            entity.x = room.col * this.tileSize;
            entity.y = room.row * this.tileSize;
            return;
        } else {

            let target = this.entityIdToEntity.get(entity.id);

            // Is there a record of this entity in the registry?
            if (target == null) {
                this.entityIdToEntity.set(entity.id, entity)
            }

            // remove prior room association
            let oldRoomId = this.entityIdToRoomId.get(entity.id);
            if (oldRoomId != null) {
                this.entityIdToRoomId.delete(entity.id);
                this.roomIdToEntityId.delete(oldRoomId);
            }

            entity.x = room.col * this.tileSize;
            entity.y = room.row * this.tileSize;
            this.entityIdToEntity.set(entity.id, entity);
            this.entityIdToRoomId.set(entity.id, room.id);
            this.roomIdToEntityId.set(room.id, entity.id);
        }
    }

    getPlayerRoom() {
        return this.roomIdToRoom.get(this.playerRoomId);
    }

    getRoomById(id) {
        return this.roomIdToRoom.get(id);
    }

    getIsEmptyForRoom(room) {
        return this.roomIdToEntityId.get(room.id) == null
            && this.roomIdToEventId.get(room.id) == null
            && room.id != this.playerRoomId;
    }

    getActiveEntities() {
        return [...this.entityIdToEntity.values()]
            .filter(entity => {
                return entity.isAlive == true;
            });
    }

    getActiveMonsters() {
        let monsters = [...this.entityIdToEntity.values()]
            .filter(entity => {
                return entity instanceof MonsterEntity;
            })
            .filter(entity => {
                return entity.isActive == true;
            });

        return monsters;
    }

    getEntityForId(id) {
        return this.entityIdToEntity.get(id);
    }

    getEntityForRoom(room) {

        if (room == null) {
            return null;
        }

        let roomId = room.id;
        let entityId = this.roomIdToEntityId.get(roomId);
        return this.entityIdToEntity.get(entityId);
    }

    getRoomForEntity(entity) {

        let roomId = null;
        if (entity instanceof PlayerEntity) {
            roomId = this.playerRoomId;
        } else {
            roomId = this.entityIdToRoomId.get(entity.id);
        }

        return this.roomIdToRoom.get(roomId);
    }

    getIsPlayerEntityContact() {
        let entityId = this.roomIdToEntityId.get(this.playerRoomId);
        if (entityId == null) {
            return false;
        }

        let entity = this.entityIdToEntity.get(entityId);
        if (entity instanceof MonsterEntity) {
            return true;
        } else {
            return false;
        }

    }

    getIsPlayerCollectableContact() {
        let entityId = this.roomIdToEntityId.get(this.playerRoomId);
        if (entityId == null) {
            return false;
        }

        let entity = this.entityIdToEntity.get(entityId);
        if (entity instanceof MonsterCollectable) {
            return true;
        } else {
            return false;
        }
    }

    getIsPlayerEventContact() {
        return (this.roomIdToEventId.get(this.playerRoomId) != null);
    }


    // EVENTS

    setEventRoom(event, room) {

        if (!(event instanceof EventEntity)) {
            console.error(`NON-EVENT! ${event.constructor.name}`);
            return
        }

        event.x = (room.col * this.tileSize) + (this.tileSize - event.image.width) / 2;
        event.y = (room.row * this.tileSize) + (this.tileSize - event.image.height) / 2;
        this.eventIdToEvent.set(event.id, event);
        this.eventIdToRoomId.set(event.id, room.id);
        this.roomIdToEventId.set(room.id, event.id);
    }

    getEventForRoom(room) {
        let eventId = this.roomIdToEventId.get(room.id);
        let event = this.eventIdToEvent.get(eventId);
        return event;
    }

    getAllEvents() {
        return [...this.eventIdToEvent.values()];
    }

    getActiveEvents() {
        return this.getAllEvents()
            .filter(evt => { return evt.isActive == true; });
    }

    debugOut() {
        [...this.entityIdToEntity.entries()].forEach((key, value) => {
            console.log(`id: ${key}: ${value.imageAssetId}`);
        });
    }
}



export class MazeRoom {

    id = crypto.randomUUID();

    floorTiles = [
        ImageAsset.FLOOR_ZX_18,
        ImageAsset.FLOOR_ZX_19,
        ImageAsset.FLOOR_ZX_20,
        ImageAsset.FLOOR_ZX_21,
        ImageAsset.FLOOR_ZX_22,
        ImageAsset.FLOOR_ZX_23,
        ImageAsset.FLOOR_ZX_24,
        ImageAsset.FLOOR_ZX_25,
        ImageAsset.FLOOR_ZX_26,
        ImageAsset.FLOOR_ZX_27
    ];

    blockTiles = [
        ImageAsset.BLOCK_ZX_1,
        ImageAsset.BLOCK_ZX_2,
        ImageAsset.BLOCK_ZX_3,
        ImageAsset.BLOCK_ZX_4,
        ImageAsset.BLOCK_ZX_5,
        ImageAsset.BLOCK_ZX_6
    ];

    row = 0;
    col = 0;
    roomSize = 64;

    isOpen = true;     // when TRUE, this room can be occupied by an entity

    image = null;

    constructor(row, col, roomSize, isOpen, assetManager) {
        this.row = row;
        this.col = col;
        this.roomSize = roomSize;
        this.assetManager = assetManager;
        this.setIsOpen(isOpen);
    }

    setIsOpen(isOpen) {
        this.isOpen = isOpen;
        if (this.isOpen == true) {
            let tile = this.floorTiles[Math.floor(this.floorTiles.length * Math.random())];
            this.image = this.assetManager.getImage(tile);
        } else {
            let tile = this.blockTiles[Math.floor(this.blockTiles.length * Math.random())];
            this.image = this.assetManager.getImage(tile);
        }
    }

    getCenter() {
        let xCenter = (this.col * this.roomSize) + (this.roomSize / 2);
        let yCenter = (this.row * this.roomSize) + (this.roomSize / 2);
        return { x: xCenter, y: yCenter };
    }

    render(context, mazeWindowX, mazeWindowY) {

        // Draw a border
        context.strokeStyle = "#000000";
        context.strokeRect(
            (this.col - mazeWindowX) * this.roomSize,
            (this.row - mazeWindowY) * this.roomSize,
            this.roomSize,
            this.roomSize);

        // Draw the room
        if (this.image != null) {
            context.drawImage(
                this.image,
                (this.col * this.roomSize),
                (this.row * this.roomSize));
        } else {
            context.fillStyle = this.color;
            context.fillRect(
                (this.col - mazeWindowX) * this.roomSize,
                (this.row - mazeWindowY) * this.roomSize,
                this.roomSize,
                this.roomSize
            );
        }

    }
}
;

