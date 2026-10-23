import { canonical, requireFields, requireText, requireInteger, authoringError as error } from '../contracts/value.js';
export function normalizeCodeContent(input) {
    const c = canonical(input);
    requireFields(c, ['path', 'language', 'text', 'encoding', 'lineEnding'], 'Code document');
    requireText(c.path, 'Source path');
    requireText(c.language, 'Language');
    if (c.path.includes('\\') || /^[\/]|[:\x00-\x1f]/.test(c.path) || c.path.split('/').some(p => !p || p === '.' || p === '..'))
        throw error('CODE_INVALID_PATH', 'Code paths must be relative portable paths');
    if (!/^[a-z][a-z0-9.+#-]{0,31}$/.test(c.language) || typeof c.text !== 'string' || c.text.length > 1048576 || c.text.includes('\0'))
        throw error('CODE_INVALID_SOURCE', 'Invalid language or bounded source text');
    if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(c.text))
        throw error('CODE_INVALID_SOURCE', 'Source contains an unpaired surrogate');
    c.encoding ??= 'utf-8';
    c.lineEnding ??= (c.text.includes('\r\n') && !/(?<!\r)\n|\r(?!\n)/.test(c.text) ? 'crlf' : /\r/.test(c.text) ? 'preserve' : 'lf');
    if (c.encoding !== 'utf-8' || !['lf', 'crlf', 'preserve'].includes(c.lineEnding))
        throw error('CODE_UNSUPPORTED_ENCODING', 'Only UTF-8 and declared newline policies are supported');
    if (c.lineEnding === 'lf' && c.text.includes('\r') || c.lineEnding === 'crlf' && /(?<!\r)\n|\r(?!\n)/.test(c.text))
        throw error('CODE_LINE_ENDING', 'Source differs from its newline policy');
    return c;
}
function boundary(text, n) { return !(n > 0 && n < text.length && /[\uD800-\uDBFF]/.test(text[n - 1]) && /[\uDC00-\uDFFF]/.test(text[n])); }
export function editCode(content, edits) {
    if (!Array.isArray(edits) || edits.length > 10000)
        throw error('CODE_INVALID_EDITS', 'A bounded edit list is required');
    const sorted = edits.map(e => { requireFields(e, ['start', 'end', 'text'], 'Text edit'); requireInteger(e.start, 'start', 0, content.text.length); requireInteger(e.end, 'end', e.start, content.text.length); if (typeof e.text !== 'string' || !boundary(content.text, e.start) || !boundary(content.text, e.end))
        throw error('CODE_INVALID_EDITS', 'Invalid UTF-16 edit boundary'); return e; }).sort((a, b) => a.start - b.start || a.end - b.end);
    for (let i = 1; i < sorted.length; i++)
        if (sorted[i].start < sorted[i - 1].end || sorted[i].start === sorted[i - 1].start)
            throw error('CODE_OVERLAPPING_EDITS', 'Overlapping edits are ambiguous');
    let text = content.text;
    for (const e of sorted.reverse())
        text = text.slice(0, e.start) + e.text + text.slice(e.end);
    return normalizeCodeContent({ ...content, text });
}
