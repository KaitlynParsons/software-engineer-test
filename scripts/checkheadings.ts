import {
  SemanticEvaluator,
  type TreeElement,
  type TreeNode,
} from "../src/utils/semanticEvaluator.ts";

const url = process.argv[2];

if (!url) {
  console.error("Usage: pnpm checkheadings <url>");
  process.exit(1);
}

const printTree = (nodes: TreeNode[] | TreeElement[], depth = 0) => {
  for (const node of nodes) {
    console.log(`${"  ".repeat(depth)}${node.tag}: ${node.content.trim()}`);
    if ("children" in node && node.children.length > 0) {
      printTree(node.children, depth + 1);
    }
  }
};

console.log(`\nChecking headings for: ${url}\n`);

let evaluator: SemanticEvaluator;
try {
  evaluator = new SemanticEvaluator(url, false);
} catch {
  console.error(`Invalid URL: "${url}"`);
  process.exit(1);
}

const { semanticStructure, skippedLevels, incongruentHeadings } =
  await evaluator.evaluateHeadings();

console.log("Semantic Structure:");
if (semanticStructure.length === 0) {
  console.log("  (no headings found)");
} else {
  printTree(semanticStructure);
}

console.log(`\nSkipped Levels: ${skippedLevels.length === 0 ? "none" : ""}`);
for (const skippedLevel of skippedLevels) {
  console.log(`  ${skippedLevel.tag}: ${skippedLevel.content.trim()}`);
}

console.log(`\nIncongruent Headings: ${incongruentHeadings.length === 0 ? "none" : ""}`);
for (const incongruentHeading of incongruentHeadings) {
  console.log(`  ${incongruentHeading.tag}: ${incongruentHeading.content.trim()}`);
}
