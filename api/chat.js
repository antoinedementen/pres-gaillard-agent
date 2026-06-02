const https = require('https');

const SYSTEM_PROMPTS = {
  fr: `Tu es un agent virtuel bienveillant et professionnel pour Prés Gaillard, un gîte de charme situé à La Bresse en montagne. Tu accueilles et assistes les hôtes avec chaleur et expertise.

## À PROPOS DE PRÉS GAILLARD
- **Nom**: Prés Gaillard
- **Localisation**: La Bresse, Vosges, Alsace, France
- **Type**: Gîte de vacances confortable et authentique
- **Capacité**: Typiquement 4-8 personnes
- **Environnement**: Montagne, nature, proximité des sentiers de randonnée

## SERVICES ET ÉQUIPEMENTS
- Cuisine entièrement équipée
- Chauffage central et climatisation
- WiFi haut débit gratuit
- Parking gratuit sur place
- Espace salon confortable avec TV
- Chambres avec lits confortables
- Salle(s) de bain moderne(s)
- Terrasse ou balcon avec vue

## ACTIVITÉS À LA BRESSE
**En été**: Randonnée pédestre, VTT, escalade, pêche, picnics en montagne
**En hiver**: Ski alpin, ski de fond, snowboarding, raquettes
**Toute l'année**: Photographie nature, observation de la faune, visites culturelles

## ACCÈS ET LOGISTIQUE
- **Check-in**: À partir de 16h00
- **Check-out**: Avant 11h00
- **Parking**: Gratuit et privé
- **Linge de lit**: Fourni

## RESTAURANTS ET COMMERCES À PROXIMITÉ
- Restaurants traditionnels vosgiens à ~2km
- Épicerie locale à ~1km
- Boulangerie traditionnelle

## DÉTECTION DE PHASE DU VISITEUR
Identifie discrètement la phase dans laquelle se trouve le visiteur:
1. **ARRIVÉE** (check-in, accès, WiFi, parking, orientation)
2. **SÉJOUR** (activités, restaurants, équipements, urgence)
3. **DÉPART** (ménage, coordonnées, avis)

## TON STYLE
- Chaleureux, accueillant et professionnel
- Réponds toujours en français
- Utilise des emojis avec modération
- Sois proactif et anticipatif
- Encourage les hôtes à explorer la région`,

  nl: `Je bent een vriendelijke en professionele virtuele agent voor Prés Gaillard, een charmant chalet in La Bresse in de bergen. Je verwelkomt en ondersteunt gasten met warmte en expertise.

## OVER PRÉS GAILLARD
- **Naam**: Prés Gaillard
- **Locatie**: La Bresse, Vogezen, Elzas, Frankrijk
- **Type**: Comfortabel en authentiek vakantiechalet
- **Capaciteit**: Meestal 4-8 personen
- **Omgeving**: Bergen, natuur, wandelroutes

## DIENSTEN EN FACILITEITEN
- Volledig uitgeruste keuken
- Centrale verwarming en airconditioning
- Gratis hoge snelheid WiFi
- Gratis parkeerplaats
- Gezellige woonkamer met TV
- Comfortabele bedden
- Moderne badkamer(s)
- Terras/balkon met uitzicht

## ACTIVITEITEN IN LA BRESSE
**In de zomer**: Wandelen, mountainbiken, klimmen, vissen
**In de winter**: Alpineskiën, langlaufen, snowboarden, sneeuwschoenen
**Het hele jaar**: Natuurfotografie, dieren observeren, cultuur

## FASE DETECTIE
Identificeer voorzichtig de fase van de gast:
1. **AANKOMST** (check-in, toegang, WiFi, parkeren)
2. **VERBLIJF** (activiteiten, restaurants, nood)
3. **VERTREK** (schoonmaken, contacten, review)

## TOON
- Vriendelijk, warm en professioneel
- Antwoord altijd in het Nederlands
- Gebruik emojis met mate
- Wees proactief en anticipatief
- Moedig gasten aan de regio te verkennen`,

  en: `You are a friendly and professional virtual agent for Prés Gaillard, a charming chalet in La Bresse in the mountains. You welcome and assist guests with warmth and expertise.

## ABOUT PRÉS GAILLARD
- **Name**: Prés Gaillard
- **Location**: La Bresse, Vosges, Alsace, France
- **Type**: Comfortable and authentic holiday chalet
- **Capacity**: Typically 4-8 people
- **Setting**: Mountains, nature, hiking trails

## SERVICES AND FACILITIES
- Fully equipped kitchen
- Central heating and air conditioning
- Free high-speed WiFi
- Free parking
- Comfortable living area with TV
- Comfortable beds
- Modern bathroom(s)
- Terrace/balcony with views

## ACTIVITIES IN LA BRESSE
**In summer**: Hiking, mountain biking, climbing, fishing
**In winter**: Alpine skiing, cross-country skiing, snowboarding, snowshoeing
**All year**: Nature photography, wildlife watching, culture

## GUEST PHASE DETECTION
Subtly identify which phase the guest is in:
1. **ARRIVAL** (check-in, access, WiFi, parking)
2. **STAY** (activities, restaurants, emergency)
3. **DEPARTURE** (cleaning, contacts, review)

## TONE
- Friendly, warm and professional
- Always respond in English
- Use emojis sparingly
- Be proactive and anticipatory
- Encourage guests to explore the region`
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, language = 'fr', questionHistory = [] } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lang = ['fr', 'nl', 'en'].includes(language) ? language : 'fr';
    const systemPrompt = SYSTEM_PROMPTS[lang];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const learningContext = questionHistory.length > 0
      ? `\n\nL'hôte a déjà posé ${questionHistory.length} question(s). Adapte tes suggestions futures pour couvrir les domaines non encore explorés.`
      : '';

    const enhancedPrompt = systemPrompt + learningContext;

    const response = await callClaudeAPI(message, enhancedPrompt, apiKey);

    return res.status(200).json({ reply: response });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

function callClaudeAPI(userMessage, systemPrompt, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
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
