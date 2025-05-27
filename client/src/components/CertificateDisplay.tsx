import React from 'react';

interface CertificateDisplayProps {
  platformName: string;
  certificateTitle?: string;
  studentName: string;
  courseName: string;
  instructorName?: string;
  completionDate: string; // Formatted date string
  certificateId?: string;
  platformLogoUrl?: string;
  signatureImageUrl?: string;
  issuingAuthorityName?: string;
  issuingAuthorityTitle?: string;
}

const CertificateDisplay: React.FC<CertificateDisplayProps> = ({
  platformName,
  certificateTitle = "Certificate of Completion", // Default title
  studentName,
  courseName,
  instructorName,
  completionDate,
  certificateId,
  platformLogoUrl,
  signatureImageUrl,
  issuingAuthorityName,
  issuingAuthorityTitle,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto border-2 border-gray-700 p-8 shadow-lg bg-white font-serif my-8 print:shadow-none print:border-none print:my-0">
      {/* Header: Platform Logo and Name */}
      <header className="text-center mb-10">
        {platformLogoUrl && (
          <img 
            src={platformLogoUrl} 
            alt={`${platformName} Logo`} 
            className="h-16 mx-auto mb-3 object-contain" 
          />
        )}
        <h1 className="text-3xl font-bold text-gray-800 tracking-wider">{platformName.toUpperCase()}</h1>
      </header>

      {/* Main Content */}
      <main className="text-center space-y-5">
        <h2 className="text-4xl font-semibold text-blue-700">{certificateTitle}</h2>
        <p className="text-lg text-gray-700">This certificate is proudly presented to</p>
        <h3 className="text-5xl font-bold text-gray-900 my-6 tracking-tight">{studentName}</h3>
        <p className="text-lg text-gray-700">for the successful completion of the online course:</p>
        <h4 className="text-3xl font-semibold text-gray-800">{courseName}</h4>
        {instructorName && (
          <p className="text-md text-gray-600 mt-3">
            Taught by: <span className="font-medium">{instructorName}</span>
          </p>
        )}
      </main>

      {/* Footer: Date, ID, Signatures */}
      <footer className="mt-16 grid grid-cols-2 items-end gap-8">
        <div className="text-left">
          <p className="text-md text-gray-700">
            Date of Completion: <span className="font-semibold">{completionDate}</span>
          </p>
          {certificateId && (
            <p className="text-sm text-gray-500 mt-1">
              Certificate ID: {certificateId}
            </p>
          )}
        </div>
        <div className="text-right">
          {signatureImageUrl && (
            <img 
              src={signatureImageUrl} 
              alt="Signature" 
              className="h-16 ml-auto mb-1 object-contain" 
            />
          )}
          {(issuingAuthorityName || issuingAuthorityTitle) && (
             <div className="border-t-2 border-gray-600 pt-2 mt-2 inline-block min-w-[200px]">
                {issuingAuthorityName && (
                <p className="text-md font-semibold text-gray-800">{issuingAuthorityName}</p>
                )}
                {issuingAuthorityTitle && (
                <p className="text-sm text-gray-600">{issuingAuthorityTitle}</p>
                )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default CertificateDisplay;
