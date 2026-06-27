export const GEOTIMELINE_ERA_IDS = Object.freeze({
  patriarchs: 'patriarchs',
  exodus: 'exodus',
  unitedKingdom: 'united_kingdom',
  prophets: 'prophets',
  lifeOfChrist: 'life_of_christ',
  earlyChurch: 'early_church',
  revelation: 'revelation'
});

function freezeEra(era) {
  return Object.freeze({
    ...era,
    scriptureRefs: Object.freeze([...(era.scriptureRefs || [])]),
    narrativeIds: Object.freeze([...(era.narrativeIds || [])]),
    dateRange: Object.freeze({
      label: era.dateRange?.label || 'Date range not specified',
      startSortKey: era.dateRange?.startSortKey ?? null,
      endSortKey: era.dateRange?.endSortKey ?? null,
      certainty: era.dateRange?.certainty || 'framework'
    })
  });
}

export const GeoTimelineEraRegistry = Object.freeze({
  [GEOTIMELINE_ERA_IDS.patriarchs]: freezeEra({
    id: GEOTIMELINE_ERA_IDS.patriarchs,
    title: 'Patriarchs',
    summary: 'Foundational family narratives from Abraham, Isaac, Jacob, and Joseph.',
    dateRange: { label: 'Patriarchal period', startSortKey: -2100, endSortKey: -1800, certainty: 'approximate_traditional_framework' },
    scriptureRefs: ['Genesis 12-50']
  }),
  [GEOTIMELINE_ERA_IDS.exodus]: freezeEra({
    id: GEOTIMELINE_ERA_IDS.exodus,
    title: 'Exodus',
    summary: 'Israel’s departure from Egypt, wilderness journey, and covenant formation.',
    dateRange: { label: 'Exodus and wilderness period', startSortKey: -1500, endSortKey: -1200, certainty: 'date_debated_framework' },
    scriptureRefs: ['Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
    narrativeIds: ['exodus']
  }),
  [GEOTIMELINE_ERA_IDS.unitedKingdom]: freezeEra({
    id: GEOTIMELINE_ERA_IDS.unitedKingdom,
    title: 'United Kingdom',
    summary: 'The monarchy narratives centered on Saul, David, and Solomon.',
    dateRange: { label: 'United monarchy', startSortKey: -1050, endSortKey: -930, certainty: 'approximate_historical_framework' },
    scriptureRefs: ['1 Samuel', '2 Samuel', '1 Kings 1-11'],
    narrativeIds: ['life_of_david']
  }),
  [GEOTIMELINE_ERA_IDS.prophets]: freezeEra({
    id: GEOTIMELINE_ERA_IDS.prophets,
    title: 'Prophets',
    summary: 'Prophetic ministry across the divided kingdom, exile, and restoration settings.',
    dateRange: { label: 'Prophetic era', startSortKey: -900, endSortKey: -400, certainty: 'broad_canonical_framework' },
    scriptureRefs: ['Isaiah', 'Jeremiah', 'Ezekiel', 'The Twelve']
  }),
  [GEOTIMELINE_ERA_IDS.lifeOfChrist]: freezeEra({
    id: GEOTIMELINE_ERA_IDS.lifeOfChrist,
    title: 'Life of Christ',
    summary: 'Gospel narratives from Jesus’ birth, ministry, death, and resurrection.',
    dateRange: { label: 'Life and ministry of Jesus', startSortKey: -6, endSortKey: 33, certainty: 'approximate_historical_framework' },
    scriptureRefs: ['Matthew', 'Mark', 'Luke', 'John'],
    narrativeIds: ['journey_to_bethlehem', 'miracles_of_jesus', 'road_to_golgotha', 'road_to_emmaus']
  }),
  [GEOTIMELINE_ERA_IDS.earlyChurch]: freezeEra({
    id: GEOTIMELINE_ERA_IDS.earlyChurch,
    title: 'Early Church',
    summary: 'Acts and apostolic mission narratives following the resurrection.',
    dateRange: { label: 'Apostolic period', startSortKey: 30, endSortKey: 95, certainty: 'approximate_historical_framework' },
    scriptureRefs: ['Acts'],
    narrativeIds: ['paul_first_missionary_journey']
  }),
  [GEOTIMELINE_ERA_IDS.revelation]: freezeEra({
    id: GEOTIMELINE_ERA_IDS.revelation,
    title: 'Revelation',
    summary: 'The churches and apocalyptic vision recorded in Revelation.',
    dateRange: { label: 'Revelation setting', startSortKey: 90, endSortKey: 100, certainty: 'approximate_historical_framework' },
    scriptureRefs: ['Revelation'],
    narrativeIds: ['seven_churches']
  })
});

export const geoTimelineEraList = Object.freeze(Object.values(GeoTimelineEraRegistry));

export function getGeoTimelineEra(eraId) {
  return GeoTimelineEraRegistry[eraId] || null;
}
