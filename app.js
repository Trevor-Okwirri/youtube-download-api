const express = require('express');
const cors = require('cors');
const app = express();
const ytdl = require('ytdl-core');

app.use(express.json());
app.use(cors());

app.post('/video-options', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const formats = ytdl.filterFormats(info.formats, 'audioandvideo');

        let videoOptions = formats.map(format => ({
            quality: format.qualityLabel || 'Unknown',
            type: format.container || 'Unknown',
            downloadUrl: `${req.protocol}://${req.get('host')}/download-video?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format.itag)}`,
            videoId: info.videoDetails.videoId,
            thumbnailUrl: `https://img.youtube.com/vi/${info.videoDetails.videoId}/0.jpg`
        }));

        res.json({ videoOptions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch video options' });
    }
});

app.get('/download-video', async (req, res) => {
    const { url, format } = req.query;

    if (!url || !format) {
        return res.status(400).json({ error: 'URL and format are required' });
    }

    try {
        const videoInfo = await ytdl.getInfo(url);
        const selectedFormat = ytdl.chooseFormat(videoInfo.formats, { quality: format });

        if (!selectedFormat) {
            return res.status(500).json({ error: 'Selected format not found' });
        }

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${videoInfo.videoDetails.title}.mp4"`);

        ytdl(url, { format: selectedFormat })
            .pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to download video' });
    }
});

app.get('/download-audio', async (req, res) => {
    const { url, format } = req.query;

    if (!url || !format) {
        return res.status(400).json({ error: 'URL and format are required' });
    }

    try {
        const audioInfo = await ytdl.getInfo(url);
        const audioFormats = ytdl.filterFormats(audioInfo.formats, 'audioonly');

        const selectedFormat = audioFormats.find(format => format.itag === format);

        if (!selectedFormat) {
            return res.status(500).json({ error: 'Selected format not found' });
        }

        res.setHeader('Content-Type', 'audio/mp3');
        res.setHeader('Content-Disposition', `attachment; filename="${audioInfo.videoDetails.title}.mp3"`);

        ytdl(url, { format: selectedFormat })
            .pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to download audio' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
