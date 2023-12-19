// vercel serverless function
module.exports = async (req, res) => {
  const https = require('https');
  const url = require('url');

  const queryObject = url.parse(req.url, true).query;
  const guildId = queryObject.guild;
  var style = queryObject.style;
  if (!style || style == 'social') {
    style = 'flat-square';
  }

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
      const jsonData = JSON.parse(data);
      const presenceCount = jsonData.presence_count;
      const name = jsonData.name;
      const badgeUrl = `https://img.shields.io/static/v1?style=${style}&label=${name}&labelColor=5662f6&message=${presenceCount}%20Online&color=23a55a&logo=discord&logoColor=white`;

      https.get(badgeUrl, (badgeRes) => {
        let data = '';
        badgeRes.on('data', (chunk) => {
          data += chunk;
        });
        badgeRes.on('end', () => {
          //attempt to get icon from discord
          const options = {
            hostname: 'discord.com',
            port: 443,
            path: `/api/guilds/${guildId}`,
            method: 'GET',
            headers: {
              Authorization: `Bot ${process.env.BOT_TOKEN}`
            }
          };

          console.log(options);

          https.get(options, (dres) => {
            let ddata = '';
            dres.on('data', chunk => {
              ddata += chunk;
            });
            dres.on('end', () => {
              res.setHeader('Content-Type', 'image/svg+xml');
              const djsonData = JSON.parse(ddata);
              console.log(djsonData);
              const icon = djsonData.icon;
              if (icon != "null" && icon) {
                const avatar = `https://cdn.discordapp.com/icons/${guildId}/${icon}.png`;
                const urlRegex = /xlink:href="(.*?)"/
                const urlMatch = urlRegex.exec(data);
                let newData = data.replace(urlMatch[1], avatar);
                res.send(newData);
              }
              else {
                res.send(data);
              }
            });
          });
        });
      });
    });
  }).on('error', (err) => {
    res.status(500).send(`Error: ${err.message}`);
  });
};