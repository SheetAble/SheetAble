import React, { useState } from 'react';
import './SheetMusicEditor.css';

const SheetMusicEditor = ({ initialData, onSave, onClose, composerName }) => {
    const [title, setTitle] = useState(initialData && initialData.title ? initialData.title : '');
const [composer, setComposer] = useState(
  (initialData && initialData.composer ? initialData.composer : composerName) || ''
);


  const handleSave = () => {
    const sheetData = {
      title,
      composer,
      createdAt: new Date().toISOString(),
    };
    onSave(sheetData);
  };

  return (
    <div className="sheet-music-editor">
      <h2>{initialData ? 'Edit Sheet Music' : 'Create Sheet Music'}</h2>
      
      <div className="editor-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter composition title"
          />
        </div>
        
        <div className="form-group">
          <label>Composer</label>
          <input
            type="text"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder="Enter composer name"
          />
        </div>
        
        <div className="editor-preview">
          <p>Sheet music editor will be implemented here.</p>
          <p>Add notes, staff lines, and musical symbols.</p>
        </div>
        
        <div className="editor-actions">
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-save">
            Save Composition
          </button>
        </div>
      </div>
    </div>
  );
};

export default SheetMusicEditor;