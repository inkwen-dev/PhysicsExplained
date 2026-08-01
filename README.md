# Physics Explained

A content website explaining physics topics in simple, accessible language.

## Project Status

✅ **Completed:**
- Project structure setup (Next.js + TypeScript + Tailwind CSS)
- Brand theme and color scheme (Deep Purple + Cyan)
- Physics category system (6 main categories, 24 subcategories)
- Content structure documentation and writing style guide
- All necessary pages and components

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
PhysicsExplained/
├── app/                    # Next.js app directory
│   ├── [slug]/            # Article pages
│   ├── categories/         # Category pages
│   ├── about/              # About page
│   └── ...
├── components/             # React components
│   ├── article/           # Article-related components
│   └── layout/            # Layout components
├── content/               # Content files
│   ├── categories/        # Category metadata (6 categories)
│   ├── subcategories/     # Subcategory metadata (24 subcategories)
│   └── topics/            # Article content (to be generated)
├── lib/                   # Utility functions
├── config/                # Configuration files
└── docs/                  # Documentation
    ├── 品牌与定位.md
    └── 内容结构/
        ├── 内容组织规范.md
        └── 写作风格指南.md
```

## Brand Colors

- **Primary**: Deep Purple `#2d1b4e`
- **Accent**: Cyan `#00d4ff`
- **Text**: Dark Gray `#2c3e50`

## Categories

1. **Classical Mechanics** (4 subcategories)
2. **Thermodynamics & Statistical Physics** (4 subcategories)
3. **Electromagnetism** (4 subcategories)
4. **Optics** (4 subcategories)
5. **Modern Physics** (4 subcategories)
6. **Everyday Physics** (4 subcategories)

## Next Steps

1. Generate first sample article for review
2. Generate first 10 articles
3. Generate remaining 90 articles (total 100 articles)

## Documentation

See `docs/` directory for:
- Brand positioning and guidelines
- Content organization standards
- Writing style guide

