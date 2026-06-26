const scriptureCatalog = {
  translations: {
    web: {
      id: 'web',
      name: 'World English Bible Sample',
      abbreviation: 'WEB',
      language: 'English',
      license: {
        name: 'Public domain',
        source: 'World English Bible public-domain sample text'
      },
      defaultPassage: {
        bookId: 'john',
        chapterNumber: 3,
        verseNumber: 16
      },
      books: {
        john: {
          id: 'john',
          name: 'John',
          testament: 'New Testament',
          order: 43,
          chapters: {
            3: {
              number: 3,
              verses: {
                16: {
                  number: 16,
                  text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.'
                }
              }
            }
          }
        }
      }
    },
    'sample-fr': {
      id: 'sample-fr',
      name: 'French Scripture Text Pending',
      abbreviation: 'FR-SAMPLE',
      language: 'French',
      license: {
        name: 'Awaiting verified Scripture text',
        source: 'Awaiting verified French Scripture text'
      },
      defaultPassage: {
        bookId: 'john',
        chapterNumber: 3,
        verseNumber: 16
      },
      availability: {
        status: 'unavailable',
        message: 'Awaiting verified Scripture text for this language.'
      },
      books: {}
    },
    'sample-pt': {
      id: 'sample-pt',
      name: 'Portuguese Scripture Text Pending',
      abbreviation: 'PT-SAMPLE',
      language: 'Portuguese',
      license: {
        name: 'Awaiting verified Scripture text',
        source: 'Awaiting verified Portuguese Scripture text'
      },
      defaultPassage: {
        bookId: 'john',
        chapterNumber: 3,
        verseNumber: 16
      },
      availability: {
        status: 'unavailable',
        message: 'Awaiting verified Scripture text for this language.'
      },
      books: {}
    },
    'sample-sw': {
      id: 'sample-sw',
      name: 'Swahili Scripture Text Pending',
      abbreviation: 'SW-SAMPLE',
      language: 'Swahili',
      license: {
        name: 'Awaiting verified Scripture text',
        source: 'Awaiting verified Swahili Scripture text'
      },
      defaultPassage: {
        bookId: 'john',
        chapterNumber: 3,
        verseNumber: 16
      },
      availability: {
        status: 'unavailable',
        message: 'Awaiting verified Scripture text for this language.'
      },
      books: {}
    },
    'sample-ja': {
      id: 'sample-ja',
      name: 'Japanese Scripture Text Pending',
      abbreviation: 'JA-SAMPLE',
      language: 'Japanese',
      license: {
        name: 'Awaiting verified Scripture text',
        source: 'Awaiting verified Japanese Scripture text'
      },
      defaultPassage: {
        bookId: 'john',
        chapterNumber: 3,
        verseNumber: 16
      },
      availability: {
        status: 'unavailable',
        message: 'Awaiting verified Scripture text for this language.'
      },
      books: {}
    }
  }
};

export const defaultTranslationId = 'web';
export const defaultPassage = Object.freeze({ bookId: 'john', chapterNumber: 3, verseNumber: 16 });
export const scriptureTranslations = Object.freeze(scriptureCatalog.translations);

export function formatScriptureReference(bookName, chapterNumber, verseNumber) {
  return `${bookName} ${chapterNumber}:${verseNumber}`;
}

export function getScriptureTranslation(translationId) {
  return scriptureTranslations[translationId] || scriptureTranslations[defaultTranslationId];
}

export function getScripturePassage(translationId, passage = defaultPassage) {
  const translation = getScriptureTranslation(translationId);

  if (translation.availability?.status === 'unavailable') {
    return {
      translationId: translation.id,
      translationName: translation.name,
      abbreviation: translation.abbreviation,
      language: translation.language,
      license: translation.license,
      availability: translation.availability,
      book: null,
      chapter: null,
      verse: null,
      reference: 'Scripture text unavailable',
      text: translation.availability.message
    };
  }
  const requestedPassage = passage || translation.defaultPassage || defaultPassage;
  const fallbackPassage = translation.defaultPassage || defaultPassage;

  const book = translation.books[requestedPassage.bookId] || translation.books[fallbackPassage.bookId];
  const chapter = book?.chapters?.[requestedPassage.chapterNumber] || book?.chapters?.[fallbackPassage.chapterNumber];
  const verse = chapter?.verses?.[requestedPassage.verseNumber] || chapter?.verses?.[fallbackPassage.verseNumber];

  return {
    translationId: translation.id,
    translationName: translation.name,
    abbreviation: translation.abbreviation,
    language: translation.language,
    license: translation.license,
    availability: translation.availability || { status: 'available', message: 'Scripture text available' },
    book: {
      id: book.id,
      name: book.name,
      testament: book.testament,
      order: book.order
    },
    chapter: chapter.number,
    verse: verse.number,
    reference: formatScriptureReference(book.name, chapter.number, verse.number),
    text: verse.text
  };
}
