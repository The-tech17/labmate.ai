// Starry background generation
function generateStars(elementId, count, size, duration) {
    const layer = document.getElementById(elementId);
    if (!layer) return;
    let shadows = [];
    for(let i=0; i<count; i++) {
        const x = Math.floor(Math.random() * 2000);
        const y = Math.floor(Math.random() * 2000);
        shadows.push(`${x}px ${y}px #FFF`);
    }
    layer.style.width = `${size}px`;
    layer.style.height = `${size}px`;
    layer.style.background = 'transparent';
    layer.style.boxShadow = shadows.join(', ');
    layer.style.animation = `animStar ${duration}s linear infinite`;
}

// Add keyframes dynamically
const styleTag = document.createElement('style');
styleTag.innerHTML = `
@keyframes animStar {
    from { transform: translateY(0px); }
    to { transform: translateY(-2000px); }
}
`;
document.head.appendChild(styleTag);

generateStars('stars', 700, 1, 50);
generateStars('stars2', 200, 2, 100);
generateStars('stars3', 100, 3, 150);

if (window.mermaid) {
    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'default'
    });
}

// App Logic
let currentTopic = '';
let currentSubjectType = 'Coding';
let generatedOutline = [];
let currentCredits = 0;
const EXPERIMENT_CREDIT_COST = 20;

document.getElementById('generate-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const promptInput = document.getElementById('prompt').value.trim();
    const typeSelect = document.getElementById('format_type').value;
    
    if (!promptInput) return;
    
    currentTopic = promptInput;
    currentSubjectType = typeSelect;

    document.getElementById('generate-btn').disabled = true;
    document.getElementById('generate-btn').classList.add('opacity-50');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('step-1').classList.add('opacity-50');
    
    const btnText = document.getElementById('generate-btn-text');
    const originalText = btnText.innerHTML;
    btnText.innerHTML = 'Generating...';
    
    const headers = { 'Content-Type': 'application/json' };
    if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

    try {
        const response = await fetch('/api/outline', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ prompt: currentTopic, type: currentSubjectType })
        });
        
        if (!response.ok) {
            const errBody = await response.json().catch(()=>({}));
            throw new Error(errBody.error || 'Outline Generation failed');
        }
        
        generatedOutline = await response.json();
        
        // Transition to Phase 2
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
        renderOutlineList();
        
    } catch (err) {
        alert("Labmate.ai encountered an error: " + err.message);
        document.getElementById('loading').classList.add('hidden');
    } finally {
        document.getElementById('generate-btn').disabled = false;
        document.getElementById('generate-btn').classList.remove('opacity-50');
        document.getElementById('step-1').classList.remove('opacity-50');
        btnText.innerHTML = originalText;
    }
});

function renderOutlineList() {
    const list = document.getElementById('outline-list');
    list.innerHTML = '';
    generatedOutline.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700 outline-item-row group";
        div.innerHTML = `
            <div class="flex items-center gap-2 w-full sm:w-auto flex-1">
                <span class="text-slate-500 font-mono text-sm cursor-move">𝄘</span>
                <input type="text" value="${item.replace(/"/g, '&quot;')}" class="outline-item-input flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-medium">
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start pl-6 sm:pl-0">
                <label class="flex items-center gap-2 cursor-pointer text-sm text-purple-300 hover:text-pink-300 transition-colors bg-slate-900/50 px-3 py-1.5 rounded border border-purple-500/20">
                    <input type="checkbox" class="outline-item-visual accent-pink-500 w-4 h-4 rounded">
                    <span class="font-bold">Visual Block</span>
                </label>
                <button type="button" onclick="this.closest('.outline-item-row').remove()" class="text-slate-500 hover:text-red-400 p-2 bg-slate-900/50 rounded transition-all">✕</button>
            </div>
        `;
        list.appendChild(div);
    });
}

window.addOutlineItem = function() {
    const list = document.getElementById('outline-list');
    const div = document.createElement('div');
    div.className = "flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700 outline-item-row group";
    div.innerHTML = `
        <div class="flex items-center gap-2 w-full sm:w-auto flex-1">
            <span class="text-slate-500 font-mono text-sm cursor-move">𝄘</span>
            <input type="text" value="New Section" class="outline-item-input flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-medium">
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start pl-6 sm:pl-0">
            <label class="flex items-center gap-2 cursor-pointer text-sm text-purple-300 hover:text-pink-300 transition-colors bg-slate-900/50 px-3 py-1.5 rounded border border-purple-500/20">
                <input type="checkbox" class="outline-item-visual accent-pink-500 w-4 h-4 rounded">
                <span class="font-bold">Visual Block</span>
            </label>
            <button type="button" onclick="this.closest('.outline-item-row').remove()" class="text-slate-500 hover:text-red-400 p-2 bg-slate-900/50 rounded transition-all">✕</button>
        </div>
    `;
    list.appendChild(div);
};

function escapeHTML(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeHeadingText(value) {
    return (value || '')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .toLowerCase();
}

function removeDuplicateLeadingHeading(container, sectionName) {
    const firstElement = container.firstElementChild;
    if (!firstElement || !/^H[1-6]$/.test(firstElement.tagName)) return;

    if (normalizeHeadingText(firstElement.textContent) === normalizeHeadingText(sectionName)) {
        firstElement.remove();
    }
}

function removeDuplicateLeadingInlineLabel(container, sectionName) {
    const firstElement = container.firstElementChild;
    if (!firstElement || firstElement.tagName !== 'P') return;

    const sectionLabel = normalizeInlineLabel(sectionName);
    if (!sectionLabel) return;

    const escapedLabel = sectionLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    firstElement.innerHTML = firstElement.innerHTML
        .replace(new RegExp(`^\\s*<strong[^>]*>\\s*${escapedLabel}\\s*</strong>\\s*`, 'i'), '')
        .replace(new RegExp(`^\\s*<b[^>]*>\\s*${escapedLabel}\\s*</b>\\s*`, 'i'), '')
        .replace(new RegExp(`^\\s*${escapedLabel}\\s*`, 'i'), '');

    if (!firstElement.textContent.trim() && !firstElement.querySelector('img, svg, canvas, table')) {
        firstElement.remove();
    }
}

function extractRenderableContent(rawContent) {
    if (rawContent == null) return '';
    if (typeof rawContent !== 'string') return String(rawContent);

    const trimmed = rawContent.trim();
    if (!trimmed) return '';

    try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && typeof parsed.content === 'string') {
            return extractRenderableContent(parsed.content);
        }
    } catch (_err) {
        // Fall through to regex-based cleanup.
    }

    const wrappedContentMatch = trimmed.match(/^\{\s*"content"\s*:\s*"([\s\S]*)"\s*\}$/);
    if (wrappedContentMatch) {
        return wrappedContentMatch[1]
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\');
    }

    const embeddedContentMatch = trimmed.match(/"content"\s*:\s*"([\s\S]*)"/);
    if (embeddedContentMatch) {
        return embeddedContentMatch[1]
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\')
            .trim();
    }

    return trimmed;
}

