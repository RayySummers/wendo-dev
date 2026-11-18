# 新西兰法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。新西兰立法由 Parliamentary Counsel Office（PCO）在 legislation.govt.nz 以英文发布现行合并文本；本库引文全部取自该站与新西兰政府公报（gazette.govt.nz），不使用律所文章、商业数据库或二手翻译。
>
> 语言事实更正：新西兰**没有**以法律指定英语为官方语言。法定官方语言有两个：`Te Ture mō Te Reo Māori 2016 / Māori Language Act 2016` s 5 的毛利语，与 `New Zealand Sign Language Act 2006`（2006 No 18）s 6 的新西兰手语；英语是事实上的通用语与立法语言。任务单里「英语为官方语言之一」的表述与官方文本不符，本库按官方文本订正（见交叉核对 1）。2026-11-18 口径：不因语言地位关闭市场，按英语市场设计并在诊断时提示，见 `index.json` 的 `language_note`（RAY-766）。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | legislation.govt.nz 发布的议会法案现行合并文本 | 是 |
| `official_regulation` | legislation.govt.nz 发布的次级立法（条例）现行合并文本 | 是 |
| `official_gazette` | 新西兰政府公报（gazette.govt.nz）刊登的部长/首席行政官公告 | 是（公告本身即法律文件） |
| `official_regulator` | MBIE / WorkSafe / Commerce Commission / OPC 的指引与说明 | 仅作监管口径，不能替代法条（本版未单独建规则） |
| `secondary` | 律所文章、商业数据库、行业报告 | 否，仅作线索（本版未使用） |

## 主来源

全部为 2026-11-17 用无头 Chromium 打开官方页面、取渲染后可读文本（`document.body.innerText`）后保存；版本信息取自页面顶部版本条。

| ID | 法规 / 文件 | 版本（页面载明） | 官方 URL | 本地文件 | 归一化文本 SHA-256 | 字符数 |
| --- | --- | --- | --- | --- | --- | --- |
| NZ1 | Fair Trading Act 1986（1986 No 121） | 现行版，as at 2026-07-01 | https://www.legislation.govt.nz/act/public/1986/121/en/latest/ | `fta.txt` | `ee47f2a81907aec48b881bf2e15d0aba24382653fcdfad1bf389b7d98422bf20` | 274922 |
| NZ2 | Consumer Guarantees Act 1993（1993 No 91） | 现行版，as at 2026-01-24 | https://www.legislation.govt.nz/act/public/1993/91/en/latest/ | `cga.txt` | `41c0f20e7fddaf7a2abc950d70893b113dd29988961b05fee9d9a2f68b85057c` | 78209 |
| NZ3 | Privacy Act 2020（2020 No 31） | 现行版，as at 2026-10-08 | https://www.legislation.govt.nz/act/public/2020/31/en/latest/ | `priv.txt` | `2d203cf16a43239d85832775a3e3f31448c9c4ca8354e6b6c14c68b7e3cc806e` | 345831 |
| NZ4 | Unsolicited Electronic Messages Act 2007（2007 No 7） | 现行版，as at 2021-10-28 | https://www.legislation.govt.nz/act/public/2007/7/en/latest/ | `uema.txt` | `3fa7414514084d5168a974bcb71c16f5b8e162f18955eb90b226a51132b44075` | 53867 |
| NZ5 | Weights and Measures Act 1987（1987 No 15） | 现行版，as at 2025-03-30 | https://www.legislation.govt.nz/act/public/1987/15/en/latest/ | `wma.txt` | `e77981d387933847eeb5eb241829b7743139f9569270bccd8392537ca28f8301` | 108981 |
| NZ6 | Electricity (Safety) Regulations 2010（SR 2010/36） | 现行版，as at 2026-10-02 | https://www.legislation.govt.nz/secondary-legislation/pco-drafted/2010/36/en/latest/ | `elec.txt` | `483c9928c5c5992917414cb7e69f3bf51a13fdab2fc7d56781338f5fac9a476d` | 492593 |
| NZ7 | Radiocommunications Act 1989（1989 No 148） | 现行版，as at 2025-11-27 | https://www.legislation.govt.nz/act/public/1989/148/en/latest/ | `radio.txt` | `bb986dbef85d4b58533b600384af53a16141cba5c29a7195d198e6ff3bf03348` | 294823 |
| NZ8 | Radiocommunications (EMC Standards) Notice 2019（Gazette 2019-go2372） | 2019-05-30 刊登，2019-06-04 生效 | https://gazette.govt.nz/notice/id/2019-go2372 | `emc.txt` | `ebde18c87e58b0c58b67b8003ed6a79cf788b9447f8ca4586e9e8dc3c6160e39` | 19233 |
| NZ9 | Te Ture mō Te Reo Māori 2016 / Māori Language Act 2016（2016 No 17） | 现行版，as at 2023-04-05 | https://www.legislation.govt.nz/act/public/2016/17/en/latest/ | `maori.txt` | `446b0bb10c1af20348ee363e766cf38456d4e3808ca80be13af7c349981876a6` | 195594 |
| NZ10 | New Zealand Sign Language Act 2006（2006 No 18） | 现行版，as at 2026-07-10 | https://www.legislation.govt.nz/act/public/2006/18/en/latest/ | `nzsl.txt` | `98c91082dd666f39f487ebfac8b9f62765f257465504e12ed1a1dc0e353460a9` | 13597 |

