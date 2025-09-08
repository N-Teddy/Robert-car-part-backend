import { ConfigService } from '@nestjs/config';
import { NotificationEnum } from '../../common/enum/notification.enum';
interface EmailOptions {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
}
interface RetryOptions {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
}
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    private templates;
    private readonly defaultRetryOptions;
    private readonly isDevelopment;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private registerHelpers;
    private loadTemplates;
    sendEmail(options: EmailOptions, retryOptions?: RetryOptions): Promise<boolean>;
    sendBulkEmails(recipients: string[], subject: string, template: string, context: Record<string, any>, retryOptions?: RetryOptions): Promise<{
        sent: string[];
        failed: string[];
    }>;
    private generateDefaultHtml;
    private sleep;
    getTemplateForNotificationType(type: NotificationEnum): string;
}
export {};
