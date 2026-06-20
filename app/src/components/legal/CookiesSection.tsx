import { Todo } from './Todo'
import { LEGAL_IDS } from '../../config/ids'

// Sections 5 à 7 : cookies, formulaires de contact, modification des conditions.
// Ancre #cookies portée par la section cookies.
export function CookiesSection() {
  return (
    <>
      {/* 5. COOKIES */}
      <section id={LEGAL_IDS.cookies}>
        <h2>5. Politique de cookies</h2>

        <h3>Utilisation des cookies</h3>
        <p>Le site peut utiliser des cookies afin de :</p>
        <ul>
          <li>Garantir son bon fonctionnement</li>
          <li>Améliorer l'expérience utilisateur</li>
          <li>Mesurer l'audience</li>
          <li>Analyser la fréquentation</li>
          <li>Assurer certaines fonctionnalités techniques</li>
        </ul>

        <h3>Cookies strictement nécessaires</h3>
        <p>
          Ces cookies sont indispensables au fonctionnement du site et ne nécessitent pas de
          consentement préalable.
        </p>

        <h3>Cookies de mesure d'audience</h3>
        <p>Des outils de statistiques peuvent être utilisés afin de mesurer :</p>
        <ul>
          <li>Le nombre de visiteurs</li>
          <li>Les pages consultées</li>
          <li>Les performances du site</li>
          <li>Les sources de trafic</li>
        </ul>
        <p>
          Lorsque la réglementation l'exige, le consentement préalable de l'utilisateur est recueilli.
        </p>

        <h3>Services tiers susceptibles d'être utilisés</h3>
        <p>
          <span className="legal-note">
            <Todo t="liste à ajuster selon les services réellement activés ; à ce jour le site n'utilise aucun outil de mesure d'audience" />
          </span>
        </p>
        <ul>
          <li>Google Analytics</li>
          <li>Google Tag Manager</li>
          <li>Google Maps</li>
          <li>YouTube</li>
          <li>Google reCAPTCHA</li>
          <li>Meta Pixel</li>
          <li>Tout autre service tiers intégré au site</li>
        </ul>

        <h3>Gestion des préférences</h3>
        <p>
          L'utilisateur peut à tout moment accepter, refuser ou modifier ses préférences relatives aux
          cookies via le bandeau de gestion des cookies présent sur le site.
        </p>
      </section>

      {/* 6. FORMULAIRES */}
      <section>
        <h2>6. Formulaires de contact et devis</h2>
        <p>Les informations transmises via les formulaires du site sont utilisées exclusivement pour :</p>
        <ul>
          <li>Répondre aux demandes de contact</li>
          <li>Étudier un projet</li>
          <li>Établir un devis</li>
          <li>Assurer le suivi commercial</li>
          <li>Organiser un rendez-vous</li>
        </ul>
        <p>
          Les données collectées sont strictement limitées à ce qui est nécessaire au traitement de la
          demande.
        </p>
      </section>

      {/* 7. MODIFICATION */}
      <section>
        <h2>7. Modification des présentes conditions</h2>
        <p>
          TCM Agencement se réserve le droit de modifier à tout moment les présentes mentions légales,
          la politique de confidentialité et la politique de cookies afin de garantir leur conformité
          avec la réglementation en vigueur.
        </p>
      </section>
    </>
  )
}
