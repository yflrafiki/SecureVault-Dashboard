import React, { useRef } from 'react';
import { nodeMatchesSearch } from '../hooks/useFileTree';
import { FolderIcon, FileIcon, ChevronIcon } from './FileIcon';
import styles from '../styles/FileTree.module.css';

// Highlights the matching part of a name during search
function HighlightMatch({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.highlight}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// Draws one single row — folder or file
function Row({ node, path, depth, expanded, isSelected, isFocused, searchQuery, onToggle, onSelect, onFocusRow, rowIndex }) {
  const isFolder = node.type === 'folder';
  const key = path.join('/');

  return (
    <div
      className={[styles.row, isFocused && styles.focused, isSelected && styles.selected].filter(Boolean).join(' ')}
      style={{ paddingLeft: `${depth * 18 + 10}px` }}
      role="treeitem"
      aria-expanded={isFolder ? expanded : undefined}
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
      onClick={e => { e.stopPropagation(); onFocusRow(rowIndex); isFolder ? onToggle(key) : onSelect(node, path); }}
    >
      <span className={styles.chevronWrap}>{isFolder && <ChevronIcon open={expanded} />}</span>
      <span className={styles.iconWrap}>{isFolder ? <FolderIcon open={expanded} /> : <FileIcon ext={node.ext || ''} />}</span>
      <span className={styles.name}><HighlightMatch text={node.name} query={searchQuery} /></span>
      {!isFolder && node.size && <span className={styles.sizeBadge}>{node.size}</span>}
    </div>
  );
}

// Draws one row, then calls itself on the children if the folder is open
function RenderTree({ node, parentPath, depth, expandedKeys, selectedFile, searchQuery, focusIndex, flatListRef, onToggle, onSelect, onFocusRow }) {
  if (!nodeMatchesSearch(node, searchQuery)) return null;

  const isFolder = node.type === 'folder';
  const path = [...parentPath, node.name];
  const key = path.join('/');
  const isOpen = expandedKeys.has(key) || (searchQuery && isFolder && (node.children || []).some(c => nodeMatchesSearch(c, searchQuery)));
  const myIndex = flatListRef.current.length;
  flatListRef.current.push({ node, path, key });

  return (
    <>
      <Row node={node} path={path} depth={depth} expanded={isOpen} isSelected={selectedFile?.node === node} isFocused={focusIndex === myIndex} searchQuery={searchQuery} onToggle={onToggle} onSelect={onSelect} onFocusRow={onFocusRow} rowIndex={myIndex} />
      {isFolder && isOpen && (node.children || []).filter(c => nodeMatchesSearch(c, searchQuery)).map(child => (
        <RenderTree key={child.name} node={child} parentPath={path} depth={depth + 1} expandedKeys={expandedKeys} selectedFile={selectedFile} searchQuery={searchQuery} focusIndex={focusIndex} flatListRef={flatListRef} onToggle={onToggle} onSelect={onSelect} onFocusRow={onFocusRow} />
      ))}
    </>
  );
}

// Main component — starts the tree and handles keyboard navigation
export default function FileTree({ rootData, expandedKeys, selectedFile, searchQuery, focusIndex, setFocusIndex, onToggle, onSelect }) {
  const flatListRef = useRef([]);
  flatListRef.current = [];

  function handleKeyDown(e) {
    const list = flatListRef.current;
    if (!list.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIndex(i => Math.min(i + 1, list.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); const item = list[focusIndex]; if (item?.node.type === 'folder') onToggle(item.key, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); const item = list[focusIndex]; if (item?.node.type === 'folder') onToggle(item.key, false); }
    else if (e.key === 'Enter') { e.preventDefault(); const item = list[focusIndex]; if (item) item.node.type === 'folder' ? onToggle(item.key) : onSelect(item.node, item.path); }
  }

  // Check if search has any results
  const visibleItems = (rootData.children || []).filter(child => nodeMatchesSearch(child, searchQuery));

  // If user searched but nothing was found, show a message
  if (searchQuery && visibleItems.length === 0) {
    return (
      <div className={styles.noResults}>
        <span>No results found for "</span>
        <strong>{searchQuery}</strong>
        <span>"</span>
      </div>
    );
  }
  
  return (
    <div className={styles.tree} role="tree" tabIndex={0} onKeyDown={handleKeyDown}>
      {(rootData.children || []).filter(child => nodeMatchesSearch(child, searchQuery)).map(child => (
        <RenderTree key={child.name} node={child} parentPath={[rootData.name]} depth={0} expandedKeys={expandedKeys} selectedFile={selectedFile} searchQuery={searchQuery} focusIndex={focusIndex} flatListRef={flatListRef} onToggle={onToggle} onSelect={onSelect} onFocusRow={idx => setFocusIndex(idx)} />
      ))}
    </div>
  );
}