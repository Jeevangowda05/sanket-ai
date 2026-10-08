# Frontend

Routes:
- `/` Home
- `/live` camera + MediaPipe tracker + context mode + live status
- `/video` video analysis scope
- `/history` session history placeholder
- `/about` scope and honesty statements

Camera uses browser MediaDevices API. Landmark tracking runs in-browser with
`@mediapipe/tasks-vision` (`useMediaPipeTracker`) and never uploads raw frames.

## Live tracker (Phase 2, schema v1)

- Model assets come from `NEXT_PUBLIC_MEDIAPIPE_{HAND,POSE,FACE}_MODEL_URL`
  (HTTPS URL or `/models/*.task`). Empty means `unavailable`, never an error.
- Tracker states: `unavailable | loading | ready | processing | error | stopped`.
- `LandmarkOverlay` draws a subtle canvas over `<video>`: hands (teal),
  pose (amber), face subset (muted red, overlay/diagnostics only).
- `RollingBuffer` (default 45 frames) feeds `useLiveWebSocket.sendSequence`
  with the latest 30-frame window at ~10 Hz. Single frames are never classified.
- Diagnostics on `/live` show camera, tracker, feature `v1` + count 258,
  buffer fill, socket, model, and tracker fps independently.
