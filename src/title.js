import { Menu, Button } from "./menu.js";
import { BG_COLOR } from "./game.js";
import { State, Action } from "./input.js";
import { PasswordGen } from "./passwordgen.js";
import { Shape } from "./canvas.js";
import { Bitmap } from "./bitmap.js";
import { Egg } from "./egg.js";
import { Vector2 } from "./vector.js";
import { Player } from "./player.js";

//
// Title screen scene
// (c) 2019 Jani Nykänen
//


// Local constants
const WAIT_TIME = 60;


//
// Title screen scene class
//
export class TitleScreen {

    //
    // Constructor
    //
    constructor(ev, c) {

        const EGG_COUNT = 8;

        // Menu
        this.menuShort = new Menu();
        this.menuLong = new Menu();
        // Active menu
        this.menu = this.menuShort;

        // Add buttons
        let buttons = [ 
            new Button("New Game", () => {

                this.phase = 3;
                this.waitTimer = WAIT_TIME;
                this.errorTimer = 0;
            }),
            new Button("Continue", () => {
                this.errorTimer = 0;
                ev.tr.activate(true, 2.0, ...BG_COLOR,
                    () => {
                        ev.changeScene("game");
                    }
                );
                }),
            new Button("Password", 
            () => {
                this.pword = "";
                this.phase = 2;
            }),];
        this.menuShort.addButton(buttons[0], buttons[2]);
        this.menuLong.addButton(buttons[0], buttons[1], buttons[2]);

        // Phase
        this.phase = -1;
        // Enter wave 
        this.enterWave = 0;

        // Password
        this.pgen = new PasswordGen();
        this.pword = "";

        // Error timer
        this.errorTimer = 0;
        // Wait timer (could use just one timer, true)
        this.waitTimer = WAIT_TIME;

        // Vortex
        this.vortexTimer = 0;
        this.vphase = 0;

        // Scaling
        this.scale = 1.0;

        // EGGS!
        this.eggs = new Array(EGG_COUNT);
        for (let i = 0; i < this.eggs.length; ++ i) {

            this.eggs[i] = new Egg(0, 0);
            this.eggs[i].scale = 1;
            this.eggs[i].angle = 0;
            this.eggs[i].follow = 1; // Affects the color
        }
        this.eggAngle = 0;

        // ...and the bird!
        this.bird = new Player(0, 0);
        this.bird.scale = 1;
        this.bird.angle = 0;

        // "Press F" pos
        this.pressFPos = 0;
        this.renderWidth = 0;
    }


    //
    // Update eggs
    //
    updateEggs(ev) {

        const ANGLE_SPEED = 0.0125;
        const ROTATE_SPEED = 0.05;
        const RADIUS = 360;
        const START = 3;

        this.eggAngle = (this.eggAngle + ANGLE_SPEED*ev.step) % (Math.PI*2);

        let m = 1.0;
        if (this.phase == 3)
            m = this.waitTimer / WAIT_TIME;

        let a, r, o;
        for (let i = 0; i < this.eggs.length +1; ++ i) {

            a = this.eggAngle + Math.PI*2/this.eggs.length * i;
            r = m * 1.0 / (this.eggs.length+START) * (i+START);
            r *= r;
            a *= 1 - 2 * (i % 2);

            o = i < this.eggs.length ? this.eggs[i] : this.bird;

            // Set position
            
            o.rpos = new Vector2(

                Math.cos(a) * RADIUS * r,
                Math.sin(a) * RADIUS * r
            );

            // Set scale
            o.scale = 3.75 * r;

            // Update angle
            o.angle = 
                (o.angle + 
                ROTATE_SPEED*ev.step * 
                (-1 + 2 * (i%2))) % (Math.PI*2)
        }
    }


