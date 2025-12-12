import { Check, Copy, CheckCircle } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import MyIcon from "../assets/UploadIcon.svg";
import axios from 'axios';

export default function UploadPage() {
  const [downloadLink, setDownloadLink] = useState('');
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      setDownloadLink(res.data.shareLink);
    } catch (error) {
      console.error("Error uploading", error);
      alert('Error al subir el archivo');
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Resetear el icono a los 2 seg
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  return (
    <main className="bg-linear-to-t from-green-1 to-green-2 text-gray-200 h-screen w-full flex items-center justify-center">

      <section className=''>
        {!downloadLink ? (
          // VISTA 1: FORMULARIO DE SUBIDA
          <div {...getRootProps()}
            className="bg-green-3 rounded-full h-96 w-96 flex 
            items-center justify-center border-dashed border-green-3"
          >
            <article className='flex flex-col items-center'>
              <input {...getInputProps()} />
              <figure className=''>
                <img src={MyIcon} width={55} />
              </figure>
              <h2 className='font-imb-600'>Upload files</h2>
              <p className="main-text">Drag and drop or click to upload</p>
              <p className="sub-text">Accepts files between 1.00KB and 10.00MB.</p>
            </article>
          </div>
        ) : (
          // VISTA 2: LINK GENERADO (Diseño mejorado)
          <div className="upload-card">
            <div style={{ marginBottom: '20px' }}>
              <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto' }} />
            </div>

            <h2 style={{ marginBottom: '5px' }}>¡Archivo listo!</h2>
            <p className="sub-text" style={{ marginBottom: '25px' }}>Comparte este enlace para descargar</p>

            {/* Input con el link y botón de copiar pegado */}
            <div>
              <input
                type="text"
                value={downloadLink}
                readOnly
              />
              <button
                onClick={copyToClipboard}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <button onClick={() => setDownloadLink('')}          >
              Subir otro archivo
            </button>
          </div>
        )}
      </section>


    </main>
  );
}