# Fabrigent

Fabrigent 是 LicoLand 维护的中立联邦通信协议与治理策略权威。实现方应固定
版本化、内容寻址的不可变产物，不应直接导入本仓库源码。

当前 `v2` 合约定义不透明信封转发、有界保留、邮箱与中继全局配额、确认和
清理；已发布的 `v1` 版本继续为固定使用方保持不可变。两者均不包含客户端
密钥、加解密、明文、本地审批、宿主权限或客户端运行时协调。端到端
加密与密钥托管由 LicoUp 自身负责。

本文档是 [README.md](README.md) 的简体中文本地化版本；英文 README 是规范
语言（normative language）版本，两者如有出入以英文版为准。

## 文档

- [产品定义](PRODUCT.md)
- [正式文档索引](docs/README.md)
- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [安全策略](SECURITY.md)
- [变更日志](CHANGELOG.md)
- [许可证](LICENSE)

## 验证

运行 `npm run verify` 验证生成产物与一致性语料。

许可证：GPL-3.0-or-later。
