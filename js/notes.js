const STORAGE_KEY = "easyMDEContent";

document.addEventListener('DOMContentLoaded', function() {
  // Initialize EasyMDE on the textarea with id "easyMDE"
  const easyMDE = new EasyMDE({
    element: document.getElementById('easyMDE'),
    autoDownloadFontAwesome: true, // Includes icon fonts if needed
    placeholder: "Type your Markdown note here...",
    status: false, // Hide the status bar if not needed
    spellChecker: false,
    theme: "monokai",
    //codeMirrorOptions: {
    //  theme: "monokai"
    //}
    // You can add additional options here
  });

  // Load saved content from localStorage (if available)
  const savedContent = localStorage.getItem(STORAGE_KEY);
  if (savedContent) {
    easyMDE.value(savedContent);
  }

  // Save content on change
  easyMDE.codemirror.on("change", function () {
    localStorage.setItem(STORAGE_KEY, easyMDE.value());
  });
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const notesLog = document.getElementById('notesLog');

  // Load existing notes from localStorage or start with an empty array
  let notes = JSON.parse(localStorage.getItem('notes')) || [];

  function renderNotes() {
    notesLog.innerHTML = ''; // Clear previous content
    notes.forEach(note => {
      const noteEntry = document.createElement('div');
      noteEntry.classList.add('note-entry', 'box');
  
      // Timestamp element
      const dateEl = document.createElement('small');
      dateEl.textContent = new Date(note.timestamp).toLocaleString();
  
      // Container for rendered Markdown
      const contentContainer = document.createElement('div');
      contentContainer.classList.add('markdown-body-dark'); // This applies GitHub Markdown CSS styles
  
      // Use the instance's previewRender function to convert Markdown to HTML
      const renderedMarkdown = easyMDE.options.previewRender(note.content, easyMDE);
      contentContainer.innerHTML = renderedMarkdown;
  
      // Append everything to the note entry
      noteEntry.appendChild(dateEl);
      noteEntry.appendChild(contentContainer);
  
      // Append the note entry to the notes log
      notesLog.appendChild(noteEntry);
    });
  }
   

  // Function to save a new note and update the log
  function saveNote() {
    // Retrieve the Markdown content from EasyMDE
    const content = easyMDE.value().trim();
    if (!content) return; // Do nothing if empty

    const note = {
      content,
      timestamp: Date.now()
    };

    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    easyMDE.value('');  // Clear the editor
    renderNotes();
  }

  // Bind save note to the button click
  saveNoteBtn.addEventListener('click', saveNote);

  // Optionally, allow saving with Ctrl+Enter (or Cmd+Enter on Mac)
  document.getElementById('easyMDE').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      saveNote();
    }
  });
  document.getElementById("clearEditorBtn").addEventListener("click", function () {
    easyMDE.value(""); // Clear editor
    localStorage.removeItem(STORAGE_KEY); // Remove from localStorage
  });
  // Render existing notes on page load
  renderNotes();
});
