import { Builder, By, WebElement, until } from "selenium-webdriver";
import "chromedriver";

import { createInterface } from "readline";

import { parse_make_24 } from "./tree_solver.js";
import config from "./config.js";

async function get_card_names(cards: WebElement[]) {
  let arr = [];
  for (const card of cards) {
    let name = await card.getCssValue("background-image");
    if (name && !name.includes("cardback")) {
      arr.push(name.match(/french\/\w+-(.*)\.svg/)![1]);
    }
  }
  return arr;
}

function cli(...values: any[]) {
  if (config.clear_screen) {
    console.clear();
  }
  for (const value of values) {
    console.log(value);
  }
}

// Running flag
let keep_running = true;

async function monitor() {
  // Set up driver
  const driver = await new Builder().forBrowser("chrome").build();

  // Give generous timeouts for this slow website
  await driver.manage().setTimeouts({ implicit: 300000, pageLoad: 300000 });

  try {
    // Set up locators for reuse
    const enter_el = By.css("button.Splash__start");
    const card_el = By.css(
      "div.Token--card div.CustomSurface div.CustomSurface__object",
    );

    // Access the website
    await driver.get(config.url);

    // Click "Enter"
    await driver.wait(until.elementLocated(enter_el));
    await driver.findElement(enter_el).click();

    // Game loop
    while (keep_running) {
      try {
        // Wait and find cards
        await driver.wait(until.elementsLocated(card_el));
        let cards = await driver.findElements(card_el);

        // Read the cards' values
        let str_values = await get_card_names(cards);

        // Turn face cards into numbers
        let values = str_values.map(card_to_i);

        let output: string | string[] =
          `${values.length}/${config.cards} cards`;

        // Compute output if number of cards is correct
        if (values.length === config.cards) {
          // Set up loading screen
          // 7 cards can be catastrophically slow...
          cli(values, "Calculating solutions...");

          const temp = await Promise.race([
            new Promise<string[]>((resolve) =>
              resolve(parse_make_24(values, config.get_all)),
            ),
            new Promise<string>((resolve) =>
              setTimeout(
                () => resolve("Timeout hit!"),
                Math.round(config.timeout * 1000),
              ),
            ),
          ]);

          output = temp.length === 0 ? "No solutions found" : temp;
        }

        // Clear and output the data
        cli(values, output);

        // Wait for change in cards
        await driver.wait(async () => {
          const new_cards = await driver.findElements(card_el);
          return (
            !keep_running ||
            (await get_card_names(new_cards)).join(",") !== str_values.join(",")
          );
        });
      } catch (err: any) {
        if (err.name === "StaleElementReferenceError") {
          // Ignore losing DOM access to an element
          continue;
        } else {
          throw err;
        }
      }
    }
  } catch (err: any) {
    if (err.name === "NoSuchWindowError") {
      // User closed the automated window by themeselves
      console.error("");
      console.error("INFO: Don't close the broswer window manually,");
      console.error("      enter Q on the command line instead!");
    } else {
      // It was a legitimate error
      console.error("");
      console.error(err.stack);
    }
  } finally {
    await driver.quit(); // Close the driver
    rl.close(); // Close the CLI
  }
}

function card_to_i(str: string) {
  switch (str) {
    case "a":
      return 1;
    case "j":
      return 11;
    case "q":
      return 12;
    case "k":
      return 13;
    default:
      return parseInt(str) || 1; // Should not have 0
  }
}

// Listen for 'q' to quit the application
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("line", (input) => {
  if (["Q", "q"].includes(input)) {
    keep_running = false;
  }
});

monitor();
