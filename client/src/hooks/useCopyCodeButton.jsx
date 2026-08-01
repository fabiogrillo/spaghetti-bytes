import { useEffect } from 'react';

const useCopyCodeButton = (containerRef, content) => {
  useEffect(() => {
    if (!containerRef?.current) return;

    const container = containerRef.current;
    const codeBlocks = container.querySelectorAll('pre');

    codeBlocks.forEach((pre) => {
      // Skip if button already exists
      if (pre.querySelector('.copy-code-btn')) return;

      // Make pre position relative for absolute button positioning
      pre.style.position = 'relative';

      // Create copy button
      const button = document.createElement('button');
      button.className = 'copy-code-btn';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `;

      // Add click handler
      button.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.textContent || pre.textContent;

        try {
          await navigator.clipboard.writeText(code);

          // Show success state
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `;
          button.classList.add('copied');

          // Reset after 2 seconds
          setTimeout(() => {
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            `;
            button.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code:', err);
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>Failed</span>
          `;
        }
      });

      pre.appendChild(button);
    });

    // Cleanup function
    return () => {
      const buttons = container.querySelectorAll('.copy-code-btn');
      buttons.forEach((btn) => btn.remove());
    };
  }, [containerRef, content]);
};

export default useCopyCodeButton;
