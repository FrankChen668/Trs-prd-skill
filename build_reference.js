const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, WidthType, BorderStyle, ShadingType,
  VerticalAlign, PageNumber, ImageRun
} = require('docx');

// SIE logo (PNG)
const logoData = fs.readFileSync(path.join(__dirname, '赛意logo.png'));

const borderS = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
const borders = { top: borderS, bottom: borderS, left: borderS, right: borderS };

function hCell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: (opts.w || 2000), type: WidthType.DXA },
    shading: { fill: 'D9E2F3', type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, font: '微软雅黑', size: 20 })]
    })]
  });
}

function bodyCell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: (opts.w || 2000), type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: (opts.align || AlignmentType.LEFT),
      children: [new TextRun({ text, font: '微软雅黑', size: 20 })]
    })]
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: '微软雅黑', size: 20 } }
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: '微软雅黑', color: '9F2240' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: '微软雅黑', color: '9F2240' },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: '微软雅黑', color: '4A5558' },
        paragraph: { spacing: { before: 120, after: 60 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1800, bottom: 1800, left: 1800 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 60 },
            children: [
              new ImageRun({
                type: 'png',
                data: logoData,
                transformation: { width: 108, height: 36 },
                altText: { title: 'SIE Logo', description: '赛意信息', name: 'SIE Logo' }
              })
            ]
          }),
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '9F2240', space: 1 } }
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '第 ', font: '微软雅黑', size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], font: '微软雅黑', size: 18 }),
              new TextRun({ text: ' 页', font: '微软雅黑', size: 18 }),
            ]
          })
        ]
      })
    },
    children: [
      // Heading1
      new Paragraph({ heading: 'Heading1', children: [new TextRun('1. 文档控制')] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: ' ', font: '微软雅黑', size: 20 })] }),

      // Heading2
      new Paragraph({ heading: 'Heading2', children: [new TextRun('1.1 更改记录')] }),
      new Paragraph({ children: [new TextRun({ text: '本表格记录文档版本变更历史。', font: '微软雅黑', size: 20 })] }),

      // Sample table (correct DXA widths)
      new Table({
        width: { size: 9066, type: WidthType.DXA },
        columnWidths: [1600, 1800, 1200, 1200, 3200],
        rows: [
          new TableRow({
            children: [
              hCell('日期', { w: 1600 }),
              hCell('作者', { w: 1800 }),
              hCell('版本', { w: 1200 }),
              hCell('变更说明', { w: 1200 }),
              hCell('更改参考', { w: 3200 }),
            ]
          }),
          new TableRow({
            children: [
              bodyCell('2026-05-06', { w: 1600, align: AlignmentType.CENTER }),
              bodyCell('张三-EMP001', { w: 1800 }),
              bodyCell('1.0', { w: 1200, align: AlignmentType.CENTER }),
              bodyCell('初始版本', { w: 1200 }),
              bodyCell('创建功能设计文档', { w: 3200 }),
            ]
          }),
        ]
      }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun('')] }),
      new Paragraph({ heading: 'Heading3', children: [new TextRun('文档状态示例')] }),
      new Paragraph({ children: [new TextRun({ text: '版本：1.0  |  当前状态：编制中', font: '微软雅黑', size: 20 })] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(path.join(__dirname, 'reference.docx'), buffer);
  console.log('reference.docx created successfully');
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
