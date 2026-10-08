# Model

Implemented:
- `BaseTemporalModel`
- `TCNModel`
- `TransformerModel` (swappable skeleton)
- `load_model_if_available()` explicit unavailable status

No pretrained weights are committed in `models/`.

## Training flow

```mermaid
flowchart LR
  Collect[Collect real samples] --> Preprocess[Landmark preprocessing + normalization]
  Preprocess --> Window[Sliding window generation]
  Window --> Train[Train TCN/Transformer in PyTorch]
  Train --> Evaluate[Evaluate on held-out real data]
  Evaluate --> Export[Export validated weights to models/]
```
