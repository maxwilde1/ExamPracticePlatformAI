# GCSE & A-Level Exam Practice Platform - Design Guidelines

## Design Approach

**Selected Framework:** Design System Approach with Material Design principles + Educational Platform aesthetics

**Rationale:** This is a utility-focused, information-dense educational tool where clarity, efficiency, and trustworthiness are paramount. Drawing inspiration from Linear's clean minimalism and established educational platforms (Khan Academy, Coursera) while using Material Design's robust component patterns for form-heavy interfaces.

**Key Principles:**
1. Academic credibility through restrained, professional design
2. Cognitive clarity - minimize distractions during exam practice
3. Efficiency-first interactions with strong keyboard support
4. Clear information hierarchy for complex metadata (boards, subjects, years)

---

## Typography

**Font Families:**
- Primary (Body/UI): Inter or IBM Plex Sans via Google Fonts CDN
- Headings: Same as primary (maintain consistency)
- Monospace (codes/metadata): JetBrains Mono

**Hierarchy:**
- Page Titles: text-4xl md:text-5xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Metadata/Labels: text-sm font-medium uppercase tracking-wide
- Helper Text: text-sm

---

## Layout System

**Spacing Units:** Use Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, gap-6, mb-8, py-12)

**Grid Strategy:**
- Container max-widths: max-w-7xl for main content, max-w-6xl for focused areas
- Multi-column where appropriate: 3-4 columns for paper cards (desktop), 2 columns (tablet), 1 column (mobile)
- Generous padding: py-12 to py-16 for desktop sections, py-8 for mobile

**Key Layouts:**
1. Homepage: Header → Search/Filter Bar → Paper Grid (3-column)
2. Exam Viewer: Fixed split (60% PDF / 40% Answer Input) with page navigation
3. Results: Full-width with page-by-page accordion/cards
4. Admin: Sidebar navigation + main content area

---

## Component Library

### Navigation & Header
- Clean top navigation bar with logo left, admin link right
- Sticky header with subtle shadow on scroll
- Breadcrumbs for exam viewer context (Level > Board > Subject > Paper)

### Search & Filters
- Prominent search bar with icon (Heroicons search icon)
- Filter chips/dropdowns for: Level, Exam Board, Subject, Year
- Clear visual feedback for active filters
- Results count display

### Paper Cards (Homepage Grid)
Each card includes:
- Paper title (bold, truncated if needed)
- Metadata row: Board badge + Subject + Year (text-sm)
- Stats: Question count, total marks
- "Start Practice" button (primary action)
- Hover state: subtle lift (shadow-md to shadow-lg)

### PDF Exam Viewer (Split View)
**Left Panel (60%):**
- PDF page display with navigation controls
- Page counter (e.g., "Page 3 of 12")
- Zoom controls (fit-to-width default)
- Previous/Next buttons (keyboard: arrow keys)

**Right Panel (40%):**
- Question context card at top: Question number, max marks, instructions
- Large textarea for answer input (min-h-64)
- Auto-save indicator (text-sm with icon)
- Submit button (disabled until answer entered)
- Progress indicator: completed pages vs. total

### Results View
- Overall score card at top: Large score display, percentage, grade estimate
- Expandable page-by-page breakdown (accordion pattern):
  - Page thumbnail + question reference
  - Student answer (read-only, subtle background)
  - AI awarded marks with rationale
  - Feedback section with improvement tips (distinct background treatment)
  - Confidence indicator (high/medium/low)

### Admin Dashboard (Separate from Student Site)
- Sidebar navigation: Papers, Upload, Moderation, Analytics
- Upload form: Multi-file input, metadata fields in organized sections
- Paper management table: sortable, filterable, with action buttons
- Moderation queue: List view with expand/collapse for low-confidence marks
- Analytics: Cost tracking cards, usage graphs

### Form Elements
- Consistent input styling: border, rounded corners (rounded-lg), focus rings
- Labels: text-sm font-medium above inputs
- Helper text below inputs where needed
- Dropdowns: Native select with custom arrow icon
- Buttons: Primary (solid), Secondary (outline), Tertiary (text only)

### Buttons
- Primary: Solid background, white text, rounded-lg, px-6 py-3
- Secondary: Border, rounded-lg, px-6 py-3
- Icon buttons: Rounded-full, p-2
- Hover states: Subtle brightness/opacity change
- Disabled: Reduced opacity (opacity-50)

### Icons
**Library:** Heroicons (via CDN) exclusively
**Usage:**
- Search, filter, navigation (arrow-left, arrow-right)
- Status indicators (check-circle, exclamation-triangle)
- Actions (upload, download, edit, trash)
- Size: w-5 h-5 for inline, w-6 h-6 for standalone

### Loading & Empty States
- Skeleton loaders for paper cards during search
- Empty state illustrations with helpful messages ("No papers match your filters")
- Loading spinner for AI marking (centered with "Analyzing your answer..." text)

---

## Images

**Hero Section (Homepage):**
- Large hero image depicting diverse students studying/taking exams
- Image dimensions: Full-width, h-96 on desktop, h-64 on mobile
- Overlay: Dark gradient (bottom to top) for text readability
- Hero content: Centered, white text
  - Headline: "Master Your GCSE & A-Level Exams"
  - Subheading: "Practice with real past papers. Get instant AI-powered feedback."
  - CTA button with blurred background (backdrop-blur-sm bg-white/20)

**Other Images:**
- Placeholder thumbnails for PDF pages (generated from actual PDFs)
- No decorative imagery elsewhere - maintain focus on functionality

---

## Accessibility

- All interactive elements have focus states (ring-2 ring-offset-2)
- Form inputs have associated labels (for/id matching)
- ARIA labels for icon-only buttons
- Sufficient contrast ratios (WCAG AA minimum)
- Keyboard navigation: Tab order, arrow keys for PDF pages, Ctrl+Enter to submit
- Screen reader announcements for auto-save, mark updates

---

## Animations

**Minimal, purposeful only:**
- Page transitions: Subtle fade (150ms)
- Button hover: Scale transform (scale-105, 100ms)
- Card hover: Lift shadow (200ms)
- Loading states: Pulse animation for skeletons
- **No scroll-triggered animations** - maintain focus on content

---

## Responsive Behavior

**Breakpoints:**
- Mobile: Base (< 768px) - Single column, stacked layout
- Tablet: md (768px+) - 2-column grids, split view may stack vertically
- Desktop: lg (1024px+) - Full multi-column grids, side-by-side split view

**Key Adaptations:**
- Exam viewer: Stack on tablet (PDF full-width above, answer input below)
- Filter bar: Collapsible on mobile (hamburger menu pattern)
- Paper cards: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)

---

## Special Considerations

**Exam Viewer Focus Mode:**
- Minimal chrome - hide header/navigation during practice
- Clear page progress indicator always visible
- Question context always visible above answer input
- Distraction-free environment prioritizes content over UI flourishes

**Admin vs. Student Interface:**
- Student site: Clean, minimal, single-purpose
- Admin dashboard: Information-dense, table-heavy, robust controls
- Visually distinct (admin has sidebar, student does not)

**Trust & Credibility:**
- Professional typography and spacing convey academic seriousness
- Consistent alignment and visual hierarchy build confidence
- Clear labeling of AI-generated feedback (transparency)
- Exam board logos/badges where appropriate (if permitted)