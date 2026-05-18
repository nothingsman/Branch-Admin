# EduGov Academy - Global Design Specification

## Overview
EduGov Academy is a high-fidelity administrative suite designed for educational branch administrators. It provides a centralized, "Corporate-Modern" interface for managing all aspects of school operations, from staff and students to attendance and academic planning.

---

## 1. Global Shell & Navigation

### Layout Structure
- **Sidebar (Fixed, 256px)**: High-contrast navigation on the left.
- **Header (Sticky)**: Breadcrumbs, Module Title, and contextual actions.
- **Main View**: Content area with smooth transition animations between modules.
- **Academic Year Context**: Global selection affects all data views (AY 2024-25, etc).

### Navigation Hierarchy
- **Primary Modules**: Dashboard, Parents, Students, Teachers, Academia, Attendance, Announcements, Academic Calendar, Batch Import.

---

## 2. Shared UI Patterns (The "Corporate-Modern" Aesthetic)

### Typography
- **Primary**: `Inter` (Sans-serif) for high legibility in data-dense areas.
- **Data/ID**: `JetBrains Mono` for technical identifiers (Student/Teacher IDs) to provide a "structured" feel.
- **Scaling**: 
  - Subhead headers: `text-[10px] font-black uppercase tracking-widest text-slate-400`
  - Table Content: `text-sm font-medium text-slate-900`

### Color System & Semantics
- **Brand Primary (#3B82F6)**: Royal blue for core actions and identity.
- **Backgrounds**: `slate-50` for low-contrast containers, `white` for interactive surfaces.
- **Status Semantic Colors**:
  - `Active / Registered / Success`: **Emerald Green** (`bg-emerald-500`, `text-emerald-600`)
  - `Pending / Invited / Warning`: **Amber/Orange** (`bg-amber-500`, `text-amber-600`)
  - `Withdrawn / Inactive / Danger`: **Red/Slate** (`bg-red-500` or `bg-slate-400`)
  - `New / System`: **Royal Blue** (`bg-primary`)

### Motion & Transitions (`motion/react`)
- **Route Changes**: Opacity fade and slight `y-axis` shift (10px).
- **List Items**: Staggered entry animation.
- **Modals**: Scale up (0.95 to 1.0) with backdrop blur.
- **Side-Sheets**: Spring-based slide from right.

---

## 3. Module Specific Themes

### A. Students & Parents (Directory Management)
- **Primary View**: Searchable data table with status indicators.
- **Special Feature**: "Linkage Status" (Linking students to parent accounts).
- **Detail View**: Interactive slide-over side-sheet with full profile, contact methods, and emergency info.
- **Action Pattern**: "SMS Notification" triggers a focused modal for parental communication.

### B. Teacher Management
- **Primary View**: Staff directory with employee IDs.
- **Special Feature**: "Class Assignment Matrix" - Assigning teachers to multiple Grade-Section pairs simultaneously.
- **Detail View**: Performance analytics and bio summary (Dual-language: English & Amharic).

### C. Academia (Curriculum Control)
- **Goal**: Hierarchical management of Grades, Sections, and Subjects.
- **UX Pattern**: Interactive cards or lists that expand to show sub-entities.
- **Action Pattern**: Quick-add modals for adding new subjects to specific grades.

### D. Attendance Dashboard
- **Primary View**: Multi-segmented dashboard showing current day stats (Present vs. Absent).
- **UX Pattern**: Grouping by class/grade with real-time status toggles.
- **Action Pattern**: "Bulk Mark" for entire sections.

### E. Academic Calendar
- **Primary View**: Monthly/Agenda hybrid view.
- **UX Pattern**: Custom date and time selection logic (Side-by-side popover pickers).
- **Status Pattern**: Color coding by event type (Holiday, Exam, Meeting).

### F. Announcements (Communications)
- **Primary View**: Chronological feed of school-wide or targeted messages.
- **UX Pattern**: Rich-text preview and recipient targeting (All, Parents, Teachers).

### G. Batch Import (Data Ingestion)
- **Primary View**: Drag-and-drop file upload zone.
- **UX Pattern**: Multi-step processing with validation checks and progress bars.

---

## 4. Component Archetypes

### 1. Metric Cards
- White background, light border, semantic icon on left with subtle background tint.
- Label in uppercase tracking, Value in bold large text.

### 2. Data Tables
- Header in slate-50 background, uppercase headers.
- Hover states that reveal action toolbars.
- Infinite scroll or clear pagination.

### 3. Modals & Forms
- Rounded corners (`rounded-[2rem]`).
- Backdrop blur (`backdrop-blur-sm`).
- Focused inputs with `transition-all` ring effects on focus.

### 4. Custom Pickers (Date/Time)
- Popover surfaces that appear on click to avoid standard browser input interference.
- High-contrast selection states.

---

## 5. Technical Requirements
- **Styling**: Tailwind CSS only (no external CSS files).
- **Icons**: Lucide-react exclusively.
- **State**: React local state for UI, Centralized mock data in `mockData.ts` for layout testing.
- **Accessibility**: High contrast ratios and aria-labels for interactive buttons.
