import { parseHTML } from "linkedom";

export interface TreeElement {
  tag: string;
  content: string;
}

export interface TreeNode extends TreeElement {
  children: TreeElement[];
}

export type SemanticEvaluation = {
  semanticStructure: TreeNode[];
  skippedLevels: TreeElement[];
  incongruentHeadings: TreeElement[];
};

/**
 * Given a URL, evaluates the semantic heading structure of a web page.
 *
 * Usage:
 *
 * const evaluator = new SemanticEvaluator("https://example.com");
 *
 * if (evaluator.isValidUrl()) {
 *
 * return evaluator.evaluateHeadings();
 *
 * }
 */
export class SemanticEvaluator {
  private url: string;
  private isBrowser: boolean;

  constructor(url: string, isBrowser: boolean = true) {
    this.url = url;
    this.isBrowser = isBrowser;
  }

  /**
   * Fetches the page at the configured URL and analyses its heading elements.
   *
   * @returns An object with three fields:
   * - `semanticStructure` — the headings arranged as a nested tree, where each
   *   heading's children are the headings that logically fall beneath it.
   * - `skippedLevels` — headings whose level jumps by more than one step from
   *   the previous heading (in either direction, e.g. h2 followed by h5).
   * - `incongruentHeadings` — headings that jump backwards in level by more
   *   than one step (e.g. h4 followed by h2), indicating a heading that
   *   appears higher in the hierarchy than expected.
   */
  public async evaluateHeadings(): Promise<SemanticEvaluation> {
    const document = await this.parseDOMFromUrl();
    // grab every heading element in the order they appear in the document
    const elements = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    // tracks the current path down the tree so we know where to attach the next heading
    const stack: { level: number; node: TreeNode }[] = [];
    const semanticStructure: TreeNode[] = [];
    const skippedLevels: TreeElement[] = [];
    const incongruentHeadings: TreeElement[] = [];
    let previousLevel = 0;

    for (const element of elements) {
      // extract the number from the tag name, e.g. "H3" -> 3
      const level = parseInt(element.tagName[1]);
      const node: TreeNode = {
        tag: element.tagName.toLowerCase(),
        content: element.textContent ?? "",
        children: [],
      };

      // flag any heading that jumps more than one level away from the previous one
      if (previousLevel > 0 && Math.abs(level - previousLevel) > 1) {
        skippedLevels.push({ tag: node.tag, content: node.content });
      }

      // flag headings that jump backwards up the hierarchy by more than one level
      if (previousLevel > 0 && level < previousLevel && previousLevel - level > 1) {
        incongruentHeadings.push({ tag: node.tag, content: node.content });
      }

      // pop headings off the stack that are at the same level or deeper,
      // so the stack top always points to this heading's direct parent
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      // if the stack is empty this is a root-level heading, otherwise attach it as a child
      if (stack.length === 0) {
        semanticStructure.push(node);
      } else {
        stack[stack.length - 1].node.children.push(node);
      }

      stack.push({ level, node });
      previousLevel = level;
    }

    return {
      semanticStructure,
      skippedLevels,
      incongruentHeadings,
    };
  }

  /**
   * Checks whether the configured URL is valid and uses the HTTPS protocol.
   *
   * @returns `true` if the URL is well-formed and secure, `false` otherwise.
   */
  public isValidUrl(): boolean {
    try {
      const url = new URL(this.url);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }

  /**
   * Fetches the HTML for the configured URL through the proxy endpoint and
   * parses it into a DOM document that can be queried like a normal browser
   * document.
   *
   * @returns A `Document` representing the parsed HTML of the page.
   */
  private async parseDOMFromUrl(): Promise<Document> {
    // use a built in vite proxy for dev purposes to bypass CORS in the browser/react app
    const response = await fetch(
      this.isBrowser ? `/api/proxy?url=${encodeURIComponent(this.url)}` : this.url,
    );
    const html = await response.text();
    const { document } = parseHTML(html);
    return document;
  }
}
