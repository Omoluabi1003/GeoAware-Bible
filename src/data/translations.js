import { getScripturePassage, scriptureTranslations } from './scripture.js';

export const translations = scriptureTranslations;

export function getTranslation(translationId) {
  const passage = getScripturePassage(translationId);

  return {
    id: passage.translationId,
    name: passage.translationName,
    abbreviation: passage.abbreviation,
    language: passage.language,
    license: passage.license.name,
    licenseSource: passage.license.source,
    reference: passage.reference,
    text: passage.text,
    book: passage.book,
    chapter: passage.chapter,
    verse: passage.verse
  };
}
