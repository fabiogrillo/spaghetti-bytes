import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiListUl, BiChevronDown, BiChevronUp } from 'react-icons/bi';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

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

  return (
    <>
      {/* Mobile TOC - Collapsible */}
      <div className="lg:hidden mb-8">
        <motion.div
          className="bg-base-100/95 backdrop-blur-sm rounded-soft shadow-soft-lg border border-base-300"
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors rounded-soft"
          >
            <div className="flex items-center gap-2 font-semibold">
              <BiListUl className="text-xl text-primary" />
              <span>Table of Contents</span>
              <span className="badge badge-sm badge-primary">{headings.length}</span>
            </div>
            {isCollapsed ? (
              <BiChevronDown className="text-xl" />
            ) : (
              <BiChevronUp className="text-xl" />
            )}
          </button>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ul className="px-4 pb-4 space-y-1">
                  {headings.map((heading) => (
                    <li key={heading.id} className={getIndent(heading.level)}>
                      <button
                        onClick={() => {
                          scrollToHeading(heading.id);
                          setIsCollapsed(true);
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
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop TOC - Sticky Sidebar */}
      <aside className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 w-64 max-h-[70vh] overflow-y-auto z-30">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-base-100/95 backdrop-blur-sm rounded-soft shadow-soft-lg border border-base-300 p-4"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-base-300">
            <BiListUl className="text-xl text-primary" />
            <span className="font-semibold">Contents</span>
          </div>

          <nav>
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id} className={getIndent(heading.level)}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
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
          </nav>
        </motion.div>
      </aside>
    </>
  );
};

export default TableOfContents;
