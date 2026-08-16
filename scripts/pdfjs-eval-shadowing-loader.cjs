// Works around a webpack dev-mode bug (webpack/webpack#20095, fixed upstream
// in webpack/webpack#20097 but not yet in the webpack version Next.js vendors
// here — see vercel/next.js#89177).
//
// pdfjs-dist ships pdf.mjs as its own pre-bundled output, ending in:
//   var __webpack_exports__ = {};
// In dev, Next wraps each module body in an `eval(...)` call (devtool:
// eval-source-map) so it can attach per-module source maps. Inside that
// eval, `var __webpack_exports__ = {}` gets hoisted and shadows the *outer*
// __webpack_exports__ that webpack's own `__webpack_require__.r(...)` call
// (emitted just before the eval, for real ESM interop) refers to — so by
// the time `.r()` runs, it's operating on `undefined`, and its internal
// `Object.defineProperty(exports, ...)` throws "called on non-object".
//
// Referencing the shadowed variable right after its declaration is enough
// to stop webpack from treating it as unused and eliding/renaming it out
// from under the outer reference — this is the workaround identified in
// https://github.com/mozilla/pdf.js/issues/20478.
module.exports = function pdfjsEvalShadowingLoaderFix(source) {
  const marker = "var __webpack_exports__ = {};";
  const index = source.indexOf(marker);
  if (index === -1) return source;
  const insertAt = index + marker.length;
  return source.slice(0, insertAt) + "\n__webpack_exports__;\n" + source.slice(insertAt);
};
