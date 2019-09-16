import { Bitmap } from "./bitmap.js";
import { clamp } from "./util.js";


//
// Asset loaded
// (c) 2019 Jani Nykänen
//


export class AssetLoader {


    //
    // Constructor
    //
    constructor(gl) {

        this.total = 0;
        this.loaded = 0;

        // Assets
        this.bitmaps = [];
        this.sounds = [];

        this.gl = gl;
    }


    //
    // Load a bitmap
    //
    loadBitmap(src, name) {

        ++ this.total;

        let image = new Image();
        image.onload = () => {

            this.bitmaps[name] = new Bitmap(image, this.gl);
            ++ this.loaded;
        }
        image.src = src;
    }


    //
    // Load a sound
    //
    loadSound(src, name) {

        ++ this.total;
    
        if (typeof(Howl) != "undefined") {

            this.sounds[name] = new Howl({

                src: [src],
                onload: () => { ++ this.loaded;}
            });
        }
    }


    //
    // Add bitmaps
    //
    addBitmaps(any) {

        for (let a of arguments) {

            this.loadBitmap(a.src, a.name);
        }
    }


    //
    // Add sounds
    //
    addSounds(any) {

        for (let a of arguments) {

            this.loadSound(a.src, a.name);
        }
    }


    //
    // Has loaded
    //
    hasLoaded() {

        return this.total == 0 ||
            (this.total == this.loaded);
    }


    //
    // Get loading percentage
    //
    getPercentage() {

        return Math.round(
            this.loaded/this.total * 100) | 0;
    }
}