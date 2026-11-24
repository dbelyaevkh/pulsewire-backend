export class AppConfigError extends Error {
    details: string;
    constructor(details: string, message?: string) {
        super(message);

        this.details = details;
        this.name = 'AppConfigError';
    }
}
