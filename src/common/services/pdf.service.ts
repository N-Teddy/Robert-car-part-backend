// src/common/services/pdf.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PDFService {
	private readonly logger = new Logger(PDFService.name);
	private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

	async compileTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
		if (this.templates.has(templateName)) {
			return this.templates.get(templateName);
		}

		try {
			const templatePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
			const templateContent = await fs.readFile(templatePath, 'utf-8');

			// Register Handlebars helpers
			handlebars.registerHelper('formatDate', (date: any) => {
				return new Date(date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
			});

			handlebars.registerHelper('formatCurrency', (amount: any) => {
				return parseFloat(amount).toFixed(2);
			});

			// Add these to the registerHandlebarsHelpers method in PDF service
			handlebars.registerHelper('multiply', (a: any, b: any) => {
				return a * b;
			});

			handlebars.registerHelper('divide', (a: any, b: any) => {
				if (b === 0) return 0;
				return a / b;
			});

			handlebars.registerHelper('add', (a: any, b: any) => {
				return a + b;
			});

			handlebars.registerHelper('subtract', (a: any, b: any) => {
				return a - b;
			});

			handlebars.registerHelper('getStatusColor', (status: string) => {
				const colors: { [key: string]: string } = {
					'COMPLETED': '#27ae60',
					'PENDING': '#f39c12',
					'CANCELLED': '#e74c3c',
					'PROCESSING': '#3498db'
				};
				return colors[status] || '#7f8c8d';
			});

			const template = handlebars.compile(templateContent);
			this.templates.set(templateName, template);
			return template;
		} catch (error) {
			this.logger.error(`Failed to compile template: ${templateName}`, error);
			throw new Error(`Failed to compile template: ${templateName}`);
		}
	}

	async generatePDF(templateName: string, data: any): Promise<Buffer> {
		let browser: puppeteer.Browser | null = null;

		try {
			const template = await this.compileTemplate(templateName);
			const html = template(data);

			// Launch Puppeteer - use boolean instead of string for headless
			browser = await puppeteer.launch({
				headless: true, // Changed from 'new' to true
				args: ['--no-sandbox', '--disable-setuid-sandbox']
			});

			const page = await browser.newPage();

			// Set the HTML content
			await page.setContent(html, {
				waitUntil: 'networkidle0'
			});

			// Generate PDF - explicitly convert to Buffer
			const pdfBuffer = await page.pdf({
				format: 'A4' as const,
				margin: {
					top: '0.5in',
					right: '0.5in',
					bottom: '0.5in',
					left: '0.5in'
				},
				printBackground: true
			});

			// Convert Uint8Array to Buffer
			return Buffer.from(pdfBuffer);
		} catch (error) {
			this.logger.error('Failed to generate PDF', error);
			throw new Error(`Failed to generate PDF: ${(error as Error).message}`);
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}

	// Helper method to generate PDF from HTML string directly
	async generatePDFFromHTML(html: string): Promise<Buffer> {
		let browser: puppeteer.Browser | null = null;

		try {
			browser = await puppeteer.launch({
				headless: true, // Changed from 'new' to true
				args: ['--no-sandbox', '--disable-setuid-sandbox']
			});

			const page = await browser.newPage();
			await page.setContent(html, { waitUntil: 'networkidle0' as const });

			const pdfBuffer = await page.pdf({
				format: 'A4' as const,
				margin: {
					top: '0.5in',
					right: '0.5in',
					bottom: '0.5in',
					left: '0.5in'
				},
				printBackground: true
			});

			// Convert Uint8Array to Buffer
			return Buffer.from(pdfBuffer);
		} catch (error) {
			this.logger.error('Failed to generate PDF from HTML', error);
			throw new Error(`Failed to generate PDF from HTML: ${(error as Error).message}`);
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}
}