"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const playwright_1 = require("playwright");
const handlebars_1 = require("handlebars");
let PdfService = class PdfService {
    async onModuleInit() {
        try {
            this.browser = await playwright_1.firefox.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            console.log('Firefox browser launched successfully for PDF generation');
        }
        catch (error) {
            console.error('Failed to launch Firefox browser:', error);
            throw new Error('PDF service initialization failed');
        }
    }
    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
            console.log('Firefox browser closed');
        }
    }
    async generatePDF(templateName, data) {
        if (!this.browser) {
            throw new Error('PDF service not initialized. Browser not available.');
        }
        try {
            const templatePath = (0, path_1.join)(process.cwd(), 'templates', `${templateName}.hbs`);
            const templateContent = (0, fs_1.readFileSync)(templatePath, 'utf8');
            const compiledTemplate = (0, handlebars_1.compile)(templateContent);
            const htmlContent = compiledTemplate(data);
            const page = await this.browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle' });
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
            await page.close();
            return pdfBuffer;
        }
        catch (error) {
            console.error('PDF generation error:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map