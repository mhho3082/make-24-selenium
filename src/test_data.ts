import { JSDOM } from "jsdom";

// https://www.4nums.com/game/difficulties/

process.stdout.write("Loading test data...\r");

const dom = new JSDOM(
  await (await fetch("https://www.4nums.com/game/difficulties/")).text(),
);
const document = dom.window.document;
const table = document.querySelector("table");
const rows = Array.from(table?.rows ?? []);

const arr = rows.map((row) => {
  return Array.from(row.cells).map((cell) => cell.textContent || "");
});

// Remove header row
arr.shift();

export const test_questions: number[][] = arr.map((v) =>
  v[1]
    .trim()
    .split(/\s+/)
    .map((v) => parseInt(v)),
);

console.log("Loading test data OK!");
