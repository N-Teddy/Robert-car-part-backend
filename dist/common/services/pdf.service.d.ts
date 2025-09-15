export declare class PDFService {
    private readonly logger;
    private templates;
    compileTemplate(templateName: string): Promise<HandlebarsTemplateDelegate>;
    generatePDF(templateName: string, data: any): Promise<Buffer>;
    generatePDFFromHTML(html: string): Promise<Buffer>;
}
