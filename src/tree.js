// --- TREE STRUCTURE ---

// Environment variables
import env from "../env.js";

class TreeNode {
  constructor(value, isOps = false, left = null, right = null) {
    this.value = value;
    this.isOps = isOps;
    this.left = left;
    this.right = right;
    return this;
  }

  find(value) {
    if (this.value === value) {
      return this;
    }
    if (!this.isOps) {
      return null;
    }

    let temp0 = this.left.find(value);
    if (temp0 !== null) {
      return temp0;
    }
    let temp1 = this.right.find(value);
    if (temp1 !== null) {
      return temp1;
    }

    return null;
  }

  data(value) {
    this.value = value;
    return this;
  }

  clone() {
    return new TreeNode(
      this.value,
      this.isOps,
      this.left === null ? null : this.left.clone(),
      this.right === null ? null : this.right.clone()
    );
  }

  toString() {
    if (this.isOps) {
      let high = this.value === "*" || this.value === "/";

      // Add brackets
      let leftString = this.left.toString();
      if (high && (this.left.value === "+" || this.left.value === "-")) {
        leftString = "(" + leftString + ")";
      }
      let rightString = this.right.toString();
      if (high && (this.right.value === "+" || this.right.value === "-")) {
        rightString = "(" + rightString + ")";
      }
      return leftString + String(this.value) + rightString;
    } else {
      return String(this.value);
    }
  }
}

// Based on https://stackoverflow.com/questions/12292532/generate-all-structurally-distinct-full-binary-trees-with-n-leaves
// Generates a list of something like (n0o0(n1o1(n2o2n3)))
function scaffold_str_gen(n) {
  // Generate something like (no(no(non)))
  let leafnode = "n";
  let dp = [];
  let newset = new Set();
  newset.add(leafnode);
  dp.push(newset);
  for (let i = 1; i < n; i++) {
    newset = new Set();
    for (let j = 0; j < i; j++) {
      for (let leftchild of dp[j]) {
        for (let rightchild of dp[i - j - 1]) {
          newset.add("(" + leftchild + "o" + rightchild + ")");
        }
      }
    }
    dp.push(newset);
  }

  // Turn into something like (n0o0(n1o1(n2o2n3)))
  const base = dp.at(-1);
  let out = [];
  for (let str of base) {
    let o = 0,
      n = 0,
      result = "";
    for (let chr of str.split("")) {
      switch (chr) {
        case "o":
          result += `o${o++}`;
          break;
        case "n":
          result += `n${n++}`;
          break;
        default:
          result += `${chr}`;
          break;
      }
    }
    out.push(result);
  }

  return out;
}

// Generates a tree scaffold based on something like ((((n0o0n1)o1(n2o2n3))o3n4)o4(n5o5n6))
function scaffold_tree_gen(str) {
  let stack = {},
    progress = str.slice(),
    count = 0,
    left,
    right;

  // For checking and finding a base node group
  const main_regexp = /\([^()]+\)/;
  // For splitting a base node group into parent and children
  const split_regexp = /\((?<left>\w\d+)(?<center>\w\d+)(?<right>\w\d+)\)/;

  while (progress.match(main_regexp)) {
    // Split the node group into parent and children
    let matches = split_regexp.exec(progress.match(main_regexp)[0]);

    // Decide if new or existing nodes should be used as children
    if (matches.groups.left.charAt(0) === "n") {
      left = new TreeNode(matches.groups.left);
    } else {
      left = stack[matches.groups.left];
    }
    if (matches.groups.right.charAt(0) === "n") {
      right = new TreeNode(matches.groups.right);
    } else {
      right = stack[matches.groups.right];
    }

    // Add the new node onto the stack
    stack[`x${count}`] = new TreeNode(matches.groups.center, true, left, right);

    // Clean up and repeat
    progress = progress.replace(main_regexp, `x${count}`);
    count++;
  }
  return stack[`x${count - 1}`];
}

let scaffolds_cache = {};
function memo_scaffolds(i) {
  if (!scaffolds_cache[i]) {
    scaffolds_cache[i] = scaffold_str_gen(i).map((str) =>
      scaffold_tree_gen(str)
    );
  }
  return scaffolds_cache[i];
}

const scaffolds = memo_scaffolds(env.cards);

// --- PARSING ---

// Heap's method
// https://stackoverflow.com/questions/9960908/permutations-in-javascript#20871714
function permute(permutation) {
  var length = permutation.length,
    result = [permutation.slice()],
    c = new Array(length).fill(0),
    i = 1,
    k,
    p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}

let perms_cache = {};
function memo_perms(i) {
  if (!perms_cache[i]) {
    perms_cache[i] = permute([...Array(i).keys()]);
  }
  return perms_cache[i];
}

let perms = memo_perms(env.cards);
const operators = ["+", "-", "*", "/"];

// Find expression that evaluate to 24
async function parseMake24(nums, getAll = false) {
  nums.sort();

  let output = new Set();

  for (let scaffold of scaffolds) {
    for (let perm of perms) {
      // Generate inputs
      let temp = scaffold.clone();
      for (let i = 0; i < env.cards; i++) {
        temp.find(`n${i}`).data(nums[perm[i]]);
      }
      let temp_list = [temp];
      for (let i = 0; i < env.cards - 1; i++) {
        temp_list = temp_list.flatMap((x) =>
          operators.map((op) => {
            let xx = x.clone();
            xx.find(`o${i}`).data(op);
            return xx;
          })
        );
      }

      // Calculate
      for (let x of temp_list) {
        let tempOut = x.toString();
        if (eval(tempOut) === env.target) {
          if (getAll) {
            output.add(tempOut);
          } else {
            return [tempOut];
          }
        }
      }
    }
  }

  return Array.from(output);
}

// --- EXPORT ---

export { parseMake24 };
