import { ConceptContent } from '../../models/content.model';

export const FILE_PROCESSING_PDF: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'file-processing-pdf',
  title: 'File Processing: PDF',

  hook:
    'A customer clicks "Download Invoice" and a perfectly formatted PDF, with your company logo, itemized charges, and ' +
    'a total, appears instantly. Nobody manually designed that exact document, it was assembled, on the fly, from raw data in a database.',

  problem:
    'Many business processes still genuinely require a real, fixed layout document, invoices, contracts, shipping ' +
    'labels, that must look identical every time and be reliably printable, and generating that from dynamic application data requires more than just writing text to a file.',

  aha: {
    statement: 'A PDF generation library lets you programmatically build a document, page layout, fonts, tables, images, from application data, the same way a template engine builds an HTML page, except the output is a real, portable, print ready document.',
    analogy:
      'It is like a print shop with a fixed template, a logo here, a table there, a total at the bottom, that gets filled in with different numbers and names every single time, producing a different final document from the exact same underlying layout logic.'
  },

  underTheHood: [
    'Apache PDFBox and iText (dual licensed, commercial for many uses) are the two dominant Java PDF libraries, both letting you programmatically add text, images, shapes, and tables to a document, positioned with real pixel or point level control.',
    'Both libraries operate at a fairly low level: you are often explicitly placing content at x/y coordinates, which gives precise control but means more complex documents (multi page tables, dynamic page breaks) require real layout logic.',
    'A common, more maintainable pattern is to first render an HTML template (using an existing templating engine like Thymeleaf) with real data, then convert that HTML to PDF using a library like Flying Saucer or wkhtmltopdf, letting familiar HTML/CSS handle layout instead of manual coordinate placement.',
    'Generated PDFs are typically streamed directly as an HTTP response with the correct Content-Type (application/pdf) and Content-Disposition header, allowing a browser to either display it inline or trigger a download, without ever needing a temporary file on the server\'s disk.',
    'For large batch generation, like nightly invoice runs, memory usage matters: generating and holding thousands of complete PDF documents in memory simultaneously can be avoided by generating and streaming, or writing, one document at a time.',
    'Digital signatures can be embedded directly into a PDF (using libraries like iText or Bouncy Castle underneath) to prove the document\'s authenticity and detect any later tampering, important for legally significant documents like signed contracts.'
  ],

  inTheWild: [
    'An e-commerce platform generating an invoice PDF on demand when a customer clicks "download," using PDFBox to lay out the company logo, line items, and total directly from the order\'s data in the database.',
    'A reporting system rendering an HTML template with actual data first, then converting that populated HTML to PDF, specifically to avoid hand coding table layout and page breaks with raw coordinate placement.',
    'Interview question: "Why might a team choose to render HTML and convert it to PDF instead of using a PDF library\'s layout API directly?" Because HTML/CSS is a much more familiar, flexible layout language for complex documents, avoiding the tedium of manually calculating x/y coordinates for every element.'
  ],

  showMe: {
    caption: 'A PDF generation endpoint saving to a temporary file versus one streaming the document directly to the response.',
    bad: {
      language: 'java',
      code:
        '@GetMapping("/invoices/{id}")\n' +
        'public String downloadInvoice(@PathVariable long id) throws IOException {\n' +
        '    String tempPath = "/tmp/invoice-" + id + ".pdf";\n' +
        '    generateInvoicePdf(id, tempPath); // writes to local disk\n' +
        '    return tempPath; // caller now has to separately serve this file somehow\n' +
        '}',
      explanation:
        'Writing to a local temp file adds unnecessary disk I/O, leaves cleanup as an afterthought, and does not scale cleanly across multiple server instances sharing no common disk.'
    },
    good: {
      language: 'java',
      code:
        '@GetMapping("/invoices/{id}")\n' +
        'public ResponseEntity<byte[]> downloadInvoice(@PathVariable long id) throws IOException {\n' +
        '    byte[] pdfBytes = invoiceService.generateInvoicePdf(id);\n' +
        '    return ResponseEntity.ok()\n' +
        '        .contentType(MediaType.APPLICATION_PDF)\n' +
        '        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")\n' +
        '        .body(pdfBytes);\n' +
        '}',
      explanation:
        'The PDF is generated in memory and streamed directly as the HTTP response body, with no temporary file, no cleanup logic, and no disk dependency at all.'
    }
  },

  impact: {
    before: 'PDF generation writes to a local temp file, adding disk I/O, cleanup responsibility, and a dependency on a shared or per instance file system.',
    after: 'The document is generated and streamed entirely in memory, with no temp file and no cleanup needed at all.',
    metric: 'Eliminating temp file usage removes an entire class of cleanup and disk space bugs from a horizontally scaled deployment, where "local disk" on one instance is not visible to any other instance.'
  },

  alternatives: [
    {
      name: 'PDFBox / iText (direct programmatic layout)',
      whenToUse: 'Documents needing precise, pixel level control, or advanced PDF specific features like digital signatures and form fields.',
      whenNotToUse: 'Complex, table heavy documents where manual coordinate placement becomes tedious and error prone to maintain.'
    },
    {
      name: 'HTML template to PDF conversion',
      whenToUse: 'Documents whose layout is naturally expressed in HTML/CSS, letting familiar web layout tools handle complex positioning and page breaks.',
      whenNotToUse: 'Documents requiring PDF specific features (digital signatures, precise print specifications) that the HTML conversion path does not support well.'
    },
    {
      name: 'Third party document generation service',
      whenToUse: 'Organizations wanting to offload document generation entirely, especially for complex, branded, frequently changing templates.',
      whenNotToUse: 'Applications wanting to avoid an external dependency and keep the generation logic and its data fully in house.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Generating PDFs by writing to the local file system as an intermediate step in a horizontally scaled, multi instance deployment.',
      why:
        'Local disk on one instance is invisible to every other instance. A request handled by instance A that generates a file, followed by a download request routed to instance B, will find nothing there, an intermittent, hard to reproduce bug that only shows up in a scaled deployment.',
      fix: 'Generate the PDF fully in memory and stream it directly in the HTTP response, avoiding any dependency on a specific instance\'s local disk.'
    }
  ],

  proveIt: {
    question: 'A PDF generation endpoint writes the file to local disk, then returns a URL for the client to fetch it in a second request. What can go wrong in a horizontally scaled, load balanced deployment?',
    answer:
      'The second request, fetching the URL, might be routed by the load balancer to a DIFFERENT instance than the one that generated and saved the file, which will find no such file on its own local disk, resulting in an intermittent 404 that seems to happen "randomly."'
  },

  oneLiner: 'A PDF is just structured bytes, generate them in memory and stream them, and an entire category of disk and instance affinity bugs disappears.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'api-design',
      conceptId: 'rest',
      title: 'REST',
      note: 'Serving a generated PDF is still just an HTTP response, with the right Content-Type and Content-Disposition headers doing the actual work of telling the browser how to handle it.'
    },
    {
      categoryId: 'system-design',
      topicId: 'system-design',
      conceptId: 'load-balancer',
      title: 'Load Balancer',
      note: 'The temp file mistake here is a direct, concrete example of why any state written locally by one instance behind a load balancer cannot be assumed accessible by another.'
    }
  ]
};
