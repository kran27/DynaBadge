// vercel serverless function
module.exports = async (req, res) => {
  const https = require('https');
  const url = require('url');

  const queryObject = url.parse(req.url,true).query;
  const guildId = queryObject.guild;

  if (!guildId) {
    res.status(400).send('Error: Missing guild query parameter');
    return;
  }

  https.get(`https://discordapp.com/api/guilds/${guildId}/widget.json`, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      const presenceCount = JSON.parse(data).presence_count;
      const badgeUrl = `https://img.shields.io/static/v1?style=flat-square&label=%20&message=${presenceCount}%20Online&color=5662f6&logo=discord&logoColor=white`;

      https.get(badgeUrl, (badgeRes) => {
        res.setHeader('Content-Type', 'image/svg+xml');
        badgeRes.pipe(res);
      });
    });
  }).on('error', (err) => {
    res.status(500).send(`Error: ${err.message}`);
  });
};