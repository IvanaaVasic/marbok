import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import path from 'node:path';
const source = await readFile('utils/productSelection.js', 'utf8');
const { toggleProduct, selectedCategories, createProductHold } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const storageSource = await readFile('utils/selectionStorage.js', 'utf8');
const { readSelection, writeSelection, clearStoredSelection } = await import('data:text/javascript;base64,' + Buffer.from(storageSource).toString('base64'));
function memoryStorage() {
    const values = new Map();
    return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const first = { product: { _id: 'one', name: 'Čokolada', productKey: '0001', package: '24 kom', price: '125' }, categoryTitle: 'Slatkiši', groupTitle: 'Čokolade' };
const second = { product: { _id: 'two', name: 'Deterdžent', productKey: '0002', package: '1 L', price: '240' }, categoryTitle: 'Hemija', groupTitle: 'Pranje' };

test('selection spans categories, deduplicates by product ID and toggles off', () => {
    let items = toggleProduct([], first); items = toggleProduct(items, second);
    assert.equal(items.length, 2);
    assert.equal(selectedCategories(items).length, 2);
    items = toggleProduct(items, { ...first, groupTitle: 'Novi proizvodi' });
    assert.deepEqual(items, [second]);
    assert.deepEqual(selectedCategories([]), []);
    assert.deepEqual(toggleProduct([], { product: {} }), []);
});
function gesture() {
    let scheduled = null, holds = 0;
    const control = createProductHold(() => holds++, {
        schedule: (callback, delay) => { assert.equal(delay, 450); scheduled = callback; return 1; },
        cancel: () => { scheduled = null; },
    });
    return { control, fire: () => scheduled?.(), get holds() { return holds; } };
}
const down = { clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true, button: 0 };
test('short tap does not select and leaves image click available', () => {
    const g = gesture(); g.control.down(down); g.control.end(); g.fire();
    assert.equal(g.holds, 0); assert.equal(g.control.consumeClick(), false);
});
test('hold selects once and consumes the subsequent click', () => {
    const g = gesture(); g.control.down(down); g.fire(); g.control.end();
    assert.equal(g.holds, 1); assert.equal(g.control.consumeClick(), true); assert.equal(g.control.consumeClick(), false);
});
test('scrolling, pointer cancellation and unmount cancel the hold', () => {
    for (const cancel of [g => g.control.move({ clientX: 10, clientY: 30 }), g => g.control.end(), g => g.control.dispose()]) {
        const g = gesture(); g.control.down(down); cancel(g); g.fire(); assert.equal(g.holds, 0);
    }
});
test('second finger and right mouse button do not start selection', () => {
    for (const event of [{ ...down, isPrimary: false }, { ...down, pointerType: 'mouse', button: 2 }]) {
        const g = gesture(); g.control.down(event); g.fire(); assert.equal(g.holds, 0);
    }
});
test('selected Excel contains exactly the chosen products in separate category tabs', async () => {
    const cache = path.join(process.cwd(), 'node_modules/.cache/marbok-selection-check');
    await mkdir(cache, { recursive: true });
    await build({ entryPoints: ['utils/catalogWorkbook.js'], bundle: true, platform: 'node', format: 'cjs',
        outfile: path.join(cache, 'workbook.cjs'), external: ['exceljs'],
        plugins: [{ name: 'image-stub', setup(build) {
            build.onResolve({ filter: /^@\/utils\/image$/ }, () => ({ path: 'image', namespace: 'test' }));
            build.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const urlFromThumbnail = value => value;' }));
        }}],
    });
    const require = createRequire(import.meta.url);
    const { createCatalogWorkbook } = require(path.join(cache, 'workbook.cjs'));
    const storage = memoryStorage();
    writeSelection(storage, { uid: 'owner', active: true, items: [first] });
    // A category navigation creates a fresh provider and restores the first selection.
    const restoredSelection = readSelection(storage, 'owner');
    const combined = toggleProduct(restoredSelection.items, second);
    writeSelection(storage, { ...restoredSelection, items: combined });
    const workbook = await createCatalogWorkbook(selectedCategories(readSelection(storage, 'owner').items), { selectedOnly: true });
    const ExcelJS = require('exceljs'); const restored = new ExcelJS.Workbook();
    await restored.xlsx.load(await workbook.xlsx.writeBuffer());
    assert.equal(restored.worksheets.length, 2);
    assert.equal(restored.worksheets[0].name, 'Slatkiši');
    assert.equal(restored.worksheets[1].name, 'Hemija');
    for (const [index, entry] of [first, second].entries()) {
        const sheet = restored.worksheets[index];
        assert.equal(sheet.rowCount, 6);
        assert.ok(sheet.getCell('A1').value.includes('PONUDA IZABRANIH'));
        assert.equal(sheet.getCell('B6').value, entry.product.name);
        assert.equal(sheet.getCell('C6').value, entry.product.productKey);
        assert.equal(sheet.getCell('D6').value, entry.product.package);
        assert.equal(sheet.getCell('E6').value, entry.product.price + ' RSD');
    }
    const all = await createCatalogWorkbook(selectedCategories([first, second]));
    assert.ok(all.worksheets[0].getCell('A1').value.includes('KATALOG PROIZVODA'));
});


test('selection survives multiple full-page category navigations', () => {
    const storage = memoryStorage();
    writeSelection(storage, { uid: 'owner', active: true, items: [first] });
    const nextCategory = readSelection(storage, 'owner');
    assert.deepEqual(nextCategory.items, [first]);
    writeSelection(storage, { ...nextCategory, items: toggleProduct(nextCategory.items, second) });
    assert.deepEqual(readSelection(storage, 'owner').items, [first, second]);
    assert.deepEqual(selectedCategories(readSelection(storage, 'owner').items).map(category => category.title), ['Slatkiši', 'Hemija']);
});
test('trash clears persisted selection and cannot resurrect it on navigation', () => {
    const storage = memoryStorage();
    writeSelection(storage, { uid: 'owner', active: true, items: [first, second] });
    writeSelection(storage, { uid: 'owner', active: false, items: [] });
    assert.deepEqual(readSelection(storage, 'owner'), { uid: 'owner', active: false, items: [] });
});
test('selection belongs to one account and logout erases it', () => {
    const storage = memoryStorage();
    writeSelection(storage, { uid: 'owner', active: true, items: [first] });
    assert.equal(readSelection(storage, 'other').items.length, 0);
    clearStoredSelection(storage);
    assert.equal(readSelection(storage, 'owner').items.length, 0);
});
test('unavailable storage or invalid data cannot crash the picker', () => {
    const broken = { getItem() { throw Error('blocked'); }, setItem() { throw Error('full'); }, removeItem() { throw Error('blocked'); } };
    assert.equal(readSelection(broken, 'owner').items.length, 0);
    assert.equal(writeSelection(broken, { uid: 'owner', active: true, items: [first] }), false);
    assert.doesNotThrow(() => clearStoredSelection(broken));
    assert.equal(readSelection({ getItem: () => '{invalid' }, 'owner').items.length, 0);
    assert.equal(readSelection(null, 'owner').items.length, 0);
});