function focusEditableEnd(element) {
    if (!element) return;

    element.focus();
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

let lastFocusedEditable = null;

function normalizeInlineLabel(text) {
    const cleaned = (text || '').replace(/:+$/, '').trim();
    return cleaned ? `${cleaned}:` : '';
}

function mergeHeadingWithNextContent(container, headingSelector) {
    container.querySelectorAll(headingSelector).forEach(heading => {
        const labelText = normalizeInlineLabel(heading.textContent);
        let next = heading.nextElementSibling;

        while (next && next.tagName === 'BR') {
            const toRemove = next;
            next = next.nextElementSibling;
            toRemove.remove();
        }

        if (next && next.tagName === 'P') {
            next.innerHTML = `<strong class="inline-label">${escapeHTML(labelText)}</strong> ${next.innerHTML}`;
            heading.remove();
            return;
        }

        const paragraph = document.createElement('p');
        paragraph.className = 'section-inline-row';
        paragraph.innerHTML = `<strong class="inline-label">${escapeHTML(labelText)}</strong>`;
        heading.replaceWith(paragraph);
    });
}

function enforceAcademicFormatting(container, sectionName) {
    removeDuplicateLeadingHeading(container, sectionName);
    removeDuplicateLeadingInlineLabel(container, sectionName);

    container.querySelectorAll('ul, ol').forEach(list => {
        const prev = list.previousElementSibling;
        if (prev && prev.tagName === 'P' && !prev.textContent.trim()) {
            prev.remove();
        }
    });
}

async function renderMermaidBlocks(body) {
    const mermaidBlocks = Array.from(body.querySelectorAll('pre code.language-mermaid'));
    const wrappers = [];

    mermaidBlocks.forEach(codeBlock => {
        const preNode = codeBlock.closest('pre');
        if (!preNode) return;

        const source = codeBlock.textContent.trim();
        const wrapper = document.createElement('div');
        wrapper.className = 'diagram-block my-4 w-full break-inside-avoid print:break-inside-avoid';

        const mmDiv = document.createElement('div');
        mmDiv.className = 'mermaid flex justify-center w-full';
        mmDiv.textContent = source;

        const fallback = document.createElement('pre');
        fallback.className = 'hidden whitespace-pre-wrap text-sm bg-amber-50 border border-amber-200 text-slate-800 p-3 rounded-md overflow-x-auto print:hidden';
        fallback.textContent = source;

        wrapper.appendChild(mmDiv);
        wrapper.appendChild(fallback);
        preNode.replaceWith(wrapper);
        wrappers.push({ mmDiv, fallback });
    });

    if (!window.mermaid) {
        wrappers.forEach(({ fallback }) => fallback.classList.remove('hidden'));
        return;
    }

    for (const { mmDiv, fallback } of wrappers) {
        try {
            await mermaid.run({ nodes: [mmDiv] });
        } catch (error) {
            console.error('Mermaid render failed:', error);
            fallback.classList.remove('hidden');
            mmDiv.classList.add('hidden');
        }
    }
}

window.createCanvas = async function() {
    const rows = document.querySelectorAll('.outline-item-row');
    const finalSections = Array.from(rows).map(row => {
        const input = row.querySelector('.outline-item-input');
        const visualCheck = row.querySelector('.outline-item-visual');
        return {
            name: input.value,
            isVisual: visualCheck ? visualCheck.checked : false
        };
    }).filter(s => s.name.trim() !== '');
    
    if (finalSections.length === 0) {
        alert("You must have at least one section!");
        return;
    }
    
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');
    
    const containerInner = document.getElementById('result-content');
    containerInner.innerHTML = '';
    
    finalSections.forEach(section => {
        const cardId = 'card-' + Math.random().toString(36).substr(2, 9);
        const escapedName = escapeHTML(section.name);
            
        const cardHTML = `
            <div id="${cardId}" data-section-name="${escapedName}" class="section-card relative bg-white shadow-2xl rounded-2xl p-8 mb-8 border border-purple-500/20 group transition-all">
                <!-- Action Bar -->
                <div class="absolute -top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 print:hidden z-20">
                    <button onclick="queueSectionGeneration('${cardId}', this.getAttribute('data-section'), true)" data-section="${escapedName}" class="magic-btn-visual bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-4 py-2 shadow-lg hover:scale-105 transition-transform flex items-center gap-2" title="Generate Diagram/Output">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span class="text-sm font-bold badge-text-visual">Visual</span>
                    </button>
                    <button onclick="insertImageFileIntoSection('${cardId}')" class="bg-slate-700 text-white rounded-full px-4 py-2 shadow-lg hover:bg-slate-600 hover:scale-105 transition-transform flex items-center gap-2" title="Insert image file">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span class="text-sm font-bold">Image</span>
                    </button>
                    <button onclick="queueSectionGeneration('${cardId}', this.getAttribute('data-section'), false)" data-section="${escapedName}" class="magic-btn bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-4 py-2 shadow-lg hover:scale-105 transition-transform flex items-center gap-2" title="Generate Section">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span class="text-sm font-bold badge-text">Generate</span>
                    </button>
                    <button onclick="this.closest('.section-card').remove()" class="bg-slate-700 text-slate-300 rounded-full p-2 shadow-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete Card">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                <div class="section-body text-slate-800 text-lg leading-relaxed space-y-4 focus:outline-none min-h-[60px]" contenteditable="true" spellcheck="false"></div>
            </div>
        `;
        containerInner.insertAdjacentHTML('beforeend', cardHTML);
        
        // Auto-feed into Queue Engine
        queueSectionGeneration(cardId, section.name, section.isVisual);
    });
};

/* =========================================================================
   Queue & Quota Management Engine
   ========================================================================= */
let generationQueue = [];
let isGenerating = false;

window.queueSectionGeneration = function(cardId, sectionName, isVisual = false) {
    const card = document.getElementById(cardId);
    if (card) {
        const body = card.querySelector('.section-body');
        if (body.innerHTML.includes('Standing_by_for_Auto-Generation') || body.innerHTML.trim() === '') {
            body.innerHTML = '<span class="text-slate-400 italic text-sm">⏳ Queued for generation...</span>';
        }
    }
    
    generationQueue.push({ cardId, sectionName, isVisual });
    processQueue();
};

async function processQueue() {
    if (isGenerating || generationQueue.length === 0) return;
    
    isGenerating = true;
    const task = generationQueue.shift();
    
    try {
        await generateSectionCore(task.cardId, task.sectionName, task.isVisual);
    } catch (e) {
        console.error("Queue Generation Error:", e);
    } finally {
        isGenerating = false;
        // Introduce a 2.5 second delay before processing the next section to respect Groq's RPM free tier limits 
        // and prevent instantaneous 500 Server Errors caused by 429 Too Many Requests blocking the pipeline.
        setTimeout(processQueue, 2500);
    }
}

window.generateSectionCore = async function(cardId, _, isVisual = false) {
    return new Promise(async (resolve, reject) => {
        const card = document.getElementById(cardId);
        if (!card) return resolve();
        
        const header = card.querySelector('h3');
        // Extract live text from the heading DOM element, securely stripping off the 'VISUAL' badge text if present.
        let liveSectionName = header ? header.innerText.replace(/VISUAL/i, '').trim() : 'Section';
        if (!liveSectionName) liveSectionName = 'Section';
        
        const body = card.querySelector('.section-body');
        const btn = isVisual ? card.querySelector('.magic-btn-visual') : card.querySelector('.magic-btn');
        const badgeText = isVisual ? card.querySelector('.badge-text-visual') : card.querySelector('.badge-text');
        
        const originalHTML = btn ? btn.innerHTML : '';
        
        body.innerHTML = '<span class="text-slate-400 animate-pulse text-sm font-bold">✨ Labmate.ai is writing this section...</span>';
        if (badgeText) badgeText.innerHTML = '...';
        if (btn) btn.disabled = true;
        
        const headers = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        try {
            const response = await fetchWithRetry('/api/section', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ topic: currentTopic, section: liveSectionName, type: currentSubjectType, is_visual: isVisual })
            }, 1, 1000);
            
            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                throw new Error(errorBody?.error || errorBody?.message || response.statusText || 'Section generation failed');
            }
            const data = await response.json();
            
            body.innerHTML = ''; 
            
            const tempDiv = document.createElement('div');
            const currentTheme = document.getElementById('theme-selector').value;
            const invertClass = currentTheme === 'dark' ? 'prose-invert' : '';
            tempDiv.className = `markdown-body prose ${invertClass} prose-purple max-w-none`;
            tempDiv.innerHTML = marked.parse(data.content);
            
            const nodesToReveal = Array.from(tempDiv.children);
            let i = 0;
            
            function revealNext() {
                if (i < nodesToReveal.length) {
                    const node = nodesToReveal[i];
                    
                    // Visual Intercepts
                    if (node.tagName === 'PRE') {
                        const codeBlock = node.querySelector('code');
                        if (codeBlock) {
                            // Mermaid Intercept
                            if (codeBlock.classList.contains('language-mermaid')) {
                                const mmDiv = document.createElement('div');
                                mmDiv.className = 'mermaid my-4 flex justify-center w-full break-inside-avoid print:break-inside-avoid';
                                mmDiv.textContent = codeBlock.textContent;
                                body.appendChild(mmDiv);
                                
                                setTimeout(async () => {
                                    try { await mermaid.run({ nodes: [mmDiv] }); } catch (e) { console.error(e); }
                                }, 50);
                                i++; setTimeout(revealNext, 50); return;
                            }
                            // Python Sandbox Intercept
                            if (codeBlock.classList.contains('language-python') || codeBlock.classList.contains('language-py')) {
                                node.classList.add('relative', 'group');
                                const runBtn = document.createElement('button');
                                runBtn.className = 'absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:scale-105 z-10 shadow-lg magic-run-btn print:hidden flex items-center gap-1';
                                runBtn.innerHTML = '✨ Run Code';
                                runBtn.onclick = () => runPythonCode(codeBlock.textContent, node);
                                node.appendChild(runBtn);
                            }
                        }
                    }
                    
                    node.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-500', 'ease-out');
                    body.appendChild(node);
                    
                    void node.offsetWidth;
                    node.classList.remove('opacity-0', 'translate-y-4');
                    
                    if (window.MathJax) {
                        MathJax.typesetPromise([node]).then(() => {
                            node.querySelectorAll('mjx-container').forEach(el => {
                                el.setAttribute('contenteditable', 'false');
                                el.setAttribute('draggable', 'true');
                            });
                        });
                    }
                    
                    i++;
                    setTimeout(revealNext, 80); // Speed up typing slightly for long queues
                } else {
                    // Typewriter finished successfully
                    if (btn) btn.innerHTML = originalHTML;
                    if (btn) btn.disabled = false;
                    resolve();
                }
            }
            revealNext();
            
        } catch (err) {
            body.innerHTML = `<span class="text-red-500">Failed: ${err.message}</span>`;
            if (btn) btn.innerHTML = originalHTML;
            if (btn) btn.disabled = false;
            resolve(); // Resolve anyway to proceed the queue
        }
    });
};

