Character sprites are a collection of sprites events can use.
Split to a 4x4 grid, where each cell is a sprite that would be displayed in the right conditions.
All the cells must be of the same size.

Rows indicate facing direction.
From top to bottom: `down`, `left`, `right`, `up`.

Columns indicate frame.
From left to right: `idle`, `1st step`, `2nd step`, `3rd step`.
Events cycle through these frames as they move, looping from `3rd step` back to `idle`, and resetting to `idle` when they stop.

Vanilla OneShot always has the 2nd step frame identical to the idle frame.

For example, Alula:
![[character_sprite_layout_1.png]]

But you only need a complete image like that for events that move around.
Images can have unrelated sprites, such as this example featuring John Margin:
![[character_sprite_layout_2.png]]
These are usually used for set pieces.