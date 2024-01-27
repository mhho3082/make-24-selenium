<div align="center">

# `make-24-selenium`

_A helpful CLI judge for Make 24 on `playingcards.io`,
using JavaScript, Selenium, and binary trees_

</div>

## Quick start

- Check that Chromium and/or Google Chrome is installed
- Create/have a table in https://playingcards.io
  that uses the inbuilt poker deck
- Install Node.js modules: `yarn`
- Modify `src/config.js` similar to below (all fields are **required**)
- Run this app: `yarn dev`
- Selenium will load the website in a new window,
  and begin to monitor for face-up cards to calculate for make 24
- Enter <kbd>Q</kbd> at the terminal to quit

## Features

- All data input and output are automatic:
  The app manages itself, focus on the game instead
- Easy-to-view interface:
  Unnecessary brackets in answers are automatically removed
- Reliable for long gaming sessions:
  Lazily loaded and handles errors gracefully
- Few dependencies:
  Just Selenium and `chromedriver`

## `config.js` example

```javascript
const config = {
  url: "https://playingcards.io/xxxxxx", // Point to your `playingcards.io` game table
  cards: 4,
  target: 24,
  get_all: true,
  clear_screen: true, // Turn to false for debug
  timeout: 1, // In seconds
};

export default config;
```