window.runPythonCode = async function(codeString, preContainer) {
    const btn = preContainer.querySelector('.magic-run-btn');
    if (btn) btn.innerHTML = '⚙️ Running...';
    
    const headers = { 'Content-Type': 'application/json' };
    if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
    
    try {
        const res = await fetch('/api/run_code', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ code: codeString })
        });
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        // Clear any old outputs associated with this specific code block
        const oldOutputs = preContainer.parentElement.querySelectorAll(':scope > .py-output-' + preContainer.id);
        oldOutputs.forEach(o => o.remove());
        
        const outputID = 'py-output-' + Math.random().toString(36).substr(2, 9);
        preContainer.id = outputID; // Link them
        
        const outputDiv = document.createElement('div');
        outputDiv.className = `py-output-${outputID} mt-4 p-4 bg-slate-100 rounded-lg border border-slate-300 shadow-inner max-w-full overflow-hidden space-y-4 print:bg-transparent print:border-none print:shadow-none print:p-0 break-inside-avoid print:break-inside-avoid`;
        outputDiv.contentEditable = "false";
        
        if (data.stdout || data.stderr) {
            const txt = document.createElement('pre');
            txt.className = 'whitespace-pre-wrap font-mono text-sm text-slate-800 bg-emerald-50/50 border border-emerald-200 p-4 rounded-md overflow-x-auto print:bg-transparent print:border-none print:p-0';
            txt.textContent = data.stdout + (data.stderr ? "\nError: " + data.stderr : "");
            outputDiv.appendChild(txt);
        }
        
        if (data.images && data.images.length > 0) {
            data.images.forEach(imgUrl => {
                const img = document.createElement('img');
                img.src = imgUrl + '?t=' + Date.now();
                img.className = 'max-w-full rounded-md shadow-md object-contain mx-auto print:shadow-none print:max-w-none';
                img.style.maxHeight = '600px';
                outputDiv.appendChild(img);
            });
        }
        
        preContainer.after(outputDiv);
        
    } catch(err) {
        alert("Interpreter Error: " + err.message);
    } finally {
        if (btn) {
            btn.innerHTML = "✨ Run Code";
            btn.disabled = false;
        }
    }
};

