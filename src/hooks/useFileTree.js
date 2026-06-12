import { useState, useCallback, useRef } from 'react';

/**
 * Assigns a stable path key to every node in the tree.
 * Path = ancestor names joined by '/', e.g. "SecureVault/Client Files/Depositions"
 */
export function buildFlatList(node, parentPath = [], results = []) {
  const path = [...parentPath, node.name];
  const key = path.join('/');
  results.push({ node, path, key });
  if (node.type === 'folder') {
    (node.children || []).forEach(child => buildFlatList(child, path, results));
  }
  return results;
}

/**
 * Returns true if a node or any descendant matches the search query.
 */
export function nodeMatchesSearch(node, query) {
  if (!query) return true;
  if (node.name.toLowerCase().includes(query.toLowerCase())) return true;
  if (node.type === 'folder') {
    return (node.children || []).some(child => nodeMatchesSearch(child, query));
  }
  return false;
}

/**
 * Core hook encapsulating all file-tree state.
 */
export function useFileTree(rootData) {
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);  // { node, path }
  const [searchQuery, setSearchQuery] = useState('');
  const [focusIndex, setFocusIndex] = useState(0);

  // Holds the currently rendered flat list so keyboard nav can reference it
  const flatListRef = useRef([]);

  const isExpanded = useCallback(
    key => expandedKeys.has(key),
    [expandedKeys]
  );

  const toggleFolder = useCallback(key => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const expandFolder = useCallback(key => {
    setExpandedKeys(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const collapseFolder = useCallback(key => {
    setExpandedKeys(prev => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const selectFile = useCallback((node, path) => {
    setSelectedFile({ node, path });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
  }, []);

  // Keyboard navigation — called from the tree's onKeyDown
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
        if (item && item.node.type === 'folder') expandFolder(item.key);
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const item = list[focusIndex];
        if (item && item.node.type === 'folder') collapseFolder(item.key);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const item = list[focusIndex];
        if (!item) break;
        if (item.node.type === 'folder') {
          toggleFolder(item.key);
        } else {
          selectFile(item.node, item.path);
        }
        break;
      }
      default:
        break;
    }
  }, [focusIndex, expandFolder, collapseFolder, toggleFolder, selectFile]);

  return {
    expandedKeys,
    selectedFile,
    searchQuery,
    setSearchQuery,
    focusIndex,
    setFocusIndex,
    flatListRef,
    isExpanded,
    toggleFolder,
    expandFolder,
    collapseFolder,
    selectFile,
    clearSelection,
    handleKeyDown,
  };
}
