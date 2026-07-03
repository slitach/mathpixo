// State Variables
let uploadedFiles = [];
let activeFileId = null;
let currentUser = null;

// DOM Elements
const sidebarUploadBtn = document.getElementById('sidebarUploadBtn');
const multiFileInput = document.getElementById('multiFileInput');
const fileList = document.getElementById('fileList');
const pageCountBadge = document.getElementById('pageCount');
const exportCombinedBtn = document.getElementById('exportCombinedBtn');

const emptyState = document.getElementById('emptyState');
const mainDragBox = document.getElementById('mainDragBox');
const activeWorkspace = document.getElementById('activeWorkspace');

const currentFileName = document.getElementById('currentFileName');
const currentFileSize = document.getElementById('currentFileSize');
const deletePageBtn = document.getElementById('deletePageBtn');
const convertAllBtn = document.getElementById('convertAllBtn');

const imagePreview = document.getElementById('imagePreview');
const pdfPreview = document.getElementById('pdfPreview');
const imageOverlay = document.getElementById('imageOverlay');
const overlayStatusText = document.getElementById('overlayStatusText');
const convertBtn = document.getElementById('convertBtn');

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const latexOutput = document.getElementById('latexOutput');
const copyBtn = document.getElementById('copyBtn');
const mathRenderArea = document.getElementById('mathRenderArea');

const combinedOutput = document.getElementById('combinedOutput');
const downloadTexBtn = document.getElementById('downloadTexBtn');
const downloadDocBtn = document.getElementById('downloadDocBtn');
const downloadPageDocBtn = document.getElementById('downloadPageDocBtn');

// ==========================================================================
// Initialization & Events
// ==========================================================================

// Open file selector
sidebarUploadBtn.addEventListener('click', () => multiFileInput.click());
mainDragBox.addEventListener('click', () => multiFileInput.click());

// File input selection
multiFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFiles(e.target.files);
        multiFileInput.value = ''; // Reset value to allow uploading same file again
    }
});

// Drag & Drop for Main Drag Box
['dragenter', 'dragover'].forEach(eventName => {
    mainDragBox.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        mainDragBox.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    mainDragBox.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        mainDragBox.classList.remove('dragover');
    }, false);
});

mainDragBox.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleFiles(files);
    }
});

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Update active class on buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show target tab content, hide others
        tabContents.forEach(content => {
            if (content.id === targetTab) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
        
        // If switching to combined tab, regenerate it
        if (targetTab === 'combinedTab') {
            generateCombinedDocument();
        }
    });
});

// Copy LaTeX handler
copyBtn.addEventListener('click', () => {
    const textToCopy = latexOutput.value;
    if (!textToCopy) return;
    copyTextToClipboard(textToCopy, copyBtn);
});

// Auto-save changes to the local/server state when editing
latexOutput.addEventListener('input', (e) => {
    if (activeFileId) {
        const file = uploadedFiles.find(f => f.id === activeFileId);
        if (file) {
            file.latex = e.target.value;
            renderFormula(file.latex, file.status, file.errorMsg);
            generateCombinedDocument();
            
            // Auto-save to server database if logged in
            if (currentUser && activeFileId.startsWith('hist_')) {
                debounceSaveEntry(activeFileId, file.latex);
            }
        }
    }
});

// Download .tex handler
downloadTexBtn.addEventListener('click', () => {
    const code = combinedOutput.value;
    if (!code) return;
    
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mathpixo_document.tex';
    link.click();
    URL.revokeObjectURL(link.href);
});

