import { useRef, useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
    credentials: { accessKeyId: process.env.AccessKeyID, secretAccessKey: process.env.SecretAccessKey },
  });

  const uploadFile = async (folderName: string, file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const params = {
      Bucket: 'id-verification-v3',
      Key: `${folderName}/${file.name}`,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
      ContentLength: file.size,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
  };

  const startSelfieCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (selfieVideoRef.current) {
        selfieVideoRef.current.srcObject = stream;
        await selfieVideoRef.current.play();
      }
    } catch (err) {
      alert('Cannot access camera');
      console.error(err);
    }
  };

  const takeSelfie = () => {
    if (!selfieVideoRef.current || !selfieCanvasRef.current) return;
    const video = selfieVideoRef.current;
    const canvas = selfieCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const uniqueName = generateUniqueName('selfie');
        const file = new File([blob], uniqueName, { type: 'image/jpeg' });
        setSelfieFile(file);

        const reader = new FileReader();
        reader.onloadend = () => setSelfieData((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uniqueName = generateUniqueName('document');
    const renamedFile = new File([file], uniqueName, { type: file.type });
    setDocumentFile(renamedFile);

    const reader = new FileReader();
    reader.onloadend = () => setDocumentData((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!selfieFile || !documentFile) return alert('Please provide both a selfie and a document.');

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await uploadFile('selfie', selfieFile);
      await uploadFile('docs', documentFile);

      const res = await fetch('https://qlju1ki45e.execute-api.us-east-1.amazonaws.com/dev-id/id-v', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfie_bucket: 'id-verification-v3',
          selfie_key: `selfie/${selfieFile.name}`,
          dl_bucket: 'id-verification-v3',
          dl_key: `docs/${documentFile.name}`,
        }),
      });

      const data = await res.json();
      const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

      if (data.statusCode === 200) setResult(parsedBody);
      else setError(parsedBody.error || 'Verification failed.');
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; background: #000; }
        .container { max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.1); }
        h2 { color: #000; margin-bottom: 15px; }
        video { width: 100%; border-radius: 12px; border: 1px solid #ddd; }
        input[type="file"] { padding: 8px; border-radius: 6px; border: 1px solid #ccc; cursor: pointer; }
        button { padding: 10px 18px; margin-right: 10px; border: none; border-radius: 8px; background: #2563eb; color: white; font-weight: bold; cursor: pointer; transition: all 0.2s ease-in-out; }
        button:hover { background: #1e40af; }
        .preview { margin-top: 15px; display: flex; flex-direction: column; align-items: center; }
        .preview img { width: 220px; border-radius: 12px; border: 1px solid #ddd; margin-bottom: 5px; }
        .result, .error { margin-top: 25px; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .result { background: #ecfdf5; border: 1px solid #10b981; color: #065f46; }
        .error { background: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; }
      `}</style>

      <div className="container">
        <h1>Document & Selfie Verification</h1>

        {/* Selfie */}
        <section>
          <h2>Step 1: Take a Selfie</h2>
          <video ref={selfieVideoRef} />
          <canvas ref={selfieCanvasRef} style={{ display: 'none' }} />
          <div style={{ marginTop: 12 }}>
            <button onClick={startSelfieCamera}>Start Camera</button>
            <button onClick={takeSelfie}>Capture Selfie</button>
          </div>
          {selfieData && (
            <div className="preview">
              <img src={`data:image/jpeg;base64,${selfieData}`} alt="selfie" />
              <span>📸 {selfieFile?.name}</span>
            </div>
          )}
        </section>

        {/* Document */}
        <section style={{ marginTop: 30 }}>
          <h2>Step 2: Upload Document</h2>
          <input type="file" accept="image/*" onChange={handleDocumentUpload} />
          {documentData && (
            <div className="preview">
              <img src={`data:image/jpeg;base64,${documentData}`} alt="document" />
              <span>📄 {documentFile?.name}</span>
            </div>
          )}
        </section>

        {/* Verify Button */}
        <section style={{ marginTop: 25 }}>
          <button onClick={handleVerify} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </section>

        {/* Result / Error */}
        {result && (
          <div className="result">
            <h3>✅ Verification Result</h3>
            <p>Similarity: <b>{result.similarity}</b></p>
            <p>Matches Found: <b>{result.matches_found}</b></p>
          </div>
        )}
        {error && (
          <div className="error">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentSelfieVerifier;
