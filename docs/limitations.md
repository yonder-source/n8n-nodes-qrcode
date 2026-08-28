# QR Code Node Limitations

Here is the list of currently supported and unsupported features.

## Supported

- UTF-8 byte-mode payloads
- QR Model 2
- Auto version selection from 1 to 40
- Error correction levels `L`, `M`, `Q`, `H`
- PNG and SVG output

## Not supported

- Logo overlays
- Gradients and styled modules
- Forced version selection
- Structured append
- Numeric/alphanumeric/Kanji segmentation optimization

## Practical guidance

- Very long payloads can fail with `Data too long`, especially at higher correction levels.
- For robust scanning, prefer high contrast colors and enough margin.