// Download page .doc handler
if (downloadPageDocBtn) {
    downloadPageDocBtn.addEventListener('click', () => {
        if (!activeFileId) return;
        const file = uploadedFiles.find(f => f.id === activeFileId);
        if (!file || file.status !== 'converted') return;

        const bodyContent = `<h2 style="color: #2b579a; font-family: 'Segoe UI Semibold', sans-serif; font-size: 16pt; margin-top: 12px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">${file.name}</h2>` + 
                            convertLatexToHtmlAndMathml(file.latex);

        const docContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${file.name}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', 'Calibri', Arial, sans-serif; line-height: 1.5; font-size: 11.0pt; }
    p { margin: 0in; margin-bottom: 8.0pt; }
    h1, h2, h3 { color: #2b579a; font-family: 'Segoe UI Semibold', sans-serif; }
    code { font-family: 'Consolas', 'Courier New', monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>
        `;

        const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        link.download = `${nameWithoutExt}.doc`;
        link.click();
        URL.revokeObjectURL(link.href);
    });
}

// Download .doc handler
if (downloadDocBtn) {
    downloadDocBtn.addEventListener('click', () => {
        const converted = uploadedFiles.filter(f => f.status === 'converted');
        if (converted.length === 0) return;

        let bodyContent = '';
        converted.forEach((file, index) => {
            if (index > 0) {
                bodyContent += '<br clear="all" style="page-break-before: always; mso-break-type: section-break;" />';
            }
            bodyContent += `<h2 style="color: #2b579a; font-family: 'Segoe UI Semibold', sans-serif; font-size: 16pt; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Page ${index + 1}: ${file.name}</h2>`;
            bodyContent += convertLatexToHtmlAndMathml(file.latex);
        });

        const docContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Mathpixo Document</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', 'Calibri', Arial, sans-serif; line-height: 1.5; font-size: 11.0pt; }
    p { margin: 0in; margin-bottom: 8.0pt; }
    h1, h2, h3 { color: #2b579a; font-family: 'Segoe UI Semibold', sans-serif; }
    code { font-family: 'Consolas', 'Courier New', monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>
        `;

        const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'mathpixo_document.doc';
        link.click();
        URL.revokeObjectURL(link.href);
    });
}

function convertLatexToHtmlAndMathml(latex) {
    // 1. Clean out package imports, document start/end, comments, and metadata
    let lines = latex.split('\n');
    let cleanedLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('%') && !trimmed.startsWith('\\usepackage') &&
               !trimmed.startsWith('\\documentclass') && !trimmed.startsWith('\\begin{document}') &&
               !trimmed.startsWith('\\end{document}') && !trimmed.startsWith('\\title') &&
               !trimmed.startsWith('\\author') && !trimmed.startsWith('\\date') &&
               !trimmed.startsWith('\\maketitle');
    });
    let text = cleanedLines.join('\n').trim();

    let placeholders = [];
    let placeholderCounter = 0;

    function addPlaceholder(mathCode, isBlock) {
        const id = `___MATH_PLACEHOLDER_${placeholderCounter++}___`;
        placeholders.push({ id, mathCode, isBlock });
        return id;
    }

    // 2. Extract block environments: \begin{align*} ... \end{align*}, etc.
    const environments = ['align\\*?', 'equation\\*?', 'gather\\*?', 'matrix', 'array', 'tikzpicture', 'blox', 'axis'];
    environments.forEach(envPattern => {
        const regex = new RegExp(`\\\\begin{(${envPattern})}([\\s\\S]*?)\\\\end{\\1}`, 'g');
        text = text.replace(regex, (match) => {
            return '\n\n' + addPlaceholder(match, true) + '\n\n';
        });
    });

    // 3. Match \[ ... \] display math
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
        return '\n\n' + addPlaceholder(math, true) + '\n\n';
    });

    // 4. Match $$ ... $$ display math
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        return '\n\n' + addPlaceholder(match, true) + '\n\n';
    });

    // 5. Match \( ... \) inline math
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
        return addPlaceholder(math, false);
    });

    // 6. Match $ ... $ inline math (excluding escaped \$)
    text = text.replace(/(?<!\\)\$((?:\\\$|[^$])+)(?<!\\)\$/g, (match, math) => {
        return addPlaceholder(math, false);
    });

    // 7. Escape HTML tags in text
    text = text.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");

    // 8. Split by double newlines into paragraph blocks
    let paragraphs = text.split(/\n\s*\n+/);
    let htmlParagraphs = paragraphs.map(p => {
        let pTrimmed = p.trim();
        if (!pTrimmed) return '';
        
        // Single newlines inside a paragraph are converted to soft line breaks
        let content = pTrimmed.replace(/\n/g, '<br/>');
        return `<p style="margin-top: 0px; margin-bottom: 8.0pt; line-height: 1.5;">${content}</p>`;
    });
    let html = htmlParagraphs.join('\n');

    // 9. Process placeholders back with KaTeX MathML elements
    placeholders.forEach(placeholder => {
        let mathmlStr = '';
        const isTikzOrBlockDiagram = placeholder.mathCode.includes('\\begin{tikzpicture}') || 
                                     placeholder.mathCode.includes('\\begin{blox}') || 
                                     placeholder.mathCode.includes('\\begin{axis}');
        
        if (isTikzOrBlockDiagram) {
            // Word cannot compile/render TikZ directly. We can export it inside a styled code block.
            mathmlStr = `<div style="background-color: #f3f4f6; border-left: 3px solid #2b579a; padding: 10px; margin: 12px 0; font-family: Consolas, monospace; font-size: 9pt; white-space: pre-wrap;">% [TikZ Diagram - Raw Code]\n${placeholder.mathCode}</div>`;
        } else {
            try {
                // Remove LaTeX formatting wrapper if KaTeX throws error on block delimiters inside equation code
                let formula = placeholder.mathCode.trim();
                if (formula.startsWith('\\[') && formula.endsWith('\\]')) {
                    formula = formula.substring(2, formula.length - 2);
                } else if (formula.startsWith('$$') && formula.endsWith('$$')) {
                    formula = formula.substring(2, formula.length - 2);
                } else if (formula.startsWith('$') && formula.endsWith('$')) {
                    formula = formula.substring(1, formula.length - 1);
                } else if (formula.startsWith('\\(') && formula.endsWith('\\)')) {
                    formula = formula.substring(2, formula.length - 2);
                }

                // Render strictly to MathML
                mathmlStr = window.katex.renderToString(formula, {
                    displayMode: placeholder.isBlock,
                    output: 'mathml',
                    throwOnError: false,
                    trust: true
                });

                if (placeholder.isBlock) {
                    mathmlStr = `<div style="text-align: center; margin-top: 12px; margin-bottom: 12px;">${mathmlStr}</div>`;
                } else {
                    mathmlStr = ` <span>${mathmlStr}</span> `;
                }
            } catch (err) {
                console.error('KaTeX MathML render error:', err);
                mathmlStr = ` <code>${placeholder.mathCode}</code> `;
            }
        }
        
        // Safely replace the placeholder
        html = html.replace(placeholder.id, mathmlStr);
    });

    return html;
}

// Convert current page
convertBtn.addEventListener('click', () => {
    if (activeFileId) {
        convertFile(activeFileId);
    }
});

// Convert all pending pages
convertAllBtn.addEventListener('click', convertAllPending);

// Delete current page
deletePageBtn.addEventListener('click', () => {
    if (activeFileId) {
        deleteFile(activeFileId);
    }
});

// Export combined document from sidebar
exportCombinedBtn.addEventListener('click', () => {
    // Switch to combined document tab
    const combinedTabBtn = document.querySelector('[data-tab="combinedTab"]');
    if (combinedTabBtn) {
        combinedTabBtn.click();
    }
});

// ==========================================================================
// Operations & State Management
// ==========================================================================

// Handle incoming files
async function handleFiles(files) {
    let firstNewId = null;
    const fileListToProcess = Array.from(files);

    for (const file of fileListToProcess) {
        // Validate type (images or PDFs)
        if (!file.type.match('image.*') && file.type !== 'application/pdf') continue;

        if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const pageCount = pdfDoc.getPageCount();

                if (pageCount > 1) {
                    // Split multi-page PDF into separate single-page files
                    for (let i = 0; i < pageCount; i++) {
                        const newPdf = await PDFLib.PDFDocument.create();
                        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                        newPdf.addPage(copiedPage);
                        
                        const pdfBytes = await newPdf.save();
                        const pageBlob = new Blob([pdfBytes], { type: 'application/pdf' });
                        
                        const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
                        const pageFile = new File([pageBlob], `${nameWithoutExt}_page_${i + 1}.pdf`, { type: 'application/pdf' });
                        
                        const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        if (!firstNewId) firstNewId = fileId;

                        const fileObj = {
                            id: fileId,
                            name: pageFile.name,
                            size: formatBytes(pageFile.size),
                            file: pageFile,
                            previewUrl: URL.createObjectURL(pageFile),
                            latex: '',
                            status: 'pending',
                            errorMsg: ''
                        };
                        uploadedFiles.push(fileObj);
                    }
                    continue; // Skip adding the original combined file
                }
            } catch (err) {
                console.error('Failed to parse or split PDF, loading as-is:', err);
            }
        }

        const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        if (!firstNewId) firstNewId = fileId;

        const fileObj = {
            id: fileId,
            name: file.name,
            size: formatBytes(file.size),
            file: file,
            previewUrl: URL.createObjectURL(file),
            latex: '',
            status: 'pending',
            errorMsg: ''
        };

        uploadedFiles.push(fileObj);
    }

    if (uploadedFiles.length > 0) {
        // Hide dashboard empty state, show active workspace
        emptyState.classList.add('hidden');
        activeWorkspace.classList.remove('hidden');

        renderSidebar();

        // Select the first newly uploaded file
        if (firstNewId) {
            selectFile(firstNewId);
        }
    }
}

// Render the sidebar list
function renderSidebar() {
    fileList.innerHTML = '';
    const activeLang = localStorage.getItem("lang") || "en";
    const dict = (typeof i18n !== 'undefined' && i18n[activeLang]) ? i18n[activeLang] : {};
    const pageText = uploadedFiles.length === 1 ? (dict.page_singular || 'page') : (dict.page_plural || 'pages');
    pageCountBadge.textContent = `${uploadedFiles.length} ${pageText}`;

    let hasConverted = false;

    uploadedFiles.forEach(file => {
        const li = document.createElement('li');
        li.className = `file-item ${file.id === activeFileId ? 'active' : ''}`;
        li.setAttribute('data-id', file.id);
        
        // Build status markup
        let statusClass = 'status-pending';
        let statusIcon = '<i class="fa-regular fa-clock"></i>';
        let statusText = dict.status_pending || 'Pending';

        if (file.status === 'converting') {
            statusClass = 'status-converting';
            statusIcon = '<i class="fa-solid fa-spinner fa-spin"></i>';
            statusText = dict.status_converting || 'Converting...';
        } else if (file.status === 'converted') {
            statusClass = 'status-converted';
            statusIcon = '<i class="fa-regular fa-circle-check"></i>';
            statusText = dict.status_converted || 'Converted';
            hasConverted = true;
        } else if (file.status === 'error') {
            statusClass = 'status-error';
            statusIcon = '<i class="fa-solid fa-circle-exclamation"></i>';
            statusText = dict.status_error || 'Error';
        }

        const isPdf = file.file ? (file.file.type === 'application/pdf') : file.name.toLowerCase().endsWith('.pdf');
        const thumbContent = isPdf 
            ? `<i class="fa-solid fa-file-pdf" style="color: var(--error); font-size: 1.25rem;"></i>`
            : `<img src="${file.previewUrl}" alt="Thumb">`;

        li.innerHTML = `
            <div class="file-item-thumb">
                ${thumbContent}
            </div>
            <div class="file-item-info">
                <p class="file-item-name" title="${file.name}">${file.name}</p>
                <span class="file-item-status ${statusClass}">
                    ${statusIcon} ${statusText}
                </span>
            </div>
            <button class="file-item-delete" title="Delete page">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // Click to select
        li.addEventListener('click', (e) => {
            if (e.target.closest('.file-item-delete')) return; // Ignore if delete clicked
            selectFile(file.id);
        });

        // Click delete button
        const delBtn = li.querySelector('.file-item-delete');
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFile(file.id);
        });

        fileList.appendChild(li);
    });

    // Enable combined document download/export if at least one page is converted
    exportCombinedBtn.disabled = !hasConverted;
}

