const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const ts = require("typescript");

function setup(overflow = "") {
  const document = { body: { style: { overflow } } };
  const source = fs.readFileSync(path.join(__dirname, "../src/hooks/dialogScrollLock.ts"), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const context = { exports: {}, document };
  vm.runInNewContext(code, context);
  return { document, lock: context.exports.lockDialogScroll };
}

for (const order of [[0, 1], [1, 0]]) {
  test(`nested dialogs restore scrolling in cleanup order ${order}`, () => {
    const { document, lock } = setup("auto");
    const release = [lock(), lock()];
    release[order[0]]();
    assert.equal(document.body.style.overflow, "hidden");
    release[order[1]]();
    assert.equal(document.body.style.overflow, "auto");
  });
}
test("repeated cleanup and a later dialog preserve the original style", () => {
  const { document, lock } = setup();
  const release = lock();
  release(); release();
  assert.equal(document.body.style.overflow, "");
  const next = lock();
  assert.equal(document.body.style.overflow, "hidden");
  next();
  assert.equal(document.body.style.overflow, "");
});
