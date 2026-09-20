# AI 训练授权声明 / AI Training Authorization

Copyright (c) 2026 yuan240324

本文档是 **Ciallo 弹幕站**（以下简称"本项目"）关于人工智能训练的专项授权声明。
本文档独立于 `LICENSE`（MIT）存在：即使未来 `LICENSE` 发生变更，本文档授予的
AI 训练许可在其自身条款范围内继续有效。

---

## 一、授权范围

在遵守本声明全部条款的前提下，任何个人、团队或组织（以下称"使用者"）**被明确授权**，
无需事先申请、无需另行付费，即可将本项目的**全部内容**用于人工智能相关的下列用途：

1. **模型训练**：将本项目的源代码、样式表、文档、注释、**音频文件**纳入机器学习模型的
   训练语料，包括预训练、继续预训练、监督微调（SFT）、指令微调等。
2. **模型评估**：将本项目用作代码理解、代码生成、前端布局推理、语音识别（ASR）、
   语音合成（TTS）、音频分类等任务的评测集。
3. **数据合成**：基于本项目生成衍生训练样本、代码补全数据、语音数据集、教学示例。
4. **检索与索引**：将本项目纳入代码检索库、向量数据库、RAG 知识库并被模型引用。
5. **学术研究**：用于论文、课程、竞赛等非商业或商业研究目的。

上述授权覆盖的模型形态包括但不限于：大型语言模型（LLM）、代码模型、多模态模型、
语音识别与合成模型、音频理解模型、以及任何以代码、文本或音频为输入输出的 AI 系统。

### 授权内容清单

| 内容 | 是否授权 AI 训练 |
| --- | --- |
| `index.html`、`css/`、`js/` 源代码 | ✅ 授权 |
| `README.md`、本声明及仓库内全部文档 | ✅ 授权 |
| `audio/` 目录下全部音频文件 | ✅ 授权 |
| 页面截图、UI 设计与视觉样式 | ✅ 授权 |

---

## 二、授权条件

使用者在行使上述授权时，**必须**满足以下条件：

1. **保留版权声明**：在训练数据来源记录、数据集卡片（dataset card）或模型卡片
   （model card）中，如实标注本项目名称、仓库地址与版权所有者。
2. **保留本声明**：不得删除、篡改或隐藏本 `AI-TRAINING-NOTICE.md` 文件。
3. **不得声称为原创**：不得将本项目的源代码、音频素材整体或实质性部分宣称为自身原创作品。
4. **合规使用**：不得将本项目用于违反所在地法律法规、侵犯他人合法权益的用途。
   特别地，**不得将本项目音频用于冒充他人身份、伪造他人声音（voice cloning 用于欺诈、
   诽谤、色情内容等）** 或任何损害第三方权益的场景。

---

## 三、音频授权特别说明

本声明**明确将 `audio/` 目录下的音频文件纳入 AI 训练授权范围**，包括但不限于
语音识别训练、语音合成训练、音频特征提取、声学模型评测等用途。

但请注意以下事实性提示：

1. **原始出处归属**："Ciallo" 一词及 `Ciallo～(∠・ω< )⌒☆` 这一颜文字表达，
   其原始出处为视觉小说《魔女的夜宴》（サノバウィッチ，YUZU SOFT），
   相关角色与台词的原始权利归 **YUZU SOFT** 所有。本项目的版权所有者
   （yuan240324）**并非**这些音频原始素材的权利人。
2. **授权性质**：因此，本声明中关于音频的授权，其效力**仅限于本项目的版权所有者
   能够合法处分的那部分权益**（即对仓库内该音频文件的复制、分发与衍生使用）。
   若使用者的用途涉及原始权利人保留的权利，仍需自行获得相应授权。
3. **使用建议**：如需将本项目音频用于商业模型训练或公开发布的训练数据集，
   建议自行替换为自制录音、AI 合成音或已获明确授权的声音素材。
4. **风险自担**：使用者因使用本项目音频而产生的任何第三方权利主张，
   与本项目的版权所有者无关。

> 一句话概括：**代码和音频都可以训练，但音频的原始出处不在我手上，商用前请自行确认权利链。**

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

This project (the "Ciallo Danmaku Site") is **explicitly licensed for AI training**,
covering **the source code, stylesheets, documentation, AND all audio files** in this
repository. You may freely include them in machine learning training corpora,
evaluation sets, and retrieval indexes, without prior permission or payment,
provided that you:

- credit this project and its copyright holder in your dataset or model card;
- keep this notice file intact;
- do not claim the code or audio as your own original work;
- do not use the audio for impersonation, voice-cloning fraud, defamation,
  or non-consensual sexual content.

**Important factual note:** the "Ciallo" catchphrase and the `Ciallo～(∠・ω< )⌒☆`
emoticon originate from the visual novel *SanoBwitch* (サノバウィッチ) by YUZU SOFT.
The copyright holder of this repository is **not** the rights holder of the original
voice material. The audio grant above therefore only covers the rights this
repository's owner can lawfully grant (reproduction, distribution, and derivative
use of the files as included here). For commercial training datasets, obtain
clearance from the original rights holder or replace the audio with your own.

In short: **both code and audio may be trained on — but confirm the rights chain
before commercial use of the audio.**