// Select a file to view in the workspace
function selectFile(id) {
    activeFileId = id;
    const file = uploadedFiles.find(f => f.id === id);
    if (!file) return;

    // Update active highlight in sidebar list
    document.querySelectorAll('.file-item').forEach(item => {
        if (item.getAttribute('data-id') === id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Topbar
    currentFileName.textContent = file.name;
    currentFileSize.textContent = file.size;

    const isPdf = file.file ? (file.file.type === 'application/pdf') : file.name.toLowerCase().endsWith('.pdf');
    const fileTypeIcon = document.querySelector('.file-type-icon');
    if (fileTypeIcon) {
        if (isPdf) {
            fileTypeIcon.className = 'fa-regular fa-file-pdf file-type-icon';
            fileTypeIcon.style.color = 'var(--error)';
        } else {
            fileTypeIcon.className = 'fa-regular fa-file-image file-type-icon';
            fileTypeIcon.style.color = 'var(--primary)';
        }
    }

    // Load Preview Image or PDF
    if (isPdf) {
        imagePreview.classList.add('hidden');
        pdfPreview.classList.remove('hidden');
        pdfPreview.src = file.previewUrl;
    } else {
        pdfPreview.classList.add('hidden');
        imagePreview.classList.remove('hidden');
        imagePreview.src = file.previewUrl;
    }

    // Update Conversion Status Screen
    if (file.status === 'converting') {
        const activeLang = localStorage.getItem("lang") || "en";
        const dict = (typeof i18n !== 'undefined' && i18n[activeLang]) ? i18n[activeLang] : {};
        overlayStatusText.textContent = dict.converting_overlay || 'Extracting formulas using Gemini...';
        imageOverlay.classList.remove('hidden');
        convertBtn.disabled = true;
    } else {
        imageOverlay.classList.add('hidden');
        // Disable convert button for already converted files loaded from server (no local file object)
        convertBtn.disabled = (file.status === 'converted' && !file.file);
    }

    // Set LaTeX output
    latexOutput.value = file.latex;
    copyBtn.disabled = (file.status !== 'converted');
    if (downloadPageDocBtn) {
        downloadPageDocBtn.disabled = (file.status !== 'converted');
    }

    // Update Live Preview Tab
    renderFormula(file.latex, file.status, file.errorMsg);

    // If combined tab is currently visible, update it
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    if (activeTab === 'combinedTab') {
        generateCombinedDocument();
    }
}

// Delete a file
function deleteFile(id) {
    const index = uploadedFiles.findIndex(f => f.id === id);
    if (index === -1) return;

    const file = uploadedFiles[index];
    if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(file.previewUrl);
    }
    
    uploadedFiles.splice(index, 1);

    // If logged in and saved on server, perform deletion in the background
    if (currentUser && id.startsWith('hist_')) {
        fetch(`/api/history/${id}`, {
            method: 'DELETE'
        }).catch(err => {
            console.error('Failed to delete history entry from server:', err);
        });
    }

    renderSidebar();

    if (uploadedFiles.length === 0) {
        // Return to empty dashboard
        activeWorkspace.classList.add('hidden');
        emptyState.classList.remove('hidden');
        activeFileId = null;
    } else if (activeFileId === id) {
        // Select next file or first file
        const nextActiveIndex = index >= uploadedFiles.length ? uploadedFiles.length - 1 : index;
        selectFile(uploadedFiles[nextActiveIndex].id);
    } else {
        generateCombinedDocument();
    }
}

// Convert an individual file
async function convertFile(id) {
    const fileObj = uploadedFiles.find(f => f.id === id);
    if (!fileObj || fileObj.status === 'converting') return;
    if (fileObj.status === 'converted' && !fileObj.file) return;

    // Update status to converting
    fileObj.status = 'converting';
    fileObj.errorMsg = '';
    renderSidebar();

    // Update workspace if this file is currently active
    if (activeFileId === id) {
        const activeLang = localStorage.getItem("lang") || "en";
        const dict = (typeof i18n !== 'undefined' && i18n[activeLang]) ? i18n[activeLang] : {};
        overlayStatusText.textContent = dict.converting_overlay || 'Extracting formulas using Gemini...';
        imageOverlay.classList.remove('hidden');
        convertBtn.disabled = true;
    }

    const formData = new FormData();
    formData.append('image', fileObj.file);

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Server error occurred during processing.');
        }

        // Save result and sync file ID/path
        fileObj.latex = data.latex;
        fileObj.status = 'converted';
        
        if (data.historyEntry) {
            const oldId = fileObj.id;
            fileObj.id = data.historyEntry.id;
            fileObj.previewUrl = data.historyEntry.filePath;
            
            if (activeFileId === oldId) {
                activeFileId = fileObj.id;
            }

            // Increment extractions count locally
            if (currentUser) {
                currentUser.extractionsCount = (currentUser.extractionsCount || 0) + 1;
            }
        } else if (data.fileUrl) {
            fileObj.previewUrl = data.fileUrl;
        }

        // Update workspace if active
        if (activeFileId === fileObj.id) {
            latexOutput.value = data.latex;
            copyBtn.disabled = false;
            if (downloadPageDocBtn) {
                downloadPageDocBtn.disabled = false;
            }
            renderFormula(data.latex, 'converted');
            
            const isPdf = fileObj.file ? (fileObj.file.type === 'application/pdf') : fileObj.name.toLowerCase().endsWith('.pdf');
            if (isPdf) {
                pdfPreview.src = fileObj.previewUrl;
            } else {
                imagePreview.src = fileObj.previewUrl;
            }
        }
    } catch (err) {
        console.error('Failed to convert:', err);
        fileObj.status = 'error';
        fileObj.errorMsg = err.message || 'Error occurred';

        // Update workspace if active
        if (activeFileId === id || activeFileId === fileObj.id) {
            renderFormula('', 'error', fileObj.errorMsg);
        }
    } finally {
        if (activeFileId === id || (fileObj && activeFileId === fileObj.id)) {
            imageOverlay.classList.add('hidden');
            convertBtn.disabled = (fileObj.status === 'converted' && !fileObj.file);
        }
        renderSidebar();
        generateCombinedDocument();
    }
}

