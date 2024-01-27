// Selenium
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

        // Compute output for correct number of cards
        let output: string | string[] =
          `Wrong number of cards - expecting ${config.cards}, found ${values.length}`;
        if (values.length === config.cards) {
          console.log("Loading..."); // 7 cards can be catastrophically slow...
          await Promise.race([
            new Promise<string | string[]>((resolve) => {
              const result = parse_make_24(values, config.get_all);
              resolve(result);
            }),
            new Promise<string>((resolve) =>
              setTimeout(() => resolve("timeout"), config.timeout * 1000),
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
        if (config.clear_screen) {
          console.clear();
        }
        console.log(values);
        console.log(output);

        // Wait for change in cards
        await driver.wait(async () => {
          const new_cards = await driver.findElements(card_el);
          return (
            !keep_running ||
            (await get_card_names(new_cards)).length !== str_values.length
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
    await driver.quit();
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
      return parseInt(str) || 1;
  }
}

// Listen for 'q' to quit the application
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("line", (input) => {
  if (["Q", "q"].includes(input)) {
    console.log("Quitting...");
    keep_running = false;
    rl.close();
  }
});

monitor();

// const test_run = () => {
//   const arr = test_questions; // From test_data.ts
//   const t_s = performance.now();
//
//   const l = arr.length;
//   const round = Math.pow(10, Math.floor(Math.log10(l)) - 2);
//   arr.forEach((v, i) => {
//     const o = parse_make_24(v);
//     o.length || console.log(`Fail: ${v}`);
//     !(i % round) && process.stdout.write(`${i}/${l}\r`);
//   });
//
//   const t_e = performance.now();
//   console.log(`Took ${((t_e - t_s) / 1000).toFixed(2)} seconds`);
// };
