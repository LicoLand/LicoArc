# Lico Arc Protocol

[English](README.md)

Lico Arc Protocol 是 LicoLand 的实现中立**协议层（Protocol Layer）**。它拥有
协议语义：封闭 schema 与注册表、确定性 wire 表示、安全与生命周期规则、定义级
一致性语料、内容寻址 Protocol Line 产物以及联邦治理。

产品和实现可以执行一个精确固定的定义或提交提案，但不能重新定义协议。发布、
实现、互操作执行、审计、部署、支持和运营均由各自的下游所有者独立闭环。

## 核心领域模型

本节是 LicoArc 三种领域实体的唯一权威定义。

| 实体 | 定义 | 权威边界 |
| --- | --- | --- |
| **Endpoint（端点）** | 用户控制的受保护通信起点或终点。 | 其密钥、明文、受保护状态、对端接受、本地审批、效果及端点认证证据的唯一运行时权威。 |
| **Station（通讯站）** | 独立运营、负责传输端点保护不透明数据的中间实体。 | Endpoint 始终不信任它；它只有固定 Protocol Line 明确授予的传输权限。 |
| **Network（网络）** | 参与方在同一固定 Protocol Line 下互认通信的联邦互操作上下文。 | 只提供互认与传输上下文；不是信任根、身份权威、明文权威或端点安全权威。 |

```text
Endpoint A ── 端点保护的 LicoArc 通信 ──▶
    Network { 一个或多个不可信 Station } ──▶ Endpoint B
```

每个独立持有密钥的设备或隔离运行时都是独立 Endpoint。Group 是以 Endpoint
为成员的受保护协作对象，不是第四种实体。

## 当前定义

已追踪源图将 `licoarc.protocol-line.v1` 定义为：

| 属性 | 值 |
| --- | --- |
| 生命周期 | `Candidate` |
| 定义状态 | `COMPLETE` |
| 新 session 资格 | `true` |
| 发布资格 | `false` |
| 强制能力 | 9 项，全部 `COMPLETE` |
| 活动 Protection Profile | `stable-core`，`COMPLETE` |

九项强制能力是 Protocol Foundation、Identity、Pairwise Protection、Generic
Messaging、Reliable Exchange、HTTPS Transport、Group Collaboration、
Transferable Evidence 和 Federation Governance。

`stable-core` 是不可拆分的混合构造：成对使用 X25519 与 ML-KEM-768 一次性
prekey，以 Ed25519 与 ML-DSA-65 双重认证，将选择与确认绑定到 transcript，
并使用有界 X25519 Double Ratchet。Profile 与 Protocol Line 身份来自有名称、
无循环依赖的语义投影。证明准入、安全核算及完整声明的一致性语料都是定义准入
的一部分。

`sessionEligible: true` 仅表示 Candidate 定义按机器策略允许认证的新 session
选择；不表示它已发布、已实现、完成互操作、已审计、已部署、受支持或正在运营。

当前规范事实见 [`spec/v1/manifest.json`](spec/v1/manifest.json)、
[`spec/protocol-lines.json`](spec/protocol-lines.json)、
[`spec/protection-profiles.json`](spec/protection-profiles.json) 与
[`docs/STATUS.md`](docs/STATUS.md)。

## 文档

- [产品权威与范围](PRODUCT.md)
- [架构](ARCHITECTURE.md)
- [领域词汇](CONTEXT.md)
- [当前状态](docs/STATUS.md)
- [兼容性与生命周期](docs/COMPATIBILITY.md)
- [协议文档](docs/protocols/)
- [定义验证](docs/conformance/verification.md)
- [决策生命周期](docs/DECISION-LIFECYCLE.md)
- [规范字段注册表](spec/FIELD-REGISTRY.md)
- [正式文档索引](docs/README.md)

运行 `npm run verify` 执行仓库拥有的源完整性检查。这些检查只验证定义图及生成
产物，不声明任何下游执行或交付状态。

许可证：GPL-3.0-or-later。
