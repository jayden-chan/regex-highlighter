export function highlighter(code: string): string {
  return `<pre class="text-base my-4 rounded-lg p-3" style="background-color:#1D2021;color:#EBDBB2;">${computeHighlighting(
    code,
  )}</pre>`;
}

function color(colorCode: string, group: number): string {
  return `<span style="color:${colorCode};">$${group}</span>`;
}

function computeHighlighting(code: string) {
  const rules = [
    // word followed by colon
    {
      regex: /(\s*)(\w+)(\??:)/g,
      template: `$1${color('#8EC07C', 2)}$3`,
    },
    // strings in single/double quotes
    {
      regex: /(('.*?')|(&quot;.*?&quot;))/g,
      template: `<span style="color:#B8BB26;">$1</span>`,
    },
    // Promise followed by generic type
    {
      regex: /(Promise)(&lt;)/g,
      template: `${color('#83A598', 1)}$2`,
    },
    // new Promise
    {
      regex: /(Promise)(\()/g,
      template: `${color('#8EC07C', 1)}$2`,
    },
    // top level function
    {
      regex: /(function )(\w+)(\()/g,
      template: `${color('#8EC07C', 1)}<b>${color('#B8BB26', 2)}</b>$3`,
    },
    // types
    {
      regex: /(number|string|boolean|any|object|undefined|null|never|void)/g,
      template: color('#FABD2F', 1),
    },
    // true/false
    {
      regex: /(true|false)/g,
      template: color('#D3869B', 1),
    },
    // some keywords
    {
      regex: /(import |export |from|throw )/g,
      template: color('#FE8019', 1),
    },
    // import as (thing)
    {
      regex: /( as )(\w+)/g,
      template: `${color('#FE8019', 1)}${color('#83A598', 2)}`,
    },
    // variable declarations
    {
      regex: /(const |let |var |new )/g,
      template: color('#83A598', 1),
    },
    // other keywords
    {
      regex: /(async |await |return |type |else |default )/g,
      template: color('#FB4934', 1),
    },
    {
      regex: /(if\s?)(\()/g,
      template: `${color('#FB4934', 1)}$2`,
    },
    {
      regex: /(try\s?)(\{)/g,
      template: `${color('#FE8019', 1)}$2`,
    },
    {
      regex: /(catch\s?)((\(\w+\)\s?)?\{)/g,
      template: `${color('#FE8019', 1)}$2$3`,
    },
    // types / interfaces
    {
      regex: /(type|interface )(\w+)/g,
      template: `${color('#FB4934', 1)}${color('#83A598', 2)}`,
    },
    // function calls
    {
      regex: /(\.)(\w+)(\()/g,
      template: `$1${color('#FB4934', 2)}$3`,
    },
    // arrow functions
    {
      regex: /(\w+ )(=&gt;)( )/g,
      template: `${color('#8EC07C', 1)}${color('#FABD2F', 2)}$3`,
    },
    // single line comments
    {
      regex: /^(\s*)(\/\/.*$)/gm,
      template: `<i>$1${color('#7C6F64', 2)}</i>`,
    },
    // multi line comments
    {
      regex: /(\/\*\*?[\s|\S]*?\*\/)/gm,
      template: `<i>${color('#7C6F64', 1)}</i>`,
    },
    // console
    {
      regex: /(console\.)/gm,
      template: color('#8EC07C', 1),
    },
  ];

  let processed = code;

  rules.forEach(rule => {
    processed = processed.replace(rule.regex, rule.template);
  });

  return processed;
}
