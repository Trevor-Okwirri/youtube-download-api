from fastapi import FastAPI, HTTPException
from pytube import YouTube
from pydantic import BaseModel

app = FastAPI()

class URLRequest(BaseModel):
    url: str

@app.post("/audio-options")
async def audio_options(request: URLRequest):
    url = request.url

    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        yt = YouTube(url)
        audio_options = []

        for stream in yt.streams.filter(only_audio=True):
            audio_options.append({
                'quality': stream.abr or 'Unknown',
                'downloadUrl': stream.url,
                'videoId': yt.video_id
            })

        return {
            'thumbnailUrl': yt.thumbnail_url,
            'audioOptions': audio_options
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/video-options")
async def video_options(request: URLRequest):
    url = request.url

    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        yt = YouTube(url)
        video_options = []

        for stream in yt.streams.filter(progressive=True, file_extension='mp4'):
            video_options.append({
                'quality': stream.resolution or 'Unknown',
                'type': 'mp4',
                'downloadUrl': stream.url,
                'videoId': yt.video_id
            })

        return {
            'thumbnailUrl': yt.thumbnail_url,
            'videoOptions': video_options
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