> NZ10 是 2026-11-18（RAY-766）补的，只用于核验语言事实，不产出规则条目：该法 s 6 只宣告新西兰手语为官方语言，未对商品标签、说明书或广告语言设定义务。抓取用下方同一份 Playwright 脚本（把 `nzsl` 加进 `URLS`），连抓两次归一化文本 SHA-256 一致（`98c91082…`）；页面版本条写 `as at 10 July 2026`。字数 13597 是归一化后长度，明显小于其它法的原因是该法本身很短（正文只有 Part 1 与 Part 2 加一个 Schedule，s 6 之后到 s 13 即结束）。
>
> NZ9 不产出规则条目：该法只确立毛利语的官方语言地位，未对商品标签、说明书或广告语言设定义务。列在这里是为了支撑「新西兰无一般性语言强制」这一覆盖结论（见 `README.md` 覆盖矩阵）。
>
> NZ7 不单独产出规则条目：EMC 公告本身不设罚则，罚则路径回到该法 s 128，已在 `NZ-EMC-01`/`NZ-EMC-02` 的 `penalty_or_note` 中引用。

## 复现命令

legislation.govt.nz 前置 AWS WAF，普通 `curl` 会拿到 HTTP 202 与一个「需要 JavaScript」的空壳页（实测：`curl -sS .../DLM96439.html` → 0 字节）。必须用能执行 JS 的客户端取渲染后文本。

```bash
mkdir -p nz-sources && cd nz-sources

cat > fetch.py <<'PY'
import asyncio, sys, hashlib, re
from playwright.async_api import async_playwright

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

def norm(t):
    t = (t.replace("\u2019", "'").replace("\u2018", "'")
          .replace("\u201c", '"').replace("\u201d", '"')
          .replace("\u2014", "-").replace("\u2013", "-").replace("\u00a0", " "))
    for junk in ("Checking for related legislation... Loading...",
                 "Checking for alerts... Loading..."):
        t = t.replace(junk, "")
    return re.sub(r"\s+", " ", t).strip()

URLS = {
    "fta":   "https://www.legislation.govt.nz/act/public/1986/121/en/latest/",
    "cga":   "https://www.legislation.govt.nz/act/public/1993/91/en/latest/",
    "priv":  "https://www.legislation.govt.nz/act/public/2020/31/en/latest/",
    "uema":  "https://www.legislation.govt.nz/act/public/2007/7/en/latest/",
    "wma":   "https://www.legislation.govt.nz/act/public/1987/15/en/latest/",
    "elec":  "https://www.legislation.govt.nz/secondary-legislation/pco-drafted/2010/36/en/latest/",
    "radio": "https://www.legislation.govt.nz/act/public/1989/148/en/latest/",
    "emc":   "https://gazette.govt.nz/notice/id/2019-go2372",
    "maori": "https://www.legislation.govt.nz/act/public/2016/17/en/latest/",
    "nzsl":  "https://www.legislation.govt.nz/act/public/2006/18/en/latest/",
}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        ctx = await b.new_context(user_agent=UA, locale="en-NZ")
        pg = await ctx.new_page()
        for name, url in URLS.items():
            r = await pg.goto(url, wait_until="load", timeout=45000)
            await pg.wait_for_timeout(3500)          # 等版本条与「Loading…」占位消失
            txt = await pg.inner_text("body")
            open(name + ".txt", "w", encoding="utf-8").write(txt)
            print(name, r.status, len(norm(txt)), hashlib.sha256(norm(txt).encode()).hexdigest())
        await b.close()

asyncio.run(main())
PY

python3 fetch.py
```

2026-11-17 复现实测：
- `fta.txt` 重新抓取两次，归一化文本 SHA-256 **完全一致**。
- `elec.txt` 两次抓取存在**仅由页面异步占位符**造成的差异：一次残留 `Checking for related legislation... Loading...` 与 `Checking for alerts... Loading...`，另一次已渲染为 `Versions (18) Empowering Acts (1)`。因此归一化函数先删除这两个占位串再哈希；删除后正文一致。哈希按上表口径计算（`.innerText` → 删除占位串 → 引号/破折号归一 → 空白折叠）。
- 其余 7 份未做二次抓取比对，只做单次核验；重跑上面的脚本可逐份复算。
- `nzsl.txt`（2026-11-18 新增，RAY-766）连抓两次归一化文本 SHA-256 **完全一致**（`98c91082…`），两次分别返回 HTTP 202 与 200——`legislation.govt.nz` 的 WAF 有时先回 202 再渲染，正文一致即可，不要按状态码判失败。

