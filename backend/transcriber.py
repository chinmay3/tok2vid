import whisper
import yt_dlp
from pathlib import Path

AUDIO_DIR = Path(__file__).parent / "data" / "audio"

# Browsers to try cookies from, in preference order
_BROWSERS = ["chrome", "safari", "firefox", "edge"]


def _build_ydl_opts(output_path: str, browser: str | None) -> dict:
    opts = {
        # lowest quality audio — speech transcription doesn't need high bitrate
        "format": "worstaudio/bestaudio[abr<=64]/bestaudio/best",
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "32",
            }
        ],
        "outtmpl": output_path,
        "quiet": True,
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            )
        },
    }
    if browser:
        opts["cookiesfrombrowser"] = (browser,)
    return opts


def download_audio(url: str, video_id: str) -> dict:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    output_path = str(AUDIO_DIR / f"{video_id}.%(ext)s")

    # Try without cookies first, then fall back to each browser
    attempts = [None] + _BROWSERS
    last_err = None

    for browser in attempts:
        try:
            ydl_opts = _build_ydl_opts(output_path, browser)
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                title = info.get("title", "Unknown")
            return {"audio_path": str(AUDIO_DIR / f"{video_id}.mp3"), "title": title}
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(
        f"Could not download video after trying all cookie sources. "
        f"Last error: {last_err}. "
        "Make sure you're logged into YouTube in Chrome or Safari."
    )

    return {"audio_path": str(AUDIO_DIR / f"{video_id}.mp3"), "title": title}


def transcribe_audio(audio_path: str, model_name: str = "base") -> str:
    model = whisper.load_model(model_name)
    result = model.transcribe(audio_path)
    return result["text"]


def download_and_transcribe(url: str, video_id: str) -> dict:
    download_result = download_audio(url, video_id)
    transcript = transcribe_audio(download_result["audio_path"])
    return {
        "title": download_result["title"],
        "transcript": transcript,
    }
