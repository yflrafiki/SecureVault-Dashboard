import React, { useEffect, useRef } from 'react';
import { FolderIcon, FileIcon, ChevronIcon } from './FileIcon';
import { nodeMatchesSearch } from '../hooks/useFileTree';
import styles from '../styles/TreeNode.module.css';

/**
 * Highlights the matching substring in a filename during search.
 */
function HighlightMatch({ text, query }) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className={styles.highlight}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  );
}


export default function TreeNode({
  node,
  depth,
  path,
  isExpanded,
  isSelected,
  isFocused,
  searchQuery,
  onToggle,
  onSelect,
  onFocusItem,
  flatIndex,
  expandedKeys,
  selectedFile,
}) {
  const rowRef = useRef(null);
  const key = path.join('/');
  const isFolder = node.type === 'folder';

  // Auto-scroll focused item into view
  useEffect(() => {
    if (isFocused && rowRef.current) {
      rowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused]);

  // During search, auto-expand folders that contain matches
  const forceExpand = searchQuery
    ? isFolder && (node.children || []).some(child => nodeMatchesSearch(child, searchQuery))
    : false;

  const expanded = isExpanded || forceExpand;

  function handleClick(e) {
    e.stopPropagation();
    onFocusItem(flatIndex);
    if (isFolder) {
      onToggle(key);
    } else {
      onSelect(node, path);
    }
  }

  const rowClass = [
    styles.row,
    isFocused ? styles.focused : '',
    isSelected ? styles.selected : '',
    isFolder ? styles.folder : styles.file,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={styles.item} role="none">
      {/* The visible row */}
      <div
        ref={rowRef}
        className={rowClass}
        style={{ paddingLeft: `${depth * 18 + 10}px` }}
        onClick={handleClick}
        role={isFolder ? 'treeitem' : 'treeitem'}
        aria-expanded={isFolder ? expanded : undefined}
        aria-selected={isSelected}
        tabIndex={isFocused ? 0 : -1}
        data-key={key}
      >
        {/* Chevron — only visible on folders */}
        <span className={styles.chevronWrap}>
          {isFolder ? (
            <ChevronIcon open={expanded} />
          ) : null}
        </span>

        {/* Icon */}
        <span className={styles.iconWrap}>
          {isFolder ? (
            <FolderIcon open={expanded} />
          ) : (
            <FileIcon ext={node.ext || ''} />
          )}
        </span>

        {/* Name */}
        <span className={styles.name}>
          <HighlightMatch text={node.name} query={searchQuery} />
        </span>

        {/* Size badge — files only */}
        {!isFolder && node.size && (
          <span className={styles.sizeBadge}>{node.size}</span>
        )}
      </div>

      {/* Children — rendered only when expanded */}
      {isFolder && expanded && (node.children || []).length > 0 && (
        <ul className={styles.children} role="group">
          {(node.children || [])
            .filter(child => nodeMatchesSearch(child, searchQuery))
            .map((child, i) => {
              const childPath = [...path, child.name];
              const childKey = childPath.join('/');
              return (
                <TreeNode
                  key={childKey}
                  node={child}
                  depth={depth + 1}
                  path={childPath}
                  isExpanded={expandedKeys.has(childKey)}
                  isSelected={selectedFile?.node === child}
                  isFocused={false}  /* managed by parent via flatIndex */
                  searchQuery={searchQuery}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  onFocusItem={onFocusItem}
                  flatIndex={-1}  /* placeholder; real index set in FileExplorer */
                  expandedKeys={expandedKeys}
                  selectedFile={selectedFile}
                />
              );
            })}
        </ul>
      )}
    </li>
  );
}
