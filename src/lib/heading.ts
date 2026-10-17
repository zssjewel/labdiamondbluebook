/**
 * 標題轉錨點 id。保留中文（模板原本只保留英文字母，中文標題會變成空 id，目錄點不動）。
 * 文章目錄和 MDX 標題都用這個函數，兩邊的 id 才會一致。這個文件不可引用 fs。
 */
export function headingId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9㐀-鿿豈-﫿\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
