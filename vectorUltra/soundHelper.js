import { AssetManager, ImageAsset, ImageLoader, SoundAsset, SoundLoader } from "./assets.js";

export class MachineGunSoundHelper {

    /** @type {boolean} */
    isMuted = false;

    /**
     * Grabs the machine gun sounds up front so they're ready to fire.
     * @param {SoundLoader} soundLoader - source of the decoded machine gun sounds
     */
    constructor(soundLoader) {

        this.machineGunPrimary = soundLoader.getSound(SoundAsset.MACHINEGUN_3);
        this.machineGunSecondary = soundLoader.getSound(SoundAsset.MACHINEGUN_2);
        this.machineGunTrail = soundLoader.getSound(SoundAsset.MACHINEGUN_TRAIL);

        this.audioPrimary = this.machineGunPrimary;
        this.audioSecondary = this.machineGunTrail;

    }

    /**
     * Silences the guns and ignores further fire/stop calls until unmuted.
     * @returns {void}
     */
    mute() {
        this.isMuted = true;
        this.audioPrimary.pause();
        this.audioSecondary.pause();
    }

    /**
     * Lets fire/stop calls make noise again.
     * @returns {void}
     */
    unmute() {
        this.isMuted = false;
    }

    /**
     * Starts the primary machine gun sound looping. Does nothing while muted.
     * @returns {void}
     */
    fireMachineGuns() {

        if (this.isMuted) {
            return
        }

        this.audioPrimary.loop = true;
        this.audioPrimary.play();
    }

    /**
     * Stops the primary loop and plays the trailing "tail" sound. Does nothing while muted.
     * @returns {void}
     */
    stopMachineGuns() {

        if (this.isMuted) {
            return
        }

        this.audioPrimary.pause();
        this.audioSecondary.play();
    }

}

export class SoundPlayer {

    /** @type {boolean} */
    isMuted = false;

    /** @type {AudioBufferSourceNode | null} */
    backgroundMusic = null;

    /**
     * @param {AssetManager} assetManager - source of decoded sounds
     * @param {AudioContext} audioContext - the game's shared audio context
     */
    constructor(assetManager, audioContext) {
        this.assetManager = assetManager;
        this.audioContext = audioContext;
    }

    /**
     * Mutes or un-mutes. Muting also stops any background music.
     * @param {boolean} shouldMute - true to mute, false to unmute
     * @returns {void}
     */
    setIsMuted(shouldMute) {
        this.isMuted = shouldMute;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        }
    }

    /**
     * Flips between muted and unmuted.
     * @returns {void}
     */
    toggleMute() {
        this.setIsMuted(!this.isMuted);
    }

    /**
     * Stops whatever background music is playing and starts a new track.
     * @param {string} soundAsset - a SoundAsset value, e.g. SoundAsset.THEME_1
     * @returns {void}
     */
    playBackgroundMusic(soundAsset) {
        this.stopBackgroundMusic();
        this.backgroundMusic = this.assetManager.getSound(soundAsset);
        this.backgroundMusic.start();
    }

    /**
     * Stops the background music, if any is playing.
     * @returns {void}
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic != null) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }

    /**
     * Fire-and-forget: plays a sound once.
     * @param {string} soundAsset - a SoundAsset value, e.g. SoundAsset.CRASH_2
     * @returns {void}
     */
    playOneShot(soundAsset) {
        let sound = this.assetManager.getSound(soundAsset, false);
        sound.start();
    }

    /**
     * Plays a sound once with a random detune, so repeated sounds don't all sound identical.
     * @param {string} soundAsset - a SoundAsset value
     * @param {number} detuneMin - lowest detune, in cents (100 cents = 1 semitone)
     * @param {number} detuneMax - highest detune, in cents
     * @returns {void}
     */
    playOneShotWithDetuneRange(soundAsset, detuneMin, detuneMax) {
        let sound = this.assetManager.getSound(soundAsset, false);
        sound.detune.value = this.randomInRange(detuneMin, detuneMax);
        sound.start();
    }

    /**
     * Random whole number between min and max, inclusive of both ends.
     * @param {number} min - lowest possible result
     * @param {number} max - highest possible result
     * @returns {number}
     */
    randomInRange(min, max) {
        let range = Math.abs(max - min) + 1;
        return Math.floor(Math.random() * range) + min
    }

}

