// vercel serverless function
module.exports = async (req, res) => {
  const https = require('https');
  const url = require('url');

  const queryObject = url.parse(req.url, true).query;
  const username = queryObject.username;

  if (!username) {
    res.status(400).send('Error: Missing username query parameter');
    return;
  }

  https.get(`https://twitter.com/${username}`, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      const regex = /window\.__INITIAL_STATE__=(.*?);window\.__META_DATA__=/;
      const match = data.match(regex);

      if (match && match.length === 2) {
        const jsonData = match[1];

        try {
          const eue = JSON.parse(jsonData).entities.users.entities;
          const firstKey = Object.keys(eue)[0];
          const followersCount = eue[firstKey].followers_count;

          const badgeUrl = `https://img.shields.io/static/v1?style=flat-square&label=%20&message=${followersCount}%20Followers_&color=1d9bf0&logo=twitter&logoColor=white`;

          https.get(badgeUrl, (badgeRes) => {
            res.setHeader('Content-Type', 'image/svg+xml');
            badgeRes.pipe(res);
          });

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      } else {
        console.error('No match found or invalid data structure');
      }
    });
  }).on('error', (err) => {
    res.status(500).send(`Error: ${err.message}`);
  });
};