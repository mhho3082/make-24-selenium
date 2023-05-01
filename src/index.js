// Selenium
import { Builder, By, until } from "selenium-webdriver";
import "chromedriver";

// Make 24 parsing
import { parseMake24 } from "./tree.js";

// Environment variables
import env from "../env.js";

async function monitor() {
  // Set up driver
  const driver = await new Builder().forBrowser("chrome").build();

  // Give generous timeouts for this slow website
  await driver.manage().setTimeouts({ implicit: 300000, pageLoad: 300000 });

  try {
    // Set up locators for reuse
    const enterButton = By.css("button.Splash__start");
    const cardElement = By.css(
      "div.Token--card div.CustomSurface div.CustomSurface__object"
    );

    // Access the website
    await driver.get(env.url);

    // Click "Enter"
    await driver.wait(until.elementLocated(enterButton));
    await driver.findElement(enterButton).click();

    // Game loop
    for (;;) {
      // Wait and find cards
      await driver.wait(until.elementsLocated(cardElement));
      let cards = await driver.findElements(cardElement);

      // Read the cards' values
      let str_values = [];
      for (const x of cards) {
        let name = await x.getCssValue("background-image");
        if (!name.includes("cardback")) {
          str_values.push(name.match(/french\/\w+-(.*)\.svg/)[1]);
        }
      }

      // Turn face cards into numbers
      let values = str_values.map(cardToInt);

      // Compute output for correct number of cards
      let output = `Wrong number of cards - expecting ${env.cards}, found ${values.length}`;
      if (values.length === env.cards) {
        console.log("Loading..."); // 7 cards can be catastrophically slow...
        await Promise.race([
          parseMake24(values, env.getAll),
          new Promise((resolve) =>
            setTimeout(() => resolve("timeout"), env.timeout)
          ),
        ]).then((x) => {
          if (x === "timeout") {
            output = "Timeout hit!";
          } else if (x.length === 0) {
            output = "No solutions found";
          } else {
            output = x;
          }
        });
      }

      // Clear and output the data
      if (env.clearScreen) {
        console.clear();
      }
      console.log(values);
      console.log(output);

      // Wait for change in cards
      await driver.wait(async () => {
        const newCards = await driver.findElements(cardElement);
        return newCards.length !== cards.length;
      });
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
