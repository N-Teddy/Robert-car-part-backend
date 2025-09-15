// src/pdf/pdf.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { firefox } from 'playwright';
import { compile } from 'handlebars';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
	private browser: any;

	async onModuleInit() {
		// Launch Firefox browser when the module initializes
		try {
			this.browser = await firefox.launch({
				headless: true, // Run in headless mode for production
				args: ['--no-sandbox', '--disable-setuid-sandbox'], // Needed for Linux environments
			});
			console.log(
				'Firefox browser launched successfully for PDF generation'
			);
		} catch (error) {
			console.error('Failed to launch Firefox browser:', error);
			throw new Error('PDF service initialization failed');
		}
	}

	async onModuleDestroy() {
		// Close the browser when the module is destroyed
		if (this.browser) {
			await this.browser.close();
			console.log('Firefox browser closed');
		}
	}

	/**
	 * Generate PDF from a Handlebars template
	 * @param templateName Name of the template file (without extension)
	 * @param data Data to pass to the template
	 * @returns PDF buffer
	 */
	async generatePDF(templateName: string, data: any): Promise<Buffer> {
		if (!this.browser) {
			throw new Error(
				'PDF service not initialized. Browser not available.'
			);
		}

		try {
			// Read and compile the Handlebars template
			const templatePath = join(
				process.cwd(),
				'templates',
				`${templateName}.hbs`
			);
			const templateContent = readFileSync(templatePath, 'utf8');
			const compiledTemplate = compile(templateContent);

			// Render the template with data
			const htmlContent = compiledTemplate(data);

			// Create a new page and set content
			const page = await this.browser.newPage();
			await page.setContent(htmlContent, { waitUntil: 'networkidle' });

			// Generate PDF
			const pdfBuffer = await page.pdf({
				format: 'A4',
				printBackground: true,
				margin: {
					top: '20mm',
					right: '20mm',
					bottom: '20mm',
					left: '20mm',
				},
			});

			// Close the page
			await page.close();

			return pdfBuffer;
		} catch (error) {
			console.error('PDF generation error:', error);
			throw new Error(`Failed to generate PDF: ${error.message}`);
		}
	}
}
