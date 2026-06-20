// Marqueur visible des informations restant à compléter (page de test).
// Partagé par les sections de la page légale.
export const Todo = ({ t = 'À COMPLÉTER' }: { t?: string }) => (
  <span className="legal-todo">[{t}]</span>
)
