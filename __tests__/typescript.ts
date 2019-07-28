import {ReactElement} from 'react';
import ReactDOMServer from 'react-dom/server';

import {readFile, writeFile, copyFile, mkdir} from 'fs';
import {sync as rmdir} from 'rimraf';

import {config} from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

import {throwIfErr, dirStat, templateReplace} from './utils';
import {SITE_LAYOUT} from './layout';
import './styles/index.scss';

const OUTPUT_DIR = './build';

function log(...args: any[]): void {
  if (args.length === 0) {
    console.log();
  }
  args.forEach(a => console.log(`[generator]: ${a}`));
}

type Page = {
  relativePath: string;
  title: string;
  template: string;
  component: ReactElement;
  reactsrc?: string;
  subpages: Page[];
};

/**
 * Recursively render the pages defined in the site layout into
 * static HTML
 */
async function render(page: Page, pathStack: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    readFile(page.template, {encoding: 'UTF-8'}, (err, template) => {
      if (err) {
        reject(err);
      }

      const html = ReactDOMServer.renderToString(page.component);
      const outputPath = [...pathStack, page.relativePath].join('');

      mkdir(outputPath, {recursive: true}, err => {
        if (err) {
          reject(err);
        }

        const toReplace = [
          {
            key: 'content',
            content: html,
          },
          {
            key: 'title',
            content: page.title,
          },
        ];

        if (page.reactsrc) {
          toReplace.push({
            key: 'reactsrc',
            content: page.reactsrc,
          });
        }

        writeFile(
          `${outputPath}index.html`,
          templateReplace(template, toReplace),
          async err => {
            if (err) {
              reject(err);
            }

            const wg: Promise<void>[] = [];
            page.subpages.forEach(subpage => {
              wg.push(render(subpage, [...pathStack, page.relativePath]));
            });

            await Promise.all(wg);
            resolve();
          },
        );
      });
    });
  });
}

export default async function main() {
  console.time('Time');
  log('Building website');
  log('Clearing old files');

  rmdir(OUTPUT_DIR);

  log('Rendering');
  await mkdir(OUTPUT_DIR, err => throwIfErr(err));
  await mkdir(`${OUTPUT_DIR}/js`, err => throwIfErr(err));

  const renderPromise = render(SITE_LAYOUT, [OUTPUT_DIR]);

  copyFile('dist/generator.css', 'build/styles.css', err => throwIfErr(err));
  copyFile('dist/cheat.js', 'build/js/cheat.js', err => throwIfErr(err));
  copyFile('dist/vim.js', 'build/js/vim.js', err => throwIfErr(err));
  copyFile('templates/404.html', 'build/404.html', err => throwIfErr(err));

  await renderPromise;

  log('Finished.\n');
  console.timeEnd('Time');

  log();
  dirStat(OUTPUT_DIR);
  log();
}

main();
