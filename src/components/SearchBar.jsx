import React, { useRef } from 'react';
import { SearchIcon, ClearIcon } from './FileIcon';
import styles from '../styles/SearchBar.module.css';

export default function SearchBar({ value, onChange }) {
  const inputRef = useRef(null);

  function handleClear() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div className={styles.wrapper}>
      <SearchIcon style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        placeholder="Search vault..."
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Search files"
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}
