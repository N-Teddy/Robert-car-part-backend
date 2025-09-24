declare const _default: (() => {
    port: number;
    url: string;
    corsOrigin: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    url: string;
    corsOrigin: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
}>;
export default _default;
