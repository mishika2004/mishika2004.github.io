# How to Provide Your Background Video / Photo Sequence

This portfolio includes a high-performance **Scroll-Driven Animation Engine**. When you scroll the page, the animation scrubs forward and backward seamlessly in sync with your scroll position!

You can provide your animation in either of the two formats below:

---

## 🌟 Method 1: Multiple Photos Arranged as an Image Sequence (RECOMMENDED)

### Why this is the best method:
- **Zero stutter or lag**: Mobile devices and desktop browsers can scrub canvas frames instantly at 60fps to 120fps.
- **Immediate reverse playback**: Video decoders often buffer or lag when you scroll backwards; image sequences scrub backwards with zero delay.
- **Crystal-clear quality**: Each frame is rendered losslessly or with high-efficiency WebP/JPEG.

### Where to put your photos:
Place your images inside:
```
assets/sequence/
  ├── frame_0001.webp (or .jpg / .png)
  ├── frame_0002.webp
  ├── frame_0003.webp
  ...
  └── frame_0120.webp
```

> **Recommended frame count:** 60 to 180 frames (approx. 2 to 5 seconds of footage at 30fps).  
> **Recommended resolution:** 1920×1080 or 1280×720.  
> **Format:** `.webp` (smallest file size and highest speed) or `.jpg`.

### How to convert any video into an image sequence in 10 seconds:

#### Option A: Using Free Online Converters (No installation needed)
1. Go to [EZGIF Video to JPG / WebP Converter](https://ezgif.com/video-to-jpg) or [CloudConvert](https://cloudconvert.com/mp4-to-jpg).
2. Upload your video.
3. Set Frame Rate (fps) to `24` or `30`.
4. Download the zip of images, rename them (e.g. `frame_0001.jpg` to `frame_0120.jpg`), and extract them into the `assets/sequence/` folder.

#### Option B: Using FFmpeg (Command line - fastest & highest quality)
Run this single command in your terminal:
```bash
ffmpeg -i your_video.mp4 -vf "scale=1920:-1:flags=lanczos,fps=30" -q:v 85 assets/sequence/frame_%04d.webp
```

---

## 🎬 Method 2: Single MP4 / WebM Video File

If you prefer to provide a single video file instead of multiple photos:

### Where to put your video:
Save your video file here:
```
assets/video/background.mp4
```
*(or `assets/video/background.webm`)*

### Important Tip for Smooth Video Scrubbing:
For an MP4 to scrub smoothly on scroll, every frame should ideally be a keyframe (All-Intra / `GOP=1`).  
You can re-encode any video for ultra-fast scrubbing using FFmpeg:
```bash
ffmpeg -i your_input.mp4 -movflags faststart -vcodec libx264 -crf 22 -g 1 -pix_fmt yuv420p assets/video/background.mp4
```

---

## 🎨 What happens if you haven't added the video yet?
We have built an **interactive, fully animated coastal landscape** directly into the website! It features:
- Floating smiling clouds with cute eyes and blush
- Rotating lighthouse light beam
- Gentle wave ripples and rolling hills with parallax depth
- Twinkling stars that respond to your mouse & scroll position

The engine will automatically detect when you drop your photos or video into the folders and switch seamlessly!
