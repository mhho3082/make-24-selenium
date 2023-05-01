// Selenium
import { Builder, By, until } from "selenium-webdriver";
import "chromedriver";

// Make 24 parsing
import { parseMake24 } from "./tree.js";

// Environment variables
import env from "../env.js";

// Website to parse for
const playingCardsIO = env.url;

async function monitor() {
  // Set up driver
  const driver = await new Builder().forBrowser("chrome").build();

  // Give generous timeouts for this slow website
  await driver.manage().setTimeouts({ implicit: 300000, pageLoad: 300000 });

  try {
    // Set up locators for reuse
    const enterButton = By.css("button.Splash__start");
    const cardElement = By.css(
      "div.Token--card .CustomSurface .CustomSurface__object"
    );

    // Access the website
    await driver.get(playingCardsIO);

    // Click "Enter"
    await driver.wait(until.elementLocated(enterButton));
    await driver.findElement(enterButton).click();

    // Game loop
    for (; ;) {
      try {
        // Wait and find cards
        await driver.wait(until.elementsLocated(cardElement));
        let cards = await driver.findElements(cardElement);

        // Read the cards' values
        let str_values = [];
        for (const x in cards) {
          let name = await cards[x].getCssValue("background-image");
          if (!name.includes("cardback")) {
            str_values.push(name.match(/french\/\w+-(.*)\.svg/)[1]);
          }
        }

        // Turn face cards into numbers
        let values = str_values.map(cardToInt);

        // Compute output for correct number of cards
        let output = "Wrong number of cards";
        if (values.length === 4) {
          output = parseMake24(values, true);
          if (output.length === 0) {
            output = "No solutions found";
          }
        }

        // Clear and output the data
        console.clear();
        console.log(values);
        console.log(output);
      } catch (ignored) {
        // Ignore errors of card(s) "missing" (recalled)
        if (!ignored.message.includes("stale element reference:")) {
          // Throw all other errors like normal
          throw ignored;
        }
      }
    }
  } catch (err) {
    console.log(err.message);
    console.log();
    console.log("INFO: Don't close the broswer window manually,");
    console.log("      hit Ctrl-C on the terminal instead!");
    console.log();
  } finally {
    await driver.quit();
  }
}

function cardToInt(str) {
  switch (str) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "10":
      return Number(str);
    case "a":
      return 1;
    case "j":
      return 11;
    case "q":
      return 12;
    case "k":
      return 13;
    default:
      return 1;
  }
}

monitor();
