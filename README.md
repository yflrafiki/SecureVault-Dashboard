# SecureVault File Explorer

A high-performance, keyboard-accessible file explorer for SecureVault Inc. — built as a submission for the Junior Frontend Engineering challenge.

**Live demo: https://securevault-dashboard.netlify.app/  

**Design file figma:  https://www.figma.com/design/vN4RTd3lIhzkmtyRheyS4b/Design-System-secure-vault?node-id=0-1&t=7m4PhVGg69MXiSV5-1 

---

## Overview

SecureVault's clients (law firms and banks) manage deeply nested folder structures with thousands of sensitive files. This application replaces a flat list with an interactive tree explorer featuring real-time search, keyboard navigation, file inspection, and a breadcrumb path trail.

---

## Setup

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Clone the repo
git clone https://github.com/your-username/securevault-dashboard.git
cd securevault-dashboard

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
# → http://localhost:5173

# 4. Production build
npm run build
npm run preview
```

**Deploying to Vercel:**
```bash
npm install -g vercel
vercel --prod
```


---

## Recursive Strategy

### The Problem: Folders Inside Folders Inside Folders

The data for this application lives in `data.json`. Open it and you will see that it is a tree, a folder can contain files, but it can also contain more folders, which can contain more folders, which can contain more folders, with no guaranteed limit on how deep it goes.

This creates a real engineering problem. If you tried to write normal code to display this, you might write something like:

"Loop through the top-level folders. For each one, loop through its children. For each of those, loop through their children..."

 You do not know in advance how deep the nesting goes. A lawyer might have case files nested 3 levels deep. Another might have 8 levels. You cannot hardcode a fixed number of loops and call it done.

---

### The Solution: A Component That Renders Itself

So recursion is a function that calls itself with different data each time, and stops when there is nothing left to process.

The rule is simple:

To display a folder: show the folder's name as a row, then apply the same rule to everything inside it.

In code, `RenderTree` is the function that does this. Here is what happens when it runs:

Am I a file?

 Show my name as a row. I have no children. Stop.
Am I a folder?

 Show my name as a row.

 Am I expanded (open)?

 Yes: take each of my children and run RenderTree on them.

(Each child will ask the same two questions above.)

 No: stop here. Show nothing inside me.


Here is a concrete example with real data from the app:
RenderTree("Client Files")

draws the "Client Files" row

 it is a folder and it is open, so loop through its children:
  RenderTree("Johnson vs. Meridian Corp")
     draws the "Johnson vs. Meridian Corp" row
     it is a folder and it is open, so loop through its children:

        RenderTree("Depositions")
           draws the "Depositions" row
           it is a folder and it is open, so loop through its children:

              RenderTree("Deposition_Harris_T.pdf")
                draws the file row
                 it is a file, no children → STOP

              RenderTree("Deposition_Chen_L.pdf")
                draws the file row
                 it is a file, no children → STOP

The critical insight is this: the component never needs to know how deep it is. It only ever looks one level ahead. its own children. The depth takes care of itself because each child runs the same logic on its own children.

Adding a 10th level of nesting to the data requires zero changes to the code. The recursion handles it automatically.

---

### How Indentation Works

Each time `RenderTree` calls itself on a child, it passes `depth + 1`. The `depth` number is used to calculate how far right that row should be pushed:
paddingLeft = depth × 18px

So depth 0 (top-level folders) has no indent. Depth 1 has 18px. Depth 2 has 36px. And so on. This is what creates the visual tree effect — purely CSS, driven by a single number that increments with each recursive call.

---

### Keyboard Navigation

Keyboard navigation requires a flat ordered list of *currently visible* rows (because what's visible depends on which folders are expanded). This is computed by a `buildVisible` traversal that runs on every render and produces `flatListRef.current`. Arrow keys move an index pointer through this list. The pattern:

```
ArrowDown → focusIndex++
ArrowUp   → focusIndex--
ArrowRight → expandFolder(list[focusIndex].key)
ArrowLeft  → collapseFolder(list[focusIndex].key)
Enter      → select file | toggle folder
```

### Search

Search is handled by `nodeMatchesSearch(node, query)` — a recursive function that returns `true` if the node's own name matches, or if *any descendant's* name matches. This means a folder only appears in search results if it or something inside it is relevant. Matching folders are auto-expanded so the matching file is immediately visible.

---

## Wildcard Feature: Breadcrumb Path Trail

### What it is

A persistent path bar beneath the explorer header showing the full vault path of the selected file — for example:

```
SecureVault / Client Files / Johnson vs. Meridian Corp / Depositions
```

### Why it was chosen

The primary personas are lawyers and bankers navigating deeply nested archives. When you're five or six levels deep in a folder tree, it's easy to lose track of *where you are* — especially after using search to jump directly to a file.

Without a breadcrumb, a user could accidentally save a new file in the wrong matter, or share a link to the wrong directory. For a law firm, that's a compliance risk. For a bank, it could be a regulatory issue.

The breadcrumb solves this by providing a constant, glanceable location indicator a pattern users recognise from Finder, Windows Explorer, and every major cloud storage product. It costs zero additional interaction but permanently answers the question: *"where am I?"

### Business value

- **Error reduction:** Users confirm their location before acting, reducing misfiles.
- **Navigation speed:** Future enhancement — clicking a breadcrumb ancestor will jump to that level.
- **Audit readiness:** The full path is always visible, supporting screenshot-based audit trails.

