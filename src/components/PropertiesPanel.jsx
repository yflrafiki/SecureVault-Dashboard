import React from 'react';
import { ShieldIcon } from './FileIcon';
import { getFileLabel, getFileColorVar } from './FileIcon';
import styles from '../styles/PropertiesPanel.module.css';

function EmptyState() {
  return (
    <div className={styles.empty}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.emptyIcon}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
          stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <p className={styles.emptyText}>Select a file to view properties</p>
    </div>
  );
}

function PropCard({ label, value, accent = false }) {
  return (
    <div className={styles.propCard}>
      <div className={styles.propLabel}>{label}</div>
      <div className={`${styles.propValue} ${accent ? styles.propAccent : ''}`}>
        {value || '—'}
      </div>
    </div>
  );
}

function ActivityRow({ color, label, value }) {
  return (
    <div className={styles.actRow}>
      <span className={styles.actDot} style={{ background: color }} />
      <span className={styles.actLabel}>{label}</span>
      <span className={styles.actValue}>{value}</span>
    </div>
  );
}

export default function PropertiesPanel({ selectedFile }) {
  if (!selectedFile) return <EmptyState />;

  const { node, path } = selectedFile;
  const ext = node.ext || '';
  const typeLabel = getFileLabel(ext);
  const colorVar = getFileColorVar(ext);
  const displayPath = path.join(' / ');

  return (
    <div className={styles.panel}>
      {/* Security badge */}
      <div className={styles.badge}>
        <ShieldIcon style={{ flexShrink: 0 }} />
        <span>Encrypted · SHA-256 Verified</span>
      </div>

      {/* File name */}
      <h2 className={styles.fileName}>{node.name}</h2>
      <p className={styles.filePath}>{displayPath}</p>

      {/* Type indicator */}
      <div className={styles.typeChip} style={{ borderColor: `var(${colorVar})`, color: `var(${colorVar})` }}>
        {typeLabel}
      </div>

      {/* Properties grid */}
      <div className={styles.propsGrid}>
        <PropCard label="File Size" value={node.size} />
        <PropCard label="File Type" value={typeLabel} accent />
        <PropCard label="Modified" value={node.modified} />
        <PropCard label="Created" value={node.created} />
      </div>

      {/* Vault activity */}
      <div className={styles.sectionTitle}>Vault Activity</div>
      <div className={styles.activity}>
        <ActivityRow color="var(--color-accent)"    label="Last accessed"   value="Today, 09:14" />
        <ActivityRow color="var(--color-accent2)"   label="Access count"    value="7 times" />
        <ActivityRow color="#F59E0B"                label="Integrity check" value="Passed" />
        <ActivityRow color="#10B981"                label="Encryption"      value="AES-256-GCM" />
      </div>
    </div>
  );
}
