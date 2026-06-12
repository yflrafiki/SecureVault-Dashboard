import React, { useEffect, useRef, useCallback } from 'react';
import { nodeMatchesSearch } from '../hooks/useFileTree';
import { FolderIcon, FileIcon, ChevronIcon } from './FileIcon';
import styles from '../styles/FileTree.module.css';

/**
 * FileTree
 *
 * Renders the vault tree and owns keyboard navigation.
 *
 * Keyboard strategy: we maintain a flat array of visible rows in rendering
 * order. The focused row is identified by flatIndex. Arrow keys move this
 * index; Enter/Right/Left manipulate the tree state.
 *
 * The flat list is rebuilt on every render because the tree shape can change
 * (expand/collapse, search filter). This is O(n) on visible items — fast
 * enough for any realistic vault size.
 */

function HighlightMatch({ text, query }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.highlight}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// Builds the visible flat list without rendering — used for keyboard nav
function buildVisible(node, path, expandedKeys, searchQuery, results = []) {
  if (!nodeMatchesSearch(node, searchQuery)) return results;
  const nodePath = [...path, node.name];
  const key = nodePath.join('/');
  results.push({ node, path: nodePath, key });
  const isFolder = node.type === 'folder';
  const forceExpand =
    searchQuery && isFolder
      ? (node.children || []).some(c => nodeMatchesSearch(c, searchQuery))
      : false;
  const expanded = expandedKeys.has(key) || forceExpand;
  if (isFolder && expanded) {
    (node.children || []).forEach(child =>
      buildVisible(child, nodePath, expandedKeys, searchQuery, results)
    );
  }
  return results;
}

function Row({
  node, path, depth, expanded, isSelected, isFocused,
  searchQuery, onToggle, onSelect, onFocusRow, rowIndex,
}) {
  const ref = useRef(null);
  const isFolder = node.type === 'folder';
  const key = path.join('/');

  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused]);

  const cls = [
    styles.row,
    isFocused && styles.focused,
    isSelected && styles.selected,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={cls}
      style={{ paddingLeft: `${depth * 18 + 10}px` }}
      role="treeitem"
      aria-expanded={isFolder ? expanded : undefined}
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
      data-key={key}
      onClick={e => {
        e.stopPropagation();
        onFocusRow(rowIndex);
        if (isFolder) onToggle(key);
        else onSelect(node, path);
      }}
    >
      <span className={styles.chevronWrap}>
        {isFolder && <ChevronIcon open={expanded} />}
      </span>
      <span className={styles.iconWrap}>
        {isFolder
          ? <FolderIcon open={expanded} />
          : <FileIcon ext={node.ext || ''} />}
      </span>
      <span className={styles.name}>
        <HighlightMatch text={node.name} query={searchQuery} />
      </span>
      {!isFolder && node.size && (
        <span className={styles.sizeBadge}>{node.size}</span>
      )}
    </div>
  );
}

// Recursively renders rows, passing the running flat-index counter via ref
function RenderTree({
  node, parentPath, depth,
  expandedKeys, selectedFile, searchQuery,
  focusIndex, flatListRef,
  onToggle, onSelect, onFocusRow,
}) {
  if (!nodeMatchesSearch(node, searchQuery)) return null;
  const path = [...parentPath, node.name];
  const key = path.join('/');
  const isFolder = node.type === 'folder';
  const forceExpand =
    searchQuery && isFolder
      ? (node.children || []).some(c => nodeMatchesSearch(c, searchQuery))
      : false;
  const expanded = expandedKeys.has(key) || forceExpand;
  const isSelected = selectedFile?.node === node;

  // Register in flat list and get our index
  const myIndex = flatListRef.current.length;
  flatListRef.current.push({ node, path, key });
  const isFocused = focusIndex === myIndex;

  return (
    <>
      <Row
        node={node}
        path={path}
        depth={depth}
        expanded={expanded}
        isSelected={isSelected}
        isFocused={isFocused}
        searchQuery={searchQuery}
        onToggle={onToggle}
        onSelect={onSelect}
        onFocusRow={onFocusRow}
        rowIndex={myIndex}
      />
      {isFolder && expanded &&
        (node.children || [])
          .filter(c => nodeMatchesSearch(c, searchQuery))
          .map(child => (
            <RenderTree
              key={[...path, child.name].join('/')}
              node={child}
              parentPath={path}
              depth={depth + 1}
              expandedKeys={expandedKeys}
              selectedFile={selectedFile}
              searchQuery={searchQuery}
              focusIndex={focusIndex}
              flatListRef={flatListRef}
              onToggle={onToggle}
              onSelect={onSelect}
              onFocusRow={onFocusRow}
            />
          ))}
    </>
  );
}

export default function FileTree({
  rootData,
  expandedKeys,
  selectedFile,
  searchQuery,
  focusIndex,
  setFocusIndex,
  onToggle,
  onSelect,
}) {
  // Reset flat list on every render
  const flatListRef = useRef([]);
  flatListRef.current = [];

  const handleFocusRow = useCallback(idx => setFocusIndex(idx), [setFocusIndex]);

  const handleKeyDown = useCallback(e => {
    const list = flatListRef.current;
    if (!list.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex(i => Math.min(i + 1, list.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex(i => Math.max(i - 1, 0));
        break;
      case 'ArrowRight': {
        e.preventDefault();
        const item = list[focusIndex];
        if (item?.node.type === 'folder') onToggle(item.key, true);
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const item = list[focusIndex];
        if (item?.node.type === 'folder') onToggle(item.key, false);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const item = list[focusIndex];
        if (!item) break;
        if (item.node.type === 'folder') onToggle(item.key);
        else onSelect(item.node, item.path);
        break;
      }
      default:
        break;
    }
  }, [focusIndex, setFocusIndex, onToggle, onSelect]);

  return (
    <div
      className={styles.tree}
      role="tree"
      aria-label="Vault file tree"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {(rootData.children || [])
        .filter(child => nodeMatchesSearch(child, searchQuery))
        .map(child => (
          <RenderTree
            key={child.name}
            node={child}
            parentPath={[rootData.name]}
            depth={0}
            expandedKeys={expandedKeys}
            selectedFile={selectedFile}
            searchQuery={searchQuery}
            focusIndex={focusIndex}
            flatListRef={flatListRef}
            onToggle={onToggle}
            onSelect={onSelect}
            onFocusRow={handleFocusRow}
          />
        ))}
    </div>
  );
}
