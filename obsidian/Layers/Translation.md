This article is mostly a reiteration of [the original fan translation guide](https://steamcommunity.com/app/420530/discussions/2/3598968030055831716/).


## Decide on Language Code
A "language code" is a short code identifying a language.
It helps the game correlate resources with their associated language.
Scan [this list of conventional language codes](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) for the language you want to translate to, and stick to that.
e.g. `en` stands for English, `ru` for Russian, `ja` for Japanese.

While it's best you stick to the conventional codes, nothing is stopping you from coming up with your own unconventional code if you so desire.
This is useful for when you're translating to a language that doesn't have a standard code, to distinguish a translation variation, or to be funny.
e.g. `ru-m`/`ru-f` for Russian referring to Niko as a male/female, `yar` for a pirate translation, `uǝ` for upside down English, `en-1337` for 3ngl1sh 1337 sp34k.


## Adding the Language
Navigate to the `Languages` folder, and find the `language_fonts.ini` file, which should look something like this:
```ini
en=Terminus (TTF)
fr=Terminus (TTF)
ko=WenQuanYi Micro Hei
zh_CN=WenQuanYi Micro Hei
ja=HigashiOme Gothic regular
```
The format being `language_code=font_name`

In this example, the language codes `en`, `fr`, `ko`, `zh_CN`, and `ja` are defined as available languages.
`en` and `fr` are assigned the `Terminus (TTF)` font, `ko` is assigned the `WenQuanYi Micro Hei`, etc.

The language should be selectable in-game after this step.

#### Fonts
It's best you stick to the `Terminus (TTF)` font.
If your text doesn't render right in game, it's probably because the font doesn't support the language, in which case you should try one of the other fonts that come with the game in the `Fonts` folder.

In case none of them support your language, you may add any TrueType Font (`.ttf`) to the `Fonts` and use that.
**Make sure you're allowed to distribute it.**


## Adding the Language for Input Settings Window
The input settings window (invoked via `F1` in-game by default) should also be translated, but is configured separately.

First, repeat the previous process for the file located at: `Languages/internal/language_fonts.ini`.
The `language_sizes.ini` file next to it decides the font size in the input window, and follows the same format, with font size instead of font: 
```ini
en=12
fr=12
ko=16
zh_CN=16
ja=16
```


## Adding the Translation
OneShot's translation files are plain-text files adhering to the PO standard, located in the `Languages` folder.
You can use any plain-text editor like [Notepad++](https://notepad-plus-plus.org/), or a dedicated program like [Poedit](https://poedit.com/) to write them.

First, make a copy of `en.po` in the `Languages` folder, and rename it to match your language code, leaving the `.po` extension.
e.g. `ru.po`, `ja.po`

If you're editing with a plain text editor, the format is:
```po
# Comment, usually indicating where the text is used
msgid "Untranslated text"
msgstr "Translated text"
```

If you're using `Poedit`, then `msgid` is the `source text`, and `msgstr` is `translation`.

From here, it's just writing the translation for each line into `msgstr`.


#### Things to keep in mind
- Untranslated text will be in English

- Perfect translation may be impossible
There are puns based on the English language which may not translate well to other languages.

- You must add your language code to the file: (See `en.po` for example)
```po
msgid "language code"
msgstr "Displayed text"
```

- You must add the localization version:
```po
msgid "POT_VERSION"
msgstr "1.0.0"
```

- See [[Text Formatting]] about special text characters.


## Adding the Translation for Input Settings Window
Same as the previous step, but in `Languages/internal`.
**Use a plain text editor instead of a dedicated program**, as the order of the keys matters here, and dedicated programs may cause issues.


## Assets
Many assets require translating as well, primarily images.
The original untranslated assets will be located in the folder dedicated to their asset.
e.g. `Graphics/Pictures/book_clover.png`.
Translated assets should be located under a language code in that directory.
e.g. `Graphics/Pictures/ru/book_clover.png` for Russian.

The original article provided a list, with additional resources and instructions for vanilla translation:
```
Wallpapers:  
Wallpaper/{language_code}/save_unix.png  
Wallpaper/{language_code}/save_w32.bmp  
  
NPCs:  
Graphics/Characters/{language_code}/green_npc_misc.png (if you want to translate the "BAA" on the one ram in the secret ram club)  
  
Solstice Password files:  
Graphics/Fogs/_/scenario1/{language_code}/pw1.png  
Graphics/Fogs/_/scenario1/{language_code}/pw2.png  
Graphics/Fogs/_/scenario1/{language_code}/pw3.png  
Graphics/Fogs/_/scenario1/{language_code}/pw4.png  
Graphics/Fogs/_/scenario2/{language_code}/pw1.png  
Graphics/Fogs/_/scenario2/{language_code}/pw2.png  
Graphics/Fogs/_/scenario2/{language_code}/pw3.png  
Graphics/Fogs/_/scenario2/{language_code}/pw4.png  
(scenario1 is used for after beating your first loop of the game, scenario2 is a set of similar files but are meant to be used if you're on a NG+ run and at the countdown door in refuge, originally meant for people waiting for the solstice countdown to end)  
  
Item Icons:  
Graphics/Icons/{language_code}/item_red_button.png  
Graphics/Icons/{language_code}/item_red_button_taped.png  
Graphics/Icons/{language_code}/item_red_magnetized_button.png  
Graphics/Icons/{language_code}/item_red_tin.png  
Graphics/Icons/{language_code}/item_red_youtried.png  
(these need to be changed only if you want to change the text on the elevator "GROUND" button to something else in the target language)  
  
Journal Pages:  
Graphics/Journal/{language_code}/  
All the images in this folder need to be localized. They also need to be saved specifically as 24bit bitmaps, with NO color space information saved.  
  
Pictures:  
Graphics/Pictures/{language_code}/book_clover.png  
Graphics/Pictures/{language_code}/book_dice.png  
Graphics/Pictures/{language_code}/book_fauna.png  
Graphics/Pictures/{language_code}/book_phosphor1.png  
Graphics/Pictures/{language_code}/book_phosphor2.png  
Graphics/Pictures/{language_code}/book_phosphor3.png  
Graphics/Pictures/{language_code}/book_phosphor4.png  
Graphics/Pictures/{language_code}/book_prophet.png  
Graphics/Pictures/{language_code}/book_prophetbot.png  
Graphics/Pictures/{language_code}/book_sketch.png  
Graphics/Pictures/{language_code}/cg_desktop.png (only if you want to translate the "MENU" in the bottom left)  
Graphics/Pictures/{language_code}/cg_map.png (also optional)  
Graphics/Pictures/{language_code}/choice0.png  
Graphics/Pictures/{language_code}/choice1.png  
Graphics/Pictures/{language_code}/choice2.png  
Graphics/Pictures/{language_code}/instruction1.png  
Graphics/Pictures/{language_code}/instruction2.png  
Graphics/Pictures/{language_code}/instruction3.png  
Graphics/Pictures/{language_code}/instruction4.png  
Graphics/Pictures/{language_code}/pj_portal.png  
  
Tilesets:  
Tilesets/{language_code}/red_alley.png  
Tilesets/{language_code}/red_in.png

For many of the pictures (like the ones in the Pictures folder, or the Journal pages), having the source images will be very helpful in creating localized versions of these images. You can access the source files for these images in the "loc_files" beta branch, which can be accessed via the password "localization". The files will appear in the game files in the "Localization Images" folder. I recommend only using this beta branch for grabbing these files, since this beta branch won't contain anything else. Also these files are .psd or .xcf files, so I'd recommend using photoshop or GIMP to open and edit them.
```

For mods, either the developer would have to provide you with a similar list, or you'd have to scan resources for translation on your own.


## Distribution
**It is your responsibility to only distribute the files you've modified.**
Do not distribute the entire game.
Do not distribute unrelated files which may mess with the game in unexpected ways, like map changes.
Do not distribute assets you're not allowed to distribute, like commercial fonts.
***ONLY*** changes you made for the translation.

It's also best if your distribution is a drag-and-drop solution, like dragging files out of a zip archive onto the game's directory.