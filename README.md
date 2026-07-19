# claude-code-cain

Coursework for the Udemy class **"Claude Code: Prototype to Prod"** — building a full-stack
online radio station app, RadioCalico, from scratch with Claude Code as the pairing tool.

The course builds incrementally: each lesson adds a throwaway prototype exploring one part of
the stack before those lessons are folded into the real app.

## Layout

```text
.
├── calico/           # Brand assets from the instructor: logo, style guide, layout wireframe,
│                      # live stream URL
├── prototype_1/       # Express.js + PostgreSQL (Docker Compose)
├── prototype_2/       # Express.js frontend + Flask backend API + SQLite (two servers)
├── prototype_3/       # Express.js + HLS audio player + song ratings (Express/Flask/SQLite)
└── RadioCalico/        # The real app — not a prototype, built following the course lesson by
                        # lesson (see RadioCalico/CLAUDE.md)
```

Each `prototype_N/` folder is self-contained with its own `CLAUDE.md` documenting its stack and
how to run it. `RadioCalico/` is the actual production build; see its `CLAUDE.md` for current
scope, tech stack, and run instructions.

## Contributing / workflow

This repo uses a PR-based workflow — `main` is protected and does not accept direct pushes:

```bash
git checkout -b feature/<name>
# make changes, commit
git push -u origin feature/<name>
gh pr create
```

Issues and PRs use the templates in `.github/`.

## License

MIT — see [LICENSE](LICENSE).
