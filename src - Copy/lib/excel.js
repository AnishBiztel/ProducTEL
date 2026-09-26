/**
 * Downloads an array of plain objects as a real .xlsx file.
 * `rows` should be an array of { ColumnName: value, ... } objects — the keys
 * become the header row, in the order they first appear.
 *
 * The xlsx library is fairly large, so it's loaded on demand here rather
 * than bundled into the app's initial load — it only downloads the first
 * time someone actually clicks an export button.
 */
export async function exportToExcel(filenameBase, sheetName, rows) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, (sheetName || "Sheet1").slice(0, 31));
  const safeName = (filenameBase || "export").replace(/[^a-z0-9-_]+/gi, "-");
  XLSX.writeFile(workbook, `${safeName}.xlsx`);
}
