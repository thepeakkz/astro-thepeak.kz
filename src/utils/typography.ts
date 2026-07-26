/**
 * Helper to apply Russian typography rules to prevent hanging prepositions/conjunctions/particles.
 * Replaces trailing space of short Russian words (1-2 letters plus common 3-4 letter ones) with non-breaking spaces.
 */
export function formatTypography(text: string): string {
  if (!text) return "";
  
  // Regex matches Russian words of 1-2 letters, plus common prepositions/conjunctions/particles/pronouns of 3-5 letters
  // preceded by start of line, space, or quotes, and followed by a regular space.
  const regex = /(^|\s|«|")([а-яА-ЯёЁ]{1,2}|для|или|как|где|там|под|над|без|при|про|через|так|что|кто|чем|тем|все|всё|всех|его|еще|ещё|уже|обо|изо|всеми)([ \t]+)/gi;
  
  let formattedText = text;
  let previousText: string;

  // Repeat until stable so adjacent short words (for example, "и в")
  // are both bound to the word that follows them.
  do {
    previousText = formattedText;
    formattedText = formattedText.replace(regex, "$1$2\u00a0");
  } while (formattedText !== previousText);

  return formattedText;
}

