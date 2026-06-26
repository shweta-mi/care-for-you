const escapePdf = (value) =>
  String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replace(/[^\x20-\x7E]/g, "-");

const wrap = (text, width = 86) => {
  const words = String(text).split(/\s+/);
  return words.reduce(
    (lines, word) => {
      const current = lines.at(-1);
      if (`${current} ${word}`.trim().length <= width) {
        lines[lines.length - 1] = `${current} ${word}`.trim();
      } else {
        lines.push(word);
      }
      return lines;
    },
    [""],
  );
};

export function downloadTextPdf(filename, title, sections) {
  const contentLines = sections.flatMap(({ heading, rows }) => [
    heading.toUpperCase(),
    ...rows.flatMap((row) => wrap(row)),
    "",
  ]);
  const pages = [];
  for (let index = 0; index < contentLines.length; index += 42) {
    pages.push([title, "", ...contentLines.slice(index, index + 42)]);
  }
  if (!pages.length) pages.push([title]);

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds = [];
  const contentIds = [];
  pages.forEach((pageLines, pageIndex) => {
    const body = pageLines
      .map((line, index) => {
        const size = index === 0 ? 18 : 10;
        const y = 800 - index * 17;
        return `BT /F1 ${size} Tf 48 ${y} Td (${escapePdf(line)}) Tj ET`;
      })
      .join("\n");
    const footer = `BT /F1 9 Tf 275 28 Td (Page ${pageIndex + 1} of ${pages.length}) Tj ET`;
    const commands = `${body}\n${footer}`;
    contentIds.push(
      addObject(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`),
    );
    pageIds.push(null);
  });
  const pagesId = objects.length + pages.length + 1;
  pages.forEach((_, index) => {
    pageIds[index] = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`,
    );
  });
  addObject(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
  );
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
