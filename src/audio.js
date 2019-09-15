
//
// Audio player
// (c) 2019 Jani Nykänen
//


// Copied from one older project,
// has some issues with music
export class AudioPlayer {


    //
    // Constructor
    //
    constructor(sounds) {

        this.enabled = false;

        // Volume
        this.sampleVol = 1.0;
        this.musicVol = 1.0;

        // Music ID
        this.musicID = null;
        // Music sound
        this.musicSound = null;
        // Volume "cache"
        this.volCache = 0.0;

        this.sounds = sounds;

        this.paused = false;
    }


    //
    // Toggle
    //
    toggle(state) {

        this.enabled = state;
    
        if(!state) {
    
            if(this.musicSound != null && this.musicID != null)
                this.musicSound.volume(0.0, this.musicID);
        }
        else {
    
            if(this.musicSound != null && this.musicID != null)
                this.musicSound.volume(this.volCache, this.musicID);
        }
    }


    //
    // Fade in music
    //
    fadeInMusic(sound, vol, time) {

        if(!this.enabled) return;

        if(this.musicID == null) {

            this.musicID = sound.play();
            this.musicSound = sound;
        }

        this.volCache = vol * this.musicVol;

        sound.volume(vol * this.musicVol, sound);
        sound.loop(true, this.musicID);
        if(!this.enabled) vol = 0.0;
        sound.fade(0.0, vol, time, this.musicID);
    }


    //
    // Fade out music
    //
    fadeOutMusic(sound, vol, time) {

        if(!this.enabled) return;

        if(this.musicID == null) {

            this.musicID = sound.play();
            this.musicSound = sound;
        }

        sound.volume(vol * this.musicVol, sound);
        sound.loop(true, this.musicID);
        if(!this.enabled) vol = 0.0;
        sound.fade(vol, 0.0, time, this.musicID);
    }


    //
    // Stop music
    //
    stopMusic() {

        if(!this.enabled) return;

        if(this.musicSound == null || this.musicID == null)
            return;

        this.musicSound.stop(this.musicID);
        this.musicID = null;
        this.musicSound = null;
    }


    //
    // Pause music
    //
    pauseMusic() {

        if(!this.enabled) return;
        
        if (this.paused) return;

        if(this.musicSound == null || this.musicID == null)
            return;

        this.musicSound.pause(this.musicID);
        this.paused = true;
    }


    //
    // Resume music
    //
    resumeMusic() {

        if(!this.enabled) return;

        if (!this.paused) return;
        this.paused = false;

        this.musicSound.play(this.musicID);
    }


    //
    // Set music volume (relative)
    //
    setMusicVolume(v) {

        if(!this.enabled) return;

        this.musicSound.volume(
            v == null ? this.volCache : this.volCache * v);
    }


    //
    // Play a sample
    //
    playSample(sound, vol) {

        if(!this.enabled) return;

        vol *= this.sampleVol;

        if(!sound.playID) {

            sound.playID = sound.play();

            sound.volume(vol, sound.playID );
            sound.loop(false, sound.playID );
        }
        else {

            sound.stop(sound.playID);
            sound.volume(vol, sound.playID );
            sound.loop(false, sound.playID );
            sound.play(sound.playID);
        }
    }

}

