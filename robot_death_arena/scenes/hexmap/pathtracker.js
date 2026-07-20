import { Pip, PipType } from "./pip.js";


export class PathTracker {

    pathSet = new Set();
    orderToHexMap = new Map();
    hexToOrderMap = new Map();

    pips = [];

    size() {
        return this.pathSet.size;
    }

    clear() {
        this.pathSet.clear();
        this.orderToHexMap.clear();
        this.hexToOrderMap.clear();
        this.pips = [];
    }

    has(hex) {
        return this.pathSet.has(hex)
    }

    add(hex) {

        if (hex == null) {
            console.error(`cannot ADD NULL hex!`);
            return;
        }

        let wasItemAdded = false;
        if (!this.pathSet.has(hex)) {
            this.pathSet.add(hex);
            let position = this.pathSet.size - 1;
            this.orderToHexMap.set(position, hex);
            this.hexToOrderMap.set(hex, position);
            this.computePips();
            wasItemAdded = true;
        }

        return wasItemAdded;
    }

    getAtIndex(index) {
        return this.orderToHexMap.get(index);
    }

    indexOf(hex) {
        return this.hexToOrderMap.get(hex);
    }

    deleteHex(hex) {

        if (hex == null) {
            console.error(`cannot DELETE NULL hex!`)
            return;
        }

        let position = this.hexToOrderMap.get(hex);
        let size = this.pathSet.size;
        for (let n = position; n < size; n++) {
            let currentHex = this.orderToHexMap.get(n);
            this.pathSet.delete(currentHex);
            this.hexToOrderMap.delete(currentHex);
        }

        for (let n = position; n < this.orderToHexMap.size; n++) {
            this.orderToHexMap.delete(n);
        }

        this.computePips();
    }

    computePips() {
        this.pips = [];
        this.pathSet.values().forEach((hex, index) => {

            let type = PipType.CIRCLE_FILLED;
            if (index == 0) {
                type = PipType.CIRCLE_OUTLINE;
            }

            this.pips.push(
                new Pip(hex, type, null)
            )
        });
    }
}