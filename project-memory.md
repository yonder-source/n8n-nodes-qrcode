# Project Memory

## 2026-08-20 — QR Code node v0.1

- The package must have no runtime QR or image dependencies.
- The node is programmatic because encoding and binary rendering are local transformations.
- v0.1 supports selectable PNG, SVG, or Both output and practical size, margin, error-correction, and color controls.
- Text is encoded as UTF-8 byte mode with automatic QR Model 2 version and mask selection.
- PNG uses a one-bit indexed palette plus an internally generated uncompressed zlib stream; SVG uses compact paths.
- Existing CI and publish workflows are user-maintained and should be validated, not edited.
- npm publishing and Trusted Publisher setup remain user-operated external actions.
