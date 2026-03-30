import { describe, it, expect, vi, beforeEach } from "vitest";
import { SemanticEvaluator } from "./semanticEvaluator";

const semanticallyInvalidHTML = `
<section>
  <h1>Heading 1</h1>
  <section>
    <h2>Heading 2</h2>
    <h2>Another Heading 2</h2>
    <section>
      <h3>Heading 3</h3>
      <section>
        <h4>Heading 4</h4>
        <section>
          <h2>An out of place Heading 2</h2>
          <h5>Heading 5</h5>
          <section>
            <h6>Heading 6</h6>
          </section>
        </section>
      </section>
    </section>
  </section>
</section>
`;

const semanticallyValidHTML = `
<section>
  <h1>Heading 1</h1>
  <section>
    <h2>Heading 2</h2>
    <h2>Another Heading 2</h2>
    <section>
      <h3>Heading 3</h3>
      <section>
        <h4>Heading 4</h4>
        <section>
          <h5>Heading 5</h5>
          <section>
            <h6>Heading 6</h6>
          </section>
        </section>
      </section>
    </section>
  </section>
</section>
`;

describe("SemanticEvaluator", () => {
  describe("isValidUrl", () => {
    it("should return false for a malformed URL", () => {
      const isValidUrl = new SemanticEvaluator("http://example.com").isValidUrl();

      expect(isValidUrl).toBe(false);
    });

    it("should return true for a valid URL", () => {
      const isValidUrl = new SemanticEvaluator("https://example.com").isValidUrl();

      expect(isValidUrl).toBe(true);
    });
  });
  describe("evaluateHeadings", () => {
    describe("Semantically invalid structure", async () => {
      beforeEach(() => {
        vi.stubGlobal(
          "fetch",
          vi.fn().mockResolvedValue({ text: () => Promise.resolve(semanticallyInvalidHTML) }),
        );
      });

      it("should nest headings by level into a semantic tree", async () => {
        const { semanticStructure } = await new SemanticEvaluator(
          "https://example.com",
        ).evaluateHeadings();

        expect(semanticStructure).toEqual([
          {
            tag: "h1",
            content: "Heading 1",
            children: [
              { tag: "h2", content: "Heading 2", children: [] },
              {
                tag: "h2",
                content: "Another Heading 2",
                children: [
                  {
                    tag: "h3",
                    content: "Heading 3",
                    children: [{ tag: "h4", content: "Heading 4", children: [] }],
                  },
                ],
              },
              {
                tag: "h2",
                content: "An out of place Heading 2",
                children: [
                  {
                    tag: "h5",
                    content: "Heading 5",
                    children: [{ tag: "h6", content: "Heading 6", children: [] }],
                  },
                ],
              },
            ],
          },
        ]);
      });

      it("should flag headings that skip more than one level", async () => {
        const { skippedLevels } = await new SemanticEvaluator(
          "https://example.com",
        ).evaluateHeadings();

        expect(skippedLevels).toEqual([
          { tag: "h2", content: "An out of place Heading 2" },
          { tag: "h5", content: "Heading 5" },
        ]);
      });

      it("should flag headings that deviate from the semantic html guidelines", async () => {
        const { incongruentHeadings } = await new SemanticEvaluator(
          "https://example.com",
        ).evaluateHeadings();

        expect(incongruentHeadings).toEqual([{ tag: "h2", content: "An out of place Heading 2" }]);
      });
    });

    describe("Semantically valid structure", async () => {
      beforeEach(() => {
        vi.stubGlobal(
          "fetch",
          vi.fn().mockResolvedValue({ text: () => Promise.resolve(semanticallyValidHTML) }),
        );
      });

      it("should not find any skipped or incongruent headings", async () => {
        const { skippedLevels, incongruentHeadings } = await new SemanticEvaluator(
          "https://example.com",
        ).evaluateHeadings();

        expect(skippedLevels).toEqual([]);
        expect(incongruentHeadings).toEqual([]);
      });
    });
  });
});
