import { Shape } from "./canvas.js";
import { Action, State } from "./input.js";
import { Menu, Button } from "./menu.js";

//
// Intro
// (c) 2019 Jani Nykänen
//

// Local constants
const WAIT_TIME = 120;


//
// Intro scene class
//
export class Intro {


    //
    // Constructor
    //
    constructor(ev) {

        

        this.timer = WAIT_TIME;
        this.phase = 0;

        // Yes/No menu
        this.menu = new Menu();
        this.menu.addButton(
            new Button("Yes", (ev) => {

                ev.audio.toggle(true);
                this.increasePhase(ev);
            }),
            new Button("No", (ev) => {

                ev.audio.toggle(false);
                this.increasePhase(ev);
            })
        );

        
    }


    //
    // Increase phase
    //
    increasePhase(ev, fadeIn) {

        ev.tr.activate(fadeIn != null, 1.0, 0, 0, 0,
            () => {

                if (fadeIn)
                    ++ this.phase;
            });

        if (!fadeIn)
            ++ this.phase;
    }


    //
    // Update scene
    //
    update(ev) {

        if (ev.tr.active) return;

        // Update menu
        if (this.phase == 0) {

            this.menu.update(ev);
        } 
        // Update "created by" animation
        else {

            this.timer -= ev.step;

            if (this.timer <= 0 || ev.input.getKey(Action.Start) == State.Pressed) {

                if (this.phase == 2) {

                    ev.tr.activate(true, 2.0, 0, 0, 0,
                        () => {
                            ev.changeScene("title");
                            ev.audio.fadeInMusic(ev.audio.sounds.theme,
                                0.6, 1000);
                        });
                }
                else if (this.phase == 1) {

                    this.increasePhase(ev, true);
                    this.timer = WAIT_TIME;
                }
            }
        }
    }

    //
    // Draw scene
    //
    draw(c) {

        const VIEW_TARGET = 720.0;
        const SMALL_SCALE = 32;
        const BIG_SCALE = 64;
        const TEXT_SHIFT = 144;

        const FACE_Y = 64;
        const FACE_SCALE = 256;

        const STR1 = ["A game by", "Main theme by"];
        const STR2 = ["Jani Nyk#nen", "H0dari"];

        let mx = c.viewport.x/2;
        let my = c.viewport.y/2;
        
        c.clear(0, 0, 0);
        c.toggleTexturing(true);

        c.loadIdentity();
        c.fitViewToDimension(c.w, c.h, VIEW_TARGET);
        c.useTransform();

        c.setColor(1, 1, 1);

        if (this.phase == 0) {

            // Draw menu
            c.translate(0, 32);
            c.useTransform();
            this.menu.draw(c, 48);

            // Draw guide
            c.loadIdentity();
            c.useTransform();   

            c.setColor();
            c.drawScaledText("Enable audio?\n(Press enter to\nconfirm)", mx -192, my -192, 
                -20, 8, 40, 40, false);
        }
        else {

            c.translate(mx, my);
            c.useTransform();

            if (this.phase == 1) {

                // Draw face
                c.drawScaledBitmap(c.bitmaps.face,
                    -FACE_SCALE/2, -FACE_SCALE + FACE_Y, 
                    FACE_SCALE, FACE_SCALE);
            }

            // Draw text
            c.drawScaledText(STR1[this.phase -1], 
                0, - BIG_SCALE + (this.phase == 1 ? TEXT_SHIFT : 0), 
                -20, 0, SMALL_SCALE, SMALL_SCALE, true);

            c.drawScaledText(STR2[this.phase -1], 
                0, - BIG_SCALE/2 + (this.phase == 1 ? TEXT_SHIFT : 0), 
                -20, 0, BIG_SCALE, BIG_SCALE, true);   
        } 
    }

}
