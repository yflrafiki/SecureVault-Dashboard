import React from 'react';
import styles from '../styles/Breadcrumb.module.css';

export default function Breadcrumb({ path = [], onSegmentClick }) {
  if (!path.length) {
    return (
      <nav className={styles.breadcrumb} aria-label="File path">
        <span className={styles.empty}>No file selected</span>
      </nav>
    );
  }

  return (
    <nav className={styles.breadcrumb} aria-label="File path">
      {path.map((segment, i) => {
        const isLast = i === path.length - 1;
        return (
          <React.Fragment key={i}>
            <span
              className={isLast ? styles.segmentActive : styles.segment}
              onClick={() => onSegmentClick && onSegmentClick(i, segment)}
              title={segment}
              aria-current={isLast ? 'page' : undefined}
            >
              {segment}
            </span>
            {!isLast && <span className={styles.separator} aria-hidden="true">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
