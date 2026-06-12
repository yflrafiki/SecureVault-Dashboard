import React, { useState, useCallback } from 'react';
import FileTree from './components/FileTree';
import PropertiesPanel from './components/PropertiesPanel';
import SearchBar from './components/SearchBar';
import Breadcrumb from './components/Breadcrumb';
import { ShieldIcon } from './components/FileIcon';
import vaultData from './data/data.json';
import './styles/global.css';
import styles from './styles/App.module.css';

export default function App() {
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusIndex, setFocusIndex] = useState(0);

  // Toggle expand/collapse. If forceState is provided, it overrides toggle.
  const handleToggle = useCallback((key, forceState) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (forceState === true) {
        next.add(key);
      } else if (forceState === false) {
        next.delete(key);
      } else {
        next.has(key) ? next.delete(key) : next.add(key);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback((node, path) => {
    setSelectedFile({ node, path });
  }, []);

  const handleSearchChange = useCallback(query => {
    setSearchQuery(query);
    setFocusIndex(0);
  }, []);

  // Count total files (not folders)
  function countFiles(node) {
    if (node.type === 'file') return 1;
    return (node.children || []).reduce((acc, c) => acc + countFiles(c), 0);
  }
  const totalFiles = countFiles(vaultData);

  return (
    <div className={styles.app}>
      {/* ── Header ─────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <ShieldIcon style={{ width: 18, height: 18 }} />
          <span className={styles.logoText}>SecureVault</span>
        </div>
        <span className={styles.headerSub}>enterprise-storage / client-files</span>
        <div className={styles.headerRight}>
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>
      </header>

      {/* ── Main layout ────────────────────────────────── */}
      <main className={styles.main}>
        {/* Left panel — file explorer */}
        <aside className={styles.explorer}>
          <div className={styles.paneHeader}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Vault Explorer
          </div>

          {/* Wildcard feature: breadcrumb path trail */}
          <Breadcrumb path={selectedFile?.path || []} />

          <FileTree
            rootData={vaultData}
            expandedKeys={expandedKeys}
            selectedFile={selectedFile}
            searchQuery={searchQuery}
            focusIndex={focusIndex}
            setFocusIndex={setFocusIndex}
            onToggle={handleToggle}
            onSelect={handleSelect}
          />
        </aside>

        {/* Right panel — properties */}
        <section className={styles.properties} aria-label="File properties">
          <div className={styles.paneHeader}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Properties
          </div>
          <div className={styles.propertiesInner}>
            <PropertiesPanel selectedFile={selectedFile} />
          </div>
        </section>
      </main>

      {/* ── Status bar ─────────────────────────────────── */}
      <footer className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.statusDot} />
          Encrypted
        </div>
        <div className={styles.statusItem}>
          {totalFiles} files secured
        </div>
        <div className={styles.statusItemRight}>
          <kbd>↑↓</kbd> navigate &nbsp;
          <kbd>→←</kbd> expand &nbsp;
          <kbd>Enter</kbd> select
        </div>
      </footer>
    </div>
  );
}
