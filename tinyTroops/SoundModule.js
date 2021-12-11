export var SFX = Object.freeze({
    BLOB_MOVE_1: "resources/sounds/blob_move_1.wav",
    BLOB_MOVE_2: "resources/sounds/blob_move_2.wav",
    BLOB_SMG_DEATH: "resources/sounds/blob_smg_dies.wav",
    BLOB_WHIP: "resources/sounds/blob_whip.wav",

    INTRO: "resources/sounds/intro.wav",

    SOLDIER_MOVE_1: "resources/sounds/soldier_move_1.wav",
    SMG_1: "resources/sounds/smg.wav",

    SMG_RANDOM: "SMG_RANDOM"

});

const soundMap = new Map();

export function getSound(sndEfx) {

    // TODO: switch(sndEfx){
    //  case: _RANDOM...
    //} 

    return new Audio(sndEfx);

    // The below code works OK for things that get buffered, but limits simultaneous playback,
    // as each call to .play() is on the same object

    // if (soundMap.has(sndEfx)) {
    //     return soundMap.get(sndEfx);
    // } else {
    //     soundMap.set(sndEfx, new Audio(sndEfx));
    //     let snd = soundMap.get(sndEfx);
    //     return snd;
    // }
};




// export var IMG = Object.freeze({
//     BLOB_MOVE_1: "resources/sounds/blob_move_1.wav",
//     BLOB_MOVE_2: "resources/sounds/blob_move_2.wav",
//     BLOB_SMG_DEATH: "resources/sounds/blob_smg_dies.wav",
//     BLOB_WHIP: "resources/sounds/blob_whip.wav",

//     INTRO: "resources/sounds/intro.wav",

//     SOLDIER_MOVE_1: "resources/sounds/soldier_move_1.wav",
//     SMG_1: "resources/sounds/smg.wav",

//     SMG_RANDOM: "SMG_RANDOM"

// });



// const imageMap = new Map();

// export function getImage(img) {

    
    


// }
