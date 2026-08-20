import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { describe, expect, it } from 'vitest';

import { QrCode } from '../nodes/QrCode/QrCode.node';

const defaults: Record<string, unknown> = {
	text: '{{$json.text}}',
	format: 'png',
	pngBinaryProperty: 'data',
	pngFileName: 'qrcode.png',
	svgBinaryProperty: 'svg',
	svgFileName: 'qrcode.svg',
	size: 256,
	margin: 4,
	errorCorrectionLevel: 'M',
	foregroundColor: '#000000',
	backgroundColor: '#ffffff',
};

function createContext(
	items: INodeExecutionData[],
	parameters: Record<string, unknown> = {},
	continueOnFail = false,
): IExecuteFunctions {
	return {
		getInputData: () => items,
		getNodeParameter: (name: string, itemIndex: number) => {
			if (name === 'text' && !(name in parameters)) return items[itemIndex].json.text;
			return parameters[name] ?? defaults[name];
		},
		getNode: () => ({
			id: '1',
			name: 'QR Code',
			type: 'qrCode',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		continueOnFail: () => continueOnFail,
		helpers: {
			prepareBinaryData: async (buffer: Buffer, fileName?: string, mimeType?: string) => ({
				data: buffer.toString('base64'),
				mimeType: mimeType ?? 'application/octet-stream',
				fileName,
			}),
		},
	} as unknown as IExecuteFunctions;
}

describe('QR Code node', () => {
	it('resolves text per item and preserves JSON, binary, and item linking', async () => {
		const items: INodeExecutionData[] = [
			{
				json: { text: 'first' },
				binary: { original: { data: 'AA==', mimeType: 'application/octet-stream' } },
			},
			{ json: { text: 'second' } },
		];
		const result = await QrCode.prototype.execute.call(createContext(items));

		expect(result[0]).toHaveLength(2);
		expect(result[0][0].json).toBe(items[0].json);
		expect(result[0][0].binary?.original).toEqual(items[0].binary?.original);
		expect(result[0][0].binary?.data.mimeType).toBe('image/png');
		expect(result[0][1].pairedItem).toEqual({ item: 1 });
	});

	it('does not overwrite an existing output binary property', async () => {
		await expect(
			QrCode.prototype.execute.call(
				createContext([
					{ json: { text: 'collision' }, binary: { data: { data: 'AA==', mimeType: 'image/png' } } },
				]),
			),
		).rejects.toThrow('already exists');
	});

	it('rejects non-string text values', async () => {
		await expect(
			QrCode.prototype.execute.call(createContext([{ json: { text: 'ignored' } }], { text: 123 })),
		).rejects.toThrow('Text must be a string');
	});

	it('outputs PNG and SVG to separate binary properties', async () => {
		const result = await QrCode.prototype.execute.call(
			createContext([{ json: { text: 'both' } }], {
				format: 'both',
				pngBinaryProperty: ' data ',
				svgBinaryProperty: ' svg ',
			}),
		);
		expect(result[0][0].binary?.data.mimeType).toBe('image/png');
		expect(result[0][0].binary?.svg.mimeType).toBe('image/svg+xml');
	});

	it('rejects colliding properties and supports continue on fail', async () => {
		const parameters = { format: 'both', pngBinaryProperty: 'output', svgBinaryProperty: 'output' };
		await expect(
			QrCode.prototype.execute.call(createContext([{ json: { text: 'bad' } }], parameters)),
		).rejects.toThrow('must be different');

		const result = await QrCode.prototype.execute.call(
			createContext(
				[
					{
						json: { text: 'bad', requestId: '123' },
						binary: { original: { data: 'AA==', mimeType: 'application/octet-stream' } },
					},
				],
				parameters,
				true,
			),
		);
		expect(result[0][0].json).toEqual({ text: 'bad', requestId: '123', error: expect.stringContaining('must be different') });
		expect(result[0][0].binary).toEqual({
			original: { data: 'AA==', mimeType: 'application/octet-stream' },
		});
		expect(result[0][0].pairedItem).toEqual({ item: 0 });
	});
});
