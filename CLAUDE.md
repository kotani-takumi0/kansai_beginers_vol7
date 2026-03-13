# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## 実装時の必須ルール（全メンバー共通）

### コードを書く前に必ず読むファイル
1. `.kiro/specs/jimoto-meishi-app/design.md` — 型定義・インターフェース・アーキテクチャ
2. `.kiro/specs/jimoto-meishi-app/requirements.md` — 要件と受入条件
3. `.kiro/specs/jimoto-meishi-app/tasks.md` — タスク一覧と依存関係
4. `.kiro/steering/structure.md` — ディレクトリ構成・命名規則・分担ルール

### 型定義の遵守
- `design.md` に定義された型（MeishiData, Topic, TopicWithStance, ComparisonResult等）を**そのまま使うこと**
- 勝手に型を新規作成・変更しない。型の変更が必要な場合はリードに相談
- すべての型は `src/types/` に配置し、readonly修飾子でイミュータブルに定義する

### ファイル配置ルール
- 担当外のディレクトリのファイルを編集しない
- 共通部品（`src/components/common/`）の変更はリードが行う

### Git運用
- **リード**: Issue単位でブランチを切る（`feature/#Issue番号-短い説明`）
- **相方**: mainに直接push（作業前に必ず `git pull`）

## Minimal Workflow
- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)