window.createCanvas = async function() {
    const rows = document.querySelectorAll('.outline-item-row');
    const finalSections = Array.from(rows).map(row => {
        const input = row.querySelector('.outline-item-input');
        const visualCheck = row.querySelector('.outline-item-visual');
        return {
            name: input.value,
            isVisual: visualCheck ? visualCheck.checked : false
        };
    }).filter(section => section.name.trim() !== '');

    if (finalSections.length === 0) {
        alert("You must have at least one section!");
        return;
    }

    const charged = await chargeForExperiment();
    if (!charged) return;

    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');

    const containerInner = document.getElementById('result-content');
    containerInner.innerHTML = '';

    finalSections.forEach(section => {
        const cardId = 'card-' + Math.random().toString(36).substr(2, 9);
        const escapedName = escapeHTML(section.name);

        const cardHTML = `
            <div id="${cardId}" data-section-name="${escapedName}" class="section-card relative bg-white shadow-2xl rounded-2xl p-8 mb-8 border border-purple-500/20 group transition-all">
                <div class="absolute -top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 print:hidden z-20">
                    <button onclick="queueSectionGeneration('${cardId}', this.getAttribute('data-section'), true)" data-section="${escapedName}" class="magic-btn-visual bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-4 py-2 shadow-lg hover:scale-105 transition-transform flex items-center gap-2" title="Generate Diagram/Output">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span class="text-sm font-bold badge-text-visual">Visual</span>
                    </button>
                    <button onclick="insertImageFileIntoSection('${cardId}')" class="bg-slate-700 text-white rounded-full px-4 py-2 shadow-lg hover:bg-slate-600 hover:scale-105 transition-transform flex items-center gap-2" title="Insert image file">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span class="text-sm font-bold">Image</span>
                    </button>
                    <button onclick="queueSectionGeneration('${cardId}', this.getAttribute('data-section'), false)" data-section="${escapedName}" class="magic-btn bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-4 py-2 shadow-lg hover:scale-105 transition-transform flex items-center gap-2" title="Generate Section">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span class="text-sm font-bold badge-text">Generate</span>
                    </button>
                    <button onclick="this.closest('.section-card').remove()" class="bg-slate-700 text-slate-300 rounded-full p-2 shadow-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete Card">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                <div class="section-title text-3xl font-bold text-slate-900 mb-5 focus:outline-none" title="Click to edit section title directly" contenteditable="true" spellcheck="false">${escapedName}</div>
                <div class="section-body text-slate-800 text-lg leading-relaxed space-y-4 focus:outline-none min-h-[60px]" contenteditable="true" spellcheck="false"></div>
            </div>
        `;

        containerInner.insertAdjacentHTML('beforeend', cardHTML);
        queueSectionGeneration(cardId, section.name, section.isVisual);
    });
};

window.queueSectionGeneration = function(cardId, sectionName, isVisual = false) {
    const card = document.getElementById(cardId);
    const body = card?.querySelector('.section-body');

    if (body && body.innerHTML.trim() === '') {
        body.innerHTML = '<span class="text-slate-400 italic text-sm">Queued for generation...</span>';
    }

    generationQueue.push({ cardId, sectionName, isVisual });
    processQueue();
};

window.insertImageFileIntoSection = function(cardId) {
    const card = document.getElementById(cardId);
    const body = card?.querySelector('.section-body');
    if (!body) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/gif';
    input.style.display = 'none';

    input.onchange = () => {
        const file = input.files?.[0];
        input.remove();
        if (!file) return;
        if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
            alert('Please choose a PNG, JPG, WEBP, or GIF image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const figure = document.createElement('figure');
            figure.className = 'manual-diagram-image my-4 text-center break-inside-avoid print:break-inside-avoid';
            figure.contentEditable = 'false';
            figure.innerHTML = `
                <img src="${reader.result}" alt="${escapeHTML(file.name)}" class="max-w-full max-h-[620px] object-contain mx-auto rounded-md border border-slate-200 shadow-sm print:shadow-none">
                <figcaption class="mt-2 text-sm text-slate-500 print:hidden">${escapeHTML(file.name)}</figcaption>
            `;

            const currentText = body.textContent.trim();
            if (!currentText || currentText.startsWith('Queued for generation') || currentText.startsWith('Labmate.ai is writing') || currentText.startsWith('Failed:')) {
                body.innerHTML = '';
            }

            body.appendChild(figure);
            focusEditableEnd(body);
        };
        reader.readAsDataURL(file);
    };

    document.body.appendChild(input);
    input.click();
};

