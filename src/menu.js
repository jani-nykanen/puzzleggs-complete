import { Action, State } from "./input.js";
import { negMod } from "./util.js";
import { Shape } from "./canvas.js";

//
// A simple menu
// (c) 2019 Jani Nykänen
//


//
// Menu button type
// 
export class Button {


    //
    // Constructor
    //
    constructor(text, cb) {

        this.text = text;
        this.cb = cb;

        this.scale = 0.0;
    }


    //
    // Update scale
    //
    updateScale(active, ev) {

        const SPEED = 0.075;

        let target = active ? 1.0 : 0.0;

        if (target > this.scale) {

            this.scale = Math.min(
                this.scale + SPEED*ev.step, 
                target);
        }
        else if (target < this.scale) {

            this.scale = Math.max(
                this.scale - SPEED*ev.step, 
                target);
        }
    }
}


//
// Menu type
//
export class Menu {


    //
    // Constructor
    //
    constructor() {

        this.buttons = [];
        this.cursorPos = 0;

        this.maxLen = 0;
    }


    //
    // Add a button
    //
    addButton(b) {

        for (let i = 0; i < arguments.length; ++ i) {

            this.buttons.push(arguments[i]);

            if (arguments[i].text.length > this.maxLen) {

                this.maxLen = arguments[i].text.length;
            }
        }

        this.buttons[0].scale = 1.0;
    }


    //
    // Update menu
    //
    update(ev) {

        // Update cursor position
        let p = 0;
        if (ev.input.getKey(Action.Up) == State.Pressed) {

            -- p;
        }
        else if (ev.input.getKey(Action.Down) == State.Pressed) {

            ++ p;
        }
        this.cursorPos = 
            negMod(this.cursorPos + p, this.buttons.length);

        // Check if enter pressed
        let cb;
        if (ev.input.getKey(Action.Start) == State.Pressed) {

            cb = this.buttons[this.cursorPos].cb;
            if ( (cb = this.buttons[this.cursorPos].cb) != null) {

                cb();
            }
        }

        // Update buttons
        for (let i = 0; i < this.buttons.length; ++ i) {

            this.buttons[i].updateScale(this.cursorPos == i, ev);
        }
    }


    //
    // Draw
    //
    draw(c, scale, bg) {

        const BUTTON_OFF = scale / 8;
        const TEXT_XOFF = -20;
        const SCALE_PLUS = 0.15;
        const SHADOW_OFF = BUTTON_OFF/2;
        const BG_OFF = BUTTON_OFF*2;
        const COLORS = [[1, 1, 1], [1, 1, 0]];

        let n = this.buttons.length;
        let h = scale + BUTTON_OFF;

        let y = c.viewport.y/2 - (n*h)/2;
        let x = c.viewport.x/2;

        // Draw background, if wanted
        let bx, by, bw, bh;
        if (bg) {

            bw = (this.maxLen+2) * (scale+TEXT_XOFF) + BG_OFF*2;
            bh = (n*h) + BG_OFF*2;

            bx = x - bw/2;
            by = c.viewport.y/2 - bh/2;

            c.toggleTexturing(false);
            c.setColor(...bg);
            c.fillShape(Shape.Rect, bx, by, bw, bh);
            c.toggleTexturing(true);
        }


        // Draw buttons
        let s;
        let col;
        for (let i = 0; i < n; ++ i) {

            s = 1.0 + this.buttons[i].scale * SCALE_PLUS;

            if (i == this.cursorPos) {

                col = COLORS[1];
            }
            else {

                col = COLORS[0];
            }

            c.drawScaledText(this.buttons[i].text,
                x, y + i*h , 
                TEXT_XOFF, 0,
                s*scale, s*scale,
                 true, null, null, null,
                SHADOW_OFF, 0.25, col);
        }

    }


    //
    // Set cursor position
    //
    setCursorPos(p) {

        this.cursorPos = p % this.buttons.length;
        for (let i = 0; i < this.buttons.length; ++ i) {

            if (i == this.cursorPos)
                this.buttons[i].scale = 1.0;
            else
                this.buttons[i].scale = 0.0;
        }
    }
}
