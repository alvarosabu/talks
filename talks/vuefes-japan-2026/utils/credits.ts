export interface Credit {
  id: string
  label: string
  role?: string
  image: string
  position: [number, number, number]
  radius: number
}

const ORG_RADIUS = 1.1
const CONTRIBUTOR_RADIUS = 0.5

export const organizations: Credit[] = [
  { id: 'ie3', label: 'IE3', role: 'Art Direction / Design', image: '/credits/logos/ie3.png', position: [-2.6, 0.15, 0], radius: ORG_RADIUS },
  { id: 'vuejs-jp', label: 'Vue.js Japan User Group', role: 'Organizer / Development', image: '/credits/logos/vuejs-jp.png', position: [2.6, 0.15, 0], radius: ORG_RADIUS },
]

// Placed by hand, not at random, so no label can land on top of another bubble.
// Three rows around the two organizations, plus one bubble in the gap between them.
// The camera sees about x ±9 and y ±5 at z = 0. The title covers y > 3.6 on the left,
// and the slide footer covers y < -4, so the rows stay between those.
const contributorPositions: [number, number][] = [
  [-6.9, 2.3], [-4.6, 2.6], [-2.3, 2.3], [0, 2.6], [2.3, 2.3], [4.6, 2.6], [6.9, 2.3],
  [-7.0, 0.5], [-5.3, -1.0], [0, -0.2], [5.3, -1.0], [7.0, 0.5],
  [-7.0, -2.6], [-5.0, -2.8], [-3.0, -2.6], [-1.0, -2.8], [1.0, -2.6], [3.0, -2.8], [5.0, -2.6], [7.0, -2.8],
]

const handles = [
  'ubugeeei', 'naokihaba', 'ktym4a', 'yamageji', 'totocalcio', '448jp', 'genj11', 'Hal-Spidernight', 'aster-mnch', 'rettuce',
  'petaxa', 'ryuhei373', 'csy19', 'hannoeru', 'kspace-trk', 'nozomuikuta', 'yuki-mina', 'antfu', 'neginasu', 'ryoAccount',
]

// Avatars are downloaded into public/ so the slide works without Wi-Fi on stage
export const contributors: Credit[] = handles.map((handle, i) => ({
  id: handle,
  label: `@${handle}`,
  image: `/credits/avatars/${handle}.png`,
  position: [...contributorPositions[i]!, 0],
  radius: CONTRIBUTOR_RADIUS,
}))
