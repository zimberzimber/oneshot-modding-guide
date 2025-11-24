Some of OneShot's maps have events that run once you enter the map.

They're just events set to `Parallel Processing` trigger to run a few RMXP commands, then delete themselves.
Usually located in some corner of the map, and really hard to find sometimes.


## Examples from the Barrens:
Disable fast travel indoors in the `Outpost interior` map.
Should be in all locations you don't want the player fast traveling from.
![[init_events_1.png]]

Change the ambient lighting in the `Start point` map.
It applies a specific predefined tone via script, which is separate from the regular screen tone you can set, as it only work while Niko isn't carrying the lightbulb.
![[init_events_2.png]]

Change Niko's sprite to not wear the gas mask in the `Docks` map.
Most commonly used in the Refuge when going in to/out of buildings.
![[init_events_3.png]]