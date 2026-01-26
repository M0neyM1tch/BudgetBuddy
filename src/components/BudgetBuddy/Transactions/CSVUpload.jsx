import React from 'react';
import Papa from 'papaparse';

function CSVUpload({ onDataParsed, selectedBank }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log('📄 File selected:', file.name);
    console.log('🏦 Selected bank:', selectedBank);

    Papa.parse(file, {
      complete: (result) => {
        console.log('✅ CSV parsed successfully');
        if (result.data && result.data.length > 0) {
          console.log('📋 Values in first row:');
          result.data[0].forEach((value, index) => {
            console.log(` ${index + 1}. "${value}"`);
          });
        }
        if (onDataParsed && typeof onDataParsed === 'function') {
          onDataParsed(result.data);
        } else {
          console.error('❌ onDataParsed is not a function!');
        }
      },
      error: (error) => {
        console.error('❌ CSV parsing error:', error);
      },
      skipEmptyLines: true,
    });
  };

  return (
    <div className="csv-upload">
      <input type="file" accept=".csv" onChange={handleFileChange} className="csv-input" />
      <p className="upload-hint">
        💡 Download your statement as CSV from your bank's website, select your bank above,
        then upload the file.
      </p>
    </div>
  );
}

export default CSVUpload;