    //
    // Update scene
    //
    update(ev) {

        const ERR_TIME = 120;
        const WAVE_SPEED = 0.05;
        const VORTEX_SPEED = 0.0125;
        const PRESS_F_SPEED = 1.0;
        const LOGO_APPEAR_SPEED = 0.75;

        let a = ev.audio;
        let id;
        let t;
        this.scale = 1;

        // Do not check input if transition active
        if (ev.tr.active)  {

            // Update eggs
            this.updateEggs({step: 0});

            if (ev.tr.fadeIn && this.phase == 3) {

                t = ev.tr.getScaledTime();
                t *= t;
                this.scale = 1.0 + 9*t;

            }
            return;
        }

        // Update "Press F"
        this.pressFPos += PRESS_F_SPEED * ev.step;

        // Update vortex
        this.vortexTimer = 
            (this.vortexTimer += VORTEX_SPEED*ev.step);
        if (this.vortexTimer >= 1.0) {

            this.vortexTimer -= 1.0;
            this.vphase = (this.vphase+1) % 2;
        }

        // Update eggs
        this.updateEggs(ev);


        // Logo appearance
        if (this.phase == -1) {

            if ( (this.waitTimer -= LOGO_APPEAR_SPEED * ev.step) <= 0.0 ) {

                this.waitTimer = 0.0;
                ++ this.phase;
            }

            // Update wave
            this.enterWave += WAVE_SPEED * ev.step;
        } 
        // Press enter
        else if (this.phase == 0) {

            if (ev.input.getKey(Action.Start) == State.Pressed) {

                ++ this.phase;

                a.playSample(a.sounds.start, 0.40);
            }

            // Update wave
            this.enterWave += WAVE_SPEED * ev.step;

        }
        // Main menu
        else if (this.phase == 1) {

            this.menu.update(ev);
            
        }
        // Password
        else if (this.phase == 2) {

            // Check backspace
            if (this.pword.length > 0 && 
                ev.input.getKey(8) == State.Pressed) {

                this.pword = this.pword.substr(0, this.pword.length-1);
            }
            // Check numeric keys
            else if (this.pword.length < 5) {

                for (let i = 48; i <= 57; ++ i) {

                    if (ev.input.getKey(i) == State.Pressed) {

                        this.pword += String(i-48);
                    }
                }
            }

            // Check enter
            if (ev.input.getKey(Action.Start) == State.Pressed) {

                if (this.pword.length == 5) {

                    // Check if proper password
                    id = this.pgen.decodePassword(this.pword);
                    if (id == -1) {

                        this.phase = 1;
                        this.errorTimer = ERR_TIME;

                        a.playSample(a.sounds.reject, 0.50);
                    }
                    else {

                        a.playSample(a.sounds.start, 0.40);
                        ev.tr.activate(true, 2.0, ...BG_COLOR,
                            () => {
                                ev.changeScene("game", id);
                            }
                        );
                    }
                }
                else {

                    this.phase = 1;
                    this.errorTimer = ERR_TIME;

                    a.playSample(a.sounds.reject, 0.50);
                }
            }
        }
        // Disappearing stuff
        else if (this.phase == 3) {

            if ((this.waitTimer -= ev.step) <= 0) {

                ev.tr.activate(true, 0.5, ...BG_COLOR,
                    () => {
                        ev.tr.speed = 2.0;
                        ev.changeScene("game", 0);
                    });
            }
        }

        // Update error timer
        if (this.errorTimer > 0)
            this.errorTimer -= ev.step;
    }


    //
    // Draw vortex
    // 
    drawVortex(c) {

        const LOOP = 8;
        const RADIUS = 720.0;

        let mx = c.viewport.x / 2;
        let my = c.viewport.y / 2;
        
        c.push();
        c.translate(mx, my);
        c.useTransform();

        let t;
        let step = 1.0 / LOOP;
        for (let i = 0; i < LOOP; ++ i) {

            t = 1.0 - ((step * i + this.vortexTimer * step) % 1.0);
            t *= t;

            c.push();
            c.rotate(Math.PI*2 * t * 
                (this.vphase == 0 ? 1 : -1) * (1 - 2* (i % 2)) )  ;
            c.scale(this.scale, this.scale);
            c.useTransform();

            c.setColor(
                BG_COLOR[0] * t, 
                BG_COLOR[1] * t, 
                BG_COLOR[2] * t);

            c.fillShape(Shape.Hexagon, 
                0, 0, 
                t * RADIUS, 
                t * RADIUS);
                
            c.pop();
        }


        // Draw eggs
        for (let e of this.eggs) {

            e.draw(c, true, e.angle, true, e.scale, true, true);
        }

        // Draw bird
        c.translate(this.bird.rpos.x, this.bird.rpos.y);
        c.rotate(this.bird.angle);
        c.scale(this.bird.scale, this.bird.scale);
        c.useTransform();

        this.bird.draw(c, true);

        c.pop();
    }


