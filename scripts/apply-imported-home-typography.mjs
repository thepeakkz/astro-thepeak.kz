import { readFile, writeFile } from "node:fs/promises";

const filePath = new URL("../public/imported-home/index.html", import.meta.url);
const shortWords =
  /(^|\s|«|")([а-яА-ЯёЁ]{1,2}|для|или|как|где|там|под|над|без|при|про|через|так|что|кто|чем|тем|все|всех|обо|изо|всеми)([ \t]+)/g;

function formatTypography(text) {
  let formatted = text;
  let previous;

  do {
    previous = formatted;
    formatted = formatted.replace(shortWords, "$1$2\u00a0");
  } while (formatted !== previous);

  return formatted;
}

const source = await readFile(filePath, "utf8");
const protectedBlocks = [];
const protectedSource = source.replace(
  /<(script|style|textarea)\b[\s\S]*?<\/\1>/gi,
  (block) => {
    const marker = `___THEPEAK_PROTECTED_BLOCK_${protectedBlocks.length}___`;
    protectedBlocks.push(block);
    return marker;
  },
);

const formattedSource = protectedSource
  .replace(/>([^<>]+)</g, (_, text) => `>${formatTypography(text)}<`)
  .replace(
    /___THEPEAK_PROTECTED_BLOCK_(\d+)___/g,
    (_, index) => protectedBlocks[Number(index)],
  );

await writeFile(filePath, formattedSource);

const addedSpaces =
  (formattedSource.match(/\u00a0/g)?.length ?? 0) -
  (source.match(/\u00a0/g)?.length ?? 0);

console.log(`Added ${addedSpaces} non-breaking spaces.`);
