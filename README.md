# @yonder-source/n8n-nodes-qrcode

n8n community node for generating QR codes without runtime external dependencies.

The QR code encoder is implemented in this project rather than delegated to a
third-party QR code package. This keeps generated workflows self-contained and
avoids additional runtime installation requirements.

## Documentation

- [Usage guide](./docs/usage.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Limitations](./docs/limitations.md)

## Installation

Install the package from the n8n community nodes settings, or install it in an
n8n installation with npm:

```sh
npm install @yonder-source/n8n-nodes-qrcode
```

See the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/)
for the available installation options.

## Quick start

1. Add **QR Code** node to your workflow.
2. Set **Text** to a static value or expression, such as `{{$json.url}}`.
3. Select **Format**: `PNG`, `SVG`, or `Both`.
4. Run the workflow and inspect the output under item binary data.

## Usage

Add **QR Code** to a workflow and enter the text or URL to encode. `Text` and
file-name parameters support n8n expressions, for example `{{$json.url}}`.

The node processes every input item and preserves its JSON and existing binary
data. Choose one of these output formats:

- **PNG**: writes an `image/png` file to the `data` binary property by default.
- **SVG**: writes an `image/svg+xml` file to the `svg` binary property by default.
- **Both**: writes both files using distinct binary properties.

Available options include image size, quiet-zone margin, L/M/Q/H error
correction, foreground color, and background color. QR versions 1 through 40
are selected automatically according to the UTF-8 payload size.

### Parameter summary

| Parameter              | Default      | Validation                       |
| ---------------------- | ------------ | -------------------------------- |
| Text                   | Empty        | Required, non-empty string       |
| Format                 | PNG          | PNG, SVG, or Both                |
| PNG Binary Property    | `data`       | Required when format is PNG/Both |
| PNG File Name          | `qrcode.png` | Required when format is PNG/Both |
| SVG Binary Property    | `svg`        | Required when format is SVG/Both |
| SVG File Name          | `qrcode.svg` | Required when format is SVG/Both |
| Size                   | `512`        | Integer from 64 to 4096          |
| Margin                 | `4`          | Integer from 0 to 16             |
| Error Correction Level | `M`          | L, M, Q, or H                    |
| Foreground Color       | `#000000`    | `#RRGGBB`                        |
| Background Color       | `#ffffff`    | `#RRGGBB`                        |

For examples and detailed output behavior, see [docs/usage.md](./docs/usage.md).

### Example

Given an input item such as:

```json
{
	"url": "https://example.com/orders/123"
}
```

Set **Text** to `{{$json.url}}`. With the default PNG format, the output item
keeps the original JSON and adds the QR image at `binary.data`.

## Error handling

- Validation and execution errors are raised as `NodeOperationError`.
- If **Continue On Fail** is enabled, failed items are returned with `json.error`
  while preserving the original item link and existing binary data.
- Common failures and fixes are documented in [docs/troubleshooting.md](./docs/troubleshooting.md).

## Dependencies and attribution

The package has no runtime QR code dependencies. Development dependencies are
used only to build and validate the n8n community node.

QR encoding is provided by vendored source from Project Nayuki's MIT-licensed
QR Code generator. The copied source lives under `nodes/QrCode/vendor/`, and
the upstream copyright and license notice are retained in that source file.

## Development

```sh
npm install
npm test
npm run build
npm run lint
```

## License

MIT

## Resources

- [Repository](https://github.com/yonder-source/n8n-nodes-qrcode)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
