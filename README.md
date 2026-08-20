# @yonder-source/n8n-nodes-qrcode

n8n community node for generating QR codes without runtime external dependencies.

The QR code encoder is implemented in this project rather than delegated to a
third-party QR code package. This keeps generated workflows self-contained and
avoids additional runtime installation requirements.

## Installation

Install the package from the n8n community nodes settings, or install it in an
n8n installation with npm:

```sh
npm install @yonder-source/n8n-nodes-qrcode
```

See the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/)
for the available installation options.

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

### Example

Given an input item such as:

```json
{
  "url": "https://example.com/orders/123"
}
```

Set **Text** to `{{$json.url}}`. With the default PNG format, the output item
keeps the original JSON and adds the QR image at `binary.data`.

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
