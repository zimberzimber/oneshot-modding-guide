Translation is fairly straight forward, however you're limited to only modifying existing text and assets.
This means you can't add or remove lines, just translate a line of text to another.

## Requirements
- English
- Not English
- A text editor (OR)  something like [po edit](https://poedit.net/).


## Adding a Language

To have your language selectable in game, you must edit the `language.fonts.ini` file to include your language, and indicate which font it should use.
The format is:
```
language_code=font
```

You will have to look up the language code for your language if you don't know what it is.

For example, these contents will allow selecting English, Russian, and Chinese (Simplified):
```
en=Terminus (TTF)
ru=Terminus (TTF)
zh_CN=WenQuanYi Micro Hei
```

So if you are to add Turkish and Brazilian Portuguese, it'd look like this:
```
en=Terminus (TTF)
ru=Terminus (TTF)
tr=Terminus (TTF)
pt_BR=Terminus (TTF)
zh_CN=WenQuanYi Micro Hei
```

Most languages would use the `Terminus (TTF)` font, but some languages, like Chinese, require using a different font.
You can see which fonts are available in vanilla OneShot's `Fonts` directory, or just add your own.

Yes, this also means you can change the font for a language to Wing Dings or whatever, so long as the font in the `Fonts` directory.


## Text

OneShot uses the PO standard for translating text, which you can either use a plain text editor like `Notepad++`, or a dedicated program like [po edit](https://poedit.net/).

If you're editing with a plain text editor, the format is: (See the template file for more examples)
```
# Comment, usually indicating where the text is used
msgid "Untranslated text"
msgstr "Translated text"
```

If you're using `po edit`, then `msgid` is the `source text`, and `msgstr` is `translation`.

To get started, copy a `.op` file from another language, and rename it to the language code of the language you're translating to. (i.e `ru.po` for Russian)
Now you mostly go over the entire file to replace text.


#### Things to keep in mind
- Untranslated text will be in English
- Perfect translation may be impossible
There are puns based on the English language which may not translate well to other languages.

- You must add your language code to the file: (See `en.po` for example)
```
msgid "language code"
msgstr "Displayed text"
```

- You must add the localization version:
```
msgid "POT_VERSION"
msgstr "1.0.0"
```

- These characters are replaced in text with something else:
`\n` - New line
`\.` - Short pause
`\|` - Long pause
`\>` - Wait for input before continuing text
`\p` - Player name
`\@` - Change face sprite
`\\` - Regular backslash
`\v[NNN]` - Print number stored in variable - Replace NNN with variable ID


## Images

Some images also require translation, such as the instructions or journal pages.
See [[Asset Layer]] for that, and use other languages for reference.

