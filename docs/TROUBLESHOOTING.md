# Troubleshooting

- **Camera not starting**: check browser permissions and HTTPS/localhost security requirements.
- **WebSocket reconnecting**: verify backend is running and `NEXT_PUBLIC_WS_URL` is correct.
- **Video upload rejected**: check extension, MIME type, size, and duration <= 30s.
- **No predictions**: expected without trained weights in `models/`.
