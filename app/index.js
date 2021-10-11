// Import parser function
import fs from 'fs';
import cheerio from 'cheerio';
import sass from 'sass';
import TAILWIND_CONF from './constant';

function parseArgs() {
  const args = process.argv.splice(2, process.argv.length);
  const withJIT = !!args.find((arg) => arg === '--withJIT');
  const shouldRemovePreviousClasses = !!args.find(
    (arg) => arg === '--remove-previous-classes',
  );
  const shouldAddNewClasses = !!args.find((arg) => arg === '--add-new-classes');
  const shouldWriteInFile = !!args.find((arg) => arg === '--write-in-file');

  const files = args.filter((arg) => arg.indexOf('--') === -1);

  return {
    withJIT,
    shouldRemovePreviousClasses,
    shouldAddNewClasses,
    shouldWriteInFile,
    files,
  };
}

function parseFile(fileName) {
  const sourceFile = fs.readFileSync(fileName, 'utf-8');
  const $ = cheerio.load(sourceFile, { recognizeSelfClosing: true });
  const template = $('template').html();
  const script = $('script')
    .html()
    .replace("@import '@kalliste/common/vars.sass'", '');
  const style = $('style')
    .html()
    .replace("@import '@kalliste/common/vars.sass'", '');

  return {
    template,
    script,
    style,
    sourceFile,
  };
}

function sassToCssClasses(style) {
  const sassRendering = sass.renderSync({ data: style, indentedSyntax: true });
  const classes = sassRendering.css.toString();
  const objectClass = {};

  let lastClass = '';

  classes.split('\n').forEach((currentLine) => {
    let line = currentLine;

    if (line[0] === '.') {
      // class opening
      const name = line.substring(1, line.length - 2);

      lastClass = name;
      objectClass[name] = {};
    } else if (line[0] !== '}' && line) {
      // class attribute
      line = line.slice(0, line.length - 1); // removing the ; on the end of the line
      const key = line.split(':')[0].trim(); // getting the key and removing whitespace
      const attribute = line.split(':')[1].trim(); // getting the attribute and removing whitespace

      objectClass[lastClass][key] = attribute;
    }
  });

  return objectClass;
}

function getCurrentClasses(classAttribute) {
  let parsedClasses = [];

  if (classAttribute) {
    if (classAttribute[0] === '[') {
      parsedClasses = classAttribute.replaceAll(' ', '').replaceAll('\n', '');

      parsedClasses = parsedClasses
        .substring(1, parsedClasses.length - 1)
        .split(',');
    } else {
      parsedClasses = [classAttribute];
    }
  }

  return parsedClasses;
}

function isAValidTailwindProperty(property) {
  return !!TAILWIND_CONF[property];
}

function isAValidTailwindValue(property, value) {
  return !!TAILWIND_CONF[property][value];
}

function transformCssClassToTailwindClasses(cssClass, withJIT) {
  const tailwindClasses = [];

  Object.keys(cssClass).forEach((key) => {
    const value = cssClass[key];

    if (isAValidTailwindProperty(key) && isAValidTailwindValue(key, value)) {
      tailwindClasses.push(TAILWIND_CONF[key][value]);
    } else if (withJIT && isAValidTailwindProperty(key)) {
      tailwindClasses.push(`${key}-[${value}]`);
    }
  });

  return tailwindClasses;
}

function getTailwindAssociatedClasses(cssClasses, classes, withJIT) {
  let fullTailwindClasses = [];

  classes.forEach((currentClass) => {
    const className = currentClass.split('$style.')[1];
    const relatedClass = cssClasses[className];

    if (relatedClass) {
      fullTailwindClasses = fullTailwindClasses.concat(
        transformCssClassToTailwindClasses(relatedClass, withJIT),
      );
    }
  });

  return [...new Set(fullTailwindClasses)]; // to remove duplicate
}

function formatNewVFC(template, script, style, shouldRemovePreviousClasses) {
  let newVFC = `
<template>
${template}
</template>

<script>
${script}
</script>
`;

  if (!shouldRemovePreviousClasses) {
    newVFC += `
<style lang="sass" module>
${style}
</style>
`;
  }

  return newVFC;
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
  } catch (err) {
    console.error(err);
  }
}

function init() {
  const {
    withJIT, shouldRemovePreviousClasses, shouldAddNewClasses, files, shouldWriteInFile,
  } = parseArgs();

  files.forEach((filePath) => {
    if (filePath) {
      console.log('Gonna transform:', filePath);
      let transformed = '';

      try {
        const {
          template, script, style, sourceFile,
        } = parseFile(filePath);
        const cssClasses = sassToCssClasses(style);
        const $ = cheerio.load(template, { recognizeSelfClosing: true });

        $('*').each((index, element) => {
          const elementClasses = getCurrentClasses($(element).attr(':class'));

          const tailwindClasses = getTailwindAssociatedClasses(
            cssClasses,
            elementClasses,
            withJIT,
          );

          if (tailwindClasses.length) {
            transformed += `${$(element)[0].name} - ${elementClasses}: `;
            transformed += `${tailwindClasses.join(' ')}\n\n`;

            // todo: not working properly with cheerio, since it transform
            // self closing tags and messes with the html. Try to parse the html and add the classes
            // in a different way

            // $(element).prepend(
            //   '\n<!-- class="' + tailwindClasses.join(" ") + '"-->'
            // );

            // if (shouldAddNewClasses) {
            //   $(element).addClass(tailwindClasses.join(" "));
            // }
            // if (shouldRemovePreviousClasses) {
            //   $(element).removeAttr(":class");
            // }
          }
        });

        // const newVFC = formatNewVFC(
        //   $("body").html(),
        //   script,
        //   style,
        //   shouldRemovePreviousClasses
        // );

        const file = `${transformed}\n${sourceFile}`;

        if (shouldWriteInFile) {
          writeFile(filePath, file);
        }

        console.info(transformed);

        console.log('transform done!');
      } catch (e) {
        console.error(e);
      }
    }
  });
}

init();
