import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

const App: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/sample.pdf',
        licenseKey: process.env.REACT_APP_WEBVIEWER_LICENSE_KEY as string,
        preloadWorker: 'contentEdit', // optional but helps for text edit
      },
      viewerRef.current
    ).then((inst) => {
      setInstance(inst);
      const { documentViewer } = inst.Core;
      const { UI } = inst;

      // Enable content editing tools (edit existing PDF text/images)
      UI.enableFeatures([UI.Feature.ContentEdit]);          // enables edit feature [web:35][web:115]
      UI.enableElements(['contentEditButton']);             // show "Edit Content" button [web:119]

      // Optional: switch toolbar to text-edit group so tools are visible
      if (UI.setToolbarGroup) {
        UI.setToolbarGroup('toolbarGroup-EditText');        // predefined edit toolbar [web:129]
      }

      documentViewer.addEventListener('documentLoaded', () => {
        console.log('Document loaded');
      });
    });
  }, []);

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

  return (
    <div className="App">
      <header className="toolbar">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
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
