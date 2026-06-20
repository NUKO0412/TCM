import { Todo } from './Todo'
import { LEGAL_IDS } from '../../config/ids'

// Sections 1 à 3 : mentions légales, propriété intellectuelle, responsabilité.
// Ancre #mentions portée par la 1re section.
export function MentionsSection() {
  return (
    <>
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
    </>
  )
}
