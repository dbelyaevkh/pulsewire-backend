export default {
    // Resolves the path aliases declared in tsconfig.json, including the ones
    // added by `nest g library`. Requires Vite 8, which ships this option.
    resolve: { tsconfigPaths: true },
    test: {
        globals: true,
        root: './',
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    include: ['**/*.spec.ts'],
                },
            },
            {
                extends: true,
                test: {
                    name: 'integration',
                    include: ['src/**/*.integration.ts'],
                    globalSetup: ['test/global-setup.ts'],
                },
            },
        ],
    },
};
