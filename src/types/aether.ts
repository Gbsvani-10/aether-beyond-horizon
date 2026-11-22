export type ChapterId =
  | 'awakening'
  | 'kingdom'
  | 'forest'
  | 'gate'
  | 'horizon'
  | 'sanctuary';

export type TimePhase = 'Sunrise' | 'Daylight' | 'Sunset' | 'Night' | 'New Dawn' | 'Eternity';

export type WorldTheme = 'fantasy' | 'digital';

export interface DiscoveryItem {
  id: string;
  chapterId: ChapterId;
  title: string;
  clue: string;
  message: string;
}

export const HIDDEN_DISCOVERIES: DiscoveryItem[] = [
  {
    id: 'sundial-stone',
    chapterId: 'awakening',
    title: 'Chronos Sundial',
    clue: 'Resting among the sunlit foothills of The Awakening.',
    message: 'The first light remembers every traveler who dared look past the ridge.',
  },
  {
    id: 'skyward-bell',
    chapterId: 'kingdom',
    title: 'Skyward Bell of Aether',
    clue: 'Suspended beside the Sanctum in The Floating Kingdom.',
    message: 'Even ancient stone forgets its weight when lifted by quiet wonder.',
  },
  {
    id: 'owl-totem',
    chapterId: 'forest',
    title: 'Starlight Owl Totem',
    clue: 'Hidden among the right-hand pines of The Lost Forest.',
    message: 'In the deepest canopy, the stars still whisper through the leaves.',
  },
];

export interface CrystalItem {
  id: string;
  chapterId: ChapterId;
  name: string;
  hint: string;
  lore: string;
}

export const AETHER_CRYSTALS: CrystalItem[] = [
  {
    id: 'crystal-dawn',
    chapterId: 'awakening',
    name: 'Dawnfire Shard',
    hint: 'Gleaming along the left mountain crest in The Awakening.',
    lore: 'Condensed from the very first amber ray to touch the eastern peaks.',
  },
  {
    id: 'crystal-sky',
    chapterId: 'kingdom',
    name: 'Zephyr Prism',
    hint: 'Floating beside the Bridge of Echoes in The Floating Kingdom.',
    lore: 'Sustains the buoyant currents that keep sky-stone aloft.',
  },
  {
    id: 'crystal-forest',
    chapterId: 'forest',
    name: 'Sylvan Dewstone',
    hint: 'Nestled near the left roots in The Lost Forest.',
    lore: 'Holds centuries of trapped starlight filtered through emerald mist.',
  },
  {
    id: 'crystal-cosmos',
    chapterId: 'gate',
    name: 'Astral Tear',
    hint: 'Drifting below the crescent moon in The Celestial Gate.',
    lore: 'A crystalline echo formed when the cosmic rift first opened.',
  },
  {
    id: 'crystal-horizon',
    chapterId: 'horizon',
    name: 'Aurora Core',
    hint: 'Resting along the right foreground cliff at The Final Horizon.',
    lore: 'Unites dawn and twilight into the key of the Astral Sanctuary.',
  },
];

export interface StoryChapter {
  id: ChapterId;
  numeral: string;
  title: string;
  fantasySubtitle: string;
  digitalSubtitle: string;
  fantasyProse: string;
  digitalProse: string;
  quote: string;
}

export const STORYBOOK_CHAPTERS: StoryChapter[] = [
  {
    id: 'awakening',
    numeral: 'I',
    title: 'The Awakening',
    fantasySubtitle: 'First Light Over the Ridge',
    digitalSubtitle: 'Sector 01 · Signal Genesis',
    fantasyProse:
      'At the edge of twilight, a solitary traveler steps onto frost-rimmed stone as a colossal sun breaches the valley mist. Far above, silhouettes of migrating birds trace paths toward realms unseen.',
    digitalProse:
      'At the boundary of dark-sector sleep, an explorer node initializes beneath a radiant solar carrier wave. Distant mountain vectors calibrate depth while golden data-motes rise along the horizon.',
    quote: 'Every journey begins the moment stillness gives way to curiosity.',
  },
  {
    id: 'kingdom',
    numeral: 'II',
    title: 'The Floating Kingdom',
    fantasySubtitle: 'Architecture of the Upper Winds',
    digitalSubtitle: 'Sector 02 · Orbital Sky-Mesh',
    fantasyProse:
      'Beyond the cloud veil, entire citadels hang weightless in twilight equilibrium. Waterfalls spill endlessly into open air, linked by slender stone bridges and ringing sky-bells.',
    digitalProse:
      'Suspended inside zero-gravity lattice fields, monolithic sky-nodes drift along harmonic resonance tracks. Cascading light streams flow between floating clusters in silent synchronization.',
    quote: 'What appears impossible from the valley becomes natural above the clouds.',
  },
  {
    id: 'forest',
    numeral: 'III',
    title: 'The Lost Forest',
    fantasySubtitle: 'Cathedral of Amber Mist',
    digitalSubtitle: 'Sector 03 · Bioluminescent Archive',
    fantasyProse:
      'Beneath towering ancient trunks, diagonal shafts of late sun ignite drifting mist and golden fireflies. Every mossy lantern and carved monolith remembers travelers who passed centuries before.',
    digitalProse:
      'Within the deep emerald archive, volumetric laser-rays slice through suspended fog while reactive swarm particles orbit living fiber-trunks and memory beacons.',
    quote: 'Even the quietest roots remember the light of distant stars.',
  },
  {
    id: 'gate',
    numeral: 'IV',
    title: 'The Celestial Gate',
    fantasySubtitle: 'Where Earth Meets Eternity',
    digitalSubtitle: 'Sector 04 · Singularity Aperture',
    fantasyProse:
      'At the forest’s end, gravity loosens and the sky opens into deep violet cosmos. Concentric rune rings spin around a luminous rift, beckoning the wayfarer across the star-sea.',
    digitalProse:
      'Beyond the archive perimeter, cosmic telemetry converges around a counter-rotating aperture. Encrypted orbital rings unlock as the explorer approaches the event horizon.',
    quote: 'Thresholds exist not to bar the way, but to ask if you are ready.',
  },
  {
    id: 'horizon',
    numeral: 'V',
    title: 'The Final Horizon',
    fantasySubtitle: 'The Dawn That Never Ends',
    digitalSubtitle: 'Sector 05 · Infinite Synthesis',
    fantasyProse:
      'Emerging into tranquil golden dawn, the traveler looks back across ridges and cloud-seas now forever changed. Every horizon reached reveals another sky waiting beyond.',
    digitalProse:
      'Emerging into clear dawn spectrum, every coordinate across the realm aligns in harmony. The horizon is not an endpoint—it is an open protocol for creation.',
    quote: 'Imagine further. Explore deeper. Create beyond limits.',
  },
];
