import type { SVGProps } from 'react';

// Placeholder Logo - replace with a proper ZoneWatch logo SVG
export default function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>ZoneWatch Logo</title>
      <path d="M2.707 7.44A2 2 0 0 0 2 8.828v6.344a2 2 0 0 0 .707 1.384l4.586 4.586A2 2 0 0 0 8.686 22h6.628a2 2 0 0 0 1.384-.707l4.586-4.586A2 2 0 0 0 22 15.172V8.828a2 2 0 0 0-.707-1.384l-4.586-4.586A2 2 0 0 0 15.314 2H8.686a2 2 0 0 0-1.384.707L2.707 7.44z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="22" x2="12" y2="15" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="22" y1="12" x2="15" y2="12" />
      <line x1="2" y1="12" x2="9" y2="12" />
    </svg>
  );
}
