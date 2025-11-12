// import { useRef, useState } from 'react';
// import { S3Uploader } from './s3-servce'; 

// const DocumentSelfieVerifier = () => {
//   const selfieVideoRef = useRef<any>(null);
//   const selfieCanvasRef = useRef<any>(null);

//   const [selfie, setSelfie] = useState<any>(null);
//   const [document, setDocument] = useState<any>(null);
//   const [loading, setLoading] = useState<any>(false);
//   const [result, setResult] = useState<any>();
//   const [error, setError] = useState<any>(null);

//   const s3Uploader = new S3Uploader(
//     'AKIAQ3YIAA6SGYK6FWNQ',
//     'WMA1vBUqtzWz2f5CabTLm3d37hHz7Go3iHMdHi+d',
//     'us-east-1',
//     'idv-ui'
//   );

//   // Start the camera for selfie
//   const startSelfieCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       selfieVideoRef.current.srcObject = stream;
//       selfieVideoRef.current.play();
//     } catch (err) {
//       console.error('Error accessing camera:', err);
//       alert('Cannot access camera');
//     }
//   };

//   // Capture selfie photo
//   const takeSelfie = () => {
//     const video = selfieVideoRef.current;
//     const canvas = selfieCanvasRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const dataUrl = canvas.toDataURL('image/png');
//     // remove prefix for AWS Rekognition: data:image/png;base64,
//     const base64Image = dataUrl.split(',')[1];
//     setSelfie(base64Image);
//   };

//   // Handle document upload
//   const handleDocumentUpload = (e: any) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader: any = new FileReader();
//     reader.onloadend = () => {
//       const base64Image = reader.result!.split(',')[1];
//       setDocument(base64Image);
//     };
//     reader.readAsDataURL(file);
//   };

//   // Call the backend API
//   const handleVerify = async () => {
//     if (!selfie || !document) {
//       alert('Please provide both a selfie and a document.');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const selfieUrl = await s3Uploader.uploadFile('selfie', selfie);
//     const documentUrl = await s3Uploader.uploadFile('document', document);

//     try {
//       const response = await fetch('https://iynk4bkqx9.execute-api.us-east-1.amazonaws.com/dev/id-v', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           selfieKey:  selfieKey
//           dlKey: documentKey, // assuming backend expects 'dl' for document
//         }),
//       });

//       const data = await response.json();
//       console.log(data);
//       if (data.statusCode === 200) {
//         console.log(data.statusCode);
//         setResult(data.body);
//       } else {
//         console.log(data.body);
//         setError(data.body.error);
//       }

//       // Parse the nested JSON inside "body" if needed
//       const parsedBody =
//         typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

//       setResult({
//         similarity: parsedBody.similarity,
//         matches_found: parsedBody.matches_found,
//       });
//     } catch (err) {
//       console.error(err);
//       setError('Verification failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ fontFamily: 'sans-serif', maxWidth: 500, margin: 'auto' }}>
//       <h3>Document & Selfie Verification</h3>

//       <section style={{ marginBottom: '20px' }}>
//         <h2>Step 1: Take a Selfie</h2>
//         <video
//           ref={selfieVideoRef}
//           style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
//         />
//         <canvas ref={selfieCanvasRef} style={{ display: 'none' }} />
//         <div style={{ marginTop: '10px' }}>
//           <button onClick={startSelfieCamera}>Start Camera</button>
//           <button onClick={takeSelfie} style={{ marginLeft: '10px' }}>
//             Capture Selfie
//           </button>
//         </div>
//         {selfie && (
//           <div style={{ marginTop: '10px' }}>
//             <img
//               src={`data:image/png;base64,${selfie}`}
//               alt="selfie"
//               style={{ width: '200px', borderRadius: '8px' }}
//             />
//           </div>
//         )}
//       </section>

//       <section style={{ marginBottom: '20px' }}>
//         <h2>Step 2: Upload Document</h2>
//         <input type="file" accept="image/*" onChange={handleDocumentUpload} />
//         {document && (
//           <div style={{ marginTop: '10px' }}>
//             <img
//               src={`data:image/png;base64,${document}`}
//               alt="document"
//               style={{ width: '200px', borderRadius: '8px' }}
//             />
//           </div>
//         )}
//       </section>

//       <section>
//         <button onClick={handleVerify} disabled={loading}>
//           {loading ? 'Verifying...' : 'Verify'}
//         </button>
//       </section>

//       {result && (
//         <div
//           style={{
//             marginTop: '20px',
//             padding: '10px',
//             borderRadius: '8px',
//             border: '1px solid #ccc',
//             // background: '#e0ffe0',
//           }}
//         >
//           <h3>Verification Result</h3>
//           <p>Similarity: <b>{result.similarity}</b></p>
//           <p>Matches Found: <b>{result.matches_found}</b></p>
//         </div>
//       )}

