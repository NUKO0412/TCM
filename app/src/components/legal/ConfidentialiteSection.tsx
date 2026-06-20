import { LEGAL_IDS } from '../../config/ids'

// Section 4 : politique de confidentialité (RGPD). Ancre #confidentialite.
export function ConfidentialiteSection() {
  return (
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
        Toute demande peut être adressée à : <strong>theo.caheric@gmail.com</strong>
      </p>

      <h3>Réclamation</h3>
      <p>
        L'utilisateur peut déposer une réclamation auprès de la CNIL s'il estime que ses droits ne
        sont pas respectés.
      </p>
    </section>
  )
}
