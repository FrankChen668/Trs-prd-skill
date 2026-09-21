# 输出目标三选一（写作期约束）

> **本文件只管「选哪条路 + 该路的前置约束」。**
> 样式配方（属性层级 / `tc.fill` / `p.jc` / `sz` / 列宽分配 / 合并单元格限制）属纪律层，
> 落在 `dingtalk-doc-writeback` + `reference/style-reference.md`，**不复制到本文件** —— 复制即制造第三份副本。
> 钉钉侧 SSOT 导航入口见工作区根 `钉钉文档样式写入最佳实践.md` §一 指针表。

---

## 一、动笔前先问输出格式

**输出目标决定写作期约束，且必须在 Step 0 与交付模式（`INTERNAL` / `CLIENT-FINAL`）一起定。**
写完再转换拿不到这些约束 —— 表格与层级已经定型，改起来等于重写。

| 输出目标 | 产物 | 前置约束（写作期） | 严格度 |
|---|---|---|---|
| **Markdown** | `.md` 中间稿 | 无。标准表格、简洁层级 | 低 |
| **本地 docx** | `.docx` | 表格与层级从简：**禁多层嵌套列表、禁合并单元格**。否则 pandoc 转出后版式会崩 | 中 |
| **钉钉云文档** | 云端 adoc | **最严**：块级写入。表头加粗可走 markdown，**底色 / 对齐 / 列宽 / 字号必须走 jsonml**；列表块需自造 `p.list`；合并单元格支持差 | 高 |

**严格度递增**（Markdown < docx < 钉钉）⇒ 按最严目标写，向下兼容；按最松目标写，向上要返工。

---

## 二、Markdown 与 Word 友好格式对照

| 格式 | 适用场景 | 特点 |
|---|---|---|
| **Markdown 格式** | 直接查看、GitHub 展示 | 标准表格，简洁 |
| **Word友好格式** | 最终导出 Word | 避免复杂嵌套 |

选择 Word友好格式时，表格与层级从简（不使用多层嵌套列表、合并单元格），
否则 pandoc 导出 `reference.docx` 后版式会崩。

---

## 三、导出路径（主次已定）

**首选：pandoc 直接转换**（本 Skill 自带 `reference.docx` 模板，无需额外 skill）

```bash
# 基础转换
pandoc input.md -o output.docx
# 使用模板 + 自动目录
pandoc input.md --reference-doc=reference.docx --toc --toc-depth=3 -o output.docx
```

- 备选：`md-to-office` skill（同样基于 pandoc，产物一致）
- 备选：内置 `docx` skill 直接生成（格式控制更精确，适合定制需求）
- **钉钉云文档不走 pandoc**：回写走 `dingtalk-doc-writeback`，调用纪律走 `dingtalk-doc-calling`

---

## 四、各目标的验收动作

| 目标 | 验收动作 | 不通过的表征 |
|---|---|---|
| Markdown | 表格渲染正常、层级无跳号 | — |
| 本地 docx | pandoc 转出后**打开看版式**：表格未错位、标题层级未乱、目录正确 | 表格串行 / 标题缩进错乱 / 目录空 |
| 钉钉云文档 | **块级回读比对**：表头加粗在、底色在、列宽未平均化、列表块未丢 | 回读后样式属性缺失、列表消失 |

钉钉回读的具体手法（分页读取 / 429 限流 / unescape）见 `dingtalk-doc-calling`。
用户已手改云端后，只能块级定点编辑，见 `dingtalk-doc-writeback`。
