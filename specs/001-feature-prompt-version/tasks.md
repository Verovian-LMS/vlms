# Tasks: Prompt Version History Tracking

**Input**: Design documents from `/specs/001-feature-prompt-version/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory ✅
   → Tech stack: Python 3.11+, TypeScript 4.9+, React 18+, FastAPI, SQLAlchemy, PostgreSQL
   → Structure: Web application (backend/ + src/)
2. Load design documents ✅
   → data-model.md: 3 entities (Prompt, PromptVersion, VersionComment)
   → contracts/api-contracts.md: 8 REST endpoints
   → research.md: Technical decisions (Myers' algorithm, immutable versions)
   → quickstart.md: 8 user scenarios for validation
3. Generate tasks by category ✅
   → Setup: Database migration, dependencies
   → Tests: Contract tests, integration tests, unit tests
   → Core: Models, services, API endpoints, frontend components
   → Integration: Database connections, authentication, error handling
   → Polish: Performance optimization, accessibility, documentation
4. Apply task rules ✅
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T036) ✅
6. Generate dependency graph ✅
7. Create parallel execution examples ✅
8. Validate task completeness ✅
   → All contracts have tests
   → All entities have models
   → All endpoints implemented
   → All user scenarios covered
9. Return: SUCCESS (tasks ready for execution) ✅
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` (existing FastAPI structure)
- **Frontend**: `src/` (existing React structure)
- **Tests**: `backend/tests/` and `tests/` (existing test structure)

## Phase 3.1: Setup

- [ ] T001 Create Alembic migration for prompt version tables in `backend/alembic/versions/`
- [ ] T002 [P] Add prompt version dependencies to `backend/requirements.txt`
- [ ] T003 [P] Create prompt version types in `src/types/prompt.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests

- [ ] T004 [P] Contract test POST /api/v1/prompts in `backend/tests/contract/test_prompts_post.py`
- [ ] T005 [P] Contract test GET /api/v1/prompts in `backend/tests/contract/test_prompts_get.py`
- [ ] T006 [P] Contract test GET /api/v1/prompts/{id} in `backend/tests/contract/test_prompts_get_by_id.py`
- [ ] T007 [P] Contract test PUT /api/v1/prompts/{id} in `backend/tests/contract/test_prompts_put.py`
- [ ] T008 [P] Contract test DELETE /api/v1/prompts/{id} in `backend/tests/contract/test_prompts_delete.py`
- [ ] T009 [P] Contract test GET /api/v1/prompts/{id}/versions in `backend/tests/contract/test_versions_get.py`
- [ ] T010 [P] Contract test GET /api/v1/prompts/{id}/versions/{version}/compare/{version} in `backend/tests/contract/test_versions_compare.py`
- [ ] T011 [P] Contract test POST /api/v1/prompts/{id}/versions/{version}/revert in `backend/tests/contract/test_versions_revert.py`

### Integration Tests

- [ ] T012 [P] Integration test prompt creation and versioning in `backend/tests/integration/test_prompt_versioning.py`
- [ ] T013 [P] Integration test version comparison in `backend/tests/integration/test_version_comparison.py`
- [ ] T014 [P] Integration test version revert in `backend/tests/integration/test_version_revert.py`
- [ ] T015 [P] Integration test version comments in `backend/tests/integration/test_version_comments.py`

### Frontend Component Tests

- [ ] T016 [P] Component test VersionHistory in `tests/components/version/VersionHistory.test.tsx`
- [ ] T017 [P] Component test VersionDiffView in `tests/components/version/VersionDiffView.test.tsx`
- [ ] T018 [P] Component test VersionComment in `tests/components/version/VersionComment.test.tsx`
- [ ] T019 [P] Component test PromptVersionForm in `tests/components/version/PromptVersionForm.test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Models

- [ ] T020 [P] Prompt model in `backend/app/models/prompt.py`
- [ ] T021 [P] PromptVersion model in `backend/app/models/prompt_version.py`
- [ ] T022 [P] VersionComment model in `backend/app/models/version_comment.py`
- [ ] T023 Update Profile model with prompts relationship in `backend/app/models/user.py`

### Pydantic Schemas

- [ ] T024 [P] Prompt schemas in `backend/app/schemas/prompt.py`
- [ ] T025 [P] Version schemas in `backend/app/schemas/version.py`

### Backend Services

- [ ] T026 [P] PromptService CRUD operations in `backend/app/services/prompt_service.py`
- [ ] T027 [P] VersionService version management in `backend/app/services/version_service.py`
- [ ] T028 [P] DiffService version comparison in `backend/app/services/diff_service.py`

