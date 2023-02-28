import {
  defineNode,
  NumberInterface,
  SelectInterface,
  NodeInterface,
} from "baklavajs";

export const StateNode = defineNode({
  type: "MathNode",
  title: "Math",
  inputs: {
    operation: () =>
      new SelectInterface("Operation", "Add", ["Add", "Subtract"]).setPort(
        false
      ),
    num1: () => new NumberInterface("Num 1", 1),
    num2: () => new NumberInterface("Num 2", 1),
  },
  outputs: {
    result: () => new NodeInterface("Result", 1),
  },
  calculate({ num1, num2, operation }) {
    if (operation === "Add") {
      return { result: num1 + num2 };
    } else {
      return { result: num1 - num2 };
    }
  },
});
