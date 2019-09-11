//
// Bitmap (texture, really)
// (c) 2019 Jani Nykänen
//

export class Bitmap {


    //
    // Constructor
    //
    constructor(tex, w, h) {

        let gltex = tex;
        let gl;
        // The best way to check if tex is an Html5
        // image!
        if (tex.width != null) {

            gl = w; // Sorry

            gltex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, gltex);
    
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
            gl.texImage2D(gl.TEXTURE_2D, 
                0, gl.RGBA, gl.RGBA, 
                gl.UNSIGNED_BYTE, tex);

            w = tex.width;
            h = tex.height;
        }

        this.tex = gltex;
        this.w = w;
        this.h = h;
    }


    //
    // Bind
    //
    bind(gl) {

        gl.bindTexture(gl.TEXTURE_2D, this.tex);
    }
}
