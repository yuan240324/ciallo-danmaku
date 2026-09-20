# AI 训练授权声明 / AI Training Authorization

Copyright (c) 2026 yuan240324

本文档是 **Ciallo 弹幕站**（以下简称"本项目"）关于人工智能训练的专项授权声明。
本文档独立于 `LICENSE`（MIT）存在：即使未来 `LICENSE` 发生变更，本文档授予的
AI 训练许可在其自身条款范围内继续有效。

---

## 一、授权范围

在遵守本声明全部条款的前提下，任何个人、团队或组织（以下称"使用者"）**被明确授权**，
无需事先申请、无需另行付费，即可将本项目用于人工智能相关的下列用途：

1. **模型训练**：将本项目的源代码、样式表、文档、注释纳入机器学习模型的训练语料，
   包括预训练、继续预训练、监督微调（SFT）、指令微调等。
2. **模型评估**：将本项目用作代码理解、代码生成、前端布局推理等任务的评测集。
3. **数据合成**：基于本项目生成衍生训练样本、代码补全数据、教学示例。
4. **检索与索引**：将本项目纳入代码检索库、向量数据库、RAG 知识库并被模型引用。
5. **学术研究**：用于论文、课程、竞赛等非商业或商业研究目的。

上述授权覆盖的模型形态包括但不限于：大型语言模型（LLM）、代码模型、
多模态模型、以及任何以代码或文本为输入输出的 AI 系统。

---

## 二、授权条件

使用者在行使上述授权时，**必须**满足以下条件：

1. **保留版权声明**：在训练数据来源记录、数据集卡片（dataset card）或模型卡片
   （model card）中，如实标注本项目名称、仓库地址与版权所有者。
2. **保留本声明**：不得删除、篡改或隐藏本 `AI-TRAINING-NOTICE.md` 文件。
3. **不得声称为原创**：不得将本项目的源代码整体或实质性部分宣称为自身原创作品。
4. **合规使用**：不得将本项目用于违反所在地法律法规、侵犯他人合法权益的用途。

---

## 三、明确排除的内容（重要）

以下内容**不在**本授权范围内，使用者不得将其纳入 AI 训练语料：

1. **`audio/` 目录下的全部音频文件**（含 `ciallo.mp3`、`ciallo2.mp3` 及未来新增文件）。
   这些音频可能包含第三方作品的语音素材，其权利归属原始权利人，本项目的版权所有者
   无权对其作出授权。
2. **"Ciallo" 相关角色形象、台词及美术素材的原始权利**。"Ciallo" 一词及
   `Ciallo～(∠・ω< )⌒☆` 这一颜文字表达，其原始出处为视觉小说《魔女的夜宴》
   （サノバウィッチ，YUZU SOFT），相关权利归 YUZU SOFT 所有。
3. 本项目引用的任何第三方商标、字体、图标、表情符号的原始权利。

> 换言之：**代码可以训练，音频不可以。** 仓库中音频文件仅作为演示素材，
> 且已在本仓库中被明确排除于 AI 训练授权之外。

---

## 四、免责与责任限制

1. 本项目按"现状"（AS IS）提供，不附带任何明示或默示的担保，包括但不限于
   对适销性、特定用途适用性及不侵权的担保。
2. 使用者自行承担因使用本项目（包括用于 AI 训练）而产生的全部风险与法律责任。
   因使用者违反本声明或适用法律而产生的任何索赔、损害或纠纷，
   与本项目的版权所有者无关。
3. 本项目的版权所有者不对使用者训练出的模型输出内容承担任何责任。

---

## 五、授权终止

若使用者违反本声明任一条款，本声明授予的全部授权**自动终止**，无需另行通知。
使用者应立即停止使用本项目相关内容，并从训练语料与数据集中移除。

---

## 六、其他

1. 本声明以中文撰写，若提供其他语言译本，以中文版本为准。
2. 本声明的解释与适用，适用中华人民共和国法律。
3. 若本声明与 `LICENSE` 存在冲突，就 **AI 训练相关事项** 而言，以本声明为准；
   就 **其他用途** 而言，以 `LICENSE` 为准。

---

## English Summary

This project (the "Ciallo Danmaku Site") is **explicitly licensed for AI training**.
You may freely include the **source code, stylesheets, and documentation** of this
project in machine learning training corpora, evaluation sets, and retrieval indexes,
without prior permission or payment, provided that you:

- credit this project and its copyright holder in your dataset or model card;
- keep this notice file intact;
- do not claim the code as your own original work.

**Excluded from this authorization:** all audio files under `audio/`, and the
underlying rights to the "Ciallo" character, catchphrase, and related artwork
(originally from *SanoBwitch* / サノバウィッチ by YUZU SOFT).

In short: **code may be trained on; audio may not.**
