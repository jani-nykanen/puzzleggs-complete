import { Bitmap } from "./bitmap.js";

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

        // Bitmaps
        this.bitmaps = [];

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
    // Add bitmaps
    //
    addBitmaps(any) {

        for (let a of arguments) {

            this.loadBitmap(a.src, a.name);
        }
    }


    //
    // Has loaded
    //
    hasLoaded() {

        return this.total == 0 ||
            (this.total == this.loaded);
    }
}