//       {error && (
//         <div
//           style={{
//             marginTop: '20px',
//             padding: '10px',
//             borderRadius: '8px',
//             background: '#ffe0e0',
//           }}
//         >
//           <h3>❌ Error</h3>
//           <p>{error}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentSelfieVerifier;


import { useRef, useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Utility for unique filenames
const generateUniqueName = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;

const DocumentSelfieVerifier = () => {
  const selfieVideoRef = useRef<HTMLVideoElement>(null);
  const selfieCanvasRef = useRef<HTMLCanvasElement>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentData, setDocumentData] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const s3 = new S3Client({
        region: 'us-east-1',
        credentials: {
          accessKeyId: '',
          secretAccessKey: ''
        }
      });
  const uploadFile = async(folderName: string, file: File) => {
    const arrayBuffer = await file.arrayBuffer();

    const params = {
      Bucket: 'id-verification-v2',
      Key: `${folderName}/${file.name}`,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
      ContentLength: file.size,
    };
    try {
      const command = new PutObjectCommand(params);
      const response = await s3.send(command);
      console.log('File uploaded', response);
      return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    } catch (error) {
      console.error('Error Uploading file', error);
      throw error;
    }
  }
  // Start the camera
  const startSelfieCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (selfieVideoRef.current) {
        selfieVideoRef.current.srcObject = stream;
        await selfieVideoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Cannot access camera');
    }
  };

  // Capture selfie photo
  const takeSelfie = () => {
    if (!selfieVideoRef.current || !selfieCanvasRef.current) return;

    const video = selfieVideoRef.current;
    const canvas = selfieCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to JPEG blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const uniqueName = generateUniqueName('selfie');
          const file = new File([blob], uniqueName, { type: 'image/jpeg' });
          setSelfieFile(file);

          // Convert to base64 for display and API
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Image = (reader.result as string).split(',')[1];
            setSelfieData(base64Image);
          };
          reader.readAsDataURL(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uniqueName = generateUniqueName('document');
    const renamedFile = new File([file], uniqueName, { type: file.type });
    setDocumentFile(renamedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = (reader.result as string).split(',')[1];
      setDocumentData(base64Image);
    };
    reader.readAsDataURL(file);
  };

  // Verify through API
  const handleVerify = async () => {
    if (!selfieFile || !documentFile) {
      alert('Please provide both a selfie and a document.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await uploadFile('selfie', selfieFile);
      await uploadFile('docs', documentFile);

      const response = await fetch('https://iynk4bkqx9.execute-api.us-east-1.amazonaws.com/dev/id-v', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "selfie_bucket": "id-verification-v2",
          "selfie_key": `selfie/${selfieFile.name}`,
          "dl_bucket": "id-verification-v2",
          "dl_key": `docs/${documentFile.name}`
        }),
      });

      const data = await response.json();
      const parsedBody =
        typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

      if (data.statusCode === 200) {
        setResult({
          similarity: parsedBody.similarity,
          matches_found: parsedBody.matches_found,
        });
      } else {
        setError(parsedBody.error || 'Verification failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 500, margin: 'auto' }}>
      <h3>Document & Selfie Verification</h3>

      {/* Step 1: Selfie */}
      <section style={{ marginBottom: 20 }}>
        <h2>Step 1: Take a Selfie</h2>
        <video
          ref={selfieVideoRef}
          style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}
        />
        <canvas ref={selfieCanvasRef} style={{ display: 'none' }} />
        <div style={{ marginTop: 10 }}>
          <button onClick={startSelfieCamera}>Start Camera</button>
          <button onClick={takeSelfie} style={{ marginLeft: 10 }}>
            Capture Selfie
          </button>
        </div>
        {selfieData && (
          <div style={{ marginTop: 10 }}>
            <img
              src={`data:image/jpeg;base64,${selfieData}`}
              alt="selfie"
              style={{ width: 200, borderRadius: 8 }}
            />
            <p>📸 Saved as: <b>{selfieFile?.name}</b></p>
          </div>
        )}
      </section>

      {/* Step 2: Document */}
      <section style={{ marginBottom: 20 }}>
        <h2>Step 2: Upload Document</h2>
        <input type="file" accept="image/*" onChange={handleDocumentUpload} />
        {documentData && (
          <div style={{ marginTop: 10 }}>
            <img
              src={`data:image/jpeg;base64,${documentData}`}
              alt="document"
              style={{ width: 200, borderRadius: 8 }}
            />
            <p>📄 Saved as: <b>{documentFile?.name}</b></p>
          </div>
        )}
      </section>

      <section>
        <button onClick={handleVerify} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </section>

      {/* Results */}
      {result && (
        <div style={{ marginTop: 20, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
          <h3>✅ Verification Result</h3>
          <p>Similarity: <b>{result.similarity}</b></p>
          <p>Matches Found: <b>{result.matches_found}</b></p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20, padding: 10, borderRadius: 8, background: '#ffe0e0' }}>
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentSelfieVerifier;
