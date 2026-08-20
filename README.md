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

After installation, add the QR code node to a workflow and provide the text or
URL to encode. The node generates a QR code that can be passed to subsequent
n8n nodes.

## Dependencies

The package has no runtime QR code dependencies. Development dependencies are
used only to build and validate the n8n community node.

## Development

```sh
npm install
npm run build
npm run lint
```

## License

MIT

## Resources

- [Repository](https://github.com/yonder-source/n8n-nodes-qrcode)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
