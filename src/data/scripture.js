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
      name: 'French Open-License Placeholder Sample',
      abbreviation: 'FR-SAMPLE',
      language: 'French',
      license: {
        name: 'Metadata-only placeholder; no Scripture text included',
        source: 'Awaiting verified public-domain or open-license French Scripture source'
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
                  text: 'Traduction française à connecter depuis une source ouverte vérifiée.'
                }
              }
            }
          }
        }
      }
    },
    'sample-pt': {
      id: 'sample-pt',
      name: 'Portuguese Open-License Placeholder Sample',
      abbreviation: 'PT-SAMPLE',
      language: 'Portuguese',
      license: {
        name: 'Metadata-only placeholder; no Scripture text included',
        source: 'Awaiting verified public-domain or open-license Portuguese Scripture source'
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
                  text: 'Tradução portuguesa a ser conectada a partir de uma fonte aberta verificada.'
                }
              }
            }
          }
        }
      }
    },
    'sample-sw': {
      id: 'sample-sw',
      name: 'Swahili Open-License Placeholder Sample',
      abbreviation: 'SW-SAMPLE',
      language: 'Swahili',
      license: {
        name: 'Metadata-only placeholder; no Scripture text included',
        source: 'Awaiting verified public-domain or open-license Swahili Scripture source'
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
                  text: 'Tafsiri ya Kiswahili itaunganishwa kutoka chanzo huria kilichothibitishwa.'
                }
              }
            }
          }
        }
      }
    },
    'sample-ja': {
      id: 'sample-ja',
      name: 'Japanese Open-License Placeholder Sample',
      abbreviation: 'JA-SAMPLE',
      language: 'Japanese',
      license: {
        name: 'Metadata-only placeholder; no Scripture text included',
        source: 'Awaiting verified public-domain or open-license Japanese Scripture source'
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
                  text: 'Verified open-license Japanese Scripture text will be connected here.'
                }
              }
            }
          }
        }
      }
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
