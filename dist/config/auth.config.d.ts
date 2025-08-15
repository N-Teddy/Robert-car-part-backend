declare const _default: (() => {
    saltRounds: number;
    passwordMinLength: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    saltRounds: number;
    passwordMinLength: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
}>;
export default _default;
