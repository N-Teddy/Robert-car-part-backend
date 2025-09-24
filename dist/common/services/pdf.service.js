"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PDFService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const common_1 = require("@nestjs/common");
const handlebars = require("handlebars");
const fs = require("fs/promises");
const path = require("path");
const puppeteer = require("puppeteer");
let PDFService = PDFService_1 = class PDFService {
    constructor() {
        this.logger = new common_1.Logger(PDFService_1.name);
        this.templates = new Map();
    }
    async compileTemplate(templateName) {
        if (this.templates.has(templateName)) {
            return this.templates.get(templateName);
        }
        try {
            const templatePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
            const templateContent = await fs.readFile(templatePath, 'utf-8');
            handlebars.registerHelper('formatDate', (date) => {
                return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            });
            handlebars.registerHelper('formatCurrency', (amount) => {
                return parseFloat(amount).toFixed(2);
            });
            handlebars.registerHelper('multiply', (a, b) => {
                return a * b;
            });
            handlebars.registerHelper('divide', (a, b) => {
                if (b === 0)
                    return 0;
                return a / b;
            });
            handlebars.registerHelper('add', (a, b) => {
                return a + b;
            });
            handlebars.registerHelper('subtract', (a, b) => {
                return a - b;
            });
            handlebars.registerHelper('formatCurrency', (amount) => {
                if (amount === null || amount === undefined)
                    return '0.00';
                const num = parseFloat(amount);
                return num.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            });
            handlebars.registerHelper('formatPercentage', (value) => {
                if (value === null || value === undefined)
                    return '0.00';
                const num = parseFloat(value);
                return num.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            });
            handlebars.registerHelper('round', (value, decimals) => {
                if (value === null || value === undefined)
                    return '0';
                const num = parseFloat(value);
                const precision = decimals || 0;
                return num.toFixed(precision);
            });
            handlebars.registerHelper('getStatusColor', (status) => {
                const colors = {
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
        }
        catch (error) {
            this.logger.error(`Failed to compile template: ${templateName}`, error);
            throw new Error(`Failed to compile template: ${templateName}`);
        }
    }
    async generatePDF(templateName, data) {
        let browser = null;
        try {
            const template = await this.compileTemplate(templateName);
            const html = template(data);
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                printBackground: true
            });
            return Buffer.from(pdfBuffer);
        }
        catch (error) {
            this.logger.error('Failed to generate PDF', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    async generatePDFFromHTML(html) {
        let browser = null;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                printBackground: true
            });
            return Buffer.from(pdfBuffer);
        }
        catch (error) {
            this.logger.error('Failed to generate PDF from HTML', error);
            throw new Error(`Failed to generate PDF from HTML: ${error.message}`);
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
};
exports.PDFService = PDFService;
exports.PDFService = PDFService = PDFService_1 = __decorate([
    (0, common_1.Injectable)()
], PDFService);
//# sourceMappingURL=pdf.service.js.map