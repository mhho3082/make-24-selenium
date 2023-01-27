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
    "x",
    true,
    new TreeNode(
      "y",
      true,
      new TreeNode("z", true, new TreeNode("a"), new TreeNode("b")),
      new TreeNode("c")
    ),
    new TreeNode("d")
  ),
  new TreeNode(
    "x",
    true,
    new TreeNode(
      "y",
      true,
      new TreeNode("a"),
      new TreeNode("z", true, new TreeNode("b"), new TreeNode("c"))
    ),
    new TreeNode("d")
  ),
  new TreeNode(
    "x",
    true,
    new TreeNode("a"),
    new TreeNode(
      "y",
      true,
      new TreeNode("z", true, new TreeNode("b"), new TreeNode("c")),
      new TreeNode("d")
    )
  ),
  new TreeNode(
    "x",
    true,
    new TreeNode("a"),
    new TreeNode(
      "y",
      true,
      new TreeNode("b"),
      new TreeNode("z", true, new TreeNode("c"), new TreeNode("d"))
    )
  ),
  new TreeNode(
    "x",
    true,
    new TreeNode("y", true, new TreeNode("a"), new TreeNode("b")),
    new TreeNode("z", true, new TreeNode("c"), new TreeNode("d"))
  ),
];

// --- PARSING ---

// python -c "import itertools; print(list(itertools.permutations([0,1,2,3])))"
const perms = [
  [0, 1, 2, 3],
  [0, 1, 3, 2],
  [0, 2, 1, 3],
  [0, 2, 3, 1],
  [0, 3, 1, 2],
  [0, 3, 2, 1],
  [1, 0, 2, 3],
  [1, 0, 3, 2],
  [1, 2, 0, 3],
  [1, 2, 3, 0],
  [1, 3, 0, 2],
  [1, 3, 2, 0],
  [2, 0, 1, 3],
  [2, 0, 3, 1],
  [2, 1, 0, 3],
  [2, 1, 3, 0],
  [2, 3, 0, 1],
  [2, 3, 1, 0],
  [3, 0, 1, 2],
  [3, 0, 2, 1],
  [3, 1, 0, 2],
  [3, 1, 2, 0],
  [3, 2, 0, 1],
  [3, 2, 1, 0],
];

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
            temp.find("a").data(nums[perms[permPtr][0]]);
            temp.find("b").data(nums[perms[permPtr][1]]);
            temp.find("c").data(nums[perms[permPtr][2]]);
            temp.find("d").data(nums[perms[permPtr][3]]);
            temp.find("x").data(operators[op0]);
            temp.find("y").data(operators[op1]);
            temp.find("z").data(operators[op2]);

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
