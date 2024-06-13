const express = require('express');
const bodyParser = require('body-parser');
const { getInfo } = require('ytdl-core');

const app = express();
app.use(bodyParser.json());


app.post('/audio-options', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const info = await getInfo(url);
        const audioOptions = info.formats
            .filter(format => format.mimeType.startsWith('audio'))
            .map(format => ({
                quality: format.audioBitrate ? `${format.audioBitrate}kbps` : 'Unknown',
                downloadUrl: format.url,
                type: 'mp3',
                size: format.contentLength,
                videoId: info.videoDetails.videoId
            }));

        return res.json({
            videoName: info.videoDetails.title,
            thumbnailUrl: info.videoDetails.thumbnails[0].url,
            audioOptions
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.post('/video-options', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const info = await getInfo(url);
        const videoOptions = info.formats
            .filter(format => format.container === 'mp4' && format.hasVideo && format.hasAudio)
            .map(format => ({
                quality: format.qualityLabel || 'Unknown',
                type: 'mp4',
                downloadUrl: format.url,
                size: format.contentLength,
                videoId: info.videoDetails.videoId
            }));

        return res.json({
            videoName: info.videoDetails.title,
            thumbnailUrl: info.videoDetails.thumbnails[0].url,
            videoOptions
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});

module.exports = app;
