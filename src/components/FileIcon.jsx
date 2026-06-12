import React from 'react';

/**
 * Maps file extensions to icon names and colour classes.
 */
const EXT_MAP = {
  pdf:  { label: 'PDF',      colorVar: '--color-pdf' },
  doc:  { label: 'DOC',      colorVar: '--color-doc' },
  docx: { label: 'DOCX',     colorVar: '--color-doc' },
  jpg:  { label: 'JPG',      colorVar: '--color-img' },
  jpeg: { label: 'JPEG',     colorVar: '--color-img' },
  png:  { label: 'PNG',      colorVar: '--color-img' },
  gif:  { label: 'GIF',      colorVar: '--color-img' },
  csv:  { label: 'CSV',      colorVar: '--color-csv' },
  xls:  { label: 'XLS',      colorVar: '--color-csv' },
  xlsx: { label: 'XLSX',     colorVar: '--color-csv' },
};

export function getFileColorVar(ext) {
  return EXT_MAP[(ext || '').toLowerCase()]?.colorVar || '--color-file-default';
}

export function getFileLabel(ext) {
  return EXT_MAP[(ext || '').toLowerCase()]?.label || (ext ? ext.toUpperCase() : 'FILE');
}

/**
  SVG icon components
 */
export function FolderIcon({ open = false, style = {} }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, ...style }}
    >
      {open ? (
        <>
          <path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v1H2V6z" fill="var(--color-folder)" />
          <path d="M2 9h20l-1.5 9a2 2 0 01-2 1.5H5.5a2 2 0 01-2-1.5L2 9z" fill="var(--color-folder)" opacity="0.8" />
        </>
      ) : (
        <path
          d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2H4z"
          fill="var(--color-folder)"
        />
      )}
    </svg>
  );
}

export function FileIcon({ ext = '', style = {} }) {
  const colorVar = getFileColorVar(ext);
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, ...style }}
    >
      <path
        d="M2 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5l-5-5H2z"
        fill={`var(${colorVar})`}
        opacity="0.25"
      />
      <path d="M9 0l5 5H9V0z" fill={`var(${colorVar})`} opacity="0.6" />
      <rect x="2" y="8" width="10" height="1.5" rx="0.75" fill={`var(${colorVar})`} />
      <rect x="2" y="11" width="7" height="1.5" rx="0.75" fill={`var(${colorVar})`} />
    </svg>
  );
}

export function ChevronIcon({ open = false, style = {} }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transition: 'transform 0.15s ease',
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        ...style,
      }}
    >
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ style = {} }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="var(--color-accent)" opacity="0.2" />
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" stroke="var(--color-accent)" strokeWidth="1.5" />
      <path d="M9 12l2 2 4-4" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ style = {} }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ClearIcon({ style = {} }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
