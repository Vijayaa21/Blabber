const XSvg = (props) => (
	<svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Blabber logo">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7B2FF7"/>  
      <stop offset="100%" stop-color="#2C3E50"/> 
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="48" fill="url(#grad)" />

  <path
    fill="white"
    d="M35 70 L35 30 Q35 20 50 20 Q65 20 65 40 Q65 55 50 55 Q65 55 65 70 Q65 80 50 80 Q35 80 35 70 Z
       M50 30 Q42 30 42 40 Q42 50 50 50 Q58 50 58 40 Q58 30 50 30 Z"
  />
</svg>

);
export default XSvg;