# Game

`pip install rembg pillow numpy flask openai`

`python3 -m flask run`

# Web extension

## Build from source

1. Clone the repo
2. Install dependencies with `npm`
3. `npm run build`

### Chrome

1. Go to `chrome://extensions/`.
2. At the top right, turn on `Developer mode`.
3. Click `Load unpacked`.
4. Find and select extension folder(`build/chromium/`).

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click `Load Temporary Add-on`.
3. Find and select the extension file(`build/firefox.zip`).

## License

[GPL-3.0 license](LICENSE).
