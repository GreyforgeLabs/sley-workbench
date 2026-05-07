    # Sley Workbench

    Local graph, lint, plan, trace, seal, and ZJX inspection workbench for Sley projects.

Status: public Sley ecosystem scaffold. This repository is intended for public use with a stable, versioned contract surface.

Implementation reality: Sley-native source-of-truth is now in `src/tool.sley`; current Node + browser host is temporary until a Sley emit target is ready.

    ## Why This Exists

    Sley is an agent-native structural language. Source remains the human review
    projection, while the compiler exposes stable JSON surfaces for graph,
    lint, query, edit planning, verification, trace receipts, and ZJX handoff.

    `sley-workbench` exists to make that loop easier for compiler contributors and agent tool builders.

    ## Current Scope

    - Priority: `P0 scaffold`
    - Utility class: `graph and graft workbench`
    - Default mode: local and deterministic
    - Write mode: disabled unless explicitly documented by the command
    - Network calls: none in tests or examples
    - Provider, deploy, spend, wallet, and secret access: not used

    ## Quick Start

    ```bash
    make smoke
    ```

    Useful commands:

    - `sley-workbench --target ../sley/examples/project`
- `sley doctor --json <target>`
- `sley graph --json --slice <node-id> <target>`

    ## Consumed Sley Contracts

    This tool treats Loom, the Sley compiler, as the oracle. It consumes these
    Sley surfaces instead of duplicating compiler logic:

    - `sley.ast.program.v0`
- `sley.symbol_graph.v0`
- `sley.symbol_graph.slice.v0`
- `sley.query.report.v0`
- `sley.lint.report.v0`
- `sley.doctor.report.v0`
- `sley.edit_plan.report.v0`
- `sley.verify.report.v0`
- `sley.trace.seal.v0`
- `sley.zjx.envelope.v0`

    Details live in [`docs/contracts.md`](docs/contracts.md).

    ## Repository Layout

    - `assets/branding/` - repo mark, social card, banner, and generated PNGs
    - `docs/` - architecture, contract, brand, and SEO notes
    - `examples/` - minimal Sley fixtures for local smoke work
    - `test/` - smoke tests that avoid network and external systems
    - `Makefile` - `fmt`, `test`, and `smoke` entry points

    Includes a local-only HTTP server and static UI scaffold with write mode disabled by default.

    ## Release Policy

    This repository is public once:

    - consumed Sley schema versions are declared;
    - deterministic local tests pass;
    - examples work against the current Sley compiler;
    - public-use branding is reviewed;
    - docs avoid private local paths;
    - write paths, if any, preview through `sley fix --dry-run` or
      `sley graft --dry-run` before mutation.

    ## SEO Surface

    Draft SEO title: `Sley Workbench - Sley developer tooling`

    Draft description: Inspect Sley readiness, graph slices, query tables, lint findings, checked repair plans, traces, seals, and ZJX envelopes from one local workbench.

    Future canonical URL: `https://sley.greyforge.tech/tools/sley-workbench`

    GitHub URL: `https://github.com/GreyforgeLabs/sley-workbench`

    ## License

    Apache-2.0. See [`LICENSE`](LICENSE).

    Autonomy, Engineered.
