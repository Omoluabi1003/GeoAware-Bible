export const translations = {
  web: {
    id: 'web',
    name: 'World English Bible Sample',
    language: 'English',
    license: 'Public domain',
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.'
  },
  'sample-fr': {
    id: 'sample-fr',
    name: 'French Placeholder Sample',
    language: 'French',
    license: 'Placeholder until verified open-license text is connected',
    reference: 'John 3:16',
    text: 'Traduction française à connecter depuis une source ouverte vérifiée.'
  },
  'sample-pt': {
    id: 'sample-pt',
    name: 'Portuguese Placeholder Sample',
    language: 'Portuguese',
    license: 'Placeholder until verified open-license text is connected',
    reference: 'John 3:16',
    text: 'Tradução portuguesa a ser conectada a partir de uma fonte aberta verificada.'
  },
  'sample-sw': {
    id: 'sample-sw',
    name: 'Swahili Placeholder Sample',
    language: 'Swahili',
    license: 'Placeholder until verified open-license text is connected',
    reference: 'John 3:16',
    text: 'Tafsiri ya Kiswahili itaunganishwa kutoka chanzo huria kilichothibitishwa.'
  }
};

export function getTranslation(translationId) {
  return translations[translationId] || translations.web;
}