// Convert all pending files
async function convertAllPending() {
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) return;

    // Set buttons to loading
    convertAllBtn.disabled = true;
    const originalText = convertAllBtn.innerHTML;
    convertAllBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Converting...';

    for (const file of pendingFiles) {
        await convertFile(file.id);
    }

    convertAllBtn.disabled = false;
    convertAllBtn.innerHTML = originalText;
}

// Render LaTeX formula using KaTeX
function renderFormula(latex, status, errorMsg) {
    if (!mathRenderArea) return;
    const activeLang = localStorage.getItem("lang") || "en";
    const dict = (typeof i18n !== 'undefined' && i18n[activeLang]) ? i18n[activeLang] : {};

    if (status === 'error') {
        mathRenderArea.innerHTML = `
            <div class="render-placeholder" style="color: var(--error); max-width: 85%;">
                <i class="fa-solid fa-circle-exclamation"></i>
                <p><strong>${dict.conversion_error || 'Conversion Error'}</strong></p>
                <p style="font-size: 0.8rem; margin-top: 0.25rem;">${errorMsg || dict.failed_process_image || 'Failed to process image.'}</p>
            </div>
        `;
        return;
    }

    if (!latex) {
        mathRenderArea.innerHTML = `
            <div class="render-placeholder">
                <i class="fa-solid fa-calculator"></i>
                <p>${dict.click_convert_placeholder || 'Click "Convert This Page" to display preview.'}</p>
            </div>
        `;
        return;
    }

    try {
        // Diagram detection (TikZ, pgfplots, blox)
        const hasTikz = latex.includes('\\begin{tikzpicture}') || latex.includes('\\tikzpicture');
        const hasBlox = latex.includes('\\begin{blox}') || latex.includes('\\bXInput') || latex.includes('\\bXComp');
        const hasPgfplots = latex.includes('\\begin{axis}') || latex.includes('\\begin{semilogyaxis}') || latex.includes('\\begin{semilogxaxis}');
        
        if (hasTikz || hasBlox || hasPgfplots) {
            let diagramType = "TikZ Diagram";
            let iconClass = "fa-diagram-project";
            
            if (hasBlox) {
                diagramType = "Control Block Diagram (Blox)";
                iconClass = "fa-circle-nodes";
            } else if (hasPgfplots) {
                diagramType = "Function Plot / Curve (PGFPlots)";
                iconClass = "fa-chart-line";
            }
            
            const diagGeneratedText = dict.diagram_generated || 'Diagram Generated';
            const diagNotRenderedText = dict.diagram_not_rendered || 'This diagram uses standard packages that cannot be rendered in HTML. The complete LaTeX code has been generated above and is ready to copy-paste into your LaTeX editor (like Overleaf)!';
            
            mathRenderArea.innerHTML = `
                <div class="render-placeholder" style="color: var(--primary); max-width: 80%; margin: 0 auto;">
                    <i class="fa-solid ${iconClass}" style="font-size: 2.25rem; color: var(--accent); margin-bottom: 0.75rem;"></i>
                    <p style="font-weight: 600; font-size: 1.05rem;">${diagramType} (${diagGeneratedText})</p>
                    <p style="font-size: 0.8rem; margin-top: 0.35rem; color: var(--text-muted); line-height: 1.4;">
                        ${diagNotRenderedText}
                    </p>
                </div>
            `;
            return;
        }

        const cleanedLatex = cleanLatexForKaTeX(latex);
        
        // Clear placeholder
        mathRenderArea.innerHTML = '';
        
        // Create elements
        const renderDiv = document.createElement('div');
        mathRenderArea.appendChild(renderDiv);
        
        // Render math block
        window.katex.render(cleanedLatex, renderDiv, {
            throwOnError: false,
            displayMode: true,
            trust: true
        });
    } catch (err) {
        console.error('KaTeX rendering error:', err);
        mathRenderArea.innerHTML = `
            <div class="render-placeholder">
                <i class="fa-solid fa-circle-info"></i>
                <p>${dict.could_not_render_preview || 'Could not render mathematics in preview. Raw code is in the code tab.'}</p>
            </div>
        `;
    }
}

