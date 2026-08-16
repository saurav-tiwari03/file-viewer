import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Dev-only webpack bug (webpack/webpack#20095, fixed upstream in
    // webpack/webpack#20097 but not yet in the version Next.js vendors here;
    // see vercel/next.js#89177 and mozilla/pdf.js#20478). Next's dev devtool
    // wraps each module body in `eval(...)`; the `var __webpack_exports__ =
    // {}` at the end of pdfjs-dist's pre-bundled pdf.mjs gets hoisted inside
    // that eval and shadows the outer __webpack_exports__ that webpack's own
    // ESM-interop `__webpack_require__.r(...)` call refers to, so it runs
    // against `undefined` and throws "Object.defineProperty called on
    // non-object" the moment pdf.mjs is imported (before any PDF loads).
    // Production builds don't use eval-wrapped modules and are unaffected.
    if (dev && !isServer) {
      config.module.rules.push({
        test: /pdfjs-dist[\\/]build[\\/]pdf(\.min)?\.mjs$/,
        loader: path.resolve(__dirname, "scripts/pdfjs-eval-shadowing-loader.cjs"),
      });
    }
    return config;
  },
};

export default nextConfig;
