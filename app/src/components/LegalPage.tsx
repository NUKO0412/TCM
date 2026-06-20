import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { ROUTES } from '../config/routes'
import { LEGAL_IDS } from '../config/ids'

// Marqueur visible des informations restant à compléter (page de test).
const Todo = ({ t = 'À COMPLÉTER' }: { t?: string }) => <span className="legal-todo">[{t}]</span>

// Page légale unique : Mentions légales · Confidentialité (RGPD) · Cookies.
// Valeurs officielles TCM Agencements (annuaire des entreprises) pré-remplies.
export function LegalPage() {
  const { hash } = useLocation()
  useEffect(() => {
    const id = hash.slice(1)
    const el = id ? document.getElementById(id) : null
    if (el) el.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash])

  return (
    <main className="legal-page">
      <header className="legal-top">
        <div className="wrap legal-top-inner">
          <Link className="brand" to={ROUTES.home} aria-label="Retour à l'accueil">
            <Logo />
            <div>
              <b>TCM Agencement</b>
              <span>Menuiserie · Lorient</span>
            </div>
          </Link>
          <Link className="legal-back" to={ROUTES.home}>
            ← Retour au site
          </Link>
        </div>
      </header>

      <div className="wrap legal-doc">
        <p className="legal-updated">Dernière mise à jour : 20 juin 2026</p>
        <h1>Mentions légales · Politique de confidentialité (RGPD) · Politique de cookies</h1>

        <nav className="legal-nav">
          <a href={`#${LEGAL_IDS.mentions}`}>Mentions légales</a>
          <a href={`#${LEGAL_IDS.confidentialite}`}>Confidentialité (RGPD)</a>
          <a href={`#${LEGAL_IDS.cookies}`}>Cookies</a>
        </nav>

        {/* 1. MENTIONS LÉGALES */}
        <section id={LEGAL_IDS.mentions}>
          <h2>1. Mentions légales</h2>

          <h3>Éditeur du site</h3>
          <p>Le présent site est édité par :</p>
          <p>
            <strong>TCM Agencements</strong>
          </p>
          <ul>
            <li>Forme juridique : société à responsabilité limitée (SARL)</li>
            <li>
              Capital social : <Todo />
            </li>
            <li>Siège social : 152 rue Édouard Branly, 56600 Lanester</li>
            <li>SIREN : 980 713 515</li>
            <li>SIRET (siège) : 980 713 515 00016</li>
            <li>RCS : Lorient — 980 713 515</li>
            <li>
              TVA intracommunautaire : FR92 980 713 515{' '}
              <span className="legal-note">
                (à confirmer ; ou « TVA non applicable, art. 293 B du CGI » en cas de franchise)
              </span>
            </li>
            <li>Activité : travaux de menuiserie bois et PVC (NAF 43.32A)</li>
            <li>Téléphone : 06 31 01 07 57</li>
            <li>E-mail : theo.caheric@gmail.com</li>
          </ul>

          <h3>Directeur de la publication</h3>
          <p>Théo Caheric, gérant.</p>

          <h3>Hébergement</h3>
          <ul>
            <li>
              Hébergeur : Vercel Inc.{' '}
              <span className="legal-note">
                (hébergement de test ; <Todo t="hébergeur final OVH à renseigner avant mise en ligne" />)
              </span>
            </li>
            <li>Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
            <li>Site internet : vercel.com</li>
          </ul>

          <h3>Conception et développement</h3>
          <p>Le présent site internet a été conçu, développé et intégré par :</p>
          <p>
            <strong>Hubelly</strong>
          </p>
          <p>
            Site internet :{' '}
            <a href="https://hubelly.com" target="_blank" rel="noopener noreferrer">
              https://hubelly.com
            </a>
          </p>
        </section>

        {/* 2. PROPRIÉTÉ INTELLECTUELLE */}
        <section>
          <h2>2. Propriété intellectuelle</h2>

          <h3>Contenus métier</h3>
          <p>
            L'ensemble des contenus métier publiés sur le site, notamment les textes, photographies,
            réalisations, visuels de chantiers, logos, documents commerciaux, marques, coordonnées,
            descriptifs de prestations et informations relatives à l'activité de TCM Agencement
            demeurent la propriété de TCM Agencement ou de leurs titulaires respectifs.
          </p>
          <p>
            TCM Agencement garantit disposer de l'ensemble des droits, licences et autorisations
            nécessaires concernant les contenus transmis pour publication sur le site.
          </p>
          <p>
            Toute reproduction, représentation, diffusion ou exploitation non autorisée de ces
            contenus est interdite.
          </p>

          <h3>Conception graphique et développements techniques</h3>
          <p>
            L'architecture du site, l'expérience utilisateur, la structure graphique, les interfaces,
            les composants logiciels, les développements informatiques spécifiques, les éléments de
            design, les éléments techniques, le code source original, les animations, les intégrations
            et l'ensemble des créations réalisées dans le cadre de la conception du site sont protégés
            par le droit de la propriété intellectuelle.
          </p>
          <p>Ces éléments ont été conçus et développés par Hubelly.</p>
          <p>
            Sauf disposition contractuelle contraire, toute reproduction, adaptation, modification,
            extraction, réutilisation ou exploitation totale ou partielle de ces éléments est interdite
            sans autorisation écrite préalable de Hubelly.
          </p>
          <p>
            Toute utilisation non autorisée pourra donner lieu à des poursuites conformément au Code de
            la propriété intellectuelle.
          </p>
        </section>

        {/* 3. RESPONSABILITÉ */}
        <section>
          <h2>3. Responsabilité</h2>

          <h3>Responsabilité des contenus</h3>
          <p>
            TCM Agencement est seule responsable des informations, textes, photographies, documents,
            coordonnées, descriptions de prestations, tarifs, réalisations et contenus qu'elle transmet
            pour publication sur le site.
          </p>
          <p>
            TCM Agencement s'engage à disposer des droits nécessaires concernant l'ensemble des
            contenus publiés.
          </p>
          <p>
            Hubelly intervient exclusivement en qualité de concepteur et prestataire technique du site
            internet.
          </p>
          <p>
            Hubelly ne saurait être tenu responsable des contenus fournis par TCM Agencement ni de leur
            conformité aux réglementations applicables.
          </p>

          <h3>Responsabilité technique</h3>
          <p>
            Hubelly met en œuvre les moyens raisonnables nécessaires afin d'assurer le bon
            fonctionnement du site.
          </p>
          <p>
            Toutefois, aucune garantie absolue de disponibilité ou d'absence d'erreur ne peut être
            accordée.
          </p>
          <p>TCM Agencement reconnaît utiliser le site sous sa responsabilité.</p>

          <h3>Liens externes</h3>
          <p>Le site peut contenir des liens vers des sites internet tiers.</p>
          <p>
            TCM Agencement et Hubelly ne peuvent être tenus responsables du contenu ou du fonctionnement
            de ces sites externes.
          </p>
        </section>

        {/* 4. CONFIDENTIALITÉ RGPD */}
        <section id={LEGAL_IDS.confidentialite}>
          <h2>4. Politique de confidentialité — RGPD</h2>

          <h3>Responsable du traitement</h3>
          <p>Le responsable du traitement des données personnelles est :</p>
          <p>
            <strong>TCM Agencements</strong>
          </p>
          <ul>
            <li>Adresse : 152 rue Édouard Branly, 56600 Lanester</li>
            <li>Téléphone : 06 31 01 07 57</li>
            <li>E-mail : theo.caheric@gmail.com</li>
          </ul>

          <h3>Données collectées</h3>
          <p>Selon les fonctionnalités utilisées, les données suivantes peuvent être collectées :</p>
          <h4>Données d'identification</h4>
          <ul>
            <li>Nom</li>
            <li>Prénom</li>
            <li>Société</li>
            <li>Fonction</li>
          </ul>
          <h4>Données de contact</h4>
          <ul>
            <li>Adresse e-mail</li>
            <li>Numéro de téléphone</li>
            <li>Adresse postale</li>
          </ul>
          <h4>Données liées aux demandes</h4>
          <ul>
            <li>Demandes de contact</li>
            <li>Demandes de devis</li>
            <li>Informations relatives aux projets</li>
            <li>Messages transmis via les formulaires</li>
          </ul>
          <h4>Données techniques</h4>
          <ul>
            <li>Adresse IP</li>
            <li>Type de navigateur</li>
            <li>Système d'exploitation</li>
            <li>Pages consultées</li>
            <li>Date et heure de navigation</li>
          </ul>
          <h4>Données analytiques</h4>
          <ul>
            <li>Statistiques de fréquentation</li>
            <li>Sources de trafic</li>
            <li>Comportement de navigation</li>
          </ul>

          <h3>Finalités du traitement</h3>
          <p>Les données collectées sont utilisées afin de :</p>
          <ul>
            <li>Répondre aux demandes de contact</li>
            <li>Établir des devis</li>
            <li>Assurer le suivi commercial</li>
            <li>Organiser des rendez-vous</li>
            <li>Réaliser les prestations demandées</li>
            <li>Respecter les obligations légales</li>
            <li>Améliorer le fonctionnement du site</li>
            <li>Produire des statistiques d'utilisation</li>
          </ul>

          <h3>Bases légales</h3>
          <p>Les traitements reposent sur :</p>
          <ul>
            <li>Le consentement de l'utilisateur</li>
            <li>Les mesures précontractuelles nécessaires à l'établissement d'un devis</li>
            <li>L'exécution d'un contrat</li>
            <li>Les obligations légales applicables</li>
            <li>L'intérêt légitime de TCM Agencement</li>
          </ul>

          <h3>Conservation des données</h3>
          <p>Les données sont conservées uniquement pendant la durée nécessaire aux finalités poursuivies.</p>
          <p>À titre indicatif :</p>
          <ul>
            <li>Formulaires de contact : 3 ans après le dernier échange</li>
            <li>Prospects : 3 ans après le dernier contact</li>
            <li>Documents contractuels et comptables : selon les délais légaux applicables</li>
            <li>Cookies : selon leur durée de validité</li>
          </ul>

          <h3>Destinataires des données</h3>
          <p>Les données sont exclusivement destinées :</p>
          <ul>
            <li>À TCM Agencement</li>
            <li>Aux personnes habilitées au sein de l'entreprise</li>
            <li>À l'hébergeur du site</li>
            <li>Aux prestataires techniques nécessaires au fonctionnement du site</li>
            <li>Aux outils de messagerie</li>
            <li>Aux outils de mesure d'audience éventuellement utilisés</li>
          </ul>
          <p>Les données ne sont jamais vendues à des tiers.</p>

          <h3>Sécurité</h3>
          <p>
            TCM Agencement met en œuvre des mesures techniques et organisationnelles appropriées afin de
            garantir la confidentialité, l'intégrité et la sécurité des données personnelles.
          </p>

          <h3>Droits des utilisateurs</h3>
          <p>Conformément au RGPD, chaque utilisateur dispose :</p>
          <ul>
            <li>D'un droit d'accès</li>
            <li>D'un droit de rectification</li>
            <li>D'un droit d'effacement</li>
            <li>D'un droit d'opposition</li>
            <li>D'un droit à la limitation du traitement</li>
            <li>D'un droit à la portabilité</li>
            <li>D'un droit de retrait du consentement</li>
          </ul>
          <p>
            Toute demande peut être adressée à : <strong>theo.caheric@gmail.com</strong>{' '}
            <span className="legal-note">
              (<Todo t="adresse e-mail dédiée RGPD si souhaitée" />)
            </span>
          </p>

          <h3>Réclamation</h3>
          <p>
            L'utilisateur peut déposer une réclamation auprès de la CNIL s'il estime que ses droits ne
            sont pas respectés.
          </p>
        </section>

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
      </div>
    </main>
  )
}
