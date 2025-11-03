import { useRef, useState } from 'react';

const DocumentSelfieVerifier = () => {
  const selfieVideoRef = useRef<any>(null);
  const selfieCanvasRef = useRef<any>(null);

  const [selfie, setSelfie] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState<any>(false);
  const [result, setResult] = useState<any>();
  const [error, setError] = useState<any>(null);

  // Start the camera for selfie
  const startSelfieCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      selfieVideoRef.current.srcObject = stream;
      selfieVideoRef.current.play();
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Cannot access camera');
    }
  };

  // Capture selfie photo
  const takeSelfie = () => {
    const video = selfieVideoRef.current;
    const canvas = selfieCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    // remove prefix for AWS Rekognition: data:image/png;base64,
    const base64Image = dataUrl.split(',')[1];
    setSelfie(base64Image);
  };

  // Handle document upload
  const handleDocumentUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader: any = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result!.split(',')[1];
      setDocument(base64Image);
    };
    reader.readAsDataURL(file);
  };

  // Call the backend API
  const handleVerify = async () => {
    if (!selfie || !document) {
      alert('Please provide both a selfie and a document.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://iynk4bkqx9.execute-api.us-east-1.amazonaws.com/dev/id-v', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selfie,
          dl: document, // assuming backend expects 'dl' for document
        }),
      });

      const data = await response.json();
      console.log(data);
      if (data.statusCode === 200) {
        console.log(data.statusCode);
        setResult(data.body);
      } else {
        console.log(data.body);
        setError(data.body.error);
      }

      // Parse the nested JSON inside "body" if needed
      const parsedBody =
        typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

      setResult({
        similarity: parsedBody.similarity,
        matches_found: parsedBody.matches_found,
      });
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 500, margin: 'auto' }}>
      <h1>Document & Selfie Verification</h1>

      <section style={{ marginBottom: '20px' }}>
        <h3>Step 1: Take a Selfie</h3>
        <video
          ref={selfieVideoRef}
          style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
        />
        <canvas ref={selfieCanvasRef} style={{ display: 'none' }} />
        <div style={{ marginTop: '10px' }}>
          <button onClick={startSelfieCamera}>Start Camera</button>
          <button onClick={takeSelfie} style={{ marginLeft: '10px' }}>
            Capture Selfie
          </button>
        </div>
        {selfie && (
          <div style={{ marginTop: '10px' }}>
            <img
              src={`data:image/png;base64,${selfie}`}
              alt="selfie"
              style={{ width: '200px', borderRadius: '8px' }}
            />
          </div>
        )}
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h3>Step 2: Upload Document</h3>
        <input type="file" accept="image/*" onChange={handleDocumentUpload} />
        {document && (
          <div style={{ marginTop: '10px' }}>
            <img
              src={`data:image/png;base64,${document}`}
              alt="document"
              style={{ width: '200px', borderRadius: '8px' }}
            />
          </div>
        )}
      </section>

      <section>
        <button onClick={handleVerify} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </section>

      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            // background: '#e0ffe0',
          }}
        >
          <h3>Verification Result</h3>
          <p>Similarity: <b>{result.similarity}</b></p>
          <p>Matches Found: <b>{result.matches_found}</b></p>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '8px',
            background: '#ffe0e0',
          }}
        >
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentSelfieVerifier;
