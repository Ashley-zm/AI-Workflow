# AI Workflow Editor - Copilot Instructions

## Project Overview

**ai-workflow** is a visual node-based AI workflow editor built with Vue 3, TypeScript, and Vue Flow. Users drag-and-drop nodes from a sidebar onto a canvas, configure LLM models and prompts via a config panel, and connect nodes with edges to create AI processing pipelines.

## Architecture

### Three-Panel Layout Pattern

- **Left Sidebar** (`Workflow.vue`): Component library with draggable node types (currently only LLM)
- **Center Canvas** (`VueFlow`): Node graph where users create workflows
- **Right Panel** (`PropertiesPanel.vue`): Reactive editor for selected node config with slide-fade animations

### State Management (Pinia)

Store file: [src/stores/workflow.ts](src/stores/workflow.ts)

- `nodes[]`: Array of Node objects from @vue-flow/core
- `edges[]`: Array of Edge connections
- `selectedNode`: Currently selected node (triggers right panel visibility)
- **Key mutation**: `setSelectedNode()` toggles the config panel based on selection

## Core Patterns & Conventions

### Node Data Structure

Every node must have `data.config` initialized:

```typescript
{
  id: `node_${Date.now()}`, // Unique identifier
  type: 'llm', // Registered in nodeTypes map
  position: { x, y },
  data: { config: { model: 'gpt-3.5-turbo', prompt: '' } }
}
```

**Why**: PropertiesPanel reads/writes `currentNode.data.config` directly; uninitialized config causes errors.

### Node Registration

Register new node types in [src/views/Workflow.vue](src/views/Workflow.vue) line 75:

```typescript
const nodeTypes = {
  llm: markRaw(LLMNode), // Always wrap components with markRaw()
}
```

Then add draggable item in the sidebar template.

### Drag-and-Drop Workflow

1. `onDragStart()` sets MIME type `application/vueflow` with node type
2. Canvas `@drop` calculates canvas position via `project()`
3. New node added via `addNodes()` (not directly to store) for VueFlow internals consistency

### Styling Conventions

- **Tailwind CSS** with @tailwindcss/vite plugin
- **Dark borders** (gray-200, gray-300) for subtle hierarchy
- **Blue accents** (#3b82f6) for interactive elements and selected states
- Component cards use `rounded-xl`, `shadow-lg`, `border-2` pattern

### TypeScript Setup

- `@vue/tsconfig` for Vue-specific types
- `vue-tsc` for type-checking (run `npm run type-check`)
- Path alias: `@/` → `src/`

## Key Dependencies & Integration Points

| Package             | Purpose           | Key Pattern                                     |
| ------------------- | ----------------- | ----------------------------------------------- |
| `@vue-flow/core`    | Node graph engine | `VueFlow` component, `Handle` for connections   |
| `pinia`             | State management  | `defineStore()` with composition API style      |
| `@tailwindcss/vite` | Styling           | Direct class names (no separate CSS files)      |
| `lucide-vue-next`   | Icons             | Used as `<BotIcon />`, `<XIcon />` in templates |

## Development Workflows

### Start Development

```bash
npm install
npm run dev    # Vite dev server on http://localhost:5173
```

### Type Checking

```bash
npm run type-check  # Required before building
```

### Build for Production

```bash
npm run build  # Runs type-check + vite build
```

### Code Formatting

```bash
npm run format  # Prettier with experimental CLI
```

## Common Extension Points

### Adding a New Node Type

1. Create [src/components/Nodes/NewNode.vue](src/components/Nodes) with `Handle` elements
2. Register in `nodeTypes` in Workflow.vue
3. Add sidebar drag item with unique type string
4. Extend PropertiesPanel with new `v-if="currentNode.type === 'newtype'"` block

### Modifying Node Properties

Edit [src/stores/workflow.ts](src/stores/workflow.ts): add fields to default `data.config` structure, then add form inputs to [src/components/PropertiesPanel.vue](src/components/PropertiesPanel.vue).

### Router (Currently Unused)

[src/router/index.ts](src/router/index.ts) is initialized but has no routes. Add routes here if multi-view navigation is needed in the future.

## Configuration Files

- `tsconfig.json` / `tsconfig.app.json`: Vue/Node 24 compat
- `.prettierrc.json`: Code formatting rules
- `vite.config.ts`: @ alias, plugin setup
- `env.d.ts`: Global type declarations

## Common Pitfalls

- **Missing `data.config` initialization**: Always ensure config exists before accessing config (done in onNodeClick + onDrop)
- **Not using `markRaw()` for components**: Vue reactivity tracking causes performance issues
- **Direct store mutation vs VueFlow methods**: Use `addNodes()` for consistency with internal graph updates
- **Animation classes**: Use TailwindCSS transition utilities; custom `.slide-fade-*` classes in Workflow.vue for panel animations
