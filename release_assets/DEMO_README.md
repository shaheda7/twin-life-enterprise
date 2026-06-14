Placeholder demo assets for Twin Life Enterprise.

Files included:
- demo_screenshot1.svg — Placeholder screenshot 1
- demo_screenshot2.svg — Placeholder screenshot 2

To replace with real demo material:
1. Record a short demo (MP4/MOV/WebM) and name it `demo_recording.mp4`.
2. Take screenshots and overwrite the SVGs with PNG/JPG files using the same filenames or add new files.
3. Upload directly to the GitHub release:

```bash
# upload specific files to release v1.1
cd /path/to/twin-life-enterprise
gh release upload v1.1 release_assets/demo_recording.mp4 release_assets/demo_screenshot1.png --clobber
```

For judges: download the `submission_summary.zip` then view the demo recording and screenshots in the `release_assets/` folder on the release page.