`emc.txt` 是政府公报刊登的公告全文（HTML），**不是** legislation.govt.nz 的法规库条目；公报页面本身即官方发布渠道。

## 交叉核对记录

1. **英语的地位**：`Māori Language Act 2016` s 5 原文只有一句「The Māori language is an official language of New Zealand.」。该法未提及英语；新西兰也没有《官方语言法》式的英语地位条款。另有一部独立的 `New Zealand Sign Language Act 2006`（2006 No 18），其 s 6 原文为「New Zealand Sign Language is declared to be an official language of New Zealand.」，2026-11-18 用无头 Chromium 打开 legislation.govt.nz 现行版（`as at 10 July 2026`）复核确认。因此法定官方语言是毛利语与新西兰手语两个，均不含英语。正确表述是「英语为事实上的通用语与立法语言，法定官方语言为毛利语与新西兰手语」。`Māori Language Act 2016` s 7 另规定在司法程序中有权使用毛利语，与商品标签无关。**同法 s 8(1) 还有一层限制**：原文「Subject to section 7, section 6 does not create any legally enforceable rights.」——把 NZSL 定为官方语言是宣示性条款，不能据此推出「商品标签必须用 NZSL」。所以新西兰仍然**没有**一般性标签语言强制；本库把毛利语/NZSL 的标签义务记为「未建规则」，而不是「义务不存在」，两者不要混。
2. **s 9 没有刑事罚金**：FTA s 40(1) 的罪名清单明确写「except sections 9, 14(2), 23, or 24」，即 s 9（误导性行为的一般禁止）不在罪名内；s 40(1) 的罚则上限为个人 $200,000、法人 $600,000。许多二手资料把 s 9 与 s 13 混为一谈并统一写「最高 60 万」，属误读。`NZ-ADV-01` 的 `penalty_or_note` 因此写「无刑事罚金」。
3. **substantiation 是独立条款**：s 12A 于 2014-06-17 由 Fair Trading Amendment Act 2013 插入，其 (2) 明确「不以陈述虚假为前提」；(3) 留「合理的人不会期待被证明」的例外。这一点与澳大利亚 ACL s 18 的路径不同，规则里已写明。
4. **s 28B 是身份披露而非信息清单**：条文只要求「让潜在买家清楚知道卖方是在贸易中经营的人」，没有规定必须列公司名、注册号或地址。报告措辞不能写成「未列注册号即违规」。
5. **产品安全标准的适用前提**：s 30(1) 只在「该品类已有依 s 29 制定的产品安全标准」时启动。抓取时 legislation.govt.nz 在 s 31 下显示「There is no secondary legislation made under this section currently on this website」，说明该页未挂现行 Unsafe Goods 公告；`NZ-SAFE-02` 的 notes 已记录，不能据此推断「新西兰没有不安全商品公告」。
6. **电气准入的路径**：`Electricity (Safety) Regulations 2010` reg 80(1) 是总要求（必须 electrically safe），reg 80(2) 给出合规路径（AS/NZS 3820 或 Schedule 4 中适用的官方标准）。reg 23 定义「deemed to be electrically unsafe」的若干情形，其中 (a) 是电压未标示、(e)/(f) 是插头不符合 Schedule 4 标准。新西兰插头体系为 AS/NZS 3112，中国国标（GB 2099）与美规两脚插头都不在该体系内。
7. **SDoC 的主体**：reg 83(2)(a) 明文写「the supplier (being the New Zealand manufacturer or importer)」，即声明义务落在新西兰境内的制造商或进口商；海外卖家须通过本地进口方履行。规则里已写明，避免报告要求海外卖家自行出具 SDoC。
8. **罚则等级**：reg 10(2) 定义 level 2 penalty 为个人 ≤ $10,000、其他 ≤ $50,000；reg 10(1) 的 level 1 为个人 ≤ $2,000、其他 ≤ $10,000。不要把「level 2」误读成「二级轻罪」。
9. **EMC 公告的分层**：公告 cl 5(a) 要求符合表 1-6 的适用标准，cl 5(b) 把「合规等级」的具体要求转致 `Radiocommunications (Compliance) Notice 2013 No. 2`。公告自身不设罚则，罚则回到 `Radiocommunications Act 1989` s 128（个人 ≤ $30,000、法人 ≤ $200,000，持续违规每日 ≤ $1,000）。
10. **度量衡的罚则口径**：WMA s 33(3) 为个人 ≤ $10,000、法人 ≤ $30,000，且持续性违规另按日加罚（个人 $100/日、法人 $250/日）。s 33(1) 的 $10,000 只针对 infringement offence，不要混用。
11. **隐私法的域外适用**：Privacy Act 2020 s 4(1)(b) 把「在新西兰开展业务过程中」行事的海外机构纳入，且 (2) 明确信息存储地与个人所在地不影响适用。这是判断隐私条目是否启动的前置条件，不是逐条规则。
12. **IPP 3 不是「同意」**：IPP 3 只要求收集时告知（收集事实、目的、接收方、机构名称与地址），新西兰没有 GDPR 式的 cookie 同意强制。报告不能把「没有 cookie 弹窗」写成违反 IPP 3。
13. **UEMA 的举证责任**：s 9(3) 明定主张「已获同意」的一方负举证责任；s 9(2) 规定退订后 5 个工作日生效。s 45 的民事罚金按 civil liability event 计，个人 ≤ $200,000、机构 ≤ $500,000。
14. **CGA 的罚则路径**：CGA 本身不设罚金，救济是 s 18 的修理/更换/退款与损害赔偿；但 s 43(4) 把「不合规地约定排除 CGA」直接接到 FTA s 13(i)，因此页面写「不退不换」时罚则回到 FTA s 40(1)。两条规则（`NZ-ADV-08`、`NZ-DESC-03`）分别从「陈述」与「条款」两个角度落，不重复计分。

