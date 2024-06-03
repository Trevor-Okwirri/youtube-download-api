from flask import Flask, request, jsonify
from pytube import YouTube

app = Flask(__name__)

@app.route('/audio-options', methods=['POST'])
def audio_options():
    url = request.json.get('url')

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        yt = YouTube(url)
        audio_options = []

        for stream in yt.streams.filter(only_audio=True):
            audio_options.append({
                'quality': stream.abr or 'Unknown',
                'downloadUrl': stream.url,
                'videoId': yt.video_id
            })

        return jsonify({'thumbnailUrl': yt.thumbnail_url,'audioOptions': audio_options,
                })
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/video-options', methods=['POST'])
def video_options():
    url = request.json.get('url')

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    yt = YouTube(url)
    video_options = []

    for stream in yt.streams.filter(progressive=True, file_extension='mp4'):
        video_options.append({
            'quality': stream.resolution or 'Unknown',
            'type': 'mp4',
            'downloadUrl': stream.url,
            'videoId': yt.video_id
        })

    return jsonify({'thumbnailUrl': yt.thumbnail_url,'videoOptions': video_options})

if __name__ == '__main__':
    app.run(port=3000)