window.generateSectionCore = async function(cardId, queuedSectionName = '', isVisual = false) {
    return new Promise(async (resolve) => {
        const card = document.getElementById(cardId);
        if (!card) return resolve();

        const body = card.querySelector('.section-body');
        const btn = isVisual ? card.querySelector('.magic-btn-visual') : card.querySelector('.magic-btn');
        const badgeText = isVisual ? card.querySelector('.badge-text-visual') : card.querySelector('.badge-text');
        const editableTitle = card.querySelector('.section-title');
        let liveSectionName = (editableTitle?.innerText || queuedSectionName || card.dataset.sectionName || '').trim();
        if (!liveSectionName) liveSectionName = 'Section';
        card.dataset.sectionName = liveSectionName;

        const originalHTML = btn ? btn.innerHTML : '';
        body.innerHTML = '<span class="text-slate-400 animate-pulse text-sm font-bold">Labmate.ai is writing this section...</span>';
        if (badgeText) badgeText.innerHTML = '...';
        if (btn) btn.disabled = true;

        const headers = { 'Content-Type': 'application/json' };
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

        try {
            const response = await fetchWithRetry('/api/section', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ topic: currentTopic, section: liveSectionName, type: currentSubjectType, is_visual: isVisual })
            }, 1, 1000);

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                throw new Error(errorBody?.error || errorBody?.message || response.statusText || 'Section generation failed');
            }
            const data = await response.json();

            const renderableContent = extractRenderableContent(data.content);
            const currentTheme = document.getElementById('theme-selector').value;
            const invertClass = currentTheme === 'dark' ? 'prose-invert' : '';

            const tempDiv = document.createElement('div');
            tempDiv.className = `markdown-body prose ${invertClass} prose-purple max-w-none`;
            tempDiv.innerHTML = marked.parse(renderableContent || '');
            enforceAcademicFormatting(tempDiv, liveSectionName);

            tempDiv.querySelectorAll('pre').forEach(preNode => {
                const codeBlock = preNode.querySelector('code');
                if (!codeBlock) return;

                if (codeBlock.classList.contains('language-python') || codeBlock.classList.contains('language-py')) {
                    preNode.classList.add('relative', 'group');
                    const runBtn = document.createElement('button');
                    runBtn.className = 'absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:scale-105 z-10 shadow-lg magic-run-btn print:hidden flex items-center gap-1';
                    runBtn.innerHTML = 'Run Code';
                    runBtn.onclick = () => runPythonCode(codeBlock.textContent, preNode);
                    preNode.appendChild(runBtn);
                }
            });

            body.innerHTML = tempDiv.innerHTML;
            body.contentEditable = 'true';
            body.spellcheck = false;

            await renderMermaidBlocks(body);

            if (window.MathJax) {
                MathJax.typesetPromise([body]).then(() => {
                    body.querySelectorAll('mjx-container').forEach(el => {
                        el.setAttribute('contenteditable', 'false');
                        el.setAttribute('draggable', 'true');
                    });
                }).catch(err => console.error(err));
            }

            if (btn) btn.innerHTML = originalHTML;
            if (btn) btn.disabled = false;
            resolve();
        } catch (err) {
            body.innerHTML = `<span class="text-red-500">Failed: ${err.message}</span>`;
            if (btn) btn.innerHTML = originalHTML;
            if (btn) btn.disabled = false;
            resolve();
        }
    });
};

// Editor Toolbar Logic
let savedSelection = null;
const floatToolbar = document.getElementById('floating-toolbar');

function checkSelectionAndShowToolbar() {
    if (!floatToolbar) return;
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        hideToolbar();
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        hideToolbar();
        return;
    }

    let node = selection.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }

    // Verify editable context
    if (node && node.closest && (node.closest('.section-body') || node.closest('.section-title') || node.closest('#doc-header') || node.closest('#doc-footer'))) {
        savedSelection = range;

        // Briefly force display to measure
        floatToolbar.classList.remove('hidden');
        floatToolbar.style.display = 'flex';
        
        // Let the browser paint to get accurate dimensions
        requestAnimationFrame(() => {
            const tbWidth = floatToolbar.offsetWidth;
            const tbHeight = floatToolbar.offsetHeight;
            floatToolbar.style.display = '';

            let topPos = rect.top + window.scrollY - tbHeight - 15;
            let leftPos = rect.left + window.scrollX + (rect.width / 2) - (tbWidth / 2);

            // Bounds constraint
            if (topPos < window.scrollY) topPos = rect.bottom + window.scrollY + 10;
            if (leftPos < 10) leftPos = 10;
            if (leftPos + tbWidth > window.innerWidth) leftPos = window.innerWidth - tbWidth - 10;

            floatToolbar.style.top = `${topPos}px`;
            floatToolbar.style.left = `${leftPos}px`;
            
            floatToolbar.classList.remove('scale-95', 'opacity-0');
            floatToolbar.classList.add('scale-100', 'opacity-100');
        });
    } else {
        hideToolbar();
    }
}

function hideToolbar() {
    if (floatToolbar) {
        floatToolbar.classList.add('scale-95', 'opacity-0');
        floatToolbar.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            if (floatToolbar.classList.contains('opacity-0')) {
                floatToolbar.classList.add('hidden');
            }
        }, 150);
    }
}

document.addEventListener('mouseup', () => setTimeout(checkSelectionAndShowToolbar, 50));
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.key.includes('Arrow')) {
        setTimeout(checkSelectionAndShowToolbar, 50);
    } else {
        hideToolbar();
    }
});
document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) hideToolbar();
});