### API Endpoints

- [ ] T029 Prompt management endpoints in `backend/app/api/v1/endpoints/prompts.py`
- [ ] T030 Version management endpoints in `backend/app/api/v1/endpoints/versions.py`
- [ ] T031 Update main API router in `backend/app/api/v1/api.py`

### Frontend Components

- [ ] T032 [P] VersionHistory component in `src/components/version/VersionHistory.tsx`
- [ ] T033 [P] VersionDiffView component in `src/components/version/VersionDiffView.tsx`
- [ ] T034 [P] VersionComment component in `src/components/version/VersionComment.tsx`
- [ ] T035 [P] PromptVersionForm component in `src/components/version/PromptVersionForm.tsx`

### Frontend Hooks and Services

- [ ] T036 [P] usePromptVersions hook in `src/hooks/use-prompt-versions.ts`
- [ ] T037 [P] useVersionDiff hook in `src/hooks/use-version-diff.ts`
- [ ] T038 [P] Prompt API service in `src/services/prompt-api.ts`

## Phase 3.4: Integration

- [ ] T039 Connect PromptService to database in `backend/app/services/prompt_service.py`
- [ ] T040 Connect VersionService to database in `backend/app/services/version_service.py`
- [ ] T041 Integrate authentication middleware for prompt endpoints
- [ ] T042 Add error handling and logging for version operations
- [ ] T043 Add CORS and security headers for new endpoints
- [ ] T044 Create prompt management pages in `src/pages/PromptManagement.tsx`
- [ ] T045 Create version history page in `src/pages/VersionHistory.tsx`
- [ ] T046 Create version comparison page in `src/pages/VersionComparison.tsx`

## Phase 3.5: Polish

- [ ] T047 [P] Unit tests for PromptService in `backend/tests/unit/test_prompt_service.py`
- [ ] T048 [P] Unit tests for VersionService in `backend/tests/unit/test_version_service.py`
- [ ] T049 [P] Unit tests for DiffService in `backend/tests/unit/test_diff_service.py`
- [ ] T050 Performance tests for version operations (< 500ms API, < 1s diff generation)
- [ ] T051 Implement pagination for version lists
- [ ] T052 Implement diff caching for performance
- [ ] T053 Add loading states and error handling to frontend components
- [ ] T054 Implement responsive design for mobile devices
- [ ] T055 Add accessibility features (ARIA labels, keyboard navigation)
- [ ] T056 Update API documentation in `docs/api.md`
- [ ] T057 Run quickstart validation scenarios
- [ ] T058 Remove code duplication and optimize imports

## Dependencies

- **Setup (T001-T003)** before everything
- **Tests (T004-T019)** before implementation (T020-T038)
- **Models (T020-T023)** before services (T026-T028)
- **Services (T026-T028)** before endpoints (T029-T031)
- **Schemas (T024-T025)** before endpoints (T029-T031)
- **Components (T032-T035)** before integration (T044-T046)
- **Hooks (T036-T038)** before integration (T044-T046)
- **Implementation (T020-T038)** before integration (T039-T046)
- **Integration (T039-T046)** before polish (T047-T058)

## Parallel Execution Examples

### Phase 3.1 Setup (T002-T003 can run in parallel)

```
Task: "Add prompt version dependencies to backend/requirements.txt"
Task: "Create prompt version types in src/types/prompt.ts"
```

### Phase 3.2 Contract Tests (T004-T011 can run in parallel)

```
Task: "Contract test POST /api/v1/prompts in backend/tests/contract/test_prompts_post.py"
Task: "Contract test GET /api/v1/prompts in backend/tests/contract/test_prompts_get.py"
Task: "Contract test GET /api/v1/prompts/{id} in backend/tests/contract/test_prompts_get_by_id.py"
Task: "Contract test PUT /api/v1/prompts/{id} in backend/tests/contract/test_prompts_put.py"
Task: "Contract test DELETE /api/v1/prompts/{id} in backend/tests/contract/test_prompts_delete.py"
Task: "Contract test GET /api/v1/prompts/{id}/versions in backend/tests/contract/test_versions_get.py"
Task: "Contract test GET /api/v1/prompts/{id}/versions/{version}/compare/{version} in backend/tests/contract/test_versions_compare.py"
Task: "Contract test POST /api/v1/prompts/{id}/versions/{version}/revert in backend/tests/contract/test_versions_revert.py"
```

### Phase 3.2 Integration Tests (T012-T015 can run in parallel)