## 未取得 / 未使用的来源

| 文件 | 状态 | 说明 |
| --- | --- | --- |
| AS/NZS 60335 系列（家用电器安全）、AS/NZS 3112（插头）、AS/NZS CISPR 32 等 | 未取得（付费标准，Standards NZ 销售） | 本库只引用法规对「Schedule 4 所列官方标准」的转致，不复制标准条文；具体条款号/版本需购买标准或在检测报告中核对 |
| Radiocommunications (Compliance) Notice 2013 No. 2 | 未取得 | EMC 合规等级的细则（level 1/2/3 各自要求）转致该公告，本版只标「需按该公告判定」，见 open questions |
| Radiocommunications Regulations 2001 | 未取得 | 公告的授权依据；罚则已由 NZ7 s 128 覆盖，未单独引 |
| Consumer Information Standards (Fibre Content Labelling) Regulations 2000 | 未收录 | 家居纺织品（床品、窗帘、地毯）若含纺织纤维，可能另有纤维成分标示义务；本版未建规则，列 v0.2 |
| Energy Efficiency (Energy Using Products) Regulations 2002 | 未收录 | 能效标签按产品类别适用，且同一文件内多处以 Part 重排条号，本版未逐类映射，列 v0.2 |
| Product Safety Standards（儿童玩具、自行车、打火机、蜡烛等） | 未逐个核对 | 与本次品类（小家电/家居/3C）交叉有限；`NZ-SAFE-01` 只作适用性触发 |
| Commerce Commission 指引（Making accurate claims / Environmental claims） | 仅用于口径参考，未建规则 | 抓取时 `comcom.govt.nz` 的栏目页返回 404 或仅剩导航；本版不以指引作为规则来源，避免把「指引」写成「法条」 |
| WorkSafe Energy Safety 的 declared medium risk 清单 | 未取得 | `NZ-ELEC-05` 的适用前提，需在 WorkSafe 站点按品类核对 |
| 食品接触材料（陶瓷/塑料/不锈钢餐具） | 未覆盖 | 属特殊品类，本版范围外 |
| 新西兰版权/商标、WEEE/电池、包装押金 | 未覆盖 | 属其他 Layer 或 v0.2 |

## 引文核验方法

- 抽取：无头 Chromium 打开固定 URL → `document.body.innerText` → 删除两处异步占位串（`Checking for ... Loading...`）→ 引号/破折号/不换行空格归一 → 空白折叠。
- 条文号：以页面渲染出的条号为唯一依据；同一文件内若出现多个同名「Part」各自重排条号（如能效条例），本库不收录，避免条号歧义。
- 对 31 条规则的 `verbatim_excerpt` 逐条做「归一化后子串匹配」，**31/31 命中，0 处不匹配**（匹配范围为对应 `source_id` 的全文）。
- 复验脚本：`agent/knowledge/legal/nz/verify_excerpts.py`。下载完本文件所列来源后运行：

```bash
python3 agent/knowledge/legal/nz/verify_excerpts.py --sources /path/to/nz-sources
# checked 31 excerpts, 0 mismatch(es)
```

- 引文均为连续原文片段，未改写、未拼接；`—` 在归一化后显示为 `-`，与原文的排版差异只此一处。
- 全部来源为数字文本（HTML），**无 OCR 来源**，因此无 OCR 误识风险，也不需要单独标注。
