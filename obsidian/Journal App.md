Aka `_______.exe` or the clover app, is a separate program.
Other than displaying the journal pages, it also handles Niko walking out of the game window.

You can't modify its behavior without delving into the [[Engine Layer]], but you can modify the graphics of the pages.

The journal pulls the pages from the game's `Graphics/Journal` and `Graphics/Fogs/_` directories, which you can modify.
The only exceptions to that are the default white clover cover, and the sprite of Niko walking on your screen, as they're hardcoded into the executable.

You'll notice that `Graphics/Journal` contains Niko's sprites, but the journal doesn't use them.

By the way, you can spawn Niko on your screen by executing `_______.exe X Y`, replacing the X and Y with initial screen coordinates, from the app's directory.