document.addEventListener('click', (event) => {
    const title = event.target.closest('.section-title');
    if (title) {
        lastFocusedEditable = title;
        focusEditableEnd(title);
        return;
    }

    const body = event.target.closest('.section-body');
    if (body && event.target === body) {
        lastFocusedEditable = body;
        focusEditableEnd(body);
    }
});

document.addEventListener('focusin', (event) => {
    const editable = event.target.closest?.('.section-title, .section-body, #doc-header, #doc-footer');
    if (editable) {
        lastFocusedEditable = editable;
    }
});

window.formatDoc = function(command, value = null) {
    // Restore selection if focus was stolen by a toolbar button
    if (savedSelection) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedSelection);
    }
    
    // Force browser to generate spans with inline CSS instead of deprecated <font> tags.
    // This effortlessly circumvents Tailwind's strong `.prose` specificities!
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(command, false, value);
};

window.printPage = function() {
    window.print();
};

/* =========================================================================
   Supabase Authentication & SaaS Credit System
   ========================================================================= */
let authClient = null;
let session = null;

if (window.supabase && window.SUPABASE_URL) {
    authClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    checkSession();
}

async function checkSession() {
    const { data } = await authClient.auth.getSession();
    if (data.session) {
        session = data.session;
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        fetchCredits();
    }
    
    authClient.auth.onAuthStateChange((_event, newSession) => {
        session = newSession;
        if (!session) {
            document.getElementById('auth-container').classList.remove('hidden');
            document.getElementById('app-container').classList.add('hidden');
        } else {
            // Once logged in seamlessly, fetch credits and hide auth portal
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            fetchCredits();
        }
    });
}

function showAuthError(msg) {
    const el = document.getElementById('auth-error');
    if (!el) return;
    el.innerHTML = msg;
    el.classList.remove('text-emerald-400', 'border-emerald-500/20', 'bg-emerald-500/10');
    el.classList.add('text-red-400', 'border-red-500/20', 'bg-red-500/10');
    el.classList.remove('hidden');
}

function showAuthSuccess(msg) {
    const el = document.getElementById('auth-error');
    if (!el) return;
    el.innerHTML = msg;
    el.classList.remove('text-red-400', 'border-red-500/20', 'bg-red-500/10', 'hidden');
    el.classList.add('text-emerald-400', 'border-emerald-500/20', 'bg-emerald-500/10');
}

function clearAuthMessage() {
    const el = document.getElementById('auth-error');
    if (!el) return;
    el.innerHTML = '';
    el.classList.add('hidden');
}

function ensureSupabaseReady() {
    if (authClient) return true;
    showAuthError('Authentication is not available right now. Check your Supabase configuration and reload the page.');
    return false;
}

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (session) headers.Authorization = `Bearer ${session.access_token}`;
    return headers;
}

function showCreditStatus(credits) {
    currentCredits = Number(credits || 0);
    const display = document.getElementById('credit-display');
    if (!display) return;
    const experimentsLeft = Math.floor(currentCredits / EXPERIMENT_CREDIT_COST);
    display.innerHTML = `${currentCredits} Credits Remaining (${experimentsLeft} experiments)`;
    display.classList.toggle('text-amber-300', currentCredits < EXPERIMENT_CREDIT_COST);
    display.classList.toggle('text-emerald-300', currentCredits >= EXPERIMENT_CREDIT_COST);
}

async function chargeForExperiment() {
    if (!session) {
        alert('Please sign in before generating an experiment.');
        return false;
    }

    try {
        const response = await fetch('/api/credits/consume_experiment', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ topic: currentTopic, type: currentSubjectType })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (data.error === 'OUT_OF_CREDITS') {
                showCreditStatus(data.credits || 0);
                openBilling(data.message || 'You need more credits to generate another experiment.');
                return false;
            }
            throw new Error(data.error || data.message || 'Credit charge failed');
        }

        showCreditStatus(data.credits);
        return true;
    } catch (err) {
        alert('Could not verify credits: ' + err.message);
        return false;
    }
}

async function downloadWordFile() {
    const doc = document.getElementById('document-page');
    if (!doc) return;

    const title = (currentTopic || 'Labmate.ai_experiment').slice(0, 80);
    const response = await fetch('/api/export/word', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, html: doc.innerHTML })
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Word export failed');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${title.replace(/[^A-Za-z0-9_-]+/g, '_') || 'Labmate.ai_experiment'}.doc`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

window.exportToWord = async function() {
    try {
        await downloadWordFile();
    } catch (err) {
        alert(err.message);
    }
};

window.exportToGoogleDocs = async function() {
    try {
        await downloadWordFile();
        window.open('https://docs.google.com/document/u/0/', '_blank', 'noopener');
        alert('Your Word file has been downloaded. In Google Docs, use File > Open > Upload to edit it as a Google Doc. Direct one-click export needs Google Drive API credentials.');
    } catch (err) {
        alert(err.message);
    }
};

window.openBilling = async function(message = '') {
    const modal = document.getElementById('billing-modal');
    const msg = document.getElementById('billing-message');
    if (modal) modal.classList.remove('hidden');
    if (msg) msg.textContent = message || 'Loading billing status...';

    if (!session) return;
    try {
        const response = await fetch('/api/billing/options', { headers: getAuthHeaders() });
        const data = await response.json();
        if (msg) msg.textContent = message || data.message || 'Choose a payment method to continue.';
    } catch (err) {
        if (msg) msg.textContent = 'Could not load billing status: ' + err.message;
    }
};

window.closeBilling = function() {
    document.getElementById('billing-modal')?.classList.add('hidden');
};

window.startCheckout = async function() {
    try {
        const response = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ package: 'credits' })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || 'Billing is not configured.');
        window.open(data.checkout_url, '_blank', 'noopener');
    } catch (err) {
        const msg = document.getElementById('billing-message');
        if (msg) msg.textContent = err.message;
    }
};

