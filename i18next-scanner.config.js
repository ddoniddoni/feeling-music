module.exports = {
    /**
     * Input folder (source code)
     **/
    input: ['app/**/*.{ts,tsx}'],
    /**
     * Output folder (messages)
     **/
    output: './translation',
    options: {
        debug: true,
        removeUnusedKeys: true,
        /**
         * Whether to sort translation keys in alphabetical order
         **/
        sort: true,
        func: {
            /**
             * List of function names which mark translation strings
             **/
            list: ['i18next.t', 'i18n.t', 't', '__'],
            extensions: ['.ts', '.tsx'],
        },
        /**
         * List of supported languages
         **/
        lngs: [
            'en',
            'ko',
        ],
        defaultLng: 'ko',
        /**
         * Default value returned for missing translations
         **/
        // defaultValue: '',
        defaultValue(lng, ns, key) {
            const keyAsDefaultValue = ['ko'];
            if (keyAsDefaultValue.includes(lng)) {
                const separator = '~~';
                const value = key.includes(separator) ? key.split(separator)[1] : key;

                return value;
            }

            return '';
        },
        resource: {
            /**
             * Where translation files should be loaded from
             **/
            loadPath: 'messages/{{lng}}/translation.json',
            /**
             * Where translation files should be saved to
             **/
            savePath: 'messages/{{lng}}/translation.json',
            jsonIndent: 2,
            lineEnding: '\n',
        },
        keySeparator: false,
        pluralSeparator: '_',
        contextSeparator: '_',
        contextDefaultValues: [],
        /**
         * Values surrounded by {{ }} are treated as params
         * e.g. "Hello {{ name }}" - "name" must be provided at runtime
         **/
        interpolation: {
            prefix: '{{',
            suffix: '}}',
        },
    },
};
