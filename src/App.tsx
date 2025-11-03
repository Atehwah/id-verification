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

import DocumentSelfieVerifier from './selfie-capture';

const App = () => {
  return (
    <div>
      <h1>Document Verification</h1>
      <DocumentSelfieVerifier />
    </div>
  );
};

export default App;
