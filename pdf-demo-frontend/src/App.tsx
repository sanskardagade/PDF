import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import { set, get } from 'idb-keyval';
import './App.css';

const DRAFT_KEY = 'ship-pdf-draft';

const App: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<any>(null);

  useEffect(() => {
    if (!viewerRef.current || instance) return;

    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey: 'demo:1765869143406:60cf5dea0300000000ab93f17aeae30f394a365a17ee06e0ed201972b4',
        preloadWorker: 'contentEdit',
      },
      viewerRef.current
    ).then((inst) => {
      setInstance(inst);
      const { documentViewer } = inst.Core;
      const { UI } = inst;

      UI.enableFeatures([UI.Feature.ContentEdit]);
      UI.enableElements(['contentEditButton']);
      if (UI.setToolbarGroup) {
        UI.setToolbarGroup('toolbarGroup-EditText');
      }

      documentViewer.addEventListener('documentLoaded', () => {
        console.log('Document loaded');
      });
    });
  }, [instance]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!instance || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const { loadDocument } = instance.UI;
    loadDocument(file);
  };

  const handleDownload = async () => {
    if (!instance) return;
    const { documentViewer, annotationManager } = instance.Core;
    const doc = documentViewer.getDocument();
    const xfdfString = await annotationManager.exportAnnotations();
    const data = await doc.getFileData({ xfdfString });
    const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'edited.pdf';
    a.click();
  };

  // const saveDraft = async () => {
  //   if (!instance) return;
  //   const { documentViewer, annotationManager } = instance.Core;
  //   const doc = documentViewer.getDocument();
  //   const xfdfString = await annotationManager.exportAnnotations();
  //   const data = await doc.getFileData({ xfdfString });
  //   const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });

  //   await set(DRAFT_KEY, blob);
  //   alert('Draft saved offline');
  // };

  const saveDraft = async () => {
  if (!instance) return;

  const { documentViewer, annotationManager } = instance.Core;

  // Make sure a document is actually loaded
  const doc = documentViewer.getDocument();
  if (!doc) {
    alert('No document loaded to save');
    return;
  }

  const xfdfString = await annotationManager.exportAnnotations();
  const data = await doc.getFileData({ xfdfString });
  const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });

  console.log('Draft size (bytes):', blob.size);
  await set(DRAFT_KEY, blob);
  alert('Draft saved offline');
};


  const loadDraft = async () => {
    if (!instance) return;
    const blob = await get(DRAFT_KEY);
    if (!blob) {
      alert('No draft found');
      return;
    }
    const { UI } = instance;
    UI.loadDocument(blob, { filename: 'draft.pdf' });
  };

  return (
    <div className="App">
      <header className="toolbar">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={saveDraft}>Save Draft (Offline)</button>
        <button onClick={loadDraft}>Load Draft</button>
        <button onClick={handleDownload}>Download Edited PDF</button>
      </header>
      <div className="webviewer" ref={viewerRef} style={{ height: '90vh' }} />
    </div>
  );
};

export default App;


// import React, { useEffect, useRef, useState } from 'react';
// import WebViewer from '@pdftron/webviewer';
// import './App.css';

// const App: React.FC = () => {
//   const viewerRef = useRef<HTMLDivElement | null>(null);
//   const [instance, setInstance] = useState<any>(null);

//   useEffect(() => {
//     if (!viewerRef.current) return;

//     WebViewer(
//       {
//         path: '/webviewer/lib',
//         initialDoc: '/sample.pdf',
//         licenseKey: 'YOUR_APRYSE_LICENSE_KEY'
//       },
//       viewerRef.current
//     ).then((inst) => {
//       setInstance(inst);
//       const { documentViewer } = inst.Core;

//       documentViewer.addEventListener('documentLoaded', () => {
//         console.log('Document loaded');
//       });
//     });
//   }, []);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!instance || !e.target.files || e.target.files.length === 0) return;
//     const file = e.target.files[0];
//     const { loadDocument } = instance.UI;
//     loadDocument(file);
//   };

//   const handleDownload = async () => {
//     if (!instance) return;
//     const { documentViewer, annotationManager } = instance.Core;
//     const doc = documentViewer.getDocument();
//     const xfdfString = await annotationManager.exportAnnotations();
//     const data = await doc.getFileData({ xfdfString });
//     const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });

//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(blob);
//     a.download = 'edited.pdf';
//     a.click();
//   };

//   return (
//     <div className="App">
//       <header className="toolbar">
//         <input type="file" accept="application/pdf" onChange={handleFileChange} />
//         <button onClick={handleDownload}>Download Edited PDF</button>
//       </header>
//       <div className="webviewer" ref={viewerRef} style={{ height: '90vh' }} />
//     </div>
//   );
// };

// export default App;
