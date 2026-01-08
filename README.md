# Gridlex CRM - Multi-View Record Management System

A modern, feature-rich CRM platform with comprehensive multi-view capabilities for managing contacts, opportunities, organizations, and tasks.

![Gridlex CRM](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🎯 Project Overview

Gridlex CRM is a unified data management platform designed to provide intuitive interfaces for managing records across multiple customized views. The application demonstrates modern UI/UX patterns with context-aware intelligence and a robust permission system.

## ✨ Key Features

### View Types
- **📋 Table View**: Full-featured data grid with inline editing, column resizing, drag-to-reorder columns, pagination, and bulk actions
- **📊 Kanban Board**: Drag-and-drop cards with swimlanes, WIP limits, quick-add functionality, and collapsible columns
- **📅 Calendar View**: Month/Week/Day/Agenda views with drag-to-reschedule and mini calendar navigation
- **🗺️ Map View**: Interactive Leaflet maps with radius search, layer controls, and multiple map styles
- **🔗 Unified View**: Combined view of all record types with smart filtering

### Data Management
- **4 Table Types**: Contacts, Opportunities, Organizations, Tasks
- **CRUD Operations**: Create, Read, Update, Delete with optimistic updates
- **Bulk Actions**: Multi-select with batch edit, duplicate, and delete
- **Inline Editing**: Double-click to edit cells directly in table view
- **Smart Filtering**: Field-based filters with multiple operators

### View Customization
- **Saved Views**: Save and share custom view configurations
- **Column Management**: Show/hide, reorder, pin, and resize columns
- **Permission System**: Private, Team, and Public view sharing
- **Default Views**: Set preferred views per table type

### User Experience
- **Onboarding Tour**: Guided introduction for new users
- **Keyboard Shortcuts**: Power-user navigation (⌘K search, ? for help)
- **Context-Aware UI**: Intelligent view availability with explanations
- **Responsive Design**: Optimized for desktop and tablet devices
- **Smooth Animations**: Framer Motion powered transitions

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | Shadcn/UI + Radix UI |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |
| **Maps** | Leaflet + React Leaflet |
| **Charts** | Recharts |
| **Notifications** | Sonner |
| **Date Handling** | date-fns |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gridlex-crm.git

# Navigate to project directory
cd gridlex-crm

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## 📐 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css         # Global styles & CSS variables
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── components/
│   ├── dialogs/            # Modal dialogs (Create, Edit, Delete, Export)
│   ├── layout/             # Header, Sidebar components
│   ├── ui/                 # Shadcn/UI components
│   └── views/              # View components (List, Kanban, Calendar, Map)
├── context/
│   └── AppContext.tsx      # Global state management
├── data/
│   └── mock-data.ts        # Sample data & field configurations
├── hooks/
│   └── use-mobile.tsx      # Responsive hooks
├── lib/
│   ├── animations.ts       # Framer Motion variants
│   ├── utils.ts            # Utility functions
│   └── view-availability.ts # View availability logic
└── types/
    └── index.ts            # TypeScript type definitions
```

## 💡 Key Design Decisions

### Context-Aware Intelligence
Views that aren't applicable to certain data types show helpful explanations rather than being hidden, helping users understand the system's capabilities.

### Progressive Disclosure
Advanced features (WIP limits, swimlanes, column pinning) are accessible but don't overwhelm new users with complexity.

### Permission-Aware UI
Actions are shown or hidden based on user permissions, with clear visual indicators for shared vs. private views.

### Unified Table View
A powerful "All Records" view combines data from multiple tables with type indicators and smart filtering.

### Optimistic Updates
UI updates immediately on user actions, providing a snappy, responsive experience.

## 🎨 Design System

The application uses a custom color palette based on Gridlex branding:

- **Navy** (`#003B5C`): Primary brand color
- **Cyan** (`#1BA9C4`): Accent color
- **Ice Blue** (`#EBF5FA`): Background highlights

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + K` | Open search |
| `⌘ + N` | Create new record |
| `⌘ + 1-4` | Switch views |
| `?` | Show keyboard shortcuts |
| `Escape` | Clear selection |
| `Enter` | Open record details |
| `Delete` | Delete selected |

## 🚀 Live Demo

[View Live Demo](https://gridlexassignment.vercel.app/)

## 📝 Future Enhancements

- [ ] Real-time collaboration
- [ ] Advanced reporting & analytics
- [ ] Email integration
- [ ] Mobile app
- [ ] API integrations
- [ ] Custom field types

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by **Sai Charan Jogu**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/saicharanjogu)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-green?style=flat-square&logo=google-chrome)](https://charanjogu.vercel.app)
