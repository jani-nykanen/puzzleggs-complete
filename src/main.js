import { Core } from "./core.js";
import { Game } from "./game.js";
import { Ending } from "./ending.js";
import { TitleScreen } from "./title.js";
import { Intro } from "./intro.js";

//
// Main file (who would have guessed)
// (c) 2019 Jani Nykänen
//


// Called when the page is loaded
window.onload = () => {

    let c = new Core();
    c.addScene(new Game(c.ev), "game", false);
    c.addScene(new Ending(c.ev), "ending", false);
    c.addScene(new TitleScreen(c.ev, c.canvas), "title", false);
    c.addScene(new Intro(c.ev), "intro", true);

    // Set assets loading
    c.ev.assets.addBitmaps(
        {name: "face", src: "assets/bitmaps/face.png"},
        {name: "logo", src: "assets/bitmaps/logo.png"}
    );
    c.ev.assets.addSounds(
        {name: "accept", src: "assets/audio/accept.wav"},
        {name: "choose", src: "assets/audio/choose.wav"},
        {name: "start", src: "assets/audio/start.wav"},
        {name: "reject", src: "assets/audio/reject.wav"},
        {name: "pause", src: "assets/audio/pause.wav"},
    );

    c.run(60);
}
