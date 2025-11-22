# Import/Export Guide

This document outlines the process for exporting and importing card boxes in the Easy Leitner application.

## Exporting a Box

You can export any of your boxes into a `.zip` archive. This is useful for backups, sharing with others, or moving your data between devices.

1.  From the main "Boxes" screen, find the box you wish to export.
2.  Tap the **Export** icon (a box with an arrow pointing out) on that box's card.
3.  The app will generate a `.zip` file.
4.  Your device's standard sharing menu will appear, allowing you to save the file to your device, send it to another app, or share it with a contact.

## Importing a Box

You can import a box from a previously exported `.zip` file.

1.  From the main "Boxes" screen, tap the **Import** icon (a box with an arrow pointing in).
2.  A modal will appear asking for a **New Box Name** and a file.
3.  Enter the name you'd like the new box to have.
4.  Tap **"Select File"** and use your device's file browser to locate and select the desired `.zip` archive.
5.  Tap **"Import"**. The app will process the file, create the new box, import the cards, and upload any included media files.

## ZIP File Structure

The `.zip` archive must follow a specific structure to be imported correctly. It should contain:

1.  **`cards.json`**: (Required) A JSON file containing all the card data.
2.  **`data/`**: (Optional) A directory containing any local media files (e.g., audio clips) referenced in `cards.json`.

### Example Structure:

```
my-german-verbs.zip
├── cards.json
└── data/
    ├── gehen.mp3
    └── sprechen.mp3
```

## `cards.json` File Format

The `cards.json` file defines the structure and content of the cards to be imported.

*   **`version`**: The version of the file format. Currently "1.0".
*   **`cards`**: An array of card objects. Each object in the array must have a single key: `config`.
*   **`config`**: An object containing the card's data. The `type` field determines the other required fields in the object.

### Local File References

To link a local media file from the `data/` directory, the value for a file field (like `voice_file_url` or `pronunciation_file_url`) should be a string prefixed with `@data/`.

**Example:** `"@data/gehen.mp3"`

### Example `cards.json`:

```json
{
  "version": "1.0",
  "cards": [
    {
      "config": {
        "type": "standard",
        "front": "Hello",
        "back": "World"
      }
    },
    {
      "config": {
        "type": "spelling",
        "voice_file_url": "@data/moon.mp3",
        "spelling": "moon"
      }
    },
    {
      "config": {
        "type": "german-verb-conjugator",
        "verb": "gehen",
        "pronunciation_file_url": "@data/gehen.mp3",
        "ich": "gehe",
        "du": "gehst",
        "er/sie/es": "geht",
        "wir": "gehen",
        "ihr": "geht",
        "sie": "gehen"
      }
    }
  ]
}
```
