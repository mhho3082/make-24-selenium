<div align="center">

# `make-24-selenium`

_A helpful CLI judge for a Make 24 game,
using JavaScript, Selenium, and binary trees_

</div>

## Quick start

- Check that Chromium and/or Google Chrome is installed
- Create/have a table in https://playingcards.io
  that uses the inbuilt poker deck
- Install Node.js modules: `yarn` or `node i`
- Create a `env.json` with a `"url"`
  pointing to your `playingcards.io` game table
- Run this app: `yarn monitor`,
  or `npm run monitor`, or `node src/index.js`
- Selenium will load the website in a new window,
  and begin to monitor for face-up cards to calculate for make 24
- Press `Ctrl-C` at the terminal to quit

## Features

- All data input and output are automatic:
  The app manages itself, focus on the game instead
- Easy-to-view interface:
  Unnecessary brackets in answers are automatically removed
- Reliable for long gaming sessions:
  Can easily survive DOM element disappearing
- Few dependencies:
  Just Selenium and `chromedriver`

## Changelog

- v0.1.0: 09/01/2023, Initialize app
- v0.1.1: 16/01/2023, Fully fix DOM element disappear error

## To-dos

- Setting the `playingcards.io` game URL with external file
- Enabling variable target card numbers and target result
  - Storing the binary tree generation results in hash maps
