export {};

declare module 'mongoose' {
  namespace Schema {
    namespace Types {
      class SupportedLanguage extends SchemaType {
        /** This schema type's name, to defend against minifiers that mangle function names. */
        static schemaName: 'SupportedLanguage';

        /** Default options for this SchemaType */
        defaultOptions?: Record<string, any>;
      }
    }
  }
}
