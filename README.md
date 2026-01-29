# nextjs-temp-2026

Next.js frontend template for 2026.

## Tech Stack

### Core
- **Framework:** [Next.js](https://nextjs.org/) 16
- **UI Library:** [React](https://react.dev/) 19
- **Language:** [TypeScript](https://www.typescriptlang.org/)

### Styling
- **CSS-in-JS:** [Panda CSS](https://panda-css.com/)

### Testing & Documentation
- **Unit Testing:** [Vitest](https://vitest.dev/)
- **Component Catalog:** [Storybook](https://storybook.js.org/) 10
- **E2E Testing:** [Playwright](https://playwright.dev/)

### Quality Control
- **Linter:** [Oxlint](https://oxc.rs/) & [ESLint](https://eslint.org/)
- **Formatter:** [oxfmt](https://github.com/oxc-project/oxc)
- **Markup Linter:** [Markuplint](https://markuplint.dev/)

### Environment & Tooling
- **Tool Manager:** [mise](https://mise.jdx.dev/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Git Hooks:** [Lefthook](https://github.com/evilmartians/lefthook)

## Prerequisites

This project uses [mise](https://mise.jdx.dev/) for tool management.

If you haven't installed `mise` yet:

```bash
# Install mise (macOS)
brew install mise
# OR via curl
curl https://mise.run | sh

# Shell integration (for zsh)
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc
```

## Setup

1. Configure and install tools via mise:
   Enable python version file support (if needed)
   ```bash
   mise settings add idiomatic_version_file_enable_tools python
   ```

   Trust and install tools
   ```bash
   mise trust && mise install
   ```

2. Install Git hooks:
   ```bash
   lefthook install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   pnpm install
   ```

## Development

Run these commands from the `frontend` directory.

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm storybook` | Start Storybook server |
| `pnpm test` | Run all tests |
| `pnpm check` | Run linting and formatting checks |
| `pnpm build` | Build for production |
