# Semantic structure from heading elements and semantic-structural incongruence in web pages

## A take-home challenge for software engineers.

Please read these instructions in full before commencing the challenge.

### Background

In web pages, heading elements (`h1-h6`) are used to impose semantic structure on the content appearing in the page. They can be used to break an article into chapters or sections, with `h1` being a top-level heading, `h2` being the heading one level down and so on. In other words the semantics of the heading elements arise from the weight they carry in relation to one another. However, there is no explicit containment hierarchy between these headings. Thus, it is the responsibility of the page author or generator to use heading elements in a semantically appropriate way.

One "problem" that arises is skipping heading levels. For example, going from `h2` to `h4` without a `h3` in between. While this is also valid HTML, [it isn't best practice](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements#Usage_notes).

Often, heading elements appear within the context of structural elements, such as `<div>` elements that have no real semantics attached to them, or structural elements, such as `<section>`, which _do_ carry meaning within the structure of a web page. Sometimes, an incongruence or conflict emerges between the innate semantics of the heading elements and imposed semantics due to the use of nested structural elements. As the HTML Standard [notes](https://html.spec.whatwg.org/multipage/sections.html#headings-and-sections):

> Sections may contain headings of any rank, but authors are strongly encouraged to either use only h1 elements, or to use elements of the appropriate rank for the section's nesting level.

For instance, consider this simple scenario:

```
<section>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <section>
    <h2>Another Heading 2</h2>
  </section>
</section>
```

This is perfectly valid HTML, but semantically, it's confused because we have a `h2` element nested at a deeper level than a `h3` element that precedes it.

These problems have a number of potential implications, including in the areas of SEO, machine translation from HTML to other formats, accessibility, automatic summarisation, and generation of tables of contents.

### Challenge

Your challenge, should you choose to accept it, is two-fold:

1. Extract the semantic structure of any web page implied by heading elements `h1-h6`. The result should be a, possibly multi-rooted, tree structure. For example, the sequence `h1`, `h2`, `h2`, `h3`, `h4`, `h2`, `h5` yields the tree `[h1, [h2, h2, [h3, [h4]], h2, [h5]]]` assuming a pre-ordered notation. Represent each heading as a node in a tree where each node consists of a tag, content and children, like `{"tag": "h1", "content": "Heading 1", "children": []`, where the list of children contains nodes of the same form. When a heading level is skipped, for example going from `h2` to `h4`, add the pair of headings on either side of the skipped levels as a tuple to an array. For this part of the task you can ignore any other elements in the page.
1. Check the extracted semantic structure against the actual containment structure of the page, adding to an array any heading element that deviates from the guideline given in the HTML spec "to either use only h1 elements, or to use elements of the appropriate rank for the section's nesting level". For example, if the above heading sequence is shown in the context of the following structure:

```
<section>
  <h1/>
  <section>
    <h2/>
    <h2/>
    <section>
      <h3/>
      <section>
        <h4/>
        <section>
          <h2/>
          <h5/>
        </section>
      </section>
    </section>
   </section>
 </section>
```

The final `h2` element would be added to the array because the container structure puts that `h2` element in a nested position relative to the position of the `h4` element that precedes it, despite the `h2` element carrying more semantic weight. Use the same object representation as above.

Structure your code so that it can be run as a:

1. standalone command on the command line, where the URL to process is given as an argument, e.g., `checkheadings https://foo.com`
1. little web app that takes a URL as a URL parameter, e.g., `http://localhost:8000?u=https://foo.com`

In both cases, the result should be a well-formed JSON object encapsulating the outputs of the two parts of the task above. For example, given the above example, the response might look something like this:

```
{
  "semantic-structure": [
    {"tag": "h1",
      "content": "Heading 1",
      "children": [
        {"tag": "h2",
         "content": "Heading 2"
        },
        {"tag": "h2",
         "content": "Another Heading 2",
         "children": [
           {"tag": "h3",
            "content": "Heading 3",
            "children": [
              {"tag": "h4",
               "content": "Heading 4"
              }
            ]
           }
         ]
        },
        {"tag": "h2",
         "content": "An out of place Heading 2",
         "children": [
           {"tag": "h5",
            "content": "Heading 5"
           }
         ]
        }
      ]
    }
  ],
  "skipped-levels": [
    {"tag": "h2", "content": "An out of place Heading 2"}, {"tag": "h5", "content": "Heading 5"}
  ],
  "incongruent-headings": [
    {"tag": "h2", "content": "An out of place Heading 2"}
  ]
}
```

Error conditions, such as a malformed URL given as argument, should be reported appropriately for both command-line and web API invocations.

Add a description of your approach to the bottom of this README, including a note about the computation complexity of your solution. Your description should also include instructions for running your solution in web app and command line form.

### Notes

1. You may assume web pages are static. That is, you do not need to evaluate inline or referenced javascript before processing the page, though you might like to briefly comment on how you'd modify your solution to support single-page websites and other dynamically generated pages.
1. For the second part of the challenge, you may assume that structural elements are restricted to `div` and [sectioning content](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Sectioning_content).
1. Tests are desirable.
1. You may use any language, libraries, frameworks that you wish, but please ensure you've documented clearly how to install anything that's required to run your solution.
1. We would not expect you to spend more than four hours completing this challenge.
1. If you need any of the requirements to be clarified, please just ask!

### Criteria

Assuming that you submit a "correct" solution, we are then first and foremost interested to see _how_ you solve the problem. That is our top criterion below.

1. Elegance/simplicity of your solution
1. Elegance/readability of your code (note: this is very distinct from the first criterion!)
1. Documentation and comments

### Submitting your solution

Clone this repo and create a new, private repository to use as the remote origin.

Create your solution there and, when it's ready, add @ckortekaas to your fork, and let us know that you've completed the challenge.

---

### Solution

The approach I took to this solution was to create a simple class that takes a url and provides a public method to evalute the semantics of its heading structure. It hides the code complexity behind a simple interface(this thinking comes from "A Philosophy of Software Design") and has a computation complexity of O(n) where n is the number of headings in the DOM. The given example for the challenge would evalute to O(7).

### Running the Solution

1. install the dependencies

```zsh
pnpm install
```

2. run the tests

```zsh
pnpm run test
```

3. run the web app

```zsh
pnpm run dev
```

- navigate to http://localhost:5173
- to evaluate the semantic structure of a url via the web app, add a "url" query param. Eg, http://localhost:5173/?url=https://kaitlynparsons.vercel.app/
- the user interface will display a prettified json object in the same output suggested by the challenge.

4. run the command line tool

```zsh
pnpm checkheadings https://kaitlynparsons.vercel.app/
```
