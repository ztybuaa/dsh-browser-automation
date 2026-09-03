# 案例构建仓库工作流

本目录是从独立案例构建工作区汇总的海外营销 Browser Use benchmark 数据集快照。它只包含方法、规格和研究文档，不包含插件实现或正式 framework comparison；宿主仓库负责版本发布和 issue 跟踪。

## 事实来源

- `docs/prds/`：数据集 PRD/spec 草案；已同步到宿主仓库的 spec issue。
- `README.md`：长期稳定的项目用途、范围和文档导航。
- `CONTEXT.md`：本仓库的领域术语，只保存词义，不保存 PRD 或实现步骤。
- `docs/adr/`：重要且难以逆转的设计决策及其理由。
- `docs/research/`：案例选择、题目可行性验证和来源研究记录。
- `dataset/questions.md`：唯一题库；JSON 只保存答案示例、schema 或隐藏 evaluator，不重复题面。

## 设计约束

- 案例有真实营销背景，但 Browser Use 执行答案只包含营销分析所需的原始素材。
- 研究对象、平台区域、查询词、时间范围、素材类型和数量在执行前固定。
- fallback 只用于设计阶段筛选题目；正式执行阶段不得替换对象或主题。
- 相关图片可以被理解并按案例要求作为证据；视频内容理解不在当前范围。
- 每道题单独可读，且不得把 reference answer、验证记录或 evaluator 细节提供给被测 agent。

## 文档变更

每次修改前先检查 `CONTEXT.md` 和相关 ADR。范围或验收标准变化时，先更新 PRD 和 ADR，再同步 README 与研究文档。未确认的候选案例不能进入正式题库；正式变更由宿主仓库的 issue 和 ticket 管理。
