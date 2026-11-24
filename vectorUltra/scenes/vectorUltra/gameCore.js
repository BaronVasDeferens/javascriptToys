export class GameCore {

    gamePad = null;

    constructor() {

    }

    setGamePad(gamePad) {
        this.gamePad = gamePad;
        console.log(`acquired gamepad: ${this.gamePad}`);
    }

}