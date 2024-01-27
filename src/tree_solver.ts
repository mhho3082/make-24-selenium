const CARD_NUM = 4;
const TARGET = 24;

class TreeNode {
  constructor(
    public value: string,
    public left?: TreeNode,
    public right?: TreeNode,
  ) {}

  find(value: string): TreeNode | undefined {
    return this.value === value
      ? this
      : this.left?.find(value) ?? this.right?.find(value);
  }

  data(value: number | string): TreeNode {
    this.value = value.toString();
    return this;
  }

  clone(): TreeNode {
    return new TreeNode(this.value, this.left?.clone(), this.right?.clone());
  }

  toString(): string {
    if (!this.left) {
      // Operator nodes must have left + right at once
      return this.value;
    }
    const high = ["*", "/"].includes(this.value);
    const is_low = (v?: string) => v && ["+", "-"].includes(v);

    let l = this.left?.toString();
    if (high && is_low(this.left?.value)) {
      l = `(${l})`;
    }
    let r = this.right?.toString();
    if (high && is_low(this.right?.value)) {
      r = `(${r})`;
    }
    return `${l}${this.value}${r}`;
  }
}

// Based on https://stackoverflow.com/q/12292532/
// Generates a list of something like (n0o0(n1o1(n2o2n3)))
function scaffold_str_gen(n: number) {
  // Generate something like (no(no(non)))
  let dp: Set<string>[] = [new Set(["n"])]; // Base case with 'n'
  for (let i = 1; i < n; i++) {
    let newset = new Set<string>();
    for (let j = 0; j < i; j++) {
      for (let leftchild of dp[j]) {
        for (let rightchild of dp[i - j - 1]) {
          newset.add(`(${leftchild}o${rightchild})`);
        }
      }
    }
    dp.push(newset);
  }

  // Turn into something like (n0o0(n1o1(n2o2n3)))
  return [...dp.at(-1)!].map((v) => {
    let o = 0,
      n = 0;
    return v.replace(/[no]/g, (m) => (m === "o" ? `o${o++}` : `n${n++}`));
  });
}

// Generates a tree scaffold based on something like ((((n0o0n1)o1(n2o2n3))o3n4)o4(n5o5n6))
function scaffold_tree_gen(str: string) {
  let stack: { [k: string]: TreeNode } = {},
    progress = str.slice(),
    count = 0;

  // For checking and finding a base node group
  const main_regexp = /\([^()]+\)/;
  // For splitting a base node group into parent and children
  const split_regexp = /\((?<left>\w\d+)(?<center>\w\d+)(?<right>\w\d+)\)/;

  while (progress.match(main_regexp)) {
    // Split the node group into parent and children
    const matches = split_regexp.exec(progress.match(main_regexp)![0]);
    const { left: l, right: r, center: c } = matches!.groups!;

    // Decide if new or existing nodes should be used as children
    const c_l = l.charAt(0) === "n" ? new TreeNode(l) : stack[l];
    const c_r = r.charAt(0) === "n" ? new TreeNode(r) : stack[r];

    // Add the new node onto the stack
    stack[`x${count}`] = new TreeNode(c, c_l, c_r);

    // Clean up and repeat
    progress = progress.replace(main_regexp, `x${count}`);
    count++;
  }
  return stack[`x${count - 1}`];
}

const scaffolds = scaffold_str_gen(CARD_NUM).map((str) =>
  scaffold_tree_gen(str),
);

// --- PARSING ---

// Heap's method
// https://stackoverflow.com/q/9960908/
function permute<T>(permutation: T[]) {
  let length = permutation.length,
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
const perms = permute(Array.from({ length: CARD_NUM }).map((_, i) => i));

const ops_combinations = (operators: string[], length: number): string[][] => {
  let out: string[][] = operators.map((v) => [v]);
  for (let i = 1; i < length; i++) {
    out = out.flatMap((a) => operators.map((v) => [...a, v]));
  }
  return out;
};
const ops_combos = ops_combinations(["+", "-", "*", "/"], CARD_NUM - 1);

function arr_uniques<T extends Object>(arr: T[]): T[] {
  const c = arr.map((v) => v.toString());
  return arr.filter((v, i) => c.indexOf(v.toString()) === i);
}

// Find expression that evaluate to 24
export function parse_make_24(
  numbers: number[],
  get_all: boolean = false,
): string[] {
  const nums = numbers.toSorted();
  const num_perms = arr_uniques(perms.map((r) => r.map((i) => nums[i])));

  let output = new Set<string>();

  for (let scaffold of scaffolds) {
    for (let perm of num_perms) {
      // Generate inputs
      const temp = scaffold.clone();
      perm.forEach((v, i) => {
        temp.find(`n${i}`)!.data(v);
      });
      const temp_list = ops_combos.map((arr) => {
        const t = temp.clone();
        arr.forEach((v, i) => t.find(`o${i}`)!.data(v));
        return t;
      });

      // Calculate
      for (let t of temp_list) {
        const t_out = t.toString();
        if (Math.abs(eval(t_out) - TARGET) < 1e-10 /* Epsilon */) {
          if (!get_all) {
            return [t_out];
          }
          output.add(t_out);
        }
      }
    }
  }

  return [...output];
}