```
Task: "Integration test prompt creation and versioning in backend/tests/integration/test_prompt_versioning.py"
Task: "Integration test version comparison in backend/tests/integration/test_version_comparison.py"
Task: "Integration test version revert in backend/tests/integration/test_version_revert.py"
Task: "Integration test version comments in backend/tests/integration/test_version_comments.py"
```

### Phase 3.2 Component Tests (T016-T019 can run in parallel)

```
Task: "Component test VersionHistory in tests/components/version/VersionHistory.test.tsx"
Task: "Component test VersionDiffView in tests/components/version/VersionDiffView.test.tsx"
Task: "Component test VersionComment in tests/components/version/VersionComment.test.tsx"
Task: "Component test PromptVersionForm in tests/components/version/PromptVersionForm.test.tsx"
```

### Phase 3.3 Models (T020-T023 can run in parallel)

```
Task: "Prompt model in backend/app/models/prompt.py"
Task: "PromptVersion model in backend/app/models/prompt_version.py"
Task: "VersionComment model in backend/app/models/version_comment.py"
Task: "Update Profile model with prompts relationship in backend/app/models/user.py"
```

### Phase 3.3 Schemas (T024-T025 can run in parallel)

```
Task: "Prompt schemas in backend/app/schemas/prompt.py"
Task: "Version schemas in backend/app/schemas/version.py"
```

### Phase 3.3 Services (T026-T028 can run in parallel)

```
Task: "PromptService CRUD operations in backend/app/services/prompt_service.py"
Task: "VersionService version management in backend/app/services/version_service.py"
Task: "DiffService version comparison in backend/app/services/diff_service.py"
```

### Phase 3.3 Components (T032-T035 can run in parallel)

```
Task: "VersionHistory component in src/components/version/VersionHistory.tsx"
Task: "VersionDiffView component in src/components/version/VersionDiffView.tsx"
Task: "VersionComment component in src/components/version/VersionComment.tsx"
Task: "PromptVersionForm component in src/components/version/PromptVersionForm.tsx"
```

### Phase 3.3 Hooks (T036-T038 can run in parallel)

```
Task: "usePromptVersions hook in src/hooks/use-prompt-versions.ts"
Task: "useVersionDiff hook in src/hooks/use-version-diff.ts"
Task: "Prompt API service in src/services/prompt-api.ts"
```

### Phase 3.5 Unit Tests (T047-T049 can run in parallel)

```
Task: "Unit tests for PromptService in backend/tests/unit/test_prompt_service.py"
Task: "Unit tests for VersionService in backend/tests/unit/test_version_service.py"
Task: "Unit tests for DiffService in backend/tests/unit/test_diff_service.py"
```

## Notes

- **[P] tasks** = different files, no dependencies
- **Verify tests fail** before implementing (TDD principle)
- **Commit after each task** for clean git history
- **Avoid**: vague tasks, same file conflicts
- **Follow existing patterns** in the codebase for consistency
- **Use existing authentication** and error handling patterns
- **Maintain TypeScript strict mode** and ESLint compliance
- **Follow constitutional principles**: Component-First, API-First, Test-First, Type Safety, Security by Default

## Task Generation Rules Applied

_Based on design documents analysis_

1. **From Contracts (api-contracts.md)**:

   - 8 contract files → 8 contract test tasks [P] (T004-T011)
   - 8 endpoints → 2 endpoint implementation tasks (T029-T030)

2. **From Data Model (data-model.md)**:

   - 3 entities → 3 model creation tasks [P] (T020-T022)
   - 1 relationship update → 1 model update task (T023)
   - 2 schema files → 2 schema creation tasks [P] (T024-T025)

3. **From User Stories (quickstart.md)**:

   - 8 scenarios → 4 integration test tasks [P] (T012-T015)
   - 4 component scenarios → 4 component test tasks [P] (T016-T019)

4. **From Research (research.md)**:
   - Myers' algorithm → DiffService task (T028)
   - Immutable versions → VersionService task (T027)
   - Performance optimization → Polish tasks (T051-T052)

## Validation Checklist

_GATE: All requirements met_

- [x] All contracts have corresponding tests (8/8)
- [x] All entities have model tasks (3/3)
- [x] All tests come before implementation (TDD)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies properly ordered (setup → tests → models → services → endpoints → integration → polish)
- [x] All user scenarios covered in integration tests
- [x] Performance requirements addressed in polish phase
- [x] Security and accessibility considerations included

**Status**: ✅ **READY FOR EXECUTION** - All 58 tasks defined with clear dependencies and parallel execution opportunities
