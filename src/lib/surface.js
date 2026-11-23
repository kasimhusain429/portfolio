/**
 * Which surface sits under a given viewport y: the hero and the About paper
 * are light (navy UI on top); everything else, including the ink flood at the
 * bottom of About, is dark (pearl UI on top).
 */
const ABOUT_FLOOD = 520 // px of navy ink at the bottom of the About paper

export function isLightAt(y) {
  const home = document.getElementById('home')
  if (home) {
    const r = home.getBoundingClientRect()
    if (y >= r.top && y < r.bottom) return true
  }
  const about = document.getElementById('about')
  if (about) {
    const r = about.getBoundingClientRect()
    if (y >= r.top && y < r.bottom - ABOUT_FLOOD) return true
  }
  return false
}
