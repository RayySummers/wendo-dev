# 人类协助清单（机器取不到、需要人工取得的官方文本）

> 本清单记录「机器取不到、需要人工取得」的官方文本。机器取不到不等于该要求不存在；判据是 RAY-763 的 2026-11-18 实测。

四要素口径：**文件／文号**、**应发布在哪个站**、**机器为什么取不到**、**需要人做什么**。取回后按 `<cc>/docs/` 归档，文件名带日期；回填对应 `SOURCES.md` 与规则条目的 `review_required`。

## 待人工取得

| # | 文件／文号 | 应发布在哪个站 | 机器为什么取不到 | 需要人做什么 |
| --- | --- | --- | --- | --- |
| 1 | QA｜2012 年第 68 号执行条例官方英文译本 | `moci.gov.qa`（英文频道）、`almeezan.qa` | 不存在：`language=en` 不生效、正文阿语（9 拉丁词 / 1858 阿语词） | 向 MOCI 或卡塔尔商会索取官方英文译本；或指定翻译并报给律所核字 |
| 2 | QA｜2018 年第 7 号法（CPL 修订）现行 Art. 18 罚则文本 | `almeezan.qa`（LawID 待查）、官方公报第 28 期 | 线上只显示旧条 + 18 bis，2018 年替换文本未定位 | 用浏览器在 almeezan.qa 站内搜「قانون رقم 7 لسنة 2018」，拿 PDF 回来；或找当地律师确认现行 Art. 18 罚则 |
| 3 | BD｜PDP Act 2026 官方英文 | `bdlaws.minlaw.gov.bd/act-1692.html`（有孟语全文） | 该条目无英文本，English 开关不生效 | 向 Legislative & Parliamentary Affairs Division 索英文版；若已有翻译机构版本，需确认「官方性」再入库 |
| 4 | BD｜Digital Commerce Operation Guidelines 2021 官方英文 | `dco.gov.bd`（连接关闭）、`mincom.gov.bd` | 站点连接关闭（ERR_CONNECTION_CLOSED），非 WAF | 让 Ray/本地人用浏览器试 `dco.gov.bd`；或向 Ministry of Commerce 索英文版 |
| 5 | EG｜PM Decree 822/2019 实施细则 | `cc.gov.eg/legislation/3007991608/`、官方公报 Al-Waqaiʿ | cc.gov.eg 现在整页 403「CC-403-7」；CPA 站只列母法无细则 | 用真人浏览器开 cc.gov.eg（必要时 VPN/异地 IP）；或向 CPA 申请细则副本 |
| 6 | EG｜EOS 强制标准清单 + ES 1781（IEC 60335-1） | `eos.org.eg` 标准目录 | 条目内文需登录（`/ar/checklogin/1/<id>`），无公开强制清单 | 注册 EOS 会员/订阅账号；或向 EOS 书面索取 ES 1781 目录页 |
| 7 | EG｜PDPL 实施细则 MCIT Decision 81/2025 | `mcit.gov.eg` | 本环境连接失败（ERR_NETWORK_CHANGED / CONNECTION_CLOSED） | 让 Ray/当地联系人在浏览器试 mcit.gov.eg；或向 MCIT 索阿语原文 PDF |
| 8 | OM｜RD 68/2026 官方英文译本 | `prod.mtcit.gov.om`、`mociip.gov.om` | 阿语原文已可取（公报 1664 p.91）；无英文本 | 向 MOCIIP/MTCIT 索官方英译；或指定律师译本（第二档） |
| 9 | OM｜TRA 3C 型号核准规则英文 | `tra.gov.om/en/type-approval` | F5/Incapsula WAF，返回 Support ID 反爬页 | 用真人浏览器（可带 cookie）开 `tra.gov.om/en/`；或向 TRA 索英文版型号核准规则 |
| 10 | OM｜MOCIIP / DGSM 官网 OS 标准清单 | `mociip.gov.om`、`dgsm.gov.om`、`omanstandard.gov.om` | 三个域名都 `ERR_CONNECTION_CLOSED`（连接级失败，非 WAF） | 让 Ray 用本地网络重试；确认现行域名后把 OS 标准清单页 PDF 带回 |
| 11 | BN｜PDPO s.24 跨境转移配套条例 | `agc.gov.bn` BruLaw、`pdp.aiti.gov.bn` | 条例尚未公布（PDPO Sch.1–6 均不含跨境；AITI guidance 只有模板） | 书面向 AITI/MOFE 确认配套条例进度；拿到后回填 BN-PRV-05 |

## 已闭环

| 项 | 站点 | 核实结果 |
| --- | --- | --- |
| QA｜CRA 现行 Type Approval 页 | `https://www.cra.gov.qa/en/Services/Telecommunications/Spectrum-Management/Type-Approval` | **200 / 15,764 字符**，正文可引用，比 2011 年那份指南新 |

- 费用：简化流程 **QR 500／件**、标准流程 **QR 1000／件**。
- 申请走 **e-Spectrum**（须先建 e-Spectrum Profile；代申请方需用授权公司 user number 开权限）。
- 必备材料四项：技术规格书、主制造商 DoC、全部 RF 测试报告、技术/操作说明（含安装与网络配置说明）。
- 受理邮箱：`spectrumaffairs@cra.gov.qa` / `type.approval@cra.gov.qa`。
- 访问要点：`cra.gov.qa` **裸域名 404**（956 B），必须带 `www.`；`https://www.cra.gov.qa/` 为 200 / 239,127 B。

> 注：CRA 的 `/-/media/` 媒体端点另有 reCAPTCHA 限流问题（见 `qa/SOURCES.md` 的 S5/S6/S7 访问状态），与上面这个页面不是一回事——页面本身取得得到，附件下载取不到。