// Clean LaTeX delimiters for direct KaTeX rendering
function cleanLatexForKaTeX(latex) {
    // Split by lines and filter out LaTeX comments and usepackage lines
    let lines = latex.split('\n');
    let cleanedLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('%') && !trimmed.startsWith('\\usepackage');
    });
    let cleaned = cleanedLines.join('\n').trim();
    
    // Strip starting/ending $$ or $ if present
    if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.substring(2, cleaned.length - 2);
    } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // Strip block delimiter \[ \]
    if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
        cleaned = cleaned.substring(2, cleaned.length - 2);
    } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) {
        cleaned = cleaned.substring(2, cleaned.length - 2);
    }
    
    return cleaned.trim();
}

// Clean LaTeX document metadata and commands for combined document structure
function cleanLatexForCombinedDocument(latex) {
    let lines = latex.split('\n');
    let cleanedLines = [];
    let extractedPackages = [];

    lines.forEach(line => {
        const trimmed = line.trim();

        // Detect and extract usepackage declarations
        if (trimmed.startsWith('\\usepackage')) {
            extractedPackages.push(trimmed);
            return;
        }

        // Skip document structure commands
        if (trimmed.startsWith('\\documentclass') || 
            trimmed.startsWith('\\begin{document}') || 
            trimmed.startsWith('\\end{document}') ||
            trimmed.startsWith('% Required packages:') ||
            trimmed.startsWith('% - \\usepackage') ||
            trimmed.startsWith('% - \\pgfplotsset') ||
            trimmed.startsWith('\\title{') ||
            trimmed.startsWith('\\author{') ||
            trimmed.startsWith('\\date{') ||
            trimmed.startsWith('\\maketitle')) {
            return;
        }

        cleanedLines.push(line);
    });

    return {
        content: cleanedLines.join('\n').trim(),
        packages: extractedPackages
    };
}

