# Lico Arc Protocol

Lico Arc Protocol 是 LicoLand 的**协议层（Protocol Layer）**：它是协议
语义、面向通讯站的 wire 契约与生命周期、封闭 schema、字段及规范要求注册表与策略、
定义级语料、内容寻址协议产物、兼容性及联邦治理语义的实现中立权威。本仓库
是这些协议材料的唯一权威，并检查其确定性的已追踪 source closure。

产品、仓库、实现、Provider、部署及外部协议可以消费 LicoArc 或提交提案，
但绝不能定义它的字段或语义。每一项协议决定都必须服务于
[LicoArc 最终协议愿景](PRODUCT.md#final-protocol-vision)，并进入本仓库拥有的
决策与定义闭环。

## 核心领域模型

本节同步投影
[英文 README 的核心领域模型](README.md#core-domain-model)；该英文段落是
唯一权威定义。其他文档可以简要介绍并链接到那里，但不得自行增加、删除或
重新定义实体及其信任边界。

LicoArc 只承认三种领域实体：

| 实体 | 定义 | 权威与隐私边界 |
| --- | --- | --- |
| **Endpoint（端点）** | 用户控制的受保护通信起点或终点。 | 用户密钥、明文、受保护状态、对端接受、本地信任、审批、效果及端点认证证据的唯一运行时权威。Endpoint 是不可侵犯的隐私边界；Station 与 Network 都不得取得或代行该权威。 |
| **Station（站点）** | 独立运营、负责中转端点保护不透明数据的中间实体。 | 所有 Endpoint 都必须始终将其视为不可信。Station 只有运输权限，不拥有明文、密钥、Endpoint 身份、真实性、完整性、新鲜度、重放判断、审批、效果或最终送达权威。 |
| **Network（网络）** | 参与方在固定 LicoArc Protocol Line 下互认通信的联邦互操作上下文。一个 Network 可以使用一个或多个独立运营的 Station。 | 只提供协议互认与传输上下文。它不得覆盖 Endpoint 决策，也不会因为成员资格、治理、托管、发现或运营而成为信任根、隐私边界、身份权威、明文权威或安全权威。 |

通信不变量是：

```text
Endpoint A ── 端点保护的 LicoArc 通信 ──▶
    Network { 一个或多个不可信 Station } ──▶ Endpoint B
```

每个独立持有密钥的设备或隔离运行时都是一个独立 Endpoint；同一自然人可以
控制多个 Endpoint，但它们的身份和受保护状态不得合并。权威和明文始终留在
Endpoint 内，不可信的 Station 只负责把不透明数据经由 LicoArc 协议互认的 Network 传输到对端
Endpoint；只有接收 Endpoint 可以验证并接受对端、受保护内容及其本地结果。

这里的“唯一权威”指用户安全与隐私的唯一运行时权威；LicoArc 仍是协议语义的
设计期权威。LicoArc 本身是协议，不是第四种运行时实体。用户、Provider、目录、
委员会、Network Host、实现语言和托管服务可以控制、支持、治理或实现系统的
部分能力，但不会因此增加新的 LicoArc 核心领域实体类型。

**Group（群组）**是以 Endpoint 为成员的受保护、版本化协作对象，不是第四种
实体。受保护的 Endpoint Association Claim 可以描述 Endpoint 之间的非权威
关联，但不得合并身份，也不证明共同自然人、设备、账户、所有权或信任。产品
动作继续作为命名空间化的不透明 Payload，而不是协议拥有的命令目录。

## 当前仓库状态

当前仓库线路是生命周期明确为 `Candidate` 的 `licoarc.protocol-line.v1`；
清单与生成 bundle 都以机器可读字段声明这一精确 wire ID 和生命周期。当前
定义事实以英文规范文档 [`docs/STATUS.md`](docs/STATUS.md) 为准。

[规范字段注册表](spec/FIELD-REGISTRY.md) 是当前字段清单的唯一权威。九个能力
的源清单、schema、注册表、边界、向量、语料和生成 bundle 共同形成已规定且闭合
的可变 Candidate；实现只能消费它，不能覆盖它。

Candidate 治理与发布工件采用受限 JSON，并通过 JCS 规范化，配合 JSON Schema
以及内容寻址的 OCI、DSSE 和 TUF 控制；Candidate Endpoint 运行时线数据则采用
由封闭 CDDL 描述的确定性 CBOR、紧凑整数标签和原始 `protectedPacket` body。
该分层、群组协作、Pairwise Protection、Reliable Exchange、HTTPS Transport
Profile、身份连续性与多根阈值治理都已在可变 Candidate 源闭包中规定。

LicoArc 使用自有 schema、字段及规范要求注册表、策略、定义级语料、产物生成
与摘要一致性检查协议定义。`docs/references/` 是被忽略的本地研究材料，不是
已追踪输入或闭环条件。所有实现与真实交付事实均由下游所有者自行闭环，不能
推进或阻塞本仓库。

本文档是 [README.md](README.md) 的简体中文本地化版本；英文 README 为规范
语言版本，两者如有出入以英文版为准。

## 文档

- [核心领域模型（英文权威）](README.md#core-domain-model)
- [产品目标与边界](PRODUCT.md)
- [领域语言](CONTEXT.md)
- [当前状态（英文规范）](docs/STATUS.md)
- [架构设计](ARCHITECTURE.md)
- [决策全生命周期（英文权威）](docs/DECISION-LIFECYCLE.md)
- [算法决策讨论区（英文）](docs/algorithm-decisions/README.md)
- [规范字段注册表（英文唯一权威）](spec/FIELD-REGISTRY.md)
- [字段取舍讨论区（英文）](docs/field-decisions/README.md)
- [协议规范索引](spec/README.md)
- [正式文档索引](docs/README.md)
- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [安全策略](SECURITY.md)
- [变更日志](CHANGELOG.md)
- [许可证](LICENSE)

## 验证

运行 `npm run verify` 检查规范字段注册表及其完整字段说明链接、Candidate
Schema、字段及规范要求注册表、Schema 与字段注册表一致性、规范要求源绑定闭合、
规范要求到证据的可追踪性、一致性
语料、机器可读 wire ID 与生命周期、生成产物、摘要一致性、决策轨道闭合、
逐记录说明章节、决策生命周期元数据与已追踪链接一致性。这些检查只证明定义
源的一致性，不产生实现或交付声明。

许可证：GPL-3.0-or-later。
