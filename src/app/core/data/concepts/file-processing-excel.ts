import { ConceptContent } from '../../models/content.model';

export const FILE_PROCESSING_EXCEL: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "file-processing-excel",
  title: "File Processing: Excel",
  topicType: "framework",
  simpleIntuition: "Finance asks for \"just a quick export\" of two million transaction rows into an Excel file. The naive approach loads all two million rows into memory as Java objects before writing a single byte, and the server runs out of heap and crashes.",
  formalMeaning: "Apache POI is the standard Java library for reading and writing Excel files, and it offers both a simple, fully in memory API and a specialized streaming API specifically built to handle very large spreadsheets without running out of memory.",
  whyItExists: "Excel files are a genuinely common business requirement, reports, bulk data imports, financial exports, but a spreadsheet is a structured binary (or XML based) format, not something you can just write plain text into, and naive approaches to large exports can silently exhaust available memory.",
  howItWorksInternally: [
    "Apache POI provides HSSF (old .xls binary format), XSSF (modern .xlsx, XML based, fully in memory), and SXSSF (a streaming variant of XSSF designed specifically for writing very large files with a small, bounded memory footprint).",
    "XSSF keeps the ENTIRE workbook in memory as Java objects until you call save, which is simple and fine for small to medium files but becomes a genuine problem, memory exhaustion, at a large enough row count.",
    "SXSSF keeps only a configurable window of the most recent rows in memory (for example, the last 100 rows) and flushes everything older directly to a temporary file on disk as you go, letting you generate a file with millions of rows using a small, constant amount of memory.",
    "Reading large Excel files has the same problem in reverse: an event based streaming reader (processing the underlying XML directly, row by row, rather than materializing the whole workbook as objects) avoids loading a huge file entirely into memory just to read it.",
    "Excel formulas, cell styles, and formatting are represented as their own distinct objects (CellStyle, Font, formula strings) that need to be created and reused carefully, since creating a new style object for every single cell in a huge spreadsheet is itself a real memory and performance cost.",
    "Column data types matter: a cell genuinely containing a number needs to be written as a numeric cell (not a string that merely looks like a number), or Excel will treat it as text, which breaks sorting, filtering, and formula calculations on that column."
  ],
  mainComponents: [
    "It is like the difference between holding an entire library's worth of books in your arms at once (loading everything into memory) versus reading and shelving one book at a time from a cart (streaming row by row). Both eventually process the same number of books, but only one approach can scale to a library with millions of them."
  ],
  realWorldExamples: [
    "A finance reporting feature exporting a multi million row transaction history using SXSSF specifically, after an earlier version using plain XSSF ran out of heap memory in production on a smaller server.",
    "A bulk data import feature reading an uploaded Excel file with a streaming event based reader, avoiding loading the entire uploaded file into memory before validating and processing individual rows.",
    "Interview question: \"Why would you choose SXSSF over XSSF for generating an Excel export?\" Because SXSSF only keeps a small, bounded window of recent rows in memory at any time, flushing older rows to disk, which lets it generate arbitrarily large files without proportionally growing memory usage."
  ],
  complexityAndTradeoffs: [
    "Before: A large Excel export loads every row into memory at once, risking an out of memory crash proportional to dataset size.",
    "After: A streaming writer keeps only a small, fixed window of rows in memory, scaling to arbitrarily large exports with constant memory usage.",
    "For a multi million row export, switching from a fully in memory approach to a streaming one is often the difference between a server crash and a successful export, not just a minor performance tweak.",
    "XSSF (fully in memory): use it when small to moderate sized spreadsheets where simplicity matters more than memory efficiency, and full random access to any cell is useful. Avoid it when very large exports, where holding the entire workbook in memory risks exhausting available heap.",
    "SXSSF (streaming write): use it when large exports, where memory efficiency during writing is essential, at the cost of losing random access to already flushed rows. Avoid it when small files, or scenarios needing to read back and modify already written rows within the same operation.",
    "CSV instead of Excel: use it when very large exports where recipients do not actually need Excel specific features like formulas, multiple sheets, or cell formatting. Avoid it when recipients who specifically expect a real spreadsheet with formatting, multiple sheets, or Excel formulas."
  ],
  commonMistakes: [
    "Using the default, fully in memory XSSFWorkbook for a large, unbounded export without considering row count ahead of time. It works perfectly fine in testing with a small sample dataset, then fails in production the first time a customer or report genuinely has millions of rows, because every single row object stays resident in memory the whole time. Fix: Use SXSSFWorkbook for any export whose row count could plausibly grow large, or explicitly cap and paginate exports that do not need to return everything at once."
  ],
  interviewPerspective: "A common way this gets tested: \"Why does SXSSFWorkbook use dramatically less memory than XSSFWorkbook when writing a very large spreadsheet?\" SXSSFWorkbook only keeps a small, configurable window of the most recently created rows in memory at any time, flushing older rows directly to a temporary file on disk as new rows are added, instead of holding every row object in memory for the entire operation.",
  triggerSentence: "A large export is not a formatting problem, it is a memory problem, and Apache POI has two very different tools depending on which one you actually have."
};
