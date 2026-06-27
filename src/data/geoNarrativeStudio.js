import { getGeoNarrative } from './geoNarrativeRegistry.js';

export const GEONARRATIVE_STUDIO_STATUS = Object.freeze({
  supported: 'supported',
  unsupported: 'unsupported'
});

const PROMPT_TO_GEONARRATIVE_ID = Object.freeze({
  'life of david': 'life_of_david',
  'miracles of jesus': 'miracles_of_jesus',
  'paul missionary journeys': 'paul_first_missionary_journey',
  'pauls missionary journeys': 'paul_first_missionary_journey',
  'paul missionary journey': 'paul_first_missionary_journey',
  'road to golgotha': 'road_to_golgotha',
  exodus: 'exodus',
  'road to emmaus': 'road_to_emmaus',
  'seven churches': 'seven_churches',
  'seven churches of revelation': 'seven_churches'
});

export const GEONARRATIVE_STUDIO_SUGGESTED_PROMPTS = Object.freeze([
  Object.freeze({ label: 'Road to Golgotha', command: 'road to golgotha' }),
  Object.freeze({ label: 'Exodus', command: 'exodus' }),
  Object.freeze({ label: 'Paul Missionary Journey', command: 'paul missionary journey' }),
  Object.freeze({ label: 'Road to Emmaus', command: 'road to emmaus' }),
  Object.freeze({ label: 'Seven Churches', command: 'seven churches' })
]);

function normalizeStudioPrompt(prompt) {
  return typeof prompt === 'string'
    ? prompt.trim().toLowerCase().replace(/[?.!]+$/g, '').replace(/[’']/g, '').replace(/\s+/g, ' ')
    : '';
}

export function resolveGeoNarrativeStudioPrompt(prompt) {
  const normalizedPrompt = normalizeStudioPrompt(prompt);
  const geoNarrativeId = PROMPT_TO_GEONARRATIVE_ID[normalizedPrompt];
  const geoNarrative = geoNarrativeId ? getGeoNarrative(geoNarrativeId) : null;

  if (geoNarrative) {
    return Object.freeze({
      status: GEONARRATIVE_STUDIO_STATUS.supported,
      prompt: normalizedPrompt,
      message: 'I can build that journey from curated Scripture geography.',
      geoNarrativeId: geoNarrative.id,
      geoNarrative
    });
  }

  return Object.freeze({
    status: GEONARRATIVE_STUDIO_STATUS.unsupported,
    prompt: normalizedPrompt,
    message: 'I can only build curated journeys currently bundled in GeoNarrative Studio; I will not invent a route for that prompt.',
    geoNarrativeId: null,
    geoNarrative: null
  });
}

export function createGeoNarrativeStudioResolver() {
  return Object.freeze({
    supportedPrompts: Object.freeze(Object.keys(PROMPT_TO_GEONARRATIVE_ID)),
    resolve: resolveGeoNarrativeStudioPrompt
  });
}
