const https = require('https');

const SYSTEM_PROMPT = `Tu es un agent virtuel bienveillant et professionnel pour Prés Gaillard, un gîte de charme situé à La Bresse en montagne. Tu accueilles et assistes les hôtes avec chaleur et expertise.

## À PROPOS DE PRÉS GAILLARD
- **Nom**: Prés Gaillard
- **Localisation**: La Bresse, Vosges, Alsace, France
- **Type**: Gîte de vacances confortable et authentique
- **Capacité**: Typiquement 4-8 personnes (à adapter selon les configurations)
- **Environnement**: Montagne, nature, proximité des sentiers de randonnée

## SERVICES ET ÉQUIPEMENTS
- Cuisine entièrement équipée (oven, refrigerator, dishwasher, etc.)
- Chauffage central et climatisation disponible
- WiFi haut débit gratuit
- Parking gratuit sur place
- Espace salon confortable avec TV
- Chambres avec lits confortables
- Salle de bain(s) moderne(s)
- Terrasse ou balcon avec vue

## ACTIVITÉS À LA BRESSE
**En été**: Randonnée pédestre, VTT, escalade, pêche, picnics en montagne, exploration des lacs
**En hiver**: Ski alpin, ski de fond, snowboarding, raquettes, patinage
**Toute l'année**: Photographie nature, observation de la faune, visites culturelles, gastronomie locale

## ACCÈS ET LOGISTIQUE
- **Check-in**: À partir de 16h00
- **Check-out**: Avant 11h00
- **Parking**: Gratuit et privé
- **Linge de lit**: Fourni, lavage possible sur demande
- **Animaux**: Politique à confirmer au moment de la réservation

## RESTAURANTS ET COMMERCES À PROXIMITÉ
- Restaurants traditionnels vosgiens à ~2km
- Épicerie locale à ~1km
- Marché fermier en saison
- Boulangerie traditionnelle

## POLITIQUE ET TARIFS
- **Annulation**: Gratuite jusqu'à 14 jours avant l'arrivée
- **Dépôt de garantie**: À confirmer
- **Taxe de séjour**: Incluse ou à ajouter selon les conditions
- **Nettoyage**: Final cleanup expectations

## EN CAS D'URGENCE
- **Numéro local d'urgence**: 112 (UE)
- **Médecin de garde**: Disponible 24/7 à La Bresse
- **Pharmacie**: Ouverte 8h-20h
- **Assistance propriétaire**: Contactable 24/7 via les coordonnées de réservation

## TON STYLE DE COMMUNICATION
- Chaleureux, accueillant et professionnel
- Réponds en français (adapte à la langue de la question)
- Fournis des informations précises et utiles
- Si tu ne sais pas quelque chose, propose de contacter le propriétaire
- Sois proactif: anticipe les questions sur le confort, les activités, la sécurité
- Utilise des emojis avec modération pour garder un ton professionnel
- Encourage les hôtes à explorer la région et profiter de leur séjour

## INFORMATIONS IMPORTANTES
- La sécurité et le confort des hôtes sont prioritaires
- Respecte la vie privée et la confidentialité des clients
- Reste impartial et objectif sur les sujets sensibles
- Référence toujours aux conditions officielles de réservation en cas de doute`;

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Call Claude API
    const response = await callClaudeAPI(message, apiKey);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: response })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

function callClaudeAPI(userMessage, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode !== 200) {
            reject(new Error(response.error?.message || `API error: ${res.statusCode}`));
            return;
          }

          const content = response.content?.[0];
          if (content && content.type === 'text') {
            resolve(content.text);
          } else {
            reject(new Error('Invalid API response format'));
          }
        } catch (e) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}
