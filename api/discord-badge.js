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
      const badgeUrl = `https://img.shields.io/static/v1?style=flat-square&label=%20&message=${presenceCount}%20Online&color=5662f6&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAABkUlEQVRIx+2VLUgEURSFvzdF1KDIgEUZsK0YhNXoDwgqaBQ0GATBNZgEk3mzxWI2GVw2iKhBcFabYNLsCuIPazDsYjuGnX3Mm3GFXatnyr3nnXfnvTuHO/AP46bqYp4JJqmaycRKSDchJc5MrUkBTbDFIl1RukuFETqAL+7xyUd8jRP2TSl1FO2oFWwntw+q2lKBqgK3wKFaxWF8e0btIPOX99szGFA/r22aYMA8e8B62y5aq1/gTu3iDlCQIN+1BMoodNhQGdCSygl1gFYT1FzD1Hqw3IMif2o2oV71GHduVTbnkcdrHFn2uOF/c0HZ0Wc9Rh2iEos/bfTRRAGjHr1uRfk2nrLRjHWMT9bR95HqbFi/rzYcdiPqy1VSbqTU161wyjBjCfaWexbwUwPlhwItwfvrSPN4c/JLir/qi1w6+ZvHMo8xYogiATkKPDnCFwpsElBgKMY+slLvbd6ZR2H0yTqUjZ7OxmB1ZlK+4U9AvvZskelm59eM3bwnP73co5yudfBbC3SgG+XU8/8/jOMb/1FYQfrpXm4AAAAASUVORK5CYII=`;

      https.get(badgeUrl, (badgeRes) => {
        res.setHeader('Content-Type', 'image/svg+xml');
        badgeRes.pipe(res);
      });
    });
  }).on('error', (err) => {
    res.status(500).send(`Error: ${err.message}`);
  });
};