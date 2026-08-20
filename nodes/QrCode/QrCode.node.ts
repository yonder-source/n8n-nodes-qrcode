import {
	NodeConnectionTypes,
	NodeOperationError,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import { encodeQrCode, type ErrorCorrectionLevel } from './Encoder';
import { renderPng, renderSvg, type RenderOptions } from './Renderer';

type OutputFormat = 'png' | 'svg' | 'both';

// Binary-producing nodes cannot be used as AI tools.
// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool
export class QrCode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QR Code',
		name: 'qrCode',
		icon: { light: 'file:QrCode.svg', dark: 'file:QrCode.dark.svg' },
		group: ['transform'],
		version: 1,
		description: 'Generate QR Code images from text',
		subtitle: '={{$parameter["format"]}}',
		defaults: { name: 'QR Code' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'Text to encode in QR Code',
			},
			{
				displayName: 'Format',
				name: 'format',
				type: 'options',
				options: [
					{ name: 'PNG', value: 'png', action: 'Generate a PNG QR code' },
					{ name: 'SVG', value: 'svg', action: 'Generate an SVG QR code' },
					{ name: 'Both', value: 'both', action: 'Generate PNG and SVG QR codes' },
				],
				default: 'png',
			},
			{
				displayName: 'PNG Binary Property',
				name: 'pngBinaryProperty',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: { show: { format: ['png', 'both'] } },
			},
			{
				displayName: 'PNG File Name',
				name: 'pngFileName',
				type: 'string',
				default: 'qrcode.png',
				required: true,
				displayOptions: { show: { format: ['png', 'both'] } },
			},
			{
				displayName: 'SVG Binary Property',
				name: 'svgBinaryProperty',
				type: 'string',
				default: 'svg',
				required: true,
				displayOptions: { show: { format: ['svg', 'both'] } },
			},
			{
				displayName: 'SVG File Name',
				name: 'svgFileName',
				type: 'string',
				default: 'qrcode.svg',
				required: true,
				displayOptions: { show: { format: ['svg', 'both'] } },
			},
			{
				displayName: 'Size',
				name: 'size',
				type: 'number',
				typeOptions: { minValue: 64, maxValue: 4096 },
				default: 512,
				description: 'Image width and height in pixels',
			},
			{
				displayName: 'Margin',
				name: 'margin',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 16 },
				default: 4,
				description: 'Quiet-zone width in modules',
			},
			{
				displayName: 'Error Correction Level',
				name: 'errorCorrectionLevel',
				type: 'options',
				description: 'Higher levels improve damage recovery but reduce data capacity',
				options: [
					{ name: 'Low (L)', value: 'L' },
					{ name: 'Medium (M)', value: 'M' },
					{ name: 'Quartile (Q)', value: 'Q' },
					{ name: 'High (H)', value: 'H' },
				],
				default: 'M',
			},
			{
				displayName: 'Foreground Color',
				name: 'foregroundColor',
				type: 'color',
				default: '#000000',
			},
			{
				displayName: 'Background Color',
				name: 'backgroundColor',
				type: 'color',
				default: '#ffffff',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const text = this.getNodeParameter('text', itemIndex);
				if (typeof text !== 'string') {
					throw new NodeOperationError(this.getNode(), 'Text must be a string', { itemIndex });
				}
				if (text.length === 0) {
					throw new NodeOperationError(this.getNode(), 'Text must not be empty', { itemIndex });
				}
				const format = this.getNodeParameter('format', itemIndex) as OutputFormat;
				if (!['png', 'svg', 'both'].includes(format)) {
					throw new NodeOperationError(this.getNode(), 'Format must be PNG, SVG, or Both', { itemIndex });
				}

				const renderOptions: RenderOptions = {
					size: this.getNodeParameter('size', itemIndex) as number,
					margin: this.getNodeParameter('margin', itemIndex) as number,
					foregroundColor: this.getNodeParameter('foregroundColor', itemIndex) as string,
					backgroundColor: this.getNodeParameter('backgroundColor', itemIndex) as string,
				};
				if (!Number.isInteger(renderOptions.size) || renderOptions.size < 64 || renderOptions.size > 4096) {
					throw new NodeOperationError(this.getNode(), 'Size must be an integer between 64 and 4096', { itemIndex });
				}
				if (!Number.isInteger(renderOptions.margin) || renderOptions.margin < 0 || renderOptions.margin > 16) {
					throw new NodeOperationError(this.getNode(), 'Margin must be an integer between 0 and 16', { itemIndex });
				}
				const level = this.getNodeParameter(
					'errorCorrectionLevel',
					itemIndex,
				) as ErrorCorrectionLevel;
				if (!['L', 'M', 'Q', 'H'].includes(level)) {
					throw new NodeOperationError(this.getNode(), 'Invalid error correction level', { itemIndex });
				}
				const matrix = encodeQrCode(text, level);
				const binary = { ...items[itemIndex].binary };

				const pngProperty =
					format === 'svg' ? '' : (this.getNodeParameter('pngBinaryProperty', itemIndex) as string).trim();
				const svgProperty =
					format === 'png' ? '' : (this.getNodeParameter('svgBinaryProperty', itemIndex) as string).trim();
				if (!pngProperty.trim() && format !== 'svg') {
					throw new NodeOperationError(this.getNode(), 'PNG binary property must not be empty', { itemIndex });
				}
				if (!svgProperty.trim() && format !== 'png') {
					throw new NodeOperationError(this.getNode(), 'SVG binary property must not be empty', { itemIndex });
				}
				if (format === 'both' && pngProperty === svgProperty) {
					throw new NodeOperationError(this.getNode(), 'PNG and SVG binary properties must be different', { itemIndex });
				}

				if (pngProperty) {
					const fileName = this.getNodeParameter('pngFileName', itemIndex) as string;
					if (!fileName.trim()) {
						throw new NodeOperationError(this.getNode(), 'PNG file name must not be empty', { itemIndex });
					}
					if (binary[pngProperty]) {
						throw new NodeOperationError(this.getNode(), `Binary property "${pngProperty}" already exists`, { itemIndex });
					}
					binary[pngProperty] = await this.helpers.prepareBinaryData(
						renderPng(matrix, renderOptions),
						fileName,
						'image/png',
					);
				}
				if (svgProperty) {
					const fileName = this.getNodeParameter('svgFileName', itemIndex) as string;
					if (!fileName.trim()) {
						throw new NodeOperationError(this.getNode(), 'SVG file name must not be empty', { itemIndex });
					}
					if (binary[svgProperty]) {
						throw new NodeOperationError(this.getNode(), `Binary property "${svgProperty}" already exists`, { itemIndex });
					}
					binary[svgProperty] = await this.helpers.prepareBinaryData(
						Buffer.from(renderSvg(matrix, renderOptions), 'utf8'),
						fileName,
						'image/svg+xml',
					);
				}

				returnData.push({ json: items[itemIndex].json, binary, pairedItem: { item: itemIndex } });
			} catch (error) {
				const operationError =
					error instanceof NodeOperationError
						? error
						: new NodeOperationError(this.getNode(), error as Error, { itemIndex });
				if (!this.continueOnFail()) throw operationError;
				returnData.push({
					json: { ...items[itemIndex].json, error: operationError.message },
					...(items[itemIndex].binary ? { binary: items[itemIndex].binary } : {}),
					pairedItem: { item: itemIndex },
				});
			}
		}

		return [returnData];
	}
}
