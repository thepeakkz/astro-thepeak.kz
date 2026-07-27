#!/usr/bin/env python3
"""
Script to extract WebP covers from video/image files with 9:16 Center Crop (1080x1920).

Algorithm:
1. Extract frame from video file (or load image).
2. Check source aspect ratio / dimensions.
3. Scale image so it completely covers 1080x1920 along the smaller dimension (preserving Aspect Ratio).
4. Center crop to 1080x1920px.
5. Save final file as .webp.
"""

import argparse
import os
import subprocess
import sys
import tempfile


def get_media_dimensions(file_path):
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=p=0",
        file_path,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0 or not res.stdout.strip():
        return None, None
    parts = res.stdout.strip().split(",")
    if len(parts) >= 2:
        try:
            return int(parts[0]), int(parts[1])
        except ValueError:
            pass
    return None, None


def find_cwebp():
    for path in ["cwebp", "/opt/homebrew/bin/cwebp", "/usr/local/bin/cwebp"]:
        res = subprocess.run([path, "-version"], capture_output=True, text=True)
        if res.returncode == 0:
            return path
    return "cwebp"


CWEBP_BIN = find_cwebp()


def generate_webp_cover(
    file_path, output_path=None, target_w=1080, target_h=1920, timestamp="00:00:00.5"
):
    if not output_path:
        base, _ = os.path.splitext(file_path)
        output_path = base + ".webp"

    w, h = get_media_dimensions(file_path)
    print(f"Processing '{file_path}' (source dimensions: {w}x{h})...")

    ext = os.path.splitext(file_path)[1].lower()
    is_video = ext in {".mp4", ".mov", ".webm", ".m4v"}

    vf_filter = (
        f"scale=w='if(gt(sar,0),iw*sar,iw)':h=ih,setsar=1,scale={target_w}:{target_h}:force_original_aspect_ratio=increase,crop={target_w}:{target_h}"
    )

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
        tmp_png = tmp_file.name

    try:
        if is_video:
            cmd_ffmpeg = [
                "ffmpeg",
                "-y",
                "-ss",
                timestamp,
                "-i",
                file_path,
                "-vf",
                vf_filter,
                "-vframes",
                "1",
                "-update",
                "1",
                tmp_png,
            ]
            res = subprocess.run(cmd_ffmpeg, capture_output=True, text=True)
            if res.returncode != 0:
                cmd_ffmpeg[3] = "00:00:00.0"
                res = subprocess.run(cmd_ffmpeg, capture_output=True, text=True)
                if res.returncode != 0:
                    print(f"Error extracting frame from {file_path}: {res.stderr}")
                    return False
        else:
            cmd_ffmpeg = [
                "ffmpeg",
                "-y",
                "-i",
                file_path,
                "-vf",
                vf_filter,
                "-update",
                "1",
                tmp_png,
            ]
            res = subprocess.run(cmd_ffmpeg, capture_output=True, text=True)
            if res.returncode != 0:
                print(f"Error processing image {file_path}: {res.stderr}")
                return False

        cmd_cwebp = [CWEBP_BIN, "-q", "80", tmp_png, "-o", output_path]
        res_cwebp = subprocess.run(cmd_cwebp, capture_output=True, text=True)
        if res_cwebp.returncode != 0:
            print(f"Error encoding webp for {file_path}: {res_cwebp.stderr}")
            return False

        print(f"  -> Generated: '{output_path}' ({target_w}x{target_h})")
        return True
    finally:
        if os.path.exists(tmp_png):
            try:
                os.remove(tmp_png)
            except OSError:
                pass


def process_directory(directory_path, target_w=1080, target_h=1920, include_images=False):
    video_exts = {".mp4", ".mov", ".webm", ".m4v"}
    image_exts = {".jpg", ".jpeg", ".png", ".webp"}
    count = 0
    for root, _, files in os.walk(directory_path):
        for f in sorted(files):
            ext = os.path.splitext(f)[1].lower()
            if ext in video_exts or (include_images and ext in image_exts):
                media_path = os.path.join(root, f)
                if generate_webp_cover(
                    media_path, target_w=target_w, target_h=target_h
                ):
                    count += 1
    print(f"\nTotal WebP covers processed/generated: {count}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate WebP covers with 9:16 (1080x1920) center crop."
    )
    parser.add_argument(
        "path",
        nargs="?",
        default="public/cases",
        help="Path to video file or directory",
    )
    parser.add_argument("--width", type=int, default=1080, help="Target width")
    parser.add_argument("--height", type=int, default=1920, help="Target height")
    parser.add_argument(
        "--include-images",
        action="store_true",
        help="Also crop and re-encode existing static image covers to 1080x1920",
    )
    args = parser.parse_args()

    if os.path.isfile(args.path):
        generate_webp_cover(args.path, target_w=args.width, target_h=args.height)
    elif os.path.isdir(args.path):
        process_directory(
            args.path,
            target_w=args.width,
            target_h=args.height,
            include_images=args.include_images,
        )
    else:
        print(f"Error: Path {args.path} not found.")
        sys.exit(1)


if __name__ == "__main__":
    main()

