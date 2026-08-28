# QR Code Node Troubleshooting

This page lists common errors and how to fix them.

## Text must not be empty

Cause:

- `Text` resolves to an empty string.

Fix:

- Provide a non-empty value.
- If using expressions, verify the source field exists.

## Text must be a string

Cause:

- `Text` resolved to a non-string type (number, object, array).

Fix:

- Convert to string in expression, for example:
  - `{{$json.value.toString()}}`

## PNG/SVG binary property must not be empty

Cause:

- Binary property parameter is blank.

Fix:

- Set a non-empty property name, such as `data`, `svg`, `qrPng`, or `qrSvg`.

## PNG and SVG binary properties must be different

Cause:

- In `both` mode, both outputs target the same property.

Fix:

- Use two distinct property names.

## Binary property "..." already exists

Cause:

- Output property already exists in input item binary.

Fix:

- Change the output property name.
- Or remove the existing binary property earlier in the workflow.

## Size must be an integer between 64 and 4096

Cause:

- `Size` is out of range or not an integer.

Fix:

- Use an integer in range, for example `256` or `512`.

## Margin must be an integer between 0 and 16

Cause:

- `Margin` is out of range or not an integer.

Fix:

- Use an integer in range, for example `4`.

## Data too long

Cause:

- Input text exceeds QR capacity for the selected error correction level.

Fix:

- Shorten the text.
- Lower error correction level (for example `H` to `M` or `L`) if acceptable.

## QR image cannot be decoded by scanner

Checks:

- Increase `Size` (for example `512`).
- Keep contrast high (`#000000` on `#ffffff`).
- Increase `Margin` if scanners struggle with edges.
- Avoid modifying generated binary output before scan/transfer.
