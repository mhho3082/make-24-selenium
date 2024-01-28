import { test_questions } from "./test_data.js";
import { parse_make_24 } from "./tree_solver.js";

const arr = test_questions; // From test_data.ts
const t_s = performance.now();

const l = arr.length;
const round = Math.pow(10, Math.floor(Math.log10(l)) - 2);
arr.forEach((v, i) => {
  const o = parse_make_24(v);
  o.length || console.log(`Fail: ${v}`);
  !(i % round) && process.stdout.write(`${i}/${l}\r`);
});

const t_e = performance.now();
console.log(`Took ${((t_e - t_s) / 1000).toFixed(2)} seconds`);
