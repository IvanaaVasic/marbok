import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = process.cwd();
const cache = path.join(root, 'node_modules/.cache/marbok-export-check');
await mkdir(cache, { recursive: true });
await build({ stdin: { contents: 'export {createOrderPdfFile} from "./utils/orderPdf"; export {createOrderExcelFile} from "./utils/orderExcel";', resolveDir: root },
    bundle: true, platform: 'node', format: 'cjs', outfile: path.join(cache, 'exports.cjs'),
    external: ['jspdf', 'jspdf-autotable', 'exceljs'],
    plugins: [{ name: 'test-image-resolver', setup(build) {
        build.onResolve({ filter: /^(\.\/image|@\/utils\/image)$/ }, () => ({ path: 'image', namespace: 'fixture' }));
        build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const urlFromThumbnail = source => source;' }));
    }}],
});
const { createOrderPdfFile, createOrderExcelFile } = require(path.join(cache, 'exports.cjs'));
const order = { orderNumber: 'ORD-TEST-50', customerName: 'Đorđe Živković - Čačak', createdAt: '2026-09-04T09:00:00Z',
    email: 'primer@example.com', phone: '060 123 456', pib: '123456789', pass: '00018',
    items: Array.from({ length: 50 }, (_, index) => ({ name: `Artikal ${index + 1}: Čokoladne bombone sa lešnikom i mlečnim punjenjem`,
        productKey: String(13000 + index), package: '24 x 18 g', quantity: 3, price: '1.250,50' })) };

test('50-item PDF preserves Serbian letters and uses at most 4 A4 pages', async () => {
    const fontBase64 = (await readFile('public/fonts/RedHatDisplay-Regular.ttf')).toString('base64');
    const image = new Uint8Array(await readFile('public/logo.jpg'));
    const file = await createOrderPdfFile(order, { fontBase64, images: Array(50).fill(image) });
    assert.equal(file.type, 'application/pdf');
    const bytes = Buffer.from(await file.arrayBuffer());
    const pageCount = (bytes.toString('latin1').match(/\/Type \/Page\b/g) || []).length;
    assert.ok(pageCount >= 2 && pageCount <= 4, `Page count: ${pageCount}`);
    await writeFile('/tmp/marbok-order-50.pdf', bytes);
    console.log(`50-item PDF: ${pageCount} A4 pages`);
});
test('Excel preserves all 50 rows, historical date, amounts and order identity', async () => {
    const file = await createOrderExcelFile({ orderNumber: order.orderNumber, createdAt: order.createdAt,
        customer: { name: order.customerName, email: order.email, phone: order.phone }, items: order.items });
    const ExcelJS = require('exceljs'); const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.worksheets[0];
    assert.equal(sheet.rowCount, 56);
    assert.equal(sheet.getCell('B6').value, '13000');
    assert.equal(sheet.getCell('B55').value, '13049');
    assert.equal(sheet.getCell('E6').value, 3);
    assert.equal(sheet.getCell('F56').value, '187.575 RSD');
    assert.ok(sheet.getCell('A3').value.includes(order.customerName));
    assert.ok(sheet.getCell('A4').value.includes('2026'));
});
test('native sharing receives a File; cancellation is quiet and unsupported sharing downloads', async () => {
    const code = await readFile('utils/shareFile.js', 'utf8');
    const { shareFile } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
    const file = new File(['pdf'], 'order.pdf', { type: 'application/pdf' });
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    const oldDocument = globalThis.document;
    let payload, clicked = false;
    try {
        Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { canShare: () => true, share: async data => { payload = data; } } });
        assert.equal(await shareFile(file), 'shared'); assert.equal(payload.files[0], file);
        navigator.share = async () => { const error = new Error('Cancelled'); error.name = 'AbortError'; throw error; };
        assert.equal(await shareFile(file), 'cancelled');
        navigator.canShare = () => false;
        globalThis.document = { body: { appendChild() {} }, createElement: () => ({ click() { clicked = true; }, remove() {} }) };
        const oldTimer = globalThis.setTimeout;
        globalThis.setTimeout = callback => { callback(); return 0; };
        try { assert.equal(await shareFile(file), 'downloaded'); assert.ok(clicked); }
        finally { globalThis.setTimeout = oldTimer; }
    } finally {
        Object.defineProperty(globalThis, 'navigator', previous);
        globalThis.document = oldDocument;
    }
});
