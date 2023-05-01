// --- TREE STRUCTURE ---

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

const scaffolds = [
  new TreeNode(
    "o0",
    true,
    new TreeNode(
      "o1",
      true,
      new TreeNode("o2", true, new TreeNode("n0"), new TreeNode("n1")),
      new TreeNode("n2")
    ),
    new TreeNode("n3")
  ),
  new TreeNode(
    "o0",
    true,
    new TreeNode(
      "o1",
      true,
      new TreeNode("n0"),
      new TreeNode("o2", true, new TreeNode("n1"), new TreeNode("n2"))
    ),
    new TreeNode("n3")
  ),
  new TreeNode(
    "o0",
    true,
    new TreeNode("n0"),
    new TreeNode(
      "o1",
      true,
      new TreeNode("o2", true, new TreeNode("n1"), new TreeNode("n2")),
      new TreeNode("n3")
    )
  ),
  new TreeNode(
    "o0",
    true,
    new TreeNode("n0"),
    new TreeNode(
      "o1",
      true,
      new TreeNode("n1"),
      new TreeNode("o2", true, new TreeNode("n2"), new TreeNode("n3"))
    )
  ),
  new TreeNode(
    "o0",
    true,
    new TreeNode("o1", true, new TreeNode("n0"), new TreeNode("n1")),
    new TreeNode("o2", true, new TreeNode("n2"), new TreeNode("n3"))
  ),
];

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

let perms = memo_perms(4);
const operators = ["+", "-", "*", "/"];

// Find expression that evaluate to 24
function parseMake24(nums, getAll = false) {
  nums.sort();

  let output = new Set();

  // Generate all possible strings
  for (const scaffoldPtr in scaffolds) {
    for (const permPtr in perms) {
      for (const op0 in operators) {
        for (const op1 in operators) {
          for (const op2 in operators) {
            let temp = scaffolds[scaffoldPtr].clone();
            temp.find("n0").data(nums[perms[permPtr][0]]);
            temp.find("n1").data(nums[perms[permPtr][1]]);
            temp.find("n2").data(nums[perms[permPtr][2]]);
            temp.find("n3").data(nums[perms[permPtr][3]]);
            temp.find("o0").data(operators[op0]);
            temp.find("o1").data(operators[op1]);
            temp.find("o2").data(operators[op2]);

            let tempOut = temp.toString();
            if (eval(tempOut) === 24) {
              if (getAll) {
                output.add(tempOut);
              } else {
                return [tempOut];
              }
            }
          }
        }
      }
    }
  }

  return Array.from(output);
}

// --- EXPORT ---

export { parseMake24 };
