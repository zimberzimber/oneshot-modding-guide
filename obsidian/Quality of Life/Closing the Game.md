Given OneShot's nature, just closing the game becomes a hassle when repeated often, especially if you're testing a long cutscene and need to cut it in the middle.

You can use either the task manager or this script to kill OneShot:
```batch
taskkill /F /IM oneshot.exe
```

On the [[Script Layer]], you could have the game check if you're in debug mode when attempting to close the game for a quicker shut down, skipping all the checks and prompts.

On the [[Engine Layer]], you could include a key bind to kill OneShot if you're in debug mode.