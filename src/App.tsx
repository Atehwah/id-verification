// import React from 'react';
// import SelfieCapture from './selfie-capture';

// const App = () => {
//   const handleCapture = (base64Image: string) => {
//     console.log('Captured Base64:', base64Image);
//   };

//   return (
//     <div>
//       <h1>Take a Selfie</h1>
//       <SelfieCapture onCapture={handleCapture} />
//     </div>
//   );
// };

// export default App;


import React from 'react';
import DocumentSelfieVerifier from './selfie-capture';

const App = () => {
  // const handleVerify = ({ selfie, document }) => {
  //   console.log('Selfie Base64:', selfie);
  //   console.log('Document Base64:', document);

  //   // Send to your backend API for verification
  //   // e.g., fetch('/api/verify', { method: 'POST', body: JSON.stringify({ selfie, document }) })
  // };

  return (
    <div>
      <h1>Document Verification</h1>
      <DocumentSelfieVerifier />
    </div>
  );
};

export default App;
