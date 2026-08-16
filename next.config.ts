import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // pdfjs-dist ships pdf.mjs as its own pre-bundled webpack output (it has
    // its own internal __webpack_require__.d harmony-export helper). It's
    // imported from three places inside react-pdf (index.js, Document.js,
    // Page.js); webpack's module concatenation (scope hoisting) partially
    // inlines that already-bundled module and corrupts one of the resulting
    // exports objects, so pdf.mjs's own defineProperty-based export helper
    // runs against `undefined` and throws "Object.defineProperty called on
    // non-object" as soon as the module is imported. Disabling concatenation
    // keeps each module's exports object intact.
    config.optimization.concatenateModules = false;
    return config;
  },
};

export default nextConfig;
