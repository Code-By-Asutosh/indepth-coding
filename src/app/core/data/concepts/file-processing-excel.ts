import { ConceptContent } from '../../models/content.model';

export const FILE_PROCESSING_EXCEL: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'file-processing-excel',
  title: 'File Processing: Excel',

  hook:
    'Finance asks for "just a quick export" of two million transaction rows into an Excel file. The naive approach loads ' +
    'all two million rows into memory as Java objects before writing a single byte, and the server runs out of heap and crashes.',

  problem:
    'Excel files are a genuinely common business requirement, reports, bulk data imports, financial exports, but a ' +
    'spreadsheet is a structured binary (or XML based) format, not something you can just write plain text into, and ' +
    'naive approaches to large exports can silently exhaust available memory.',

  aha: {
    statement: 'Apache POI is the standard Java library for reading and writing Excel files, and it offers both a simple, fully in memory API and a specialized streaming API specifically built to handle very large spreadsheets without running out of memory.',
    analogy:
      'It is like the difference between holding an entire library\'s worth of books in your arms at once (loading everything into memory) versus reading and shelving one book at a time from a cart (streaming row by row). Both eventually process the same number of books, but only one approach can scale to a library with millions of them.'
  },

  underTheHood: [
    'Apache POI provides HSSF (old .xls binary format), XSSF (modern .xlsx, XML based, fully in memory), and SXSSF (a streaming variant of XSSF designed specifically for writing very large files with a small, bounded memory footprint).',
    'XSSF keeps the ENTIRE workbook in memory as Java objects until you call save, which is simple and fine for small to medium files but becomes a genuine problem, memory exhaustion, at a large enough row count.',
    'SXSSF keeps only a configurable window of the most recent rows in memory (for example, the last 100 rows) and flushes everything older directly to a temporary file on disk as you go, letting you generate a file with millions of rows using a small, constant amount of memory.',
    'Reading large Excel files has the same problem in reverse: an event based streaming reader (processing the underlying XML directly, row by row, rather than materializing the whole workbook as objects) avoids loading a huge file entirely into memory just to read it.',
    'Excel formulas, cell styles, and formatting are represented as their own distinct objects (CellStyle, Font, formula strings) that need to be created and reused carefully, since creating a new style object for every single cell in a huge spreadsheet is itself a real memory and performance cost.',
    'Column data types matter: a cell genuinely containing a number needs to be written as a numeric cell (not a string that merely looks like a number), or Excel will treat it as text, which breaks sorting, filtering, and formula calculations on that column.'
  ],

  inTheWild: [
    'A finance reporting feature exporting a multi million row transaction history using SXSSF specifically, after an earlier version using plain XSSF ran out of heap memory in production on a smaller server.',
    'A bulk data import feature reading an uploaded Excel file with a streaming event based reader, avoiding loading the entire uploaded file into memory before validating and processing individual rows.',
    'Interview question: "Why would you choose SXSSF over XSSF for generating an Excel export?" Because SXSSF only keeps a small, bounded window of recent rows in memory at any time, flushing older rows to disk, which lets it generate arbitrarily large files without proportionally growing memory usage.'
  ],

  showMe: {
    caption: 'A large export loading every row into memory at once versus streaming rows with a bounded memory footprint.',
    bad: {
      language: 'java',
      code:
        'XSSFWorkbook workbook = new XSSFWorkbook();\n' +
        'Sheet sheet = workbook.createSheet("Transactions");\n' +
        'for (int i = 0; i < transactions.size(); i++) { // 2,000,000 rows\n' +
        '    Row row = sheet.createRow(i);\n' +
        '    row.createCell(0).setCellValue(transactions.get(i).getAmount());\n' +
        '} // every single row object stays in memory until workbook.write() is called',
      explanation:
        'All two million row objects, and their cells, sit fully in memory simultaneously, which for a large enough dataset exhausts the available heap before the file is even written.'
    },
    good: {
      language: 'java',
      code:
        'SXSSFWorkbook workbook = new SXSSFWorkbook(100); // keep only 100 rows in memory at a time\n' +
        'Sheet sheet = workbook.createSheet("Transactions");\n' +
        'for (int i = 0; i < transactions.size(); i++) {\n' +
        '    Row row = sheet.createRow(i);\n' +
        '    row.createCell(0).setCellValue(transactions.get(i).getAmount());\n' +
        '} // rows beyond the last 100 are automatically flushed to a temp file on disk',
      explanation:
        'Only the most recent 100 rows are ever held in memory at once, with older rows automatically flushed to disk, letting this scale to millions of rows with constant, bounded memory use.'
    }
  },

  impact: {
    before: 'A large Excel export loads every row into memory at once, risking an out of memory crash proportional to dataset size.',
    after: 'A streaming writer keeps only a small, fixed window of rows in memory, scaling to arbitrarily large exports with constant memory usage.',
    metric: 'For a multi million row export, switching from a fully in memory approach to a streaming one is often the difference between a server crash and a successful export, not just a minor performance tweak.'
  },

  alternatives: [
    {
      name: 'XSSF (fully in memory)',
      whenToUse: 'Small to moderate sized spreadsheets where simplicity matters more than memory efficiency, and full random access to any cell is useful.',
      whenNotToUse: 'Very large exports, where holding the entire workbook in memory risks exhausting available heap.'
    },
    {
      name: 'SXSSF (streaming write)',
      whenToUse: 'Large exports, where memory efficiency during writing is essential, at the cost of losing random access to already flushed rows.',
      whenNotToUse: 'Small files, or scenarios needing to read back and modify already written rows within the same operation.'
    },
    {
      name: 'CSV instead of Excel',
      whenToUse: 'Very large exports where recipients do not actually need Excel specific features like formulas, multiple sheets, or cell formatting.',
      whenNotToUse: 'Recipients who specifically expect a real spreadsheet with formatting, multiple sheets, or Excel formulas.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Using the default, fully in memory XSSFWorkbook for a large, unbounded export without considering row count ahead of time.',
      why:
        'It works perfectly fine in testing with a small sample dataset, then fails in production the first time a customer or report genuinely has millions of rows, because every single row object stays resident in memory the whole time.',
      fix: 'Use SXSSFWorkbook for any export whose row count could plausibly grow large, or explicitly cap and paginate exports that do not need to return everything at once.'
    }
  ],

  proveIt: {
    question: 'Why does SXSSFWorkbook use dramatically less memory than XSSFWorkbook when writing a very large spreadsheet?',
    answer:
      'SXSSFWorkbook only keeps a small, configurable window of the most recently created rows in memory at any time, flushing older rows directly to a temporary file on disk as new rows are added, instead of holding every row object in memory for the entire operation.'
  },

  oneLiner: 'A large export is not a formatting problem, it is a memory problem, and Apache POI has two very different tools depending on which one you actually have.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'memory-management',
      title: 'Memory Management',
      note: 'Choosing between XSSF and SXSSF is a direct, practical application of understanding heap memory limits and how object retention affects them.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'file-processing-pdf',
      title: 'File Processing: PDF',
      note: 'Both PDF and Excel generation face the same underlying question, generate everything in memory at once, or stream it, once the data involved gets large enough.'
    }
  ]
};
