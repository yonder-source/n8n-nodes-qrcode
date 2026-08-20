# QR Code Node Specification

## Purpose

Generate QR Code image files inside n8n without network calls, credentials, or
runtime third-party dependencies.

## Node contract

- One main input and one main output.
- Process each input item independently and preserve its JSON and existing binary data.
- Link every successful or continued-error output to its source item.
- Encode non-empty text as UTF-8 byte-mode QR Model 2, automatically selecting version 1–40 and mask 0–7.
- Use the selected L, M, Q, or H error-correction level without silently upgrading it.

### Parameters

| Parameter | Default | Validation |
| --- | --- | --- |
| Text | Empty | Required and non-empty; expressions supported |
| Format | PNG | PNG, SVG, or Both |
| PNG binary property | `data` | Required for PNG/Both |
| PNG file name | `qrcode.png` | Required for PNG/Both; expressions supported |
| SVG binary property | `svg` | Required for SVG/Both |
| SVG file name | `qrcode.svg` | Required for SVG/Both; expressions supported |
| Size | 512 | Integer from 64 through 4096 pixels |
| Margin | 4 | Integer from 0 through 16 modules |
| Error correction | M | L, M, Q, or H |
| Foreground | `#000000` | `#RRGGBB`, different from background |
| Background | `#ffffff` | `#RRGGBB`, different from foreground |

PNG output uses indexed one-bit pixels and a standards-compliant PNG/zlib
stream. SVG output uses a compact path and crisp-edge rendering. Raster size
must contain at least one pixel for every QR and margin module.

## Errors

Invalid values, conflicting or pre-existing output properties, insufficient raster size,
and payloads exceeding version 40 raise `NodeOperationError` with the source
item index. Continue On Fail converts the failure into an item-linked error object.

## Version 0.1 exclusions

Logo overlays, transparency, gradients, styled modules, forced versions, and
numeric/alphanumeric/Kanji segmentation are not supported.

## Acceptance

`npm test`, `npm run lint`, `npm run build`, and `npm pack --dry-run` must pass.
Independent decoding tests cover ASCII, URLs, Traditional Chinese, emoji, all
error-correction levels, capacity limits, PNG structure, SVG output, and node behavior.
