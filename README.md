# Flourish Travel - 3-Layer Architecture

This project uses a 3-layer architecture to maximize reliability and maintainability. See [AGENT.md](AGENT.md) for complete details.

## Quick Start

### Directory Structure
```
.
├── AGENT.md              # Complete architecture documentation
├── directives/           # Layer 1: SOPs and instructions (Markdown)
├── execution/            # Layer 3: Deterministic Python scripts
├── .tmp/                 # Intermediate files (not committed)
├── .env                  # Environment variables and API keys
└── .gitignore           # Git ignore rules
```

### The 3 Layers

1. **Directives** (`directives/`) - What to do
   - Natural language SOPs in Markdown
   - Define goals, inputs, tools, outputs, edge cases

2. **Orchestration** (AI Agent) - Decision making
   - Reads directives and calls execution scripts
   - Handles intelligent routing and error recovery

3. **Execution** (`execution/`) - Doing the work
   - Deterministic Python scripts
   - Reliable, testable, fast

### Getting Started

1. Copy `.env` template and add your API keys
2. Review example directive: `directives/example_process_data.md`
3. Review example script: `execution/process_data.py`
4. Create your own directives and scripts as needed

### Key Principles

- **Local files are temporary**: Everything in `.tmp/` can be deleted and regenerated
- **Deliverables live in the cloud**: Use Google Sheets, Slides, or other cloud services
- **Self-anneal on errors**: Fix issues, update scripts, improve directives
- **Check for tools first**: Always look for existing scripts before creating new ones

## Environment Setup

Install Python dependencies:
```bash
pip install python-dotenv
# Add other dependencies as needed
```

Configure `.env` with your API keys and credentials.

## Usage Pattern

When working with the AI agent:
1. Ask it to follow a directive (e.g., "process this data using the process_data directive")
2. The agent will read the directive, call the appropriate script, and handle errors
3. If something breaks, the agent will self-anneal: fix, test, update

Read [AGENT.md](AGENT.md) for complete operating principles and guidelines.
