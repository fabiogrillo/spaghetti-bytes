import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiListUl, BiChevronDown, BiChevronUp, BiX } from 'react-icons/bi';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);

  // Parse headings from HTML content
  useEffect(() => {
    if (!content) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');

    const extractedHeadings = Array.from(headingElements).map((heading, index) => {
      const text = heading.textContent.trim();
      const level = parseInt(heading.tagName.charAt(1));
      const id = `heading-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;

      return { id, text, level };
    });

    setHeadings(extractedHeadings);
  }, [content]);

  // Add IDs to actual headings in the DOM after render
  useEffect(() => {
    if (headings.length === 0) return;

    const articleHeadings = document.querySelectorAll('.prose h1, .prose h2, .prose h3');

    articleHeadings.forEach((heading, index) => {
      if (headings[index]) {
        heading.id = headings[index].id;
      }
    });
  }, [headings]);

  // Track active heading on scroll
  const handleScroll = useCallback(() => {
    if (headings.length === 0) return;

    const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);

    let currentActive = '';
    for (const heading of headingElements) {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 120) {
        currentActive = heading.id;
      }
    }

    setActiveId(currentActive);
  }, [headings]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) return null;

  const getIndent = (level) => {
    switch (level) {
      case 2: return 'pl-3';
      case 3: return 'pl-6';
      default: return '';
    }
  };

  const headingList = (onClickHeading) => (
    <ul className="space-y-1">
      {headings.map((heading) => (
        <li key={heading.id} className={getIndent(heading.level)}>
          <button
            onClick={() => {
              scrollToHeading(heading.id);
              onClickHeading?.();
            }}
            className={`
              block w-full text-left py-2 px-3 rounded-lg text-sm transition-all
              ${activeId === heading.id
                ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                : 'hover:bg-base-200 text-base-content/70 hover:text-base-content'
              }
            `}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile TOC - Collapsible */}
      <div className="lg:hidden mb-8">
        <motion.div
          className="bg-base-100/95 backdrop-blur-sm rounded-soft shadow-soft-lg border border-base-300"
        >
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors rounded-soft"
          >
            <div className="flex items-center gap-2 font-semibold">
              <BiListUl className="text-xl text-primary" />
              <span>Table of Contents</span>
              <span className="badge badge-sm badge-primary">{headings.length}</span>
            </div>
            {isMobileOpen ? (
              <BiChevronUp className="text-xl" />
            ) : (
              <BiChevronDown className="text-xl" />
            )}
          </button>

          <AnimatePresence>
            {isMobileOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  {headingList(() => setIsMobileOpen(false))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop TOC - Toggle Button + Slide-in Panel */}
      <div className="hidden lg:block">
        {/* Toggle button - always visible */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsDesktopOpen(!isDesktopOpen)}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-30 btn btn-circle bg-base-100/95 backdrop-blur-sm border border-base-300 shadow-soft-lg hover:shadow-soft-hover hover:bg-base-200 transition-all"
          aria-label={isDesktopOpen ? 'Close table of contents' : 'Open table of contents'}
        >
          <BiListUl className="text-xl text-primary" />
        </motion.button>

        {/* Panel */}
        <AnimatePresence>
          {isDesktopOpen && (
            <>
              {/* Backdrop - click to close */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-30"
                onClick={() => setIsDesktopOpen(false)}
              />

              {/* Sidebar panel */}
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-72 z-40 bg-base-100/98 backdrop-blur-md border-r border-base-300 shadow-soft-lg overflow-y-auto"
              >
                <div className="p-5 pt-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-base-300">
                    <div className="flex items-center gap-2">
                      <BiListUl className="text-xl text-primary" />
                      <span className="font-semibold">Contents</span>
                      <span className="badge badge-sm badge-primary">{headings.length}</span>
                    </div>
                    <button
                      onClick={() => setIsDesktopOpen(false)}
                      className="btn btn-ghost btn-circle btn-sm"
                      aria-label="Close table of contents"
                    >
                      <BiX className="text-lg" />
                    </button>
                  </div>

                  {/* Headings list */}
                  <nav>
                    {headingList(() => setIsDesktopOpen(false))}
                  </nav>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default TableOfContents;
