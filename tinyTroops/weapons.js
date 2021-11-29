export class Weapon {
    name = "Gneric Weapons, Inc.";
    soundPrep = null;
    soundAttack = null;
    soundHit = null;
    soundMiss = null;
    rangeMin = 0;
    rangeMax = 99;
    ignoresTerrain = false;

    constructor(name, soundPrep, soundAttack,soundHit,soundMiss,rangeMin,rangeMax,ignoresTerrain) {
        this.name = name;
        this.soundPrep = new Audio(soundPrep);
        this.soundAttack = new Audio(soundAttack);
        this.soundHit = new Audio(soundHit);
        this.soundMiss = new Audio(soundMiss);
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        this.ignoresTerrain = ignoresTerrain;
    }
}

export class WeaponFactory {

    constructor() {

    }
    
    getSmg() {
        return new Weapon("SMG", null, "smg.wav", null, null, 0, 99, false);
    }

}