document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!ensureSupabaseReady()) return;

    const btn = document.getElementById('login-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Signing In...';
    btn.disabled = true;

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    clearAuthMessage();

    try {
        const { data, error } = await authClient.auth.signInWithPassword({ email, password });
        if (error) {
            showAuthError(error.message);
        }
    } catch (err) {
        showAuthError("System Error: " + err.message);
        console.error(err);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

document.getElementById('google-login-btn')?.addEventListener('click', async () => {
    if (!ensureSupabaseReady()) return;
    clearAuthMessage();

    const { error } = await authClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) showAuthError(error.message);
});

window.handleSignup = async function() {
    const btn = document.getElementById('signup-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Creating...';
    btn.disabled = true;
    
    try {
        if (!authClient) throw new Error("Supabase is not initialized. Please ensure your .env variables are properly loaded.");
        
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        clearAuthMessage();
        
        if (!email || !password || password.length < 6) {
            showAuthError("Please enter an email and a 6+ character password to sign up.");
            btn.innerHTML = originalText;
            return;
        }
        
        const { data, error } = await authClient.auth.signUp({ email, password });
        if (error) {
            showAuthError(error.message);
        } else {
            showAuthSuccess("Account created successfully! You now have 400 free credits.");
            
            // Log them in immediately after signup if email verification is off
            if (data.session) {
                session = data.session;
                document.getElementById('auth-container').classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');
                fetchCredits();
            } else {
                showAuthSuccess("Account created! Please check your email inbox to verify your account, or disable 'Confirm email' for your Supabase project.");
            }
        }
    } catch (err) {
        showAuthError("System Error: " + err.message);
        console.error(err);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

const signupBtn = document.getElementById('signup-btn');
if (signupBtn) {
    signupBtn.removeAttribute('onclick');
    signupBtn.addEventListener('click', window.handleSignup);
}

window.handleLogout = async function() {
    if (!ensureSupabaseReady()) return;
    await authClient.auth.signOut();
};

async function fetchCredits() {
    if (!session) return;
    try {
        const response = await fetch('/api/credits/account', { headers: getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to fetch credits');
        showCreditStatus(data.credits);
    } catch (err) {
        const display = document.getElementById('credit-display');
        if (display) display.innerHTML = 'Credits unavailable';
        console.error(err);
    }
}

window.insertTable = function() {
    const rows = parseInt(prompt("Enter number of rows:", "3"), 10);
    const cols = parseInt(prompt("Enter number of columns:", "3"), 10);
    if (!rows || !cols || isNaN(rows) || isNaN(cols)) return;

    let tableHTML = `
        <br>
        <table class="w-full border-collapse border border-slate-500 my-4 text-left">
            <thead>
                <tr>
    `;
    
    for (let c=0; c<cols; c++) {
        tableHTML += `<th class="border border-slate-500 p-2 text-slate-300">Header ${c+1}</th>`;
    }
    
    tableHTML += `
                </tr>
            </thead>
            <tbody>
    `;
    
    for (let r=0; r<rows; r++) {
        tableHTML += `<tr>`;
        for (let c=0; c<cols; c++) {
            tableHTML += `<td class="border border-slate-500 p-2">Data</td>`;
        }
        tableHTML += `</tr>`;
    }

    tableHTML += `
            </tbody>
        </table>
        <br>
    `;

    if (lastFocusedEditable) {
        focusEditableEnd(lastFocusedEditable);
        formatDoc('insertHTML', tableHTML);
        return;
    }

    formatDoc('insertHTML', tableHTML);
};

window.insertAIImage = function() {
    const promptText = prompt("Describe the image you want to generate (e.g. 'Pencil sketch of an electronic circuit'):");
    if (!promptText) return;
    
    const id = "img-" + Date.now();
    const loadingHTML = `<div id="${id}" class="my-4 p-4 border-2 border-dashed border-purple-500 rounded text-center text-purple-300 font-medium animate-pulse">✨ Generating AI Image: "${promptText}"...</div><br>`;
    formatDoc('insertHTML', loadingHTML);
    
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=800&height=400&nologo=true`;
    const img = new Image();
    img.src = url;
    img.className = "w-full max-w-2xl mx-auto rounded-lg shadow-xl my-4 border border-slate-300";
    img.alt = promptText;
    
    img.onload = () => {
        const placeholder = document.getElementById(id);
        if (placeholder) placeholder.parentNode.replaceChild(img, placeholder);
    };
    img.onerror = () => {
        const placeholder = document.getElementById(id);
        if (placeholder) {
            placeholder.innerHTML = "❌ Failed to load image. Try again.";
            placeholder.classList.replace('text-purple-300', 'text-red-500');
            placeholder.classList.replace('border-purple-500', 'border-red-500');
        }
    };
};

const resultContent = document.getElementById('result-content');
const fontFamilySelect = document.getElementById('font-family');
const themeSelect = document.getElementById('theme-selector');
const fontSizeInput = document.getElementById('font-size');
const sizeVal = document.getElementById('size-val');
const lineSpacingSelect = document.getElementById('line-spacing');

function getActiveEditableElement() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    let node = selection.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }

    return node && node.closest
        ? node.closest('.section-title, .section-body, #doc-header, #doc-footer')
        : null;
}

function selectionHasRangeInsideEditor() {
    const selection = window.getSelection();
    const activeElement = getActiveEditableElement();
    return !!(selection && activeElement && selection.rangeCount > 0 && !selection.isCollapsed);
}

function applyInlineStyleToSelection(styleText) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.setAttribute('style', styleText);

    try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        selection.removeAllRanges();
        return true;
    } catch (_err) {
        return false;
    }
}

async function fetchWithRetry(url, options, retries = 1, delayMs = 800) {
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fetch(url, options);
        } catch (error) {
            lastError = error;
            if (attempt === retries) break;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    throw lastError;
}

// Default document formatting
resultContent.style.lineHeight = "1.0";
resultContent.style.fontFamily = "'Times New Roman', serif";
resultContent.style.fontSize = "12pt";
document.getElementById('document-page').style.fontFamily = "'Times New Roman', serif";
document.getElementById('doc-header').style.fontFamily = "'Times New Roman', serif";
document.getElementById('doc-footer').style.fontFamily = "'Times New Roman', serif";

fontFamilySelect.addEventListener('change', (e) => {
    const activeElement = getActiveEditableElement();
    if (activeElement && activeElement.classList.contains('section-title')) {
        activeElement.style.fontFamily = e.target.value;
        return;
    }

    if (selectionHasRangeInsideEditor()) {
        formatDoc('fontName', e.target.value.replace(/['"]/g, ''));
        return;
    }

    resultContent.style.fontFamily = e.target.value;
});

lineSpacingSelect.addEventListener('change', (e) => {
    const activeElement = getActiveEditableElement();
    if (activeElement && activeElement.classList.contains('section-title')) {
        activeElement.style.lineHeight = e.target.value;
        return;
    }

    resultContent.style.lineHeight = e.target.value;
});

fontSizeInput.addEventListener('input', (e) => {
    const size = e.target.value + 'pt';
    sizeVal.textContent = size;

    const activeElement = getActiveEditableElement();
    if (activeElement && activeElement.classList.contains('section-title')) {
        activeElement.style.fontSize = size;
        return;
    }

    if (selectionHasRangeInsideEditor()) {
        if (applyInlineStyleToSelection(`font-size: ${size};`)) {
            return;
        }
    }

    resultContent.style.fontSize = size;
});

// Render formatting to match theme
themeSelect.addEventListener('change', (e) => {
    const docPage = document.getElementById('document-page');
    // Remove all previous background classes to clear state
    docPage.classList.remove('bg-white', 'text-slate-900', 'bg-slate-900', 'text-slate-200', 'bg-[#f4ecd8]', 'text-[#5c4b37]');
    const innerMarkdown = docPage.querySelectorAll('.markdown-body');
    
    if (e.target.value === 'dark') {
        docPage.classList.add('bg-slate-900', 'text-slate-200');
        innerMarkdown.forEach(el => el.classList.add('prose-invert'));
    } else if (e.target.value === 'light') {
        docPage.classList.add('bg-white', 'text-slate-900');
        innerMarkdown.forEach(el => el.classList.remove('prose-invert'));
    } else {
        docPage.classList.add('bg-[#f4ecd8]', 'text-[#5c4b37]');
        innerMarkdown.forEach(el => el.classList.remove('prose-invert'));
    }
});

// Native Print & Page Config
const pageSizeSelect = document.getElementById('page-size');
const pageMarginSelect = document.getElementById('page-margin');
const docPage = document.getElementById('document-page');
const showPageBreaks = document.getElementById('show-page-breaks');

let printStyle = document.getElementById('print-style');
if (!printStyle) {
    printStyle = document.createElement('style');
    printStyle.id = 'print-style';
    document.head.appendChild(printStyle);
}

showPageBreaks.addEventListener('change', (e) => {
    if (e.target.checked) docPage.classList.add('page-guides');
    else docPage.classList.remove('page-guides');
});

function applyPageSettings() {
    let width, minHeight, pageSizeName;
    switch(pageSizeSelect.value) {
        case 'A4': width = '210mm'; minHeight = '297mm'; pageSizeName = 'A4'; break;
        case 'A3': width = '297mm'; minHeight = '420mm'; pageSizeName = 'A3'; break;
        case 'Letter': width = '8.5in'; minHeight = '11in'; pageSizeName = 'letter'; break;
        case 'Legal': width = '8.5in'; minHeight = '14in'; pageSizeName = 'legal'; break;
    }
    
    const margin = pageMarginSelect.value;
    
    // Update live DOM visual constraints
    docPage.style.width = width;
    docPage.style.minHeight = minHeight;
    docPage.style.padding = margin;
    
    // Inject physical @page size dynamically for the browser layout
    printStyle.innerHTML = `
        @page { size: ${pageSizeName} portrait; margin: ${margin} !important; }
    `;
}

if (pageSizeSelect && pageMarginSelect) {
    pageSizeSelect.addEventListener('change', applyPageSettings);
    pageMarginSelect.addEventListener('change', applyPageSettings);
    applyPageSettings(); 
}

document.getElementById('download-btn').addEventListener('click', () => {
    window.print();
});
document.getElementById('word-export-btn')?.addEventListener('click', window.exportToWord);
document.getElementById('google-docs-btn')?.addEventListener('click', window.exportToGoogleDocs);

/* =========================================================================
   Header, Footer, and Page Number Management Addons
   ========================================================================= */

window.toggleHeaderFooter = function() {
    document.getElementById('doc-header').classList.remove('hidden');
    document.getElementById('doc-footer').classList.remove('hidden');
};

window.insertTextHeader = function() {
    const header = document.getElementById('doc-header');
    if (!header) return;

    header.classList.remove('hidden');
    if (!header.textContent.trim()) {
        header.innerHTML = '<p><strong>Course Title</strong></p>';
    }
    focusEditableEnd(header);
};

window.insertHeaderTable = function() {
    const header = document.getElementById('doc-header');
    if (!header) return;

    header.classList.remove('hidden');
    header.innerHTML = `
        <table>
            <tr>
                <th>Course / Subject</th>
                <th>Experiment No.</th>
            </tr>
            <tr>
                <td>Experiment Title</td>
                <td></td>
            </tr>
        </table>
    `;
    focusEditableEnd(header);
};

window.insertFooterTemplate = function() {
    const footer = document.getElementById('doc-footer');
    if (!footer) return;

    footer.classList.remove('hidden');
    if (!footer.textContent.trim()) {
        footer.innerHTML = '<span>Instructor Signature</span><span class="page-number-ui" contenteditable="false"></span>';
    }
    focusEditableEnd(footer);
};

window.insertPageNumber = function() {
    const footer = document.getElementById('doc-footer');
    if (!footer) return;
    
    // Inject Chrome Native Print CSS incrementer span
    const pageNumSpan = document.createElement('span');
    footer.classList.remove('hidden');
    pageNumSpan.className = 'page-number-ui text-xs text-gray-400 ml-auto whitespace-nowrap pt-1';
    pageNumSpan.setAttribute('contenteditable', 'false');
    
    // Check if there is already a wrapper or if we need to align right
    if (!footer.innerHTML.includes('page-number-ui')) {
        footer.appendChild(pageNumSpan);
    }
};

document.querySelector('button[onclick="toggleHeaderFooter()"]')?.classList.add('hidden');
