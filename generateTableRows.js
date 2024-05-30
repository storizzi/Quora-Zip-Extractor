function generateTableRows(items) {
    if (!items.length) return { tableHeader: '', tableRows: '' };

    const keys = Object.keys(items[0]);
    const tableHeader = keys.map(key => `<th>${key}</th>`).join('');
    const tableRows = items.map((item, index) => {
        const row = keys.map(key => `<td>${item[key] || ''}</td>`).join('');
        return `<tr><td>${index + 1}</td>${row}</tr>`;
    }).join('');

    return { tableHeader, tableRows };
}

module.exports = { generateTableRows };
