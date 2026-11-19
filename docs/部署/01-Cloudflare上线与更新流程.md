# Cloudflare上线与更新流程

本站保留 https://physicsexplained.org 和既有文章路径，由 Next.js 静态导出，再通过 Cloudflare Workers Static Assets 托管。本文维护本站可重复操作；实际发布结果见[上线记录](02-上线记录.md)。

## 一、配置与入口

- 通用方法：[全局Cloudflare SOP](../../../../Projects/我的AI助理/共用工具与SOP/Cloudflare/01-网站上线与更新SOP.md)。跨电脑先定位个人库，读不到应说明缺口。
- 广告策略：[全局Adsterra规范](../../../../Projects/我的AI助理/共用工具与SOP/网站广告/01-Adsterra广告形式与接入规范.md)。
- GitHub：`leiwenfans-hue/PhysicsExplained`。
- Cloudflare账号：`75fb37f584344bc26491c8a8c4adecaa`；zone：`86af62140b311d343fcfd5d5b1bf8fdb`。
- Worker：`physics-explained`，配置见根目录 `cloudflare.config.ts`。
- 正式地址：`https://physicsexplained.org`；文章路径保持 `/<slug>`，不添加语言或文章目录前缀。
- 构建：`npm run build`，产物 `out/`；禁止上传源码、环境文件、`.git` 和 `local-data/`。
- 广告参数：`config/ads.ts`，GA4：`app/layout.tsx`。浏览器请求、真实展示、收入分别验收。

## 二、权限与首次上线

1. 执行 `git status --short`、`git ls-remote origin HEAD`；必要时用 `git push --dry-run origin HEAD:main` 核对推送权限。只读公开仓成功不能证明写权限。
2. 使用锁文件安装：`npm ci`。本机首次使用的 Node 为24.13.0；cf 1.0.0-rc.1声明要求 `^22.23.0 || ^24.22.0 || ^26.12.0`，后续环境应使用满足该范围的版本。本次实跑结果单独记录。
3. `npm exec -- cf auth whoami` 核对登录。未登录执行 `npm exec -- cf auth login --no-browser`，由本人在正规页面批准。MCP与cf授权独立；不复制MCP凭证，不将密码、设备码或令牌写入文档。
4. 用Cloudflare MCP读取上述zone的DNS、现有Worker与域名绑定；保留Google和Vercel验证TXT，仅调整本站根域名及www的托管记录。冲突不覆盖其他业务。
5. 执行 `npm run build`、`npm run verify:static`，再执行 `npm exec -- cf deploy ./out --dry-run`。本地检查覆盖全部200篇文章的导出、canonical与sitemap。
6. 获得发布授权后执行 `npm exec -- cf deploy ./out`。记录版本ID和部署结果；请求超时先查询远端，不盲目重复发布。
7. 为Worker关联原域名并核对DNS、HTTPS。正式切换前保存旧记录；本次旧根域名和www均为代理A记录 `216.198.79.1`，不能假设恢复该地址就能恢复已下线的Vercel站。若报100117（已有DNS记录），先核实冲突确为本次迁移的旧记录，再移除该两条并重试绑定；不删除验证TXT或其他记录。绑定成功后由平台管理托管DNS，后续更新不重复删DNS。
8. 验正式域名首页、分类、子分类、全部文章、robots、sitemap和真实404；浏览器抽查桌面、窄屏、导航和正文。记录抽查范围，不把HTTP检查称为视觉验收。

## 三、后续更新

1. 修改源文件，复核 `git diff`，保留其他人的修改。更新内容不更名既有slug；确需改名须配置并验收301。
2. 核对目标账号、Worker、现有部署ID，保存恢复基线。
3. `npm ci` 后执行 `npm run deploy`：顺序为构建、静态检查、上传。同一流程不自动创建新资源、变更DNS或提交GSC。
4. 执行 `npm run verify:live` 并验证本次变更。脚本覆盖sitemap全部地址、导出的全部分类/子分类、首页引用的Next.js资源、www、HTTP转HTTPS及真实404；HTML检查canonical和noindex。明细保存在忽略Git的 `local-data/live-verification.json`，失败会返回非零退出码。网络错误也记为失败，核清原因后才重试，不能忽略失败项。
5. 将源提交、构建时间、部署ID、检查结果填入上线记录，再提交并推送相关源码和文档。**Git push不会自动部署**；内容更新必须完成上述deploy及线上检查。首次上线缺canonical，已补齐；分类和文章canonical均使用原根域名。Cloudflare zone的Always Use HTTPS已开启；www保留可访问，canonical统一根域名，当前没有配置www到根域名301。
6. 本流程为人工或当前AI会话按命令执行；尚未建立定时任务或GitHub Actions自动发布。

## 四、恢复与故障

- 构建或校验失败：不部署，修源后重试。
- 登录失败：走正规授权，不从配置文件提取其他工具凭证。
- DNS/证书未生效：查实际绑定、记录及HTTPS，不反复新建Worker。
- 发布结果未知：先用MCP查询Worker部署/版本，再决定是否重试。
- 新版线上失败：在Cloudflare选择已记录、可用的旧Worker版本恢复，然后重新验正式域名。或检出已验证的旧源版本，按同一构建流程重新发布；注意静态构建时间会改变产物，不能称为原字节恢复。
- 首次上线没有本站旧Worker部署可退；本次未进行破坏性线上回滚演练。
- 不删除旧版本或验证TXT，不修改其他站DNS，不新增付费承诺。

官方依据：[静态资源](https://developers.cloudflare.com/workers/static-assets/)、[cf部署预构建目录](https://developers.cloudflare.com/cf/projects/)。配置与API执行前按当前文档核对。