    //
    // Draw scene
    //
    draw(c) {

        const VIEW_TARGET = 720.0;
        const TEXT_SCALE = 48;
        const ENTER_SCALE = 64;
        const PW_GUIDE_SCALE = 32;
        const CENTER_SHIFT = 192;
        const COPYRIGHT_SCALE = 32;
        const COPYRIGHT_OFF = -8;
        const SHADOW_OFF_1 = 8;
        const SHADOW_OFF_2 = 4;
        const LOGO_W = 600;
        const LOGO_H = 360;
        const LOGO_Y = -256;
        const PRESS_F_STR = "Press F to toggle fullscreen";
        const ERROR_Y = TEXT_SCALE;

        c.clear(...BG_COLOR);

        let mx = c.viewport.x / 2;
        let my = c.viewport.y / 2;
        let str = "";
        let bmpLogo = c.bitmaps.logo;

        // Reset view
        c.loadIdentity();
        c.fitViewToDimension(c.w, c.h, VIEW_TARGET);
        c.useTransform();

        // Store viewport
        this.renderWidth = c.viewport.x;
        this.pressFPos %= this.renderWidth;

        // Draw background vortex
        c.toggleTexturing(false);
        this.drawVortex(c);
        c.toggleTexturing(true);

        // Shift
        c.translate(0, CENTER_SHIFT);
        c.useTransform();

        // Compute logo scale
        let lscale = 1.0;
        if (this.phase == -1) {

            lscale = 1.0 - this.waitTimer / WAIT_TIME;
        }

        if (this.phase == 0 || this.phase == -1) {

            c.setGlobalAlpha(lscale);

            c.drawScaledText("Press Enter", mx, my-ENTER_SCALE/2,
                -20, 0, ENTER_SCALE, ENTER_SCALE, true,
                Math.PI*2/6, 8, this.enterWave,
                SHADOW_OFF_1, 0.25, [1, 1, 0.5]);

            c.setGlobalAlpha(1);
        }
        else if (this.phase == 1) {

            // Draw menu
            this.menu.draw(c, TEXT_SCALE);
        }
        else if (this.phase == 2) {

            for (let i = 0; i < 5; ++ i) {

                str += i >= this.pword.length ? "_" : this.pword.charAt(i);
            }

            c.drawScaledText("Enter password and press enter:", 
                mx, my-TEXT_SCALE/2,
                -24, 0, PW_GUIDE_SCALE, PW_GUIDE_SCALE, true,
                null, null, null,
                SHADOW_OFF_2, 0.25, [1, 1, 0.5]);

            c.drawScaledText(str, 
                mx, my-TEXT_SCALE/2 + TEXT_SCALE,
                -20, 0, TEXT_SCALE, TEXT_SCALE, true,
                null, null, null,
                SHADOW_OFF_2, 0.25, [1, 1, 0.5]);    
        }
        else if (this.phase == 3) {

            c.setGlobalAlpha(this.waitTimer / WAIT_TIME);
        }

        // Copyright
        c.loadIdentity();
        c.useTransform();
        c.drawScaledText("$2019 Jani Nyk#nen", 
            mx, c.viewport.y-COPYRIGHT_SCALE+COPYRIGHT_OFF,
            -20, 0, COPYRIGHT_SCALE, COPYRIGHT_SCALE, true,
            null, null, null,
            SHADOW_OFF_2, 0.25, [1, 1, 1]);

        // Compute logo shift
        let logoShift = 0;
        if (this.phase == -1) {

            logoShift = Math.sin(Math.PI*2 * lscale) * LOGO_H/2;
        }

        c.push();
        c.translate(mx, my + LOGO_Y + LOGO_H/2 + logoShift);
        c.rotate((1.0-lscale) * Math.PI*2);
        c.useTransform();

        // Draw logo
        for (let i = 1; i >= 0; -- i) {

            if (i == 0)
                c.setColor(1, 1, 1);
            else
                c.setColor(0, 0, 0, 0.25);

            c.drawScaledBitmap(bmpLogo, 
                -LOGO_W/2*lscale + SHADOW_OFF_1*i, 
                -LOGO_H/2*lscale + SHADOW_OFF_1*i, 
                LOGO_W*lscale, LOGO_H*lscale);
        }

        c.pop();

        // Draw "Press F"
        for (let i = -1; i <= 1; ++ i) {

            c.drawScaledText(PRESS_F_STR, 
                -this.pressFPos + 
                    i *this.renderWidth,
                0, -24, 0, COPYRIGHT_SCALE, COPYRIGHT_SCALE, false,
                null, null, null, SHADOW_OFF_2, 0.25, [1, 1, 1]);
        }

        // Draw error
        if (this.errorTimer > 0) {

            c.setColor(1, 0.5, 0);
            c.drawScaledText("Incorrect password!", 
                mx, ERROR_Y,
                -20, 0, PW_GUIDE_SCALE, PW_GUIDE_SCALE, true);
        }

        c.setGlobalAlpha(1);
    }


    //
    // Change event
    //
    onChange(p) {

        this.errorTimer = 0;
        this.scale = 1;

        if (p != null) {

            this.phase = 1;
            this.menu = this.menuLong;
        }

        this.menu.setCursorPos(p == null ? 0 : 1);
    }

}
