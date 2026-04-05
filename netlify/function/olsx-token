// Netlify Function — Proxy token OLSX
// Sert l'URL iframe OLSX sans exposer le token dans le code source HTML
// Configurer OLSX_TOKEN dans les variables d'environnement Netlify
// Endpoint : /.netlify/functions/olsx-token

exports.handler = async function(event) {
  var token = process.env.OLSX_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': 'https://areprog.fr' },
      body: JSON.stringify({ error: 'OLSX_TOKEN non configuré dans les variables Netlify' }),
    };
  }

  var params = new URLSearchParams({
    token:       token,
    lang:        'fr',
    darkmode:    'on',
    color:       'sky',
    descriptions:'on',
    currency:    '€',
    hideprice:   'on',
    mailcontact: 'arthur@areprog.fr',
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://areprog.fr',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ url: 'https://api.olsx.eu/iframe?' + params.toString() }),
  };
};
