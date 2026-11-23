export default {
    resolve: { tsconfigPaths: true },
    test: {
        globals: true,
        root: './',
        include: ['**/*.e2e-spec.ts'],
    },
};