// ------------------------------------------------------------------------------------

export class SoundLooper {

    /** @type {boolean} */
    isPlaying = false;

    /** @type {AudioBuffer | null} */
    buffer = null;

    /** @type {AudioBufferSourceNode | null} */
    source = null;

    /**
     * @param {string} soundAsset - a SoundAsset value to loop, e.g. SoundAsset.MACHINEGUN_3
     * @param {AssetManager} assetManager - source of the decoded audio buffer
     * @param {AudioContext} audioContext - the game's shared audio context
     */
    constructor(soundAsset, assetManager, audioContext) {
        this.assetManager = assetManager;
        this.audioContext = audioContext;
        this.buffer = this.assetManager.getBuffer(soundAsset);
    }

    /**
     * Starts looping the sound. Does nothing if it's already playing.
     * @returns {void}
     */
    play() {
        if (this.isPlaying == false) {
            this.isPlaying = true;
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(this.audioContext.destination);

            this.source.loop = true;
            this.source.loopStart = 0;
            this.source.loopEnd = this.buffer.length;

            this.source.start();
        }
    }

    /**
     * Turns looping off, so the current pass plays out to its end and then stops.
     * @returns {void}
     */
    stop() {
        if (this.source == null) {
            return;
        }

        this.isPlaying = false;
        this.source.loop = false;
    }

    /**
     * Nudges the pitch of the currently playing loop.
     * @param {number} increment - detune change in cents (100 cents = 1 semitone); negative lowers the pitch
     * @returns {void}
     */
    changePitchBy(increment) {
        this.source.detune.value += increment;
    }

}

// ------------------------------------------------------------------------------------

export class SoundGenerator {

    /** @type {boolean} */
    isStarted = false;

    /**
     * Builds a low (50 Hz) sawtooth oscillator, ready to play.
     * @param {AudioContext} audioContext - the game's shared audio context
     */
    constructor(audioContext) {

        this.audioContext = audioContext;
        this.gainNode = audioContext.createGain();
        this.gainNode.gain.value = 0.1;

        this.oscillatorPrimary = audioContext.createOscillator();
        this.oscillatorPrimary.type = "sawtooth";
        this.oscillatorPrimary.frequency.setValueAtTime(40, audioContext.currentTime);

        this.oscillatorSecondary = audioContext.createOscillator();
        this.oscillatorSecondary.type = "sawtooth";
        this.oscillatorSecondary.frequency.setValueAtTime(30, audioContext.currentTime);
        this.oscillatorSecondary.detune.value = 50;

        this.oscillatorPrimary.connect(this.gainNode);
        this.oscillatorSecondary.connect(this.gainNode)
        this.gainNode.connect(this.audioContext.destination);
    }

    /**
     * Starts the oscillator. An oscillator can only be started once!
     * @returns {void}
     */
    play() {
        this.oscillatorPrimary.start();
        this.oscillatorSecondary.start();
        this.isStarted = true;
    }

    /**
     * Stops the oscillator, if it was started. Once stopped, it can't be restarted.
     * @returns {void}
     */
    stop() {
        if (this.oscillatorPrimary != null && this.isStarted == true) {
            this.oscillatorPrimary.stop();
            this.oscillatorSecondary.stop();
        }
    }

    /**
     * Nudges the oscillator's frequency.
     * @param {number} increment - frequency change; it gets divided by 10, so 10 = +1 Hz; negative lowers the pitch
     * @returns {void}
     */
    changePitchBy(increment) {
        console.log(`${this.oscillatorPrimary.frequency.value} + ${increment}`)
        this.oscillatorPrimary.frequency.setValueAtTime(this.oscillatorPrimary.frequency.value + increment / 10, this.audioContext.currentTime);
        this.oscillatorSecondary.frequency.setValueAtTime(this.oscillatorSecondary.frequency.value + increment / 10, this.audioContext.currentTime);

    }

}