// Generate the fully compilable LaTeX Document
function generateCombinedDocument() {
    const converted = uploadedFiles.filter(f => f.status === 'converted');
    if (converted.length === 0) {
        combinedOutput.value = '';
        return;
    }

    // Determine required packages based on code content
    const allCodeText = converted.map(f => f.latex).join('\n');
    let packages = [
        '\\usepackage{amsmath}',
        '\\usepackage{amssymb}',
        '\\usepackage{graphicx}'
    ];

    if (allCodeText.includes('\\begin{tikzpicture}') || allCodeText.includes('\\tikzpicture')) {
        packages.push('\\usepackage{tikz}');
    }
    if (allCodeText.includes('\\begin{blox}') || allCodeText.includes('\\bXInput')) {
        // Blox requires TikZ
        if (!packages.includes('\\usepackage{tikz}')) {
            packages.push('\\usepackage{tikz}');
        }
        packages.push('\\usepackage{blox}');
    }
    if (allCodeText.includes('\\begin{axis}') || allCodeText.includes('\\begin{semilogyaxis}')) {
        if (!packages.includes('\\usepackage{tikz}')) {
            packages.push('\\usepackage{tikz}');
        }
        packages.push('\\usepackage{pgfplots}');
        packages.push('\\pgfplotsset{compat=1.18}');
    }

    // Extract packages from each file's LaTeX and add to main packages list
    converted.forEach((file) => {
        const { packages: filePackages } = cleanLatexForCombinedDocument(file.latex);
        filePackages.forEach(pkg => {
            const normalizedPkg = pkg.trim();
            if (!packages.includes(normalizedPkg)) {
                packages.push(normalizedPkg);
            }
        });
    });

    // Build LaTeX document
    let doc = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
${packages.join('\n')}

\\title{Mathpixo - Extracted Mathematics}
\\author{Compiled Document}
\\date{\\today}

\\begin{document}
\\maketitle

`;

    converted.forEach((file, index) => {
        doc += `% ==========================================================================\n`;
        doc += `% Page ${index + 1}: ${file.name}\n`;
        doc += `% ==========================================================================\n\n`;
        
        const { content } = cleanLatexForCombinedDocument(file.latex);
        doc += content + `\n\n`;
        
        // Add newpage between pages
        if (index < converted.length - 1) {
            doc += `\\newpage\n\n`;
        }
    });

    doc += `\\end{document}\n`;
    combinedOutput.value = doc;
}

// ==========================================================================
// Helper Utilities
// ==========================================================================

// Copy text utility with button feedback
function copyTextToClipboard(text, buttonEl) {
    const oldHTML = buttonEl.innerHTML;
    navigator.clipboard.writeText(text).then(() => {
        buttonEl.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        buttonEl.style.background = 'var(--accent)';
        buttonEl.style.borderColor = 'var(--accent)';
        buttonEl.style.color = '#fff';
        
        setTimeout(() => {
            buttonEl.innerHTML = oldHTML;
            buttonEl.style.background = '';
            buttonEl.style.borderColor = '';
            buttonEl.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Clipboard copy failed:', err);
    });
}

// Format byte sizes
function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ==========================================================================
// Authentication & History Persistence (Mathpix style)
// ==========================================================================

const sidebarUserSection = document.getElementById('sidebarUserSection');
const authModal = document.getElementById('authModal');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const tabLoginBtn = document.getElementById('tabLoginBtn');
const tabRegisterBtn = document.getElementById('tabRegisterBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

let saveTimeout = null;
function debounceSaveEntry(id, latex) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        try {
            await fetch(`/api/history/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latex })
            });
        } catch (err) {
            console.error('Failed to auto-save latex:', err);
        }
    }, 1000);
}

