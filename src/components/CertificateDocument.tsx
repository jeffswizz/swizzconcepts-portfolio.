import { CredentialItem } from '../types/portfolio.ts';

interface CertificateDocumentProps {
  credential: CredentialItem;
  recipientName: string;
  brandName: string;
}

export function CertificateDocument({
  credential,
  recipientName,
  brandName,
}: CertificateDocumentProps) {
  if (credential.certificateImageUrl) {
    return (
      <img
        src={credential.certificateImageUrl}
        alt={`${credential.organization} Certificate for ${recipientName}`}
        referrerPolicy="no-referrer"
        className="w-full h-auto rounded-lg border border-[#E8DFD0] object-contain max-h-[520px] bg-white"
      />
    );
  }

  return (
    <div className="bg-[#FFFDF9] border border-[#C5A46D]/60 rounded-xl p-6 sm:p-10 text-[#242424] relative overflow-hidden">
      {/* Inner architectural border */}
      <div className="border border-[#E8DFD0] rounded-lg p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DFD0] pb-4">
          <div>
            <p className="font-mono text-xs text-[#A85D2E] font-semibold">
              {credential.organization}
            </p>
            <p className="text-xs text-[#242424]/65 mt-0.5">{credential.period}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-[#242424]/65">Credential ID</p>
            <p className="font-mono text-xs font-semibold text-[#242424] tabular-nums">
              {credential.certificateId}
            </p>
          </div>
        </div>

        <div className="py-7 text-center">
          <p className="text-xs font-medium text-[#C5A46D] tracking-wide">
            Certificate of Completion
          </p>
          <h4 className="font-display text-xl sm:text-2xl font-bold text-[#242424] mt-2">
            {credential.certificateTitle}
          </h4>
          <p className="text-sm text-[#242424]/70 mt-4">Awarded to</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#242424] mt-1">
            {recipientName}
          </p>
          <p className="text-xs text-[#A85D2E] font-medium mt-1">{brandName}</p>
          <p className="text-xs sm:text-sm text-[#242424]/75 mt-5 max-w-lg mx-auto leading-relaxed">
            {credential.summary}
          </p>
        </div>

        <div className="pt-4 border-t border-[#E8DFD0] flex flex-wrap items-center justify-between gap-4 text-xs text-[#242424]/70">
          <span>Issued: {credential.issuedDate}</span>
          <span className="font-mono text-[#A85D2E]">
            {credential.highlights.slice(0, 4).join(' · ')}
          </span>
        </div>
      </div>
    </div>
  );
}

export async function downloadCredentialCertificate(
  credential: CredentialItem,
  recipientName: string,
  brandName: string
): Promise<void> {
  if (credential.certificateImageUrl) {
    const link = document.createElement('a');
    link.href = credential.certificateImageUrl;
    link.download = `${credential.organization.toLowerCase().replace(/\s+/g, '-')}-certificate`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Render crisp high-res PNG certificate dynamically via Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 980;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Warm Ivory canvas background
  ctx.fillStyle = '#F8F5ED';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Deep Charcoal border
  ctx.strokeStyle = '#242424';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  // Inner Muted Gold hairline border
  ctx.strokeStyle = '#C5A46D';
  ctx.lineWidth = 2;
  ctx.strokeRect(62, 62, canvas.width - 124, canvas.height - 124);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#C47745';
  ctx.font = '600 22px sans-serif';
  ctx.fillText(credential.organization.toUpperCase(), canvas.width / 2, 160);

  ctx.fillStyle = '#242424';
  ctx.font = '700 46px sans-serif';
  ctx.fillText(credential.certificateTitle, canvas.width / 2, 240);

  ctx.fillStyle = '#6B655B';
  ctx.font = '400 24px sans-serif';
  ctx.fillText('Awarded to', canvas.width / 2, 340);

  ctx.fillStyle = '#242424';
  ctx.font = '700 54px sans-serif';
  ctx.fillText(recipientName, canvas.width / 2, 420);

  ctx.fillStyle = '#A85D2E';
  ctx.font = '600 22px sans-serif';
  ctx.fillText(`${brandName} · ${credential.roleTitle}`, canvas.width / 2, 475);

  // Wrap summary text cleanly
  ctx.fillStyle = '#3B3936';
  ctx.font = '400 23px sans-serif';
  const words = credential.summary.split(' ');
  let line = '';
  let y = 560;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > 980) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word;
      y += 38;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, canvas.width / 2, y);
  }

  // Footer metadata
  ctx.textAlign = 'left';
  ctx.fillStyle = '#57534E';
  ctx.font = '500 20px monospace';
  ctx.fillText(`Credential ID: ${credential.certificateId}`, 110, 845);

  ctx.textAlign = 'right';
  ctx.fillText(credential.issuedDate, canvas.width - 110, 845);

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${credential.organization.toLowerCase().replace(/\s+/g, '-')}-certificate-${recipientName
    .toLowerCase()
    .replace(/\s+/g, '-')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
