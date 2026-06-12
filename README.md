# SecureVault File Explorer

Live Demo: https://securevault-dashboard.netlify.app/

Design File (Figma): https://www.figma.com/design/vN4RTd3lIhzkmtyRheyS4b/Design-System-secure-vault?node-id=0-1&t=7m4PhVGg69MXiSV5-1

---

## Overview

SecureVault's clients (law firms) manage deeply nested folder structures containing thousands of sensitive files. This application replaces a flat file list with an interactive tree explorer that supports:

* Recursive folder navigation
* Real-time search
* Keyboard navigation
* File inspection
* Breadcrumb path tracking

---

# 1. Setup Instructions

### Prerequisites

* Node.js 22+
* npm

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/securevault-dashboard.git

# Navigate into project
cd securevault

# Install dependencies
npm install

# Start development server
npm run dev
```

Application runs at:

```bash
http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

---


---

# 2. Recursive Strategy

## The Problem

The application's data is stored as a tree structure in `data.json`.

A folder can contain:

* Files
* Folders
* Folders inside folders

There is no fixed limit on nesting depth.

For example:

```text
Client Files
 └── Johnson vs. Meridian Corp
      └── Depositions
           └── Harris.pdf
```

Because the depth is unknown, a fixed number of loops cannot reliably render the structure.

---

## The Solution

I used a recursive component called `RenderTree`.

The component renders a node and then applies the same logic to each child node.

The logic is:

```text
If node is a file:
    Render file
    Stop

If node is a folder:
    Render folder

    If expanded:
        Render all children using RenderTree
```

Each child uses the exact same component, allowing the tree to grow to any depth without requiring changes to the rendering logic.

---

## Example

```text
RenderTree("Client Files")
```

* Render "Client Files"
* Folder is expanded
* Render children

```text
RenderTree("Johnson vs. Meridian Corp")
```

* Render folder
* Folder is expanded
* Render children

```text
RenderTree("Depositions")
```

* Render folder
* Folder is expanded
* Render children

```text
RenderTree("Deposition_Harris_T.pdf")
```

* Render file
* Stop

The component never needs to know how deeply nested it is. It only renders the current node and delegates child rendering back to itself.

---

## Indentation

To visually represent hierarchy, each recursive call passes:

```javascript
depth + 1
```

The indentation is calculated as:

```text
padding-left = depth × 18px
```

This creates the tree structure while keeping the rendering logic simple.

---

## Search

Search is also recursive.

The function `nodeMatchesSearch(node, query)` returns `true` when:

* The node's name matches the query, or
* Any descendant matches the query

This allows parent folders to remain visible when they contain matching files deeper in the hierarchy.

Matching paths are automatically expanded so users can immediately see the search result.

---

## Keyboard Navigation

Keyboard navigation operates on a flattened list of currently visible nodes.

```text
ArrowDown  → Next item
ArrowUp    → Previous item
ArrowRight → Expand folder
ArrowLeft  → Collapse folder
Enter      → Select file or toggle folder
```

A traversal function rebuilds this visible list whenever folder expansion changes.

---

# 4. Wildcard Feature: Breadcrumb Path Trail

## What It Is

A breadcrumb bar displayed beneath the explorer header showing the complete location of the currently selected item.

Example:

```text
SecureVault / Client Files / Johnson vs. Meridian Corp / Depositions
```

---

## Why I Chose It

The primary users are lawyers and financial professionals who often work with deeply nested folder structures.

After navigating several levels deep or jumping directly to files through search, it can become difficult to understand where the selected item exists within the vault.

The breadcrumb trail provides constant location awareness and reduces the risk of interacting with the wrong folder or file.

It is a familiar pattern used in products such as:

* Windows Explorer
* macOS Finder
* Google Drive

and helps users quickly answer:

"Where am I in the folder hierarchy?"

without requiring any additional interaction.
