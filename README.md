<div align="center">

# `make-24-selenium`

_A helpful CLI judge for Make 24 on `playingcards.io`,
using JavaScript, Selenium, and binary trees_

</div>

## Quick start

- Check that Chromium and/or Google Chrome is installed
- Create/have a table in https://playingcards.io
  that uses the inbuilt poker deck
- Install Node.js modules: `node i`
- Create/modify a `env.js` similar to below (all fields are **required**)
- Run this app: `npm start`
- Selenium will load the website in a new window,
  and begin to monitor for face-up cards to calculate for make 24
- Press `Ctrl-C` at the terminal to quit

## Features

- All data input and output are automatic:
  The app manages itself, focus on the game instead
- Easy-to-view interface:
  Unnecessary brackets in answers are automatically removed
- Reliable for long gaming sessions:
  Lazily loaded and handles errors gracefully
- Few dependencies:
  Just Selenium and `chromedriver`

## `env.js` example

```javascript
const env = {
  url: "https://playingcards.io/xxxxxx", // Point to your `playingcards.io` game table
  cards: 4,
  target: 24,
  getAll: true,
  clearScreen: true, // Turn to false for debug
  timeout: 1000, // In milliseconds
};

export default env;
```

## Changelog

- v0.1.0: 09/01/2023, Initialize app
- v0.1.1: 16/01/2023, Fully fix DOM element disappear error
- v0.1.2: 01/05/2023, Dynamic tree generation

## To-dos

- Setting the `playingcards.io` game URL with external file
- Enabling variable target card numbers and target result
  - Storing the binary tree generation results in hash maps
