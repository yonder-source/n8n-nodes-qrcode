# QR Code Node Usage

This guide explains how to use the **QR Code** node from `@yonder-source/n8n-nodes-qrcode`.

## What this node does

The node encodes text into a QR Code image and writes the output to item binary data.

- Input: one text value per item
- Output: PNG, SVG, or both
- Behavior: preserves existing `json` and existing `binary` data

## Parameters

| Parameter              | Type    | Default      | Required         | Notes                                                    |
| ---------------------- | ------- | ------------ | ---------------- | -------------------------------------------------------- |
| Text                   | string  | empty        | Yes              | Can use expressions such as `{{$json.url}}`              |
| Format                 | options | `png`        | Yes              | `png`, `svg`, or `both`                                  |
| PNG Binary Property    | string  | `data`       | For `png`/`both` | Must be non-empty and not already present on item binary |
| PNG File Name          | string  | `qrcode.png` | For `png`/`both` | Can use expressions                                      |
| SVG Binary Property    | string  | `svg`        | For `svg`/`both` | Must be non-empty and not already present on item binary |
| SVG File Name          | string  | `qrcode.svg` | For `svg`/`both` | Can use expressions                                      |
| Size                   | number  | `512`        | Yes              | Integer from `64` to `4096`                              |
| Margin                 | number  | `4`          | Yes              | Integer from `0` to `16` modules                         |
| Error Correction Level | options | `M`          | Yes              | `L`, `M`, `Q`, `H`                                       |
| Foreground Color       | color   | `#000000`    | Yes              | `#RRGGBB`                                                |
| Background Color       | color   | `#ffffff`    | Yes              | `#RRGGBB`                                                |

## Output behavior

### Format: PNG

- Writes an `image/png` file to `binary.<pngBinaryProperty>`
- Default property: `binary.data`

### Format: SVG

- Writes an `image/svg+xml` file to `binary.<svgBinaryProperty>`
- Default property: `binary.svg`

### Format: Both

- Writes both PNG and SVG outputs
- `PNG Binary Property` and `SVG Binary Property` must be different

## Example workflow input/output

### Input item

```json
{
	"json": {
		"url": "https://example.com/orders/123"
	}
}
```

### Parameter example

- Text: `{{$json.url}}`
- Format: `both`
- PNG Binary Property: `qrPng`
- SVG Binary Property: `qrSvg`

### Output item shape

```json
{
	"json": {
		"url": "https://example.com/orders/123"
	},
	"binary": {
		"qrPng": {
			"mimeType": "image/png",
			"fileName": "qrcode.png"
		},
		"qrSvg": {
			"mimeType": "image/svg+xml",
			"fileName": "qrcode.svg"
		}
	}
}
```

## Expression examples

- Text from a field: `{{$json.text}}`
- Dynamic PNG name: `qr-{{$json.orderId}}.png`
- Dynamic SVG name: `qr-{{$now.toFormat('yyyyLLdd-HHmmss')}}.svg`

## Continue On Fail behavior

If **Continue On Fail** is enabled, invalid items are returned with:

- Original `json`
- Existing binary data preserved
- `json.error` message describing the failure
