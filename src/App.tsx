import { useState, useEffect } from "react";
import "./App.css";
import { SemanticEvaluator, type SemanticEvaluation } from "./utils/semanticEvaluator";
import beautify, { type JSBeautifyOptions } from "js-beautify";

const beautifyOptions: JSBeautifyOptions = {
  indent_size: 4,
  indent_char: " ",
  max_preserve_newlines: 5,
  preserve_newlines: true,
  keep_array_indentation: false,
  break_chained_methods: false,
  brace_style: "collapse",
  space_before_conditional: true,
  unescape_strings: false,
  jslint_happy: false,
  end_with_newline: false,
  wrap_line_length: 0,
  comma_first: false,
  e4x: false,
  indent_empty_lines: false,
};

function App() {
  const [urlToEvaluate] = useState(new URLSearchParams(window.location.search).get("url"));
  const [semanticEvaluation, setSemanticEvaluation] = useState<SemanticEvaluation | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!urlToEvaluate) return;

    (async () => {
      try {
        const semanticEvaluator = new SemanticEvaluator(urlToEvaluate);
        const headingsEvaluation = await semanticEvaluator.evaluateHeadings();
        setSemanticEvaluation(headingsEvaluation);
      } catch {
        setIsError(true);
      }
    })();
  }, [urlToEvaluate]);

  if (!urlToEvaluate) {
    return (
      <section id="center">
        <p>No URL provided.</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="center">
        <p>Invalid URL.</p>
      </section>
    );
  }

  if (!semanticEvaluation) {
    return (
      <section id="center">
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section id="center">
      <pre>{beautify.js_beautify(JSON.stringify(semanticEvaluation), beautifyOptions)}</pre>
    </section>
  );
}

export default App;
