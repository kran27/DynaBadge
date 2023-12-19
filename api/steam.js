// vercel serverless function
module.exports = async (req, res) => {
    const https = require('https');
    const url = require('url');

    const queryObject = url.parse(req.url, true).query;
    const name = queryObject.name;

    var style = queryObject.style;
    if (!style || style == 'social') {
        style = 'flat-square';
    }

    if (!name) {
        res.status(400).send('Error: Missing name query parameter');
        return;
    }

    https.get(`https://steamcommunity.com/id/${name}`, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            const nameRegex = /<title>Steam Community :: (.*?)<\/title>/;
            const name = nameRegex.exec(data)[1];
            const statusRegex = /<div class="profile_in_game_header">(.*?)<\/div>/;
            var status = statusRegex.exec(data)[1];
            console.log(status);
            let game = '';
            if (status == 'Currently In-Game') {
                const gameRegex = /<div class="profile_in_game_name">(.*?)<\/div>/;
                game = gameRegex.exec(data)[1];
                console.log(game);
            }
            let color;
            let color2;
            if (status == 'Currently Online') {
                color = '53a4c4';
                color2 = '458097';
            }
            else if (status == 'Currently In-Game') {
                color = '8fb93b';
                color2 = '6e8c31';
            }
            else {
                color = '6a6a6a';
                color2 = '555555';
            }
            const idRegex = /<div class="playerAvatar profile_header_size (.*?)" data-miniprofile="(.*?)">/;
            const id = idRegex.exec(data)[2];
            console.log(id);

            if (status == 'Currently In-Game') {
                status = `${status}: ${game}`;
            }
            status = status.replace("Currently ", "");

            const avatarUrl = `https://store.steampowered.com/actions/ajaxgetavatarpersona?accountid=${id}`;
            https.get(avatarUrl, (avatarRes) => {
                let data = '';
                avatarRes.on('data', (chunk) => {
                    data += chunk;
                });
                avatarRes.on('end', () => {
                    const avatar = JSON.parse(data).userinfo.avatar_url;
                    const badgeUrl = `https://img.shields.io/static/v1?style=${style}&label=${name}&labelColor=171d25&message=${status}&color=${color}&logo=steam&logoColor=white`;
                    https.get(badgeUrl, (badgeRes) => {
                        let data = '';
                        badgeRes.on('data', (chunk) => {
                            data += chunk;
                        });
                        badgeRes.on('end', () => {
                            res.setHeader('Content-Type', 'image/svg+xml');
                            const gradient =
                                `<linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="5%" style="stop-color:#${color};stop-opacity:1" />
                        <stop offset="95%" style="stop-color:#${color2};stop-opacity:1" />
                    </linearGradient>
                    `;

                            const rectRegex = /<rect x="(.*?)" width="(.*?)" height="(.*?)" fill="#(.*?)"\/>/;
                            const match = rectRegex.exec(data);

                            const urlRegex = /xlink:href="(.*?)"/
                            const urlMatch = urlRegex.exec(data);

                            if (match) {
                                const x = match[1];
                                const width = match[2];
                                const height = match[3];

                                const newRect = `<rect x="${x}" width="${width}" height="${height}" fill="url(#grad1)"/>`;
                                let newData = data.replace(rectRegex, `${gradient}${newRect}`);
                                newData = newData.replace(urlMatch[1], avatar);

                                res.send(newData);
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