function renderUserSection() {
    if (currentUser) {
        const firstLetter = currentUser.name ? currentUser.name[0] : currentUser.email[0];
        sidebarUserSection.innerHTML = `
            <div class="user-profile-card">
                <div class="user-avatar">${firstLetter}</div>
                <div class="user-details">
                    <p class="user-name">${currentUser.name || 'User'}</p>
                    <p class="user-email">${currentUser.email}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                    <button class="btn-settings" id="openSettingsBtn" title="Account Settings" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; transition: var(--transition-smooth); font-size: 0.85rem;">
                        <i class="fa-solid fa-gear"></i>
                    </button>
                    <button class="btn-logout" id="logoutBtn" title="Log Out" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; transition: var(--transition-smooth); font-size: 0.85rem;">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('openSettingsBtn').addEventListener('click', openSettingsModal);
    } else {
        sidebarUserSection.innerHTML = `
            <button class="btn btn-secondary btn-full-width" id="loginTriggerBtn">
                <i class="fa-solid fa-user"></i> Sign In / Sign Up
            </button>
        `;
        document.getElementById('loginTriggerBtn').addEventListener('click', () => showAuthModal('login'));
    }
}

function showAuthModal(mode = 'login') {
    authModal.classList.remove('hidden');
    switchAuthTab(mode);
}

function hideAuthModal() {
    authModal.classList.add('hidden');
    loginForm.reset();
    registerForm.reset();
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
}

function switchAuthTab(mode) {
    if (mode === 'login') {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        tabLoginBtn.classList.remove('active');
        tabRegisterBtn.classList.add('active');
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

closeAuthBtn.addEventListener('click', hideAuthModal);
tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));

authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        hideAuthModal();
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed.');
        }
        currentUser = data.user;
        hideAuthModal();
        renderUserSection();
        await fetchHistory();
    } catch (err) {
        loginError.textContent = err.message;
        loginError.classList.remove('hidden');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.classList.add('hidden');
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed.');
        }
        currentUser = data.user;
        hideAuthModal();
        renderUserSection();
        await fetchHistory();
    } catch (err) {
        registerError.textContent = err.message;
        registerError.classList.remove('hidden');
    }
});

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        renderUserSection();
        
        // Clear workspace
        uploadedFiles = [];
        activeFileId = null;
        renderSidebar();
        
        // Reset dashboard view
        activeWorkspace.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } catch (err) {
        console.error('Logout failed:', err);
    }
}

async function fetchHistory() {
    try {
        const response = await fetch('/api/history');
        if (!response.ok) return;
        
        const data = await response.json();
        uploadedFiles = data.history.map(entry => ({
            id: entry.id,
            name: entry.name,
            size: formatBytes(entry.size || 0),
            file: null,
            previewUrl: entry.filePath,
            latex: entry.latex,
            status: entry.status,
            errorMsg: ''
        }));

        if (uploadedFiles.length > 0) {
            emptyState.classList.add('hidden');
            activeWorkspace.classList.remove('hidden');
            renderSidebar();
            selectFile(uploadedFiles[0].id);
        } else {
            activeWorkspace.classList.add('hidden');
            emptyState.classList.remove('hidden');
            renderSidebar();
        }
    } catch (err) {
        console.error('Failed to fetch history:', err);
    }
}

function dataURLtoFile(dataurl, filename, type) {
    try {
        var arr = dataurl.split(','),
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: type || 'image/png'});
    } catch (e) {
        console.error('Error in dataURLtoFile:', e);
        return null;
    }
}

async function initApp() {
    if (window.location.protocol === 'file:') {
        const warningMsg = "Warning: Mathpixo is running from a local file protocol (file://). To use the Gemini OCR conversion backend, you must run the server using 'npm start' and visit http://localhost:8000 in your browser.";
        
        // Render visible warning banner
        const warningBanner = document.createElement('div');
        warningBanner.style.background = 'var(--error, #ef4444)';
        warningBanner.style.color = '#fff';
        warningBanner.style.padding = '12px';
        warningBanner.style.textAlign = 'center';
        warningBanner.style.fontWeight = 'bold';
        warningBanner.style.fontSize = '0.95rem';
        warningBanner.style.position = 'fixed';
        warningBanner.style.top = '0';
        warningBanner.style.left = '0';
        warningBanner.style.width = '100%';
        warningBanner.style.zIndex = '99999';
        warningBanner.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
        warningBanner.textContent = warningMsg;
        document.body.appendChild(warningBanner);
        document.body.style.paddingTop = '50px';
    }

    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.user) {
            currentUser = data.user;
            renderUserSection();
            await fetchHistory();
        } else {
            currentUser = null;
            renderUserSection();
            
            // Auto-open login modal if redirected from pricing page
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('login') === 'true') {
                showAuthModal('login');
            }
        }

        // Parse pending file from landing page uploader
        const pendingData = sessionStorage.getItem('pendingUploadData');
        const pendingName = sessionStorage.getItem('pendingUploadName');
        const pendingType = sessionStorage.getItem('pendingUploadType');
        if (pendingData && pendingName) {
            sessionStorage.removeItem('pendingUploadData');
            sessionStorage.removeItem('pendingUploadName');
            sessionStorage.removeItem('pendingUploadType');
            const file = dataURLtoFile(pendingData, pendingName, pendingType);
            if (file) {
                handleFiles([file]);
            }
        }
    } catch (err) {
        console.error('Initial auth check failed:', err);
        currentUser = null;
        renderUserSection();
    }
}

// Run initialization
initApp();

// ==========================================================================
// Settings, Billing, and Extractions Usage Modal
// ==========================================================================
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsProfileName = document.getElementById('settingsProfileName');
const settingsProfileEmail = document.getElementById('settingsProfileEmail');
const settingsProfileJoined = document.getElementById('settingsProfileJoined');
const settingsPlanName = document.getElementById('settingsPlanName');
const settingsExtractionLabel = document.getElementById('settingsExtractionLabel');
const settingsExtractionProgress = document.getElementById('settingsExtractionProgress');
const settingsExtractionLimitText = document.getElementById('settingsExtractionLimitText');

function openSettingsModal() {
    if (!currentUser) return;
    
    // Populate Profile Info
    settingsProfileName.textContent = currentUser.name || 'User';
    settingsProfileEmail.textContent = currentUser.email;
    settingsProfileJoined.textContent = new Date(currentUser.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Populate Subscription & Billing info
    const plan = (currentUser.subscription && currentUser.subscription.plan) || 'free';
    settingsPlanName.textContent = `${plan} plan`;
    
    // Calculate Usage Limits
    const usage = currentUser.extractionsCount || 0;
    let limit = 20;
    if (plan === 'pro' || plan === 'organization') {
        limit = 6000;
    }
    
    settingsExtractionLabel.textContent = `${usage} / ${limit.toLocaleString()}`;
    
    // Fill progress bar
    const pct = Math.min((usage / limit) * 100, 100);
    settingsExtractionProgress.style.width = `${pct}%`;
    
    if (plan === 'free') {
        settingsExtractionLimitText.textContent = `Your free account is limited to 20 OCR extractions (images and PDFs) per month. Upgrade to Pro for 6,000 extractions.`;
    } else {
        settingsExtractionLimitText.textContent = `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} account includes ${limit.toLocaleString()} extractions per month.`;
    }
    
    settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
    settingsModal.classList.add('hidden');
}

closeSettingsBtn.addEventListener('click', closeSettingsModal);
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettingsModal();
    }
});

// ==========================================================================
// UPGRADES: Clipboard Paste, Overleaf, and Theme Toggles
// ==========================================================================

// 1. Clipboard Paste (Ctrl+V) Support
window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    const files = [];
    for (const item of items) {
        if (item.kind === 'file') {
            const blob = item.getAsFile();
            const file = new File([blob], `clipboard_snip_${Date.now()}.png`, { type: blob.type });
            files.push(file);
        }
    }
    if (files.length > 0) {
        handleFiles(files);
    }
});

// 2. One-Click Overleaf Export
const overleafBtn = document.getElementById('overleafBtn');
if (overleafBtn) {
    overleafBtn.addEventListener('click', () => {
        const code = combinedOutput.value;
        if (!code) return;
        
        const form = document.createElement('form');
        form.action = 'https://www.overleaf.com/docs';
        form.method = 'POST';
        form.target = '_blank';

        const nameInput = document.createElement('input');
        nameInput.type = 'hidden';
        nameInput.name = 'snip[][name]';
        nameInput.value = 'main.tex';
        form.appendChild(nameInput);

        const contentInput = document.createElement('input');
        contentInput.type = 'hidden';
        contentInput.name = 'snip[][content]';
        contentInput.value = code;
        form.appendChild(contentInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
}

// 3. Light / Dark Theme Toggle
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

if (themeToggleBtn && themeIcon) {
    // Load preference on start
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeIcon.className = 'fa-solid fa-moon';
    } else {
        document.body.classList.remove('light-theme');
        themeIcon.className = 'fa-solid fa-sun';
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        if (isLight) {
            localStorage.setItem('theme', 'light');
            themeIcon.className = 'fa-solid fa-moon';
        } else {
            localStorage.setItem('theme', 'dark');
            themeIcon.className = 'fa-solid fa-sun';
        }
    });
}

// Listen for language changes to update sidebar and preview translation
window.addEventListener('langChanged', () => {
    renderSidebar();
    if (activeFileId) {
        selectFile(activeFileId);
    }
});
