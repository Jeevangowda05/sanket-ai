# Video Pipeline

```mermaid
flowchart LR
  Upload[Upload Video] --> Ext[Extension check]
  Ext --> Mime[MIME check]
  Mime --> Size[Size check]
  Size --> Dur[OpenCV duration <= 30s]
  Dur --> Queue[Queue analysis id]
  Queue --> Result[model_unavailable until weights exist]
```
