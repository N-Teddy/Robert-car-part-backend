declare const _default: (() => {
    port: number;
    corsOrigin: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    corsOrigin: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
}>;
export default _default;
