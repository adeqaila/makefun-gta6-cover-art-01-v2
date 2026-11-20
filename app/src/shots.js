// Fixed scenes for screenshots: ?shot=cover shows the cover alone at
// 1280x720; ?shot=editor shows the full studio UI. ?film= picks the film.
// window.__shotReady is set once the scene is painted.
export function runShot(shot, query, app) {
  const film = query.get('film') || 'family';
  if (film !== app.state.film) app.setFilm(film);
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
  }
  app.redraw();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
