import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class PdfService implements OnModuleInit, OnModuleDestroy {
    private browser;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    generatePDF(templateName: string, data: any): Promise<Buffer>;
}
