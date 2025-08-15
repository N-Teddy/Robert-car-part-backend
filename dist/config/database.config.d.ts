declare const _default: (() => {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: {
        rejectUnauthorized: boolean;
    };
    pool: {
        max: number;
        connectionTimeoutMillis: number;
        idleTimeoutMillis: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: {
        rejectUnauthorized: boolean;
    };
    pool: {
        max: number;
        connectionTimeoutMillis: number;
        idleTimeoutMillis: number;
    };
}>;
export default _default;
