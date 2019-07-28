import {readFileSync} from 'fs';

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const args = process.argv;

const file = args[2];
if (!file) {
  console.error('Error: You must specify a file to process');
  process.exit(1);
}

const language = args[3];
if (!language) {
  console.error('Error: You must specify a language');
  process.exit(1);
}

if (language === '--escape') {
  console.log(escapeHtml(readFileSync(file).toString()));
}

let engine;
switch (language.toLowerCase()) {
  case 'typescript':
    engine = require('./languages/typescript.js');
    break;
  default:
    console.error('Error: language not supported');
    process.exit(1);
}

console.log(engine.highlighter(escapeHtml(readFileSync(file).toString())));
