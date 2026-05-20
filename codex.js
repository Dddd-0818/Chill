// codex.js

'use strict';

const CodexModule = (() => {
  // id: 唯一标识
  // title: 教程标题
  // keywords: 用于搜索的关键词，用逗号分隔
  // description: 教程的详细介绍，支持 <br> 换行
  // action: 点击"前往功能"时执行的跳转函数
  // features: （可选）功能很多时启用二级目录，格式同上
  const TUTORIAL_DATA = [
    // ============================================================
    // 聊天 (Chat) — 主文件模块
    // ============================================================
    {
      id: 'chat',
      title: '聊天 (Chat)',
      keywords: '聊天,对话,消息,角色,chat,conversation',
      description: '聊天是整个系统的核心：你在这里选择一个角色，和 TA 展开真正的对话，让故事一点点往前走。<br><br><b>在开始之前，你必须完成这两件事</b><br>1) <b>建立至少一个角色</b>：所有能在聊天里选到的角色，都来自左侧导航里的<b>角色档案 (Character)</b>。如果你完全没建角色，聊天列表会是空的。<br>2) <b>配好 API</b>：没有 API，AI 收到你的消息也不会回复。你需要去 <b>设置 → API 设置</b>，填好 ENDPOINT / KEY / MODEL，点"保存配置"，再点"设为当前使用"。这两步缺一不可。<br><br><b>完整新手流程（5 步走）</b><br>1) 进入<b>角色档案</b>，点"新建"，至少填一个名字，保存<br>2) 进入<b>设置 → API 设置</b>，新建配置 → 填 ENDPOINT / KEY / MODEL → 保存 → 设为当前使用<br>3) 回到桌面，点"聊天"图标进入聊天<br>4) 在角色列表或邀请列表里找到刚才建的角色，点进去<br>5) 在底部输入框打字，点发送，等待 AI 回复<br><br><b>聊天页有哪些区域？</b><br>- 左侧纵排图标栏：切换不同"分区"（Archive / Guestlist / Group / Sparkle / Dossier）<br>- 中间主区域：当前分区的内容（角色列表、会话列表、群聊、动态等）<br>- 进入单个对话后：顶部有返回与设置按钮，底部是输入区，中间是消息流<br><br><b>没收到 AI 回复？先看这里</b><br>99% 是 API 没配好。去<b>设置 → API 设置</b>检查：配置不是空的、ENDPOINT/KEY/MODEL 都填了、点过"保存配置"、点过"设为当前使用"。<br><br><b>让对话质量更高的小提示</b><br>- 角色档案写得越详细（性格、口癖、背景），AI 回复越贴人设<br>- 世界书里写好世界观设定后，AI 能更自然地把设定带入对话<br>- 对话变长时，用"记忆中枢→提炼更新"压缩历史，防止 AI 忘事',
      features: [
        {
          id: 'chat-choose',
          title: '选择角色进入聊天 (Choose)',
          keywords: '选择角色,进入,choose,roster,邀请',
          description: '你和哪个角色聊，就先选哪个角色。这是进入对话的第一步。<br><br><b>前提检查</b><br>如果列表里没有任何角色，原因只有一个：你还没建角色。去<b>角色档案</b>新建一个，保存后回来重进聊天，角色就会出现。<br><br><b>怎么选（两个入口都可以）</b><br>- 入口 A：切到左侧"Archive"分区 → 看角色画报流 → 点你想聊的那个<br>- 入口 B：切到左侧"Guestlist"分区 → 看邀请列表 → 点对应邀请卡<br><br><b>进入后你会看到</b><br>- 会话页（对话流）：TA 发来的开场白（如果设置了），或者空白等你发第一句<br>- 顶部：角色名 + 返回键 + 设置图标（滑杆）<br>- 底部：输入框 + 发送按钮<br><br><b>常见困惑</b><br>- "点了但没进去"：看看是不是点到了图标以外的区域，重点一下<br>- "进去了但 AI 不说话"：这是 API 问题，不是角色问题，去设置里检查',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-tabs',
          title: '聊天页的侧边栏与分区 (Tabs)',
          keywords: '侧边栏,分区,tab,栏目,Archive,Guestlist,Group,Sparkle,Dossier',
          description: '聊天页左边有一列竖排小图标。它不是装饰，每个图标都是一个独立区域的入口。<br><br><b>每个图标是什么</b><br>- <b>Archive（画报）</b>：角色画报流。每个角色有自己的卡片/画面，你在这里选角色进入对话。这是最常用的入口。<br>- <b>Guestlist（邀请列表）</b>：把角色理解成"来访嘉宾"的名单。你会在这里看到哪些角色正在等你开始对话，点进去和 Archive 一样能进入对话。<br>- <b>Group（群聊）</b>：多角色同时在线的聊天模式。你可以在这里新建群聊，选多个角色一起聊（需要先建好角色）。<br>- <b>Sparkle（动态）</b>：像一个小广场/朋友圈。你可以在这里发动态，也能看到角色们发的内容（如果 Agent 后台生态是开着的）。<br>- <b>Dossier（档案）</b>：你自己的个人主页/名片页，这里可以展示/编辑你的身份信息。<br><br><b>怎么用</b><br>直接点左边的图标就能切换。如果你在某个分区里进了二级页面，点左上角的返回可以回到分区首页，不会直接退出聊天。<br><br><b>常见困惑</b><br>- "Archive 和 Guestlist 有什么区别"：内容来源一样，只是展示形式不同；Archive 是画报流，Guestlist 是列表。习惯哪个用哪个。<br>- "Sparkle 里什么都没有"：需要先开启 Agent 引擎的"主动发帖"，角色才会自动在这里更新内容；或者你自己手动发一条试试。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-send',
          title: '发送消息 (Send)',
          keywords: '发送,消息,send,输入,换行,语音输入',
          description: '在对话页底部的输入框里写内容，发送给角色，等待 AI 回复。听起来很简单，但写法会很大程度影响回复质量。<br><br><b>基础操作</b><br>- 点击底部输入框，键盘弹出，开始输入<br>- 输完后点右边的发送按钮（或键盘上的"发送/确认"）<br>- 等待 AI 生成回复（通常 1–10 秒，取决于模型和网络）<br><br><b>怎么写才能获得好回复</b><br>- <b>想推剧情</b>：把"发生了什么 / 你做了什么 / 你想要什么结果"写清楚。例如："我推开了那扇锈迹斑斑的门，走进房间，看见你正坐在窗边。"<br>- <b>想要沉浸感</b>：多写感受、细节、动作。例如："我有些紧张，手心微微出汗。"<br>- <b>想调整风格</b>：直接告诉 AI："接下来请用更诗意的方式回复" 或 "请保持简短"，大多数模型会听的。<br>- <b>想纠正 AI 的走向</b>：直接发一条"【OOC: 请不要让角色这样做，改成……】"（OOC = Out of Character，表示你在跳出剧情说话）。<br><br><b>常见问题</b><br>- "发出去了但没有回复"：一定是 API 问题，不是发送功能坏了。去设置检查。<br>- "回复内容显示不完整"：可能是 max_tokens 太低，去 API 设置里把"最大 Token"调高。<br>- "AI 一直重复同样的话"：Temperature 太低，调到 0.7–0.9 试试。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-tools',
          title: '消息工具栏与管理 (Message Tools)',
          keywords: '工具,管理,复制,编辑,引用,撤回,重roll,长按,操作菜单',
          description: '每条消息都有配套的操作工具，用来管理对话内容。<br><br><b>怎么唤出工具</b><br>通常是：长按一条消息（或点消息旁边的 … / 更多按钮），弹出操作菜单。<br><br><b>常见工具说明</b><br>- <b>复制</b>：把这条消息的文字复制到剪贴板，方便粘贴到别处用<br>- <b>编辑</b>：直接修改这条消息的内容（通常只能编辑自己发的消息）<br>- <b>引用 / 回复</b>：把这条消息作为上下文引用，然后你再补充新内容发出去<br>- <b>撤回</b>：把这条消息从对话里删掉（AI 不会再"记得"它，但本地历史可能保留）<br>- <b>重 Roll / 重新生成</b>：让 AI 重新回复这条消息。如果你觉得 AI 回的不好，用这个让它再试一次。每次重 Roll 都会产生新的回复，你可以左右划选择最喜欢的那版。<br><br><b>小提示</b><br>- 重 Roll 是最常用的功能之一：遇到不满意的回复，先重 Roll，再考虑改写 Prompt<br>- 编辑自己的消息后，后面 AI 的回复也可以重新生成，让剧情走另一条路<br>- 不同版本的回复之间可以互相切换，类似"多时间线"',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-switch-api',
          title: '聊天内切换 API 配置 (Switch API)',
          keywords: '切换api,切换配置,api配置,profile,endpoint,key,model,当前使用,switch',
          description: '你可以在聊天过程中随时切换"当前使用的 API 配置"，不用退出聊天回设置页。<br><br><b>什么时候需要切换</b><br>- 想换一个更快/更慢的模型对比效果<br>- 临时切换到另一个服务商<br>- 原来的配置额度用完了，换备用配置继续聊<br><br><b>怎么找到切换入口</b><br>通常在聊天页顶部工具栏、或者侧边栏里，会有一个显示"当前模型名/配置名"的区域，点一下可以展开选择列表。<br><br><b>切换操作流程</b><br>1) 找到 API 配置入口（看顶部或更多菜单）<br>2) 点开后看到你在"设置 → API 设置"里保存过的所有配置<br>3) 点你想换的那个<br>4) 确认它变成"当前使用"状态了<br>5) 继续发消息，接下来的回复就会用新配置<br><br><b>注意事项</b><br>- 切换只影响"切换后发出的新消息"，历史消息不会重新生成<br>- 如果切换后 AI 不回复，说明新配置本身有问题，去设置页检查这条配置的 ENDPOINT/KEY/MODEL<br>- 如果列表里只有一个配置，那就去设置里多建几个备用的',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-stickers',
          title: '表情包与贴纸 (Stickers)',
          keywords: '表情包,贴纸,emoji,sticker,gif,图片表情,斗图,emote',
          description: '在聊天输入区附近会有贴纸/表情功能入口，用来发送图片表情，强化情绪表达。<br><br><b>怎么打开</b><br>在输入框旁边找到"表情/贴纸/图片"图标，点开后会看到贴纸选择面板。<br><br><b>添加贴纸</b><br>通常在贴纸面板里有一个"+"或"上传"按钮，你可以把自己准备好的图片/GIF 上传进去，之后就能在聊天里一键发送。<br><br><b>发送贴纸</b><br>1) 打开贴纸面板<br>2) 点你想发的那个<br>3) 贴纸会以图片气泡的形式发送到对话里<br><br><b>AI 会对贴纸有反应吗？</b><br>如果你发了一张贴纸，AI 可能会描述自己看到了什么，也可能直接回应你的情绪。如果你想让反应更准确，可以在贴纸后面补一句话说明你的意图，例如："（甩出一个翻白眼的表情）"。<br><br><b>管理贴纸</b><br>你上传过的贴纸会保存在本地贴纸库里，下次打开面板还能用。想删除可以在贴纸管理区长按/点删除按钮。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv',
          title: '会话页：真正的对话流 (Conversation)',
          keywords: '会话页,对话流,conv,conversation,消息流,load more,滑杆,历史记录',
          description: '从聊天列表点进某个角色后，你就进入了"会话页/对话流"。这是你和这个角色的所有消息汇聚的地方。<br><br><b>你会看到什么</b><br>- <b>顶部区域</b>：左边是返回键（回角色列表），中间是角色名，右边是"设置（滑杆图标）"按钮<br>- <b>消息流（中间）</b>：所有历史消息从上到下排列。你的消息靠右，AI 的消息靠左。<br>- <b>Load More 按钮</b>：如果历史消息很多，最顶部会有这个按钮，点一下可以往上加载更早的记录<br>- <b>底部输入区</b>：你的打字区域 + 各种工具按钮（发送/贴纸/语音等）<br><br><b>重要的高级功能都藏在这里</b><br>点右上角的"滑杆图标"会打开会话设置面板，里面有：<br>- 记忆中枢（提炼历史/封存世界书）<br>- 离线主动联络<br>- 别名与双语<br>- 对话页 CSS 美化<br>- 危险操作（清空记录）<br><br><b>实用建议</b><br>和一个角色聊久了（几十轮以上），记得去会话设置里提炼一次记忆，减少 AI 忘事、跑题的概率。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv-settings',
          title: '会话设置面板 (Conversation Settings)',
          keywords: '会话设置,设置面板,滑杆,齿轮,conv settings,开关,slider,配置',
          description: '在会话页右上角点击"滑杆（三条线加小圆圈）"图标，就能打开当前会话的设置面板。<br><br><b>这个面板里有什么</b><br>1) <b>记忆中枢</b>：提炼更新、封存世界书、查看当前记忆摘要<br>2) <b>离线主动联络</b>：开关 + 时长设置（多久没上线后角色主动来找你）<br>3) <b>别名与双语</b>：改称呼方式、开启双语模式<br>4) <b>Custom CSS</b>：给这个对话页单独换皮肤<br>5) <b>危险区</b>：清空聊天记录 / New Chapter<br><br><b>怎么打开</b><br>进入某个角色的对话 → 看顶部右边 → 找滑杆图标 → 点击 → 面板从底部弹出（或侧边展开）<br><br><b>小提示</b><br>这个面板是"每个对话独立的"——你在 A 角色的会话里改了 CSS，不会影响 B 角色的对话。如果你想让多个对话用同一套皮肤，就在各自的 CSS 里存成预设，然后分别应用。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv-memory-refine',
          title: '记忆中枢：提炼更新 (Memory Refine)',
          keywords: '记忆中枢,提炼更新,summary,refine,指定轮数,潜意识,总结,摘要',
          description: '当对话变得很长，AI 容易"忘事"或者跑题。"提炼更新"就是把长对话压缩成精华要点，帮 AI 记住真正重要的事。<br><br><b>为什么需要这个</b><br>AI 的"工作记忆"是有限的（叫 Context Window）。当历史消息太多，最早的那些就会被"挤出去"，AI 开始忘记剧情里发生过的事。提炼就是把关键信息"固化"成摘要，让它始终跟着对话走。<br><br><b>怎么用</b><br>1) 打开会话页 → 点右上角滑杆图标 → 进入会话设置<br>2) 找到"记忆中枢"区域<br>3) （可选）在"指定轮数"输入框填数字：只提炼最近 N 轮对话；不填就提炼全部<br>4) 点"提炼更新"<br>5) 等待 AI 生成摘要（通常 5–30 秒）<br>6) 完成后可以在摘要区看到提炼结果，检查要点是否完整<br><br><b>提炼的内容要包含什么</b><br>- 角色关系现状（感情走到哪了、有没有冲突/承诺）<br>- 关键事件（发生过什么大事）<br>- 约定与秘密（角色之间知道什么秘密、约好了什么）<br>- 当前场景（现在在哪里/什么时间）<br><br><b>不要提炼的时候做什么</b><br>- 提炼越细越长不一定越好：100 字以内的精炼摘要比 500 字的流水账有效<br>- 建议每 20–30 轮提炼一次，不要等到几百轮再提<br>- 提炼完后可以手动补充/修改摘要，比如 AI 漏了某个重要细节',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv-archive-worldbook',
          title: '封存世界书 (Archive to WorldBook)',
          keywords: '封存世界书,archive,worldbook,篇章,章节,关键词,唤醒,经历变设定',
          description: '这个功能可以把你们经历过的事情"固化"成世界书词条，让角色在之后的对话里能"想起"这段历史。<br><br><b>使用场景</b><br>你们经历了一段很重要的剧情（比如一场旅行、一次决裂、一次表白），但你不想靠记忆摘要来保留它——你希望这段经历变成这个世界里永久存在的"设定"，之后只要聊天提到关键词，AI 就能自然想起来。<br><br><b>怎么用</b><br>1) 会话设置 → 记忆中枢<br>2) 找到"封存世界书"按钮<br>3) 点击后填写：<br>&nbsp;&nbsp;&nbsp;- 词条名称（例如"第一次去海边"）<br>&nbsp;&nbsp;&nbsp;- 唤醒关键词（例如"海边,那次旅行,贝壳"——聊天里提到这些词就会触发）<br>&nbsp;&nbsp;&nbsp;- 内容（AI 会帮你生成，你也可以手动补充/修改）<br>4) 确认保存，这条词条就会进入世界书<br><br><b>关键词怎么设</b><br>- 要具体，不要太泛。"海边"比"旅游"好；"夏日祭"比"节日"好<br>- 多设几个近义词/相关词，防止 AI 用了不同说法而没触发<br>- 一个词条 3–5 个关键词是比较合理的量<br><br><b>和普通记忆摘要的区别</b><br>摘要是"上下文里总是带着的背景"，词条是"被提到才会想起的设定"。两个结合用效果最好。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv-offline-proactive',
          title: '离线主动联络 (Offline Proactive)',
          keywords: '离线主动联络,离线消息,失联,offline,小时,主动分享,主动找你',
          description: '当你超过一定时间没有上线，角色可能会主动给你发消息。这个功能让关系感觉更像"真实在继续"，而不是你去聊才有动静。<br><br><b>功能详情</b><br>- 你可以设置一个"失联时长阈值"（比如：4 小时、8 小时）<br>- 当你超过这个时长没上线，系统会让角色主动发消息过来<br>- 消息内容由 AI 生成，会根据角色设定来决定说什么（可能是分享生活、也可能是想念你）<br>- 有时候还会配图或语音（取决于你开了哪些功能）<br><br><b>怎么设置</b><br>1) 会话设置（右上角滑杆） → 找"离线主动联络"区域<br>2) 把开关打开（切到 ON）<br>3) 拖动时长滑块，设置多少小时触发<br>4) 保存（通常改完自动保存）<br><br><b>注意事项</b><br>- 这个开关是"每个会话独立的"，给 A 角色开了不影响 B 角色<br>- 触发需要 API 能用，否则生成不了内容<br>- 时长不要设太短（比如 1 小时），否则角色会"太黏人"，消息频率太高',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv-alias-translate',
          title: '别名与双语 (Alias & Bilingual)',
          keywords: '别名,昵称,alias,双语,translate,bilingual,开关,称呼,日语,英语',
          description: '会话设置里可以给角色设置"别名/昵称"，也可以开启双语回复模式。<br><br><b>别名是什么</b><br>当你叫角色"小美"，但 TA 的档案名是"Amelia"，你可以在这里设别名，让称呼方式更自然、更贴合你们的关系。<br><br><b>双语模式是什么</b><br>开启后，AI 的每条回复会同时呈现两种语言（比如中文 + 日文 / 中文 + 英文）。适合：<br>- 用这个 App 练习外语<br>- 某些角色本来就是外国人，用母语说话更贴角色感<br>- 想对照原文学习某种表达方式<br><br><b>怎么设置</b><br>1) 打开会话设置（右上角滑杆）<br>2) 找到"别名/双语"区域<br>3) 别名：在输入框里填你想用的称呼<br>4) 双语：打开开关，并选择第二种语言<br>5) 改完后发一条消息看效果',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv-custom-css',
          title: '对话页 CSS 美化 (Custom CSS)',
          keywords: 'css,美化,主题,预览并应用,复制默认源码,预设,preset,皮肤,气泡,颜色',
          description: '你可以给某个对话页单独写 CSS，改变气泡颜色、字体、背景等视觉效果，让这个对话空间有自己的风格。<br><br><b>界面里有什么</b><br>- <b>复制默认源码</b>：把系统默认 CSS 复制到剪贴板，方便你以它为模板开始修改<br>- <b>代码输入框</b>：把你的 CSS 粘贴/编辑到这里<br>- <b>预览并应用</b>：在当前对话页实时预览效果；确认满意后效果就固定了<br>- <b>恢复默认</b>：一键清掉你写的所有自定义 CSS，恢复原始样式<br>- <b>存为预设</b>：把当前这套 CSS 存成一个命名预设，之后其他对话也能快速调用<br><br><b>新手推荐流程</b><br>1) 点"复制默认源码"<br>2) 打开文本编辑器或直接在输入框里粘贴<br>3) 修改你想改的内容，比如：<br>&nbsp;&nbsp;&nbsp;- 气泡背景色：找到 `bubble` 相关变量改颜色值<br>&nbsp;&nbsp;&nbsp;- 字体大小：找到 `font-size` 改数值<br>4) 粘贴回输入框，点"预览并应用"<br>5) 如果满意，再点"存为预设"给它命名，之后能复用<br><br><b>如果你不懂 CSS</b><br>在聊天里问 AI："帮我写一段 CSS，让聊天气泡变成淡粉色，文字用深紫色，字号稍大一点"，把 AI 生成的代码粘贴进去预览就好。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv-clear-history',
          title: '危险区：清空记录 / New Chapter',
          keywords: '清空记录,清空历史,danger,new chapter,保留潜意识,keep memory,重开',
          description: '会话设置最底部的"危险区"里，有清空对话历史的选项。<br><br><b>有哪些操作</b><br>- <b>清空全部记录</b>：把这个对话的所有聊天消息删掉，从空白重新开始<br>- <b>New Chapter / 开新篇（部分版本有）</b>：清空消息记录，但保留提炼后的"潜意识记忆摘要"，相当于重开一章但角色还记得之前发生过什么<br><br><b>两者的区别</b><br>- 普通清空：一切归零，角色完全失忆<br>- New Chapter：消息清了，但摘要还在，AI 下一章开始时能大致衔接之前的剧情<br><br><b>操作前务必</b><br>1) 先想想有没有重要的对话内容你想留着 → 去截图或复制<br>2) 如果有重要剧情 → 先去"记忆中枢 → 封存世界书"，把它存进设定<br>3) 如果你有开云同步 → 先 PUSH 一次备份<br>4) 去"设置 → 数据设置 → 导出备份包"做本地备份<br><br><b>注意</b><br>- 清空通常是<b>不可逆</b>的，没有"撤销"按钮<br>- 点击前系统一般会弹出二次确认，确认前再想一次',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-conv-image-viewer',
          title: '图片查看器 (Image Viewer)',
          keywords: '图片查看器,下载,重新生图,viewer,download,regen,全屏,长按',
          description: '在对话里，角色发来的图片（或你触发生图后的结果）可以点进去全屏查看。<br><br><b>怎么进入查看器</b><br>点对话里的图片气泡，就会进入全屏图片查看器。<br><br><b>查看器里能做什么</b><br>- <b>全屏看清楚</b>：放大细节，避免在气泡里看不清<br>- <b>下载图片</b>：点"下载"按钮，保存到本地相册/文件夹<br>- <b>重新生图（部分场景）</b>：如果这张图是 AI 生成的，查看器里可能会出现"重新生图"按钮，点击后 AI 会用同样的 Prompt 生成一张新的，不满意可以一直重生<br><br><b>小提示</b><br>- 在有些设备上，你也可以长按图片然后选择"保存"（系统菜单）<br>- 如果"重新生图"按钮不出现，说明这张图不是由 Novel（生图模块）生成的，或者你的 Novel 配置有问题',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-invitations',
          title: '邀请列表 (Guestlist)',
          keywords: '邀请,Guestlist,邀请卡,列表,访客',
          description: 'Guestlist 是聊天页左侧的"邀请列表"分区，把所有可以对话的角色以"来访嘉宾"的形式列出来。<br><br><b>这里显示什么</b><br>- 你在角色档案里建好的所有角色<br>- 每个角色一张邀请卡，卡上通常有头像、名字、简介<br>- 如果和某个角色有未读消息，可能会有角标提示<br><br><b>前提</b><br>如果 Guestlist 是空的，只有一个原因：你还没建角色。去<b>角色档案</b>新建一个，回来刷新就能看到。<br><br><b>怎么用</b><br>1) 点左侧 Guestlist 图标切换到这个分区<br>2) 看卡片列表，找你想聊的角色<br>3) 点一下邀请卡<br>4) 进入详情页确认，然后进入对话<br><br><b>和 Archive 的关系</b><br>两个入口都能进入同一个角色的对话，只是展示形式不同。Archive 更像"画报/封面"，Guestlist 更像"名单列表"，看你喜欢哪种方式找角色。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-group-chats',
          title: '群聊 (Group Chat)',
          keywords: '群聊,Group,新建,成员,多人,群组,Host',
          description: '群聊让你同时和多个角色对话，像在一个真实的聊天群里一样。<br><br><b>前提</b><br>- 群聊成员必须先在<b>角色档案</b>里建好<br>- 通常需要至少 2 个角色才能创建群聊<br>- API 也必须配好，否则角色不会回复<br><br><b>怎么创建群聊</b><br>1) 点左侧 Group 图标进入群聊分区<br>2) 点"New Group Chat"（新建群聊）<br>3) 选择"Host Identity"：你在这个群里以什么身份出现（相当于你的群昵称）<br>4) 从角色列表里勾选你想加入的成员（2 个以上）<br>5) 确认创建<br><br><b>群聊里怎么聊</b><br>- 你发一条消息后，群里的角色们会依次回复<br>- 可以用 @ 来指定某个角色回复（例如"@小美 你怎么看？"）<br>- 角色之间也可能互相对话，不一定每次都找你<br><br><b>注意事项</b><br>- 群聊里每个角色各自保持自己的人设，但"群体对话"的质量通常比一对一低一些，因为 AI 需要同时模拟多个角色<br>- 群聊越小越好控制：2–3 个角色比 10 个角色效果好得多',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-sparkle',
          title: '动态发布 (Sparkle)',
          keywords: '动态,发布,Sparkle,Feed,广场,图片,Publish,发帖',
          description: 'Sparkle 是聊天页里的"动态/小广场"分区，你可以在这里发帖，也能看到角色们发的内容。<br><br><b>这个分区里有什么</b><br>- 你自己发的动态<br>- 角色们通过 Agent 后台自动发的内容（如果你开了 Agent）<br>- 每条动态可以配文字和图片<br><br><b>怎么发动态</b><br>1) 点左侧 Sparkle 图标进入分区<br>2) 点右下角的铅笔/编辑按钮（New Entry / 新建动态）<br>3) 在弹出的编辑框里写内容<br>4) 想加图片就点图片按钮上传<br>5) 点"Publish"发布<br><br><b>动态里的角色互动</b><br>如果你开了 Agent 引擎，角色可能会对你的动态作出反应（评论、点赞等）。想快点有反应，去设置 → Agent 设置里点一下"Debug 唤醒"强制触发。<br><br><b>和回声沙龙的关系</b><br>Sparkle 是在聊天页内的"个人动态流"，主要是你和你的角色圈子；回声沙龙（Forum）是更大的社区广场，有不同板块（广场/树洞/世界事件）。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-dossier',
          title: '个人主页/身份档案 (Dossier)',
          keywords: '个人主页,身份,档案,Dossier,拉链,zipper,名片,资料',
          description: 'Dossier 是你在这个聊天世界里的"个人名片"。这里展示你的身份，也能折叠侧边栏来获得更宽的视野。<br><br><b>这里有什么</b><br>- 你的名字、头像、个人简介等展示信息<br>- 可能有你和各角色的关系状态概览<br>- 一个"拉链"按钮，用来折叠/展开侧边栏（让页面更宽）<br><br><b>怎么用</b><br>1) 点左侧 Dossier 图标进入分区<br>2) 查看你的当前档案信息<br>3) 想更新信息：按页面提示点击对应区域编辑<br>4) 想折叠侧边栏：点"拉链"图标，侧边栏收起，给主区域腾出空间<br>5) 再点一次拉链：侧边栏恢复展开<br><br><b>小提示</b><br>Dossier 的信息会影响 AI 怎么称呼你、以及某些角色和你的互动方式。建议至少把名字和简单的描述填一下。',
          action: () => Router.go('chat')
        },
        {
          id: 'chat-api-prereq',
          title: 'AI 不回复？API 排查指南',
          keywords: 'api,不回,报错,key,endpoint,模型,设置,排查,401,403,error',
          description: '发了消息但 AI 没有回复，或者显示报错——绝大多数情况都是 API 配置问题，不是软件坏了。按下面的步骤逐一检查。<br><br><b>第 1 步：确认有配置</b><br>进入<b>设置 → API 设置</b>。"选择配置"下拉框里是否有内容（不是"+ 新建配置"那一条）？如果没有，先新建一个。<br><br><b>第 2 步：确认配置内容完整</b><br>选中你的配置，检查三个字段：<br>- ENDPOINT：必须有（例如 `https://api.openai.com` 或 `https://api.openai.com/v1`，两种都接受）<br>- KEY：必须有（例如 `sk-xxx...`，注意别多空格/少字符）<br>- MODEL：必须有（例如 `gpt-4o`、`claude-3-5-sonnet-20241022`）<br><br><b>第 3 步：确认点了"保存配置"</b><br>只填内容不等于保存。填完后要点一次"保存配置"按钮，页面提示成功才算存好。<br><br><b>第 4 步：确认点了"设为当前使用"</b><br>保存不等于在用。你还需要再点一次"设为当前使用"——这才是告诉系统"聊天用这套配置"。这一步是最常见的遗漏。<br><br><b>第 5 步：回到聊天再试一次</b><br>改好后，重新进入对话，发一条简单的消息测试（比如"你好"）。<br><br><b>常见报错含义</b><br>- 401 / Unauthorized：KEY 填错了，或者过期了<br>- 403 / Forbidden：KEY 没权限用这个模型，或者账户欠费<br>- 404 / Not Found：ENDPOINT 填错了，或者模型名拼写有误<br>- 429 / Rate Limit：请求太频繁，等一下再试，或者换一个 KEY<br>- 500 / Server Error：服务商那边的问题，稍后重试<br><br><b>还是不行？</b><br>- 把 ENDPOINT 复制出来在浏览器里打开，看看能不能访问<br>- 把 KEY 复制出来，去服务商官网/控制台确认它还有效',
          action: () => Router.go('settings')
        }
      ],
      action: () => Router.go('chat')
    },

    // ============================================================
    // 角色档案 (Character) — 主文件模块
    // ============================================================
    {
      id: 'character',
      title: '角色档案 (Character)',
      keywords: '角色,档案,人设,AI,卡司,casting,character,新建,编辑,persona,面具',
      description: '角色档案是你建立和管理"聊天对象"的地方。你想和谁聊，想给 TA 设定什么性格和背景，都在这里完成。<br><br><b>角色档案和"面具 (Persona)"的区别</b><br>- <b>角色档案</b>：你的聊天对象，比如"小美"这个角色，TA 是 AI 扮演的<br>- <b>面具 (Persona)</b>：你自己在聊天里的身份，比如你叫什么、你是谁<br>两个是不同东西，别搞混。<br><br><b>你能做什么</b><br>- <b>新建角色</b>：给 AI 一个"人设"，让 TA 以这个设定和你对话<br>- <b>编辑角色</b>：随时改设定，改完保存后聊天就会用新设定<br>- <b>管理角色列表</b>：有很多角色时可以排序、归档、删除<br><br><b>新建角色推荐填什么</b><br>1) <b>名字（必填）</b>：角色叫什么<br>2) <b>外观/描述</b>：外貌特征、穿着风格<br>3) <b>性格</b>：TA 是什么性格的人（温柔/毒舌/傲娇/冷静等）<br>4) <b>背景故事</b>：TA 经历过什么、家庭/职业/特殊经历<br>5) <b>口癖/说话方式</b>：TA 习惯用的词、说话风格（例如喜欢用反问、爱说"你懂吗"）<br>6) <b>开场白</b>：你们第一次见面时 TA 说的第一句话<br><br><b>保存后会发生什么</b><br>系统会把你填的内容整理成更结构化的"角色稿"（像杂志人物稿），方便 AI 理解和 TA 保持一致。你也可以预览这份整理稿，确认 AI 理解正确。<br><br><b>最少需要填什么才能开始聊天</b><br>只填一个名字就可以保存并开始聊。但填得越细，AI 越能稳定地扮演这个角色。',
      action: () => Router.go('character')
    },

    // ============================================================
    // 回声沙龙 (Forum) — 外部模块 forum.js
    // ============================================================
    {
      id: 'forum',
      title: '回声沙龙 (Echoes)',
      keywords: '论坛,社区,动态,广场,树洞,事件,forum,echoes,post',
      description: '把它理解成"世界里的社交平台"。你可以自己发动态，也可以看角色们在这里发什么、聊什么、发生了什么。<br><br><b>前提</b><br>想在"角色广场"看到更多角色动态，通常需要你先在<b>角色档案</b>里建立一些角色（至少 1 个），并开启 Agent 引擎的"角色主动发帖"。<br><br><b>怎么用（最常见的 2 步）</b><br>1) 进回声沙龙<br>2) 选一个板块开始浏览/发布<br><br>这个 App 功能比较多，所以教程里会先给你一个<b>功能目录</b>，你点进去再看每个板块的详细玩法。',
      features: [
        {
          id: 'forum-plaza',
          title: '角色广场 (Plaza)',
          keywords: '广场,动态,实名,角色,plaza',
          description: '这是"实名动态区"，你会看到角色们像发朋友圈一样更新内容。<br><br><b>前提</b><br>如果这里内容很少/没有角色：先去<b>角色档案</b>建角色，再去<b>设置 → Agent 引擎</b>开启"角色主动发帖"，然后等待或点 Debug 强制触发。<br><br><b>怎么玩</b><br>1) 打开广场<br>2) 往下刷看动态<br>3) 遇到喜欢的内容就互动（比如评论/回应）<br><br><b>适合</b><br>想看角色日常、关系变化、世界氛围的时候。',
          action: () => Router.go('forum')
        },
        {
          id: 'forum-treehole',
          title: '匿名树洞 (Treehole)',
          keywords: '树洞,匿名,心声,倾诉,treehole',
          description: '这是"匿名区"，不想署名的内容都可以丢进来。<br><br><b>怎么玩</b><br>1) 打开树洞<br>2) 发一段想说但不想署名的话<br>3) 看别人匿名的心声，跟它产生回响<br><br><b>适合</b><br>写情绪、秘密、深夜碎碎念。',
          action: () => Router.go('forum')
        },
        {
          id: 'forum-world-events',
          title: '世界事件 (World Events)',
          keywords: '世界事件,公告,剧情,事件,event,world',
          description: '这是"世界公告/新闻区"。你用它来快速了解：这个世界正在发生什么、剧情在往哪儿走。<br><br><b>怎么玩</b><br>1) 打开世界事件<br>2) 看最新事件<br>3) 把事件当作写作/聊天的素材继续推进故事',
          action: () => Router.go('forum')
        },
        {
          id: 'forum-comment-reply',
          title: '评论区小技巧：回复 @某人 (Reply)',
          keywords: '评论,回复,@,reply,语法,指定回复',
          description: '在评论输入框里可以用类似"回复 @名字: 内容"的格式，来指定你在回复谁（更像真实社交的楼中楼）。<br><br><b>怎么用</b><br>1) 在评论框输入：回复 @Ta的名字: 你要说的话<br>2) 提交评论',
          action: () => Router.go('forum')
        },
        {
          id: 'forum-delete-confirm',
          title: '删除二次确认：点遮罩可取消 (Delete Confirm)',
          keywords: '删除,确认,弹窗,遮罩,取消,warning',
          description: '删除帖子/内容时通常会弹出二次确认（System Warning）。你除了点取消按钮，也可以点击弹窗外的遮罩区域快速取消。',
          action: () => Router.go('forum')
        }
      ],
      action: () => Router.go('forum')
    },

    // ============================================================
    // 世界书 (WorldBook) — 主文件模块
    // ============================================================
    {
      id: 'worldbook',
      title: '世界书 (WorldBook)',
      keywords: '世界书,设定,lore,world,book,记忆,注入,关键词,词条,触发',
      description: '世界书是你的"设定本"。你把世界观、规则、地点、物品、关系……写在这里，AI 在聊天时会按关键词把相关设定自动带进上下文。<br><br><b>它是怎么工作的</b><br>你给每条词条设置"关键词"。聊天过程中，只要对话内容里出现了这个关键词，这条词条就会被注入到 AI 的上下文里，让 TA 在回复时"想起"并使用这段设定。不触发的词条不会占用 Token，非常高效。<br><br><b>你能做什么</b><br>- 新建词条：写一段设定内容，设置触发关键词<br>- 编辑词条：随时修改，改完即生效<br>- 管理词条：开启/关闭单条词条、按类别整理<br>- 从文件导入：支持批量导入词条（具体格式见导入界面提示）<br><br><b>推荐写什么</b><br>- 地点描述："古城街市""这座图书馆的规矩"<br>- 人物关系："XXX 和 YYY 的恩怨""XXX 唯一信任的人"<br>- 世界规则："这个世界里魔法的代价""法律禁止的事"<br>- 物品说明："那枚戒指的来历""那辆车意味着什么"<br>- 关键事件："那场战争之后发生了什么"<br><br><b>完整新手流程</b><br>1) 打开世界书（左侧/底部导航找"世界书"图标）<br>2) 点"新建词条"或 "+"<br>3) 填词条名称（方便你自己找，不影响 AI）<br>4) 填内容（尽量具体，少说抽象概念）<br>5) 填关键词（聊天里提到这些词就会触发）<br>6) 保存<br>7) 回到聊天，在对话里自然提到关键词，看 AI 的回复有没有更准确<br><br><b>关键词怎么设才好用</b><br>- 要具体："海边的灯塔"比"灯塔"好，"血族禁区"比"禁区"好<br>- 数量适中：一条词条 2–5 个关键词，太多反而乱<br>- 避免太泛：别用"爱""战争""人"这种几乎每句话都会出现的词<br>- 可以用角色名：某个角色就是一个关键词，提到 TA 就触发相关设定<br><br><b>词条多了以后</b><br>可以按"主题/类别"分组，比如把地点词条放一组、人物词条放一组。点一下词条旁的开关可以临时停用，不用删掉它。',
      action: () => Router.go('worldbook')
    },

    // ============================================================
    // 线下剧情 (Story) — 主文件模块
    // ============================================================
    {
      id: 'story',
      title: '线下剧情 (Story)',
      keywords: '线下,剧情,故事,story,roster,archive,摘要,见面',
      description: '这是"线下见面/线下剧情"的专属模式：先选角，再进入剧情对话。它更像一部独立的小剧场，和普通聊天的节奏不太一样。<br><br><b>前提</b><br>线下剧情要先"选角"，角色同样来自<b>角色档案</b>。如果你还没建角色，这里就没法开始。<br><br><b>怎么用（新手 3 步）</b><br>1) 先去角色档案建立角色<br>2) 进入线下剧情选角，选择角色开始<br>3) 进入剧情对话推进剧情<br><br><b>小提示</b><br>线下剧情通常会被整理成"摘要/记忆"，方便之后在线上聊天自然衔接。',
      features: [
        {
          id: 'story-roster',
          title: '线下剧情选角 (Roster)',
          keywords: '选角,角色,roster,进入',
          description: '进入线下剧情前，你先在这里选角色。<br><br><b>前提</b><br>如果这里没有角色可选：先去<b>角色档案</b>新建角色，再回来。<br><br><b>怎么用</b><br>1) 打开"线下剧情选角"页面<br>2) 选择一个角色<br>3) 点击进入开始线下剧情',
          action: () => Router.go('story-roster')
        },
        {
          id: 'story-chat',
          title: '线下剧情对话 (Story Chat)',
          keywords: '剧情对话,对话,chat,推进',
          description: '这里是线下剧情的主场：一轮轮推进、把"见面那一段"写完。<br><br><b>怎么用</b><br>1) 进入剧情对话<br>2) 按你的想法继续写/继续聊<br>3) 需要时回到选角或继续下一段',
          action: () => Router.go('story-chat')
        }
      ],
      action: () => Router.go('story-roster')
    },

    // ============================================================
    // 遇见 (Meet) — 外部模块 chill-meet-bundle.js
    // ============================================================
    {
      id: 'meet',
      title: '遇见 (Meet)',
      keywords: '遇见,线下,见面,meet,iframe,刷卡,匹配',
      description: '"遇见"是一个内嵌的小宇宙：外观像交友 App，但用途更像"线下票根 + 情绪档案 + 私密对话"。你可以刷卡片（喜欢/跳过）、收陌生招呼、进入对话，也可以在"我的"里填资料与生日生成星座/星盘。<br><br><b>前提</b><br>- 不需要云同步也能玩（本地就能保存）<br>- 但你最好先把"我的资料"填一下，体验会完整很多<br><br><b>怎么用（新手 4 步）</b><br>1) 打开遇见（桌面点"遇见"）<br>2) 先去"我的"上传头像/填写生日<br>3) 回到"发现"刷卡片：左滑跳过、右滑喜欢（也能点按钮）<br>4) 去"消息/对话"进入聊天继续聊<br><br><b>注意</b><br>你关闭遇见只是"退回桌面"，下次打开还能继续（内容是保存的）。',
      features: [
        {
          id: 'meet-enter-exit',
          title: '进入与退出 (Enter / Exit)',
          keywords: '进入,退出,返回,back,close',
          description: '遇见是一个全屏内嵌页面。<br><br><b>怎么进入</b><br>- 桌面点"遇见"图标打开<br><br><b>怎么退出</b><br>- 点顶部的 Back 返回 Chill 桌面<br><br><b>小提示</b><br>退出不会清空内容，下次打开还是原来的进度。',
          action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
        },
        {
          id: 'meet-discover',
          title: '发现：刷卡片 (Discover)',
          keywords: '发现,卡片,左滑,右滑,喜欢,跳过,refresh,discover',
          description: '这是遇见最核心的玩法：像刷卡片一样"遇到"一些人/一些故事。<br><br><b>怎么玩（两种方式）</b><br>1) 手势：左滑=跳过，右滑=喜欢<br>2) 按钮：点 X=不感兴趣，点 ♥=喜欢<br><br><b>细节</b><br>- 卡片里的资料区可以上下滑动（不止一屏）<br>- 右上角 REFRESH：在发现页会"拉新卡片/刷新卡片堆"',
          action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
        },
        {
          id: 'meet-inbox',
          title: '消息与对话 (Inbox)',
          keywords: '消息,对话,inbox,陌生招呼,列表',
          description: '这里会把"陌生招呼"和"对话列表"放在一起，你从这里进入真正的聊天。<br><br><b>怎么玩</b><br>1) 打开消息页<br>2) 先看陌生招呼（如果有）<br>3) 在"对话"列表里点开一个会话进入聊天<br><br><b>常见问题：为什么我点了喜欢，却聊不了？</b><br>遇见里有"私聊权限"的设置：<br>- 仅互相喜欢后可私聊：必须互相喜欢（匹配）才会进对话列表<br>- 允许陌生人私信：未匹配也可能收到招呼，统一在"陌生招呼"里',
          action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
        },
        {
          id: 'meet-daily',
          title: '今日运势 (Daily)',
          keywords: '运势,今日,刷新,daily,refresh',
          description: '这是"当天的运势/提示"。<br><br><b>怎么玩</b><br>1) 打开今日运势页<br>2) 右上角点 REFRESH 刷新今日运势<br><br><b>小提示</b><br>REFRESH 在不同页面作用不同：在发现页刷新卡片，在运势页刷新当天运势。',
          action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
        },
        {
          id: 'meet-me',
          title: '我的资料：头像与生日 (Me / Profile)',
          keywords: '我的,资料,头像,生日,星座,星盘,profile,me',
          description: '这里是你的"遇见名片"。你可以上传头像、填写个人资料，并填生日生成星座/星盘相关内容。<br><br><b>怎么用（推荐）</b><br>1) 先上传头像（点头像区域即可更换）<br>2) 打开个人资料，补全你想展示的内容<br>3) 填写出生日期：YYYY-MM-DD<br>4) 出生时间：HH:mm（24 小时制，可不填）<br><br><b>为什么要填</b><br>填完后，发现卡片/匹配/运势相关的体验会更完整。',
          action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
        },
        {
          id: 'meet-favor',
          title: '好感与星级 (Favor / Stars)',
          keywords: '好感,星级,一星,四星,互相,解锁,姓名,回应,心里话',
          description: '遇见里有一套"好感 → 星级"的进度条。聊得越多、互动越好，好感会累积，星级会上升。<br><br><b>好感怎么变？</b><br>在聊天过程中/退出聊天时，系统会弹出结算：你可以选择给 Ta 的这次相处打分（也可以跳过不加分）。结算档位大致是：-1 会扣分，0 不加分，½/1★/2★/3★/4★/5★ 会分别加不同分数。<br><br><b>星级门槛（总好感达到这些数）</b><br>- 1★：30<br>- 2★：60<br>- 3★：110<br>- 4★：170<br>- 5★：270（满）<br><br><b>达到星级后能做什么？</b><br>- 到 1★：会出现"<b>一星解锁姓名</b>"弹窗，你可以输入你的名字，并确认/编辑 Ta 的真实姓名<br>- 到互相 4★：会触发"<b>互相 4★</b>"的心里话信件弹窗',
          action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
        },
        {
          id: 'meet-chat',
          title: '遇见里的聊天 (Chat)',
          keywords: '聊天,对话,发送,退出,好感,chat',
          description: '遇见里有自己的全屏聊天界面。通常你从"消息/对话"点进来，就会进入聊天。<br><br><b>怎么玩</b><br>1) 在对话列表点开一个会话进入聊天<br>2) 输入内容并发送<br>3) 退出时，系统可能会弹出"好感结算/关系节点"的弹窗',
          action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
        },
        {
          id: 'meet-save',
          title: '保存与继续 (Save)',
          keywords: '保存,本地,继续,进度,cache,db',
          description: '遇见的内容不是一次性的。<br><br><b>保存规则</b><br>- 遇见会把自己的数据保存到本地（不是云端）<br>- 你退出只是关页面，不会清空进度<br><br><b>遇到"内容不见了"怎么办</b><br>一般是浏览器数据被清理或换设备导致。想跨设备保留，需要配合云同步。',
          action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
        }
      ],
      action: () => (window.ChillMeet && typeof window.ChillMeet.open === 'function' ? window.ChillMeet.open() : void 0)
    },

    // ============================================================
    // 角色日记 (Diary) — 外部模块 diary.js
    // ============================================================
    {
      id: 'diary',
      title: '角色日记 (Diary)',
      keywords: '日记,档案,时间线,生成,存档,diary,archive',
      description: '这是角色的"日记/档案本"。它不是把聊天复制粘贴，而是把角色的生活写成独立文本，让你能像翻书一样回看角色经历。<br><br><b>前提</b><br>你需要先在<b>角色档案</b>里建立角色，否则日记里没有对象可以选择。<br><br><b>怎么用（最常见的 3 步）</b><br>1) 先去角色档案建立角色<br>2) 进入日记，选一个角色<br>3) 生成/查看日记条目<br><br><b>适合</b><br>想要"时间线"、想回顾剧情、想让角色更像活过一样。',
      features: [
        {
          id: 'diary-directory',
          title: '目录与角色切换 (Directory)',
          keywords: '目录,切换,角色,滑动,directory',
          description: '这是日记的入口目录，用来切换不同角色。<br><br><b>前提</b><br>如果目录里空空的：先去<b>角色档案</b>新建角色。<br><br><b>怎么用</b><br>1) 打开目录<br>2) 滑动/选择角色<br>3) 点"进入"进入该角色日记',
          action: () => (typeof DiaryModule !== 'undefined' && DiaryModule.open ? DiaryModule.open() : void 0)
        },
        {
          id: 'diary-generate',
          title: '生成日记 (Generate)',
          keywords: '生成,写日记,AI,generate',
          description: '让 AI 为当前角色写一篇新的日记，并保存进列表里。<br><br><b>怎么用</b><br>1) 进入某个角色的日记页<br>2) 触发"生成日记"<br>3) 生成完成后在列表里点开阅读',
          action: () => (typeof DiaryModule !== 'undefined' && DiaryModule.open ? DiaryModule.open() : void 0)
        },
        {
          id: 'diary-archive',
          title: '存档与回看 (Archive)',
          keywords: '存档,回看,归档,archive',
          description: '把日记当成档案来翻：按时间一条条看，点进去看单篇详情。<br><br><b>怎么用</b><br>1) 打开日记列表<br>2) 选择某一条日记<br>3) 进入详情阅读/回看',
          action: () => (typeof DiaryModule !== 'undefined' && DiaryModule.open ? DiaryModule.open() : void 0)
        },
        {
          id: 'diary-redact-reveal',
          title: '隐藏段落：点击墨迹块揭示 (Redact Reveal)',
          keywords: '隐藏,REDACT,墨迹,点击揭示,reveal',
          description: '日记里有时会出现"像被涂黑的墨迹块"的隐藏段落。它不是坏了：你可以直接点一下，让内容从隐藏态变为可读（适合做悬念/秘密）。',
          action: () => (typeof DiaryModule !== 'undefined' && DiaryModule.open ? DiaryModule.open() : void 0)
        }
      ],
      action: () => (typeof DiaryModule !== 'undefined' && DiaryModule.open ? DiaryModule.open() : void 0)
    },

    // ============================================================
    // 音乐 (Music) — 外部模块 music.js
    // ============================================================
    {
      id: 'music',
      title: '音乐 (Music)',
      keywords: '音乐,歌单,歌词,播放器,下载,本地,MusicModule',
      description: '这是你的"音乐空间"。你可以搜歌、加到歌单、保存歌词，并用播放器播放（支持离线）。<br><br><b>怎么用（新手 3 步）</b><br>1) 打开音乐<br>2) 搜索一首歌并加入本地库/歌单<br>3) 点播放（之后即使没网也能播你保存过的内容）',
      features: [
        {
          id: 'music-search',
          title: '搜索与入库 (Search)',
          keywords: '搜索,歌名,歌手,导入,search',
          description: '用歌名/歌手搜索歌曲，然后把它"收进本地"。<br><br><b>怎么用</b><br>1) 在搜索框输入歌名/歌手<br>2) 选择结果<br>3) 加入歌单或保存到本地库',
          action: () => (typeof MusicModule !== 'undefined' && MusicModule.open ? MusicModule.open() : void 0)
        },
        {
          id: 'music-playlists',
          title: '歌单管理 (Playlists)',
          keywords: '歌单,playlist,管理,收藏',
          description: '用歌单把音乐整理成"章节"。比如：夜晚、雨天、写作、战斗、告别……<br><br><b>怎么用</b><br>1) 新建歌单<br>2) 把歌加入歌单<br>3) 播放时切换不同歌单',
          action: () => (typeof MusicModule !== 'undefined' && MusicModule.open ? MusicModule.open() : void 0)
        },
        {
          id: 'music-player',
          title: '悬浮播放器 (Floating Player)',
          keywords: '悬浮,播放器,播放,暂停,先锋,player',
          description: '播放器可以悬浮在桌面上：你在别的页面做事时，也能随时暂停/切歌。<br><br><b>怎么用</b><br>1) 开始播放一首歌<br>2) 打开悬浮播放器<br>3) 在任何页面控制播放/暂停/切歌',
          action: () => (typeof MusicModule !== 'undefined' && MusicModule.open ? MusicModule.open() : void 0)
        },
        {
          id: 'music-import-lrc',
          title: '本地导入：音频 + LRC 歌词 (Import)',
          keywords: '本地导入,上传,音频,lrc,歌词,匹配,confirm upload',
          description: '音乐支持把本地音频与 LRC 歌词导入进库里。常见流程是：先添加音频文件，再添加 LRC 歌词，确认上传后完成入库与匹配。',
          action: () => (typeof MusicModule !== 'undefined' && MusicModule.open ? MusicModule.open() : void 0)
        }
      ],
      action: () => (typeof MusicModule !== 'undefined' && MusicModule.open ? MusicModule.open() : void 0)
    },

    // ============================================================
    // 时空邮局 (Post Office) — 外部模块 post-office.js
    // ============================================================
    {
      id: 'post-office',
      title: '时空邮局 (Post Office)',
      keywords: '时空邮局,未寄出的信,捕捞,回信,退回,post office,letters',
      description: '你可以把它当成"捞信的地方"。点击捕捞，会出现一批来自不同时空的信；你可以拆开读，然后选择：代写回信（投递）或退回。<br><br><b>怎么用（最常见的 4 步）</b><br>1) 打开时空邮局<br>2) 点击"捕捞信笺"<br>3) 点开某封信阅读<br>4) 写回信并确认投递，或填写理由退回',
      features: [
        {
          id: 'po-catch',
          title: '捕捞信笺 (Catch)',
          keywords: '捕捞,洋流,采样,catch',
          description: '开始"捞信"。系统会生成/截获一批信件卡片显示在列表里。<br><br><b>怎么用</b><br>1) 在列表页点"捕捞信笺"<br>2) 等待几秒<br>3) 捕捞完成后从卡片里点开任意一封',
          action: () => (typeof PostOfficeModule !== 'undefined' && PostOfficeModule.open ? PostOfficeModule.open() : void 0)
        },
        {
          id: 'po-detail',
          title: '拆封与验讫 (Detail)',
          keywords: '详情,拆封,验讫,detail',
          description: '点开卡片进入详情页阅读正文。<br><br><b>你会看到</b><br>- 中文信：直接展示正文<br>- 外语信：会分成"原文 Original"和"中文展读"两段，方便读',
          action: () => (typeof PostOfficeModule !== 'undefined' && PostOfficeModule.open ? PostOfficeModule.open() : void 0)
        },
        {
          id: 'po-proxy-reply',
          title: '代投递回信 (Proxy Reply)',
          keywords: '代投递,回信,草稿,proxy',
          description: '你来替"收件人"写回信（可以写摘要，也可以写完整回信）。<br><br><b>怎么用</b><br>1) 在详情页找到"代收件人回复"输入框<br>2) 输入内容（会自动保存草稿）<br>3) 点击"确认代投递"完成投递',
          action: () => (typeof PostOfficeModule !== 'undefined' && PostOfficeModule.open ? PostOfficeModule.open() : void 0)
        },
        {
          id: 'po-return',
          title: '退回区 (Return)',
          keywords: '退回,理由,return',
          description: '当你不想回信/不想投递时，用"退回区"把信退回去。<br><br><b>怎么用</b><br>1) 点"展开退回区"<br>2) 写清楚退回理由（必填）<br>3) 点"确认退回"',
          action: () => (typeof PostOfficeModule !== 'undefined' && PostOfficeModule.open ? PostOfficeModule.open() : void 0)
        },
        {
          id: 'po-return-toggle',
          title: '退回区展开/收起 (Toggle)',
          keywords: '退回区,展开,收起,取消,清空理由,toggle',
          description: '在详情页里"退回区"通常是可展开的面板：点"展开退回区/收起退回区"切换；点取消会收起面板并清空你刚写的退回理由，避免误提交。',
          action: () => (typeof PostOfficeModule !== 'undefined' && PostOfficeModule.open ? PostOfficeModule.open() : void 0)
        }
      ],
      action: () => (typeof PostOfficeModule !== 'undefined' && PostOfficeModule.open ? PostOfficeModule.open() : void 0)
    },

    // ============================================================
    // 云同步 (Cloud) — 外部模块 cloud.js
    // ============================================================
    {
      id: 'cloud',
      title: '云同步 (Cloud Sync)',
      keywords: '云同步,supabase,备份,拉取,上传,pull,push,cloud',
      description: '这是"云备份/云同步"。你把数据上传到云端，换设备或不小心清了缓存时，可以再拉回来。<br><br><b>重要提醒</b><br>这里的"拉取/上传"都是<b>全量覆盖</b>：你一旦执行，就会用一边的数据覆盖另一边。<br><br><b>怎么用（推荐顺序）</b><br>1) 先接入节点（填 URL 和 Key）<br>2) 需要备份时用 PUSH 上传<br>3) 需要恢复时用 PULL 拉取',
      features: [
        {
          id: 'cloud-connect',
          title: '节点接入 (Node Connection)',
          keywords: 'url,key,连接,project,anon',
          description: '先把云端"连上"。你需要填两样东西：<br>- Project URL（项目地址）<br>- Anon Key（匿名密钥）<br><br><b>前提</b><br>这两项必须是你自己的 Supabase 项目提供的；没填对就无法同步。',
          action: () => (typeof CloudModule !== 'undefined' && CloudModule.open ? CloudModule.open() : void 0)
        },
        {
          id: 'cloud-pull',
          title: '拉取覆盖 (PULL)',
          keywords: '拉取,pull,覆盖,download',
          description: '把云端的数据<b>拉到本地</b>。这会用云端数据覆盖你当前本地数据。<br><br><b>什么时候用</b><br>- 换设备<br>- 本地数据丢了想恢复<br><br><b>注意</b><br>如果你本地还有新东西没备份，先别拉取。',
          action: () => (typeof CloudModule !== 'undefined' && CloudModule.open ? CloudModule.open() : void 0)
        },
        {
          id: 'cloud-push',
          title: '上传覆盖 (PUSH)',
          keywords: '上传,push,覆盖,upload',
          description: '把本地的数据<b>上传到云端</b>。这会用本地数据覆盖云端旧数据。<br><br><b>什么时候用</b><br>- 你确定"现在这台设备的数据是最新的"<br>- 想做一次备份',
          action: () => (typeof CloudModule !== 'undefined' && CloudModule.open ? CloudModule.open() : void 0)
        },
        {
          id: 'cloud-auto-backup',
          title: '自动备份 (Auto Backup)',
          keywords: '自动备份,后台,auto',
          description: '打开后，它会在你把应用切到后台时，悄悄帮你做同步（有冷却时间，不会频繁刷）。<br><br><b>适合</b><br>懒得手动备份、又怕丢数据的人。',
          action: () => (typeof CloudModule !== 'undefined' && CloudModule.open ? CloudModule.open() : void 0)
        }
      ],
      action: () => (typeof CloudModule !== 'undefined' && CloudModule.open ? CloudModule.open() : void 0)
    },

    // ============================================================
    // 观点修罗场 (Debate) — 外部模块 debate.js
    // ============================================================
    {
      id: 'debate',
      title: '观点修罗场 (Debate)',
      keywords: '辩论,观点,立场,修罗场,存档,debate,arena',
      description: '这是一个"辩论/对线"玩法：你先选好身份、立场和对手，再进入擂台，让观点互相碰撞。<br><br><b>怎么用（新手 3 步）</b><br>1) 开局设置：选身份/对手/立场<br>2) 进入擂台开始对话<br>3) 想保留进度就存档',
      features: [
        {
          id: 'debate-setup',
          title: '开局设置 (Setup)',
          keywords: '开局,身份,对手,立场,setup',
          description: '开局前的准备区：你在这里决定"你是谁""你站哪边""对手是谁"。<br><br><b>怎么用</b><br>1) 填你的身份/名字（或选择预设）<br>2) 选对手<br>3) 选你的立场，然后点击开始',
          action: () => (typeof DebateModule !== 'undefined' && DebateModule.open ? DebateModule.open() : void 0)
        },
        {
          id: 'debate-arena',
          title: '擂台对话 (Arena)',
          keywords: '擂台,对话,arena,stream',
          description: '真正开打的地方：你会看到对话一轮轮推进。<br><br><b>怎么用</b><br>1) 进入擂台<br>2) 按提示继续推进对话<br>3) 觉得一轮很精彩就存档',
          action: () => (typeof DebateModule !== 'undefined' && DebateModule.open ? DebateModule.open() : void 0)
        },
        {
          id: 'debate-archive',
          title: '存档与读档 (Archive)',
          keywords: '存档,读档,archive,save,load',
          description: '把一场辩论保存成档案，之后可以继续或回看。<br><br><b>怎么用</b><br>1) 在合适的时刻点击存档<br>2) 下次进入从档案里选择一条<br>3) 点击读档继续',
          action: () => (typeof DebateModule !== 'undefined' && DebateModule.open ? DebateModule.open() : void 0)
        }
      ],
      action: () => (typeof DebateModule !== 'undefined' && DebateModule.open ? DebateModule.open() : void 0)
    },

    // ============================================================
    // 设置 (Settings) — 主文件模块
    // ============================================================
    {
      id: 'settings',
      title: '设置 (Settings)',
      keywords: '设置,preferences,config,api,美化,数据,系统,agent,settings',
      description: '设置是整个系统的"总控台"。可以把它分成 5 大板块来理解：<br><br><b>① API 设置</b>：让 AI 能回复你。没有这个，什么都不能正常用。<b>这是第一件事。</b><br><b>② 音画设置</b>：配语音（MiniMax TTS）和生图（Novel AI），可选。<br><b>③ 美化设置</b>：换壁纸、换图标，纯外观。<br><b>④ 数据设置</b>：导出备份包、从备份恢复、查看存储占用。建议每隔一段时间做一次备份。<br><b>⑤ 系统设置</b>：字体大小、图标标签显示、自定义字体。<br><b>⑥ Agent 引擎</b>：让角色在后台"活起来"——自动发帖、写日记、刷论坛。<br><br><b>新手建议的顺序</b><br>1) 先把 API 配好（不然聊天不会回）<br>2) 再做美化（壁纸/图标）<br>3) 再做系统字体（字号/自定义字体）<br>4) 最后做备份与 Agent（按需）',
      features: [
        {
          id: 'settings-api',
          title: 'API 设置：让聊天能回复 (API)',
          keywords: 'api,profile,endpoint,key,model,temperature,拉取模型,保存,设为当前使用,配置',
          description: '这是整个系统里<b>最重要</b>的配置页：你在这里告诉系统"去哪里调用 AI、用哪个密钥、用哪个模型"。没有这一页配好，AI 永远不会回复你。<br><br><b>你需要什么才能配 API</b><br>你需要一个 <b>API Key（密钥）</b> 和对应的 <b>服务地址（Endpoint）</b>。两种获取方式：<br><br>1) <b>去服务商官网直接申请（最稳）</b><br>- OpenAI：https://platform.openai.com → API Keys → Create new secret key<br>- Anthropic (Claude)：https://console.anthropic.com → API Keys<br>- Google Gemini：https://aistudio.google.com → Get API key<br>- 国内模型（智谱/百川/文心等）：去对应官网开发者平台申请<br><br>2) <b>用第三方 API 中转站（适合新手和省钱）</b><br>很多人会用聚合中转 API 站，价格通常比官方便宜，门槛更低。你可以在<b>小红书</b>搜"API 站 / 大模型API / Openai 代理"等关键词找到推荐。<br>注意：尽量选口碑好的站子，别买来源不明的 Key；站子通常会给你一段 ENDPOINT 和一段 KEY。<br><br><b>配置步骤（完整 8 步）</b><br>1) 打开"设置"（桌面左上角或底部设置图标）<br>2) 点"API 设置"<br>3) 在"选择配置"下拉框里点"+ 新建配置"<br>4) 配置名称：随便起，比如"GPT-4o 主力"或"Claude"（方便自己认）<br>5) ENDPOINT：填 API 地址，例如 `https://api.openai.com` 或 `https://api.openai.com/v1`（带不带 /v1 都行，系统会自动处理）<br>6) KEY：粘贴你的密钥（通常以 `sk-` 开头；Anthropic 的以 `sk-ant-` 开头）<br>7) MODEL：先点"点击拉取列表"按钮，让系统自动获取可用模型名；如果拉取失败，就手动输入模型名（例如 `gpt-4o`、`claude-3-5-sonnet-20241022`）<br>8) 点"保存配置"<br>9) 再点"设为当前使用"——这一步决定聊天真正用哪套，<b>缺了这步一切白搭</b><br><br><b>TEMPERATURE（温度）是什么</b><br>控制 AI 回复的"随机性"。<br>- 0.3 以下：极稳定，适合角色设定强烈、不希望 AI 乱发挥的情况<br>- 0.7（推荐默认）：稳定和创意之间的平衡点<br>- 1.0 以上：很发散，适合想要更有创意/戏剧性但可能跑偏的情况<br><br><b>多个配置怎么管理</b><br>你可以建多个配置（不同模型/不同服务商），随时在"选择配置"里切换。"当前使用"的那个旁边会有标记。切换配置后记得点"设为当前使用"。<br><br><b>常见问题排查</b><br>- 拉取模型列表失败：通常是 ENDPOINT 或 KEY 填错了；或者该服务商不支持 /v1/models 接口（手动填模型名就好）<br>- 能保存但聊天不回：多半是忘了"设为当前使用"<br>- 报错 401：KEY 错误/过期<br>- 报错 403：权限不足或欠费<br>- 报错 404：模型名拼写错误',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-api-fetch-models',
          title: 'API 设置：拉取模型列表 (Fetch Models)',
          keywords: '点击拉取列表,拉取模型,/v1/models,fetch models,下拉,model list',
          description: '在 API 设置里，MODEL 字段旁边通常有一个"点击拉取列表"按钮，点一下可以自动从服务商获取所有可用模型的名称，省去手动查找和拼写的麻烦。<br><br><b>为什么有时候拉取失败</b><br>- ENDPOINT 或 KEY 填错了：先检查这两个字段<br>- 服务商不支持 /v1/models 接口：这是正常的，不是所有服务商都开放这个接口。遇到这种情况，就手动输入模型名（去服务商文档找对应的 model id）<br>- 网络问题：等一下再试，或者换个网络<br><br><b>手动填模型名时参考</b><br>- OpenAI 系列：gpt-4o / gpt-4o-mini / gpt-4-turbo<br>- Claude 系列：claude-opus-4-5 / claude-sonnet-4-5 / claude-haiku-4-5-20251001<br>- Gemini 系列：gemini-2.5-pro-preview / gemini-2.0-flash<br>- 其他：去对应服务商的官方文档或控制台找 model id',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-api-set-active',
          title: 'API 设置：设为当前使用 (Set Active)',
          keywords: '设为当前使用,set active,当前配置,切换配置,激活',
          description: '保存配置只是"把它存进数据库"，聊天不一定会用它。你还需要点击"设为当前使用"，系统才会以这套配置来发送所有 AI 请求。<br><br><b>什么时候需要点</b><br>- 第一次新建配置后<br>- 你想从 A 配置切换到 B 配置时<br>- 你修改了某个配置的内容（建议重新设为当前使用确保生效）<br><br><b>怎么确认哪个是当前使用的</b><br>"选择配置"下拉框里，当前使用的那个旁边通常会有"★ 当前使用"字样或高亮标记。<br><br><b>如果你有多个配置</b><br>每次只能有一个"当前使用"。想临时换一个，就在列表里选中它，再点"设为当前使用"；原来那个会自动退下来。',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-voice',
          title: '音画设置：语音与生图 (Voice & Vision)',
          keywords: '音画,tts,minimax,novel,生图,voice,vision,语音,图片生成',
          description: '音画设置是"声音 + 图片生成"的配置入口，分成两个子页面：MiniMax（语音合成）和 Novel（AI 生图）。<br><br><b>MiniMax 语音设置（让角色开口说话）</b><br>你需要先有一个 MiniMax 账号，并在官网（https://platform.minimaxi.com）创建应用，拿到 API Key 和 Group ID。<br><br>1) 打开：设置 → 音画设置 → MiniMax 设置<br>2) 填"API Key"（在 MiniMax 控制台里找）<br>3) 填"Group ID"（在 MiniMax 控制台里找，通常是一串数字）<br>4) 模型：推荐 `speech-01-turbo`（速度快）或 `speech-01-hd`（质量高）<br>5) 选语言（中文/日语/英语等）<br>6) 调语速（1.0 是正常速，0.8 慢一点，1.2 快一点）和音量<br>7) 点"保存配置"<br><br>配好后，聊天里的 AI 消息旁边会出现语音播放按钮，点一下就能听到角色说话。<br><br><b>Novel AI 生图设置（让角色主动发图）</b><br>你需要先有一个 Novel AI 账号（https://novelai.net），并在账号设置里找到 Persistent API Token。<br><br>1) 打开：设置 → 音画设置 → Novel 设置<br>2) 填"Persistent Token"（就是你的 API Key）<br>3) 选模型：<br>&nbsp;&nbsp;&nbsp;- nai-diffusion-3：稳定版，效果均衡<br>&nbsp;&nbsp;&nbsp;- nai-diffusion-4-5：最新版，质量更高，Anlas 消耗也更多<br>4) 调参数（可以先用默认值）：<br>&nbsp;&nbsp;&nbsp;- STEPS：生成步数，28 是默认，越高越精细但越慢<br>&nbsp;&nbsp;&nbsp;- SCALE：提示词权重，7 是默认，越高越"听话"<br>&nbsp;&nbsp;&nbsp;- Sampler：采样器，k_euler_ancestral 是常用选择<br>&nbsp;&nbsp;&nbsp;- Size：画面尺寸（按角色通常出现的构图选）<br>5) 点"测试生图"：系统会生成一张测试图，点图可以下载或清除<br>6) 确认没问题后点"保存配置"<br><br><b>常见问题</b><br>- Novel 不出图：通常是 Token 错误，或者账户 Anlas 额度不足<br>- MiniMax 没声音：通常是 Key 或 Group ID 填错；也可能是该语言没选或语速设了 0',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-ui',
          title: '美化设置：壁纸与图标 (Appearance)',
          keywords: '美化,主题,外观,ui,theme,壁纸,图标,wallpaper,icon',
          description: '美化设置是最直观的"换皮肤"页，主要就两件事：<b>壁纸</b>和<b>图标</b>。<br><br><b>壁纸（Wallpaper）</b><br>1) 打开：设置 → 美化设置<br>2) 点"点击上传壁纸"<br>3) 选择你本地的图片（JPG/PNG/WEBP 均可）<br>4) 图片会自动处理成合适尺寸，并设为壁纸<br>5) 想恢复默认：点"恢复默认背景"<br><br><b>壁纸效果最好的图片类型</b><br>- 竖版图（9:16 比例最佳）<br>- 主体不在正中间（因为桌面图标会遮住中心区域）<br>- 颜色不太复杂（否则图标文字看不清）<br><br><b>自定义图标（Icons）</b><br>1) 往下滑到图标区<br>2) 找到你想替换的那个图标位置<br>3) 点对应的上传按钮（页面会有"点击对应位置上传图片"提示）<br>4) 选择你的图片（建议用正方形图片，约 200×200px 以上）<br>5) 图标立刻更换<br>6) 想全部恢复默认：点"恢复所有图标默认"<br><br><b>注意事项</b><br>- 壁纸和图标都存在本地，换设备会丢失<br>- 如果重要，先去"数据设置"导出一次完整备份包（图片资产也会一起备份）',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-data',
          title: '数据设置：备份与恢复 (Storage & Backup)',
          keywords: '数据,存储,备份,storage,backup,导出,导入,zip,清空',
          description: '数据设置是"保命"的地方。所有的聊天记录、角色档案、设定……都存在浏览器本地，如果缓存被清了就没了。养成定期导出备份包的习惯，可以避免大部分"数据丢失"的惨剧。<br><br><b>存储统计（先看看自己用了多少）</b><br>页面顶部会显示：<br>- API 配置数量<br>- 当前使用的配置名<br>- 图片资产数量与占用空间<br>点"刷新统计"可以更新最新数值。<br><br><b>导出完整备份包 (.zip) ← 最常用</b><br>1) 点"导出完整备份包 (.zip)"<br>2) 浏览器会自动下载一个 zip 文件<br>3) 把这个文件存到你找得到的地方（桌面/云盘/网盘）<br>4) 里面包含：所有 IndexedDB 数据 + 图片资产，是完整的备份<br><br><b>从压缩包恢复 (.zip)</b><br>1) 点"从压缩包恢复 (.zip)"<br>2) 选择你之前导出的 zip 文件<br>3) 系统会解压并覆盖当前本地数据<br>4) 等恢复完成后刷新页面（或按提示操作）<br><br><b>什么时候做备份</b><br>- 做任何危险操作（清空记录/清空数据）之前<br>- 换设备之前<br>- 每隔 1–2 周定期备份一次<br><br><b>清除全部数据（危险）</b><br>这会清空所有东西：聊天记录、角色档案、世界书、设置……全部消失。<b>执行前务必先导出备份包。</b> 这个操作通常用于"完全重置"，非必要不要点。',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-data-import-export',
          title: '数据设置：导出 / 从 zip 恢复 (Export / Import)',
          keywords: '导出,备份包,zip,恢复,导入,export,import',
          description: '数据设置里最常用的两件事：导出备份包和从 zip 恢复。<br><br><b>导出</b><br>- 点"导出完整备份包"→ 下载 zip → 存好<br>- zip 里包含所有数据和图片资产<br><br><b>恢复</b><br>- 点"从压缩包恢复"→ 选你导出的 zip → 等待完成<br>- 恢复会覆盖当前数据，不可撤销<br><br><b>建议</b><br>做任何"危险操作"（清空记录/清空数据）前，先导出一次。',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-system',
          title: '系统设置：字体与显示 (System)',
          keywords: '系统,字体,字号,typography,font,图标标签,显示',
          description: '系统设置控制全局的"视觉体验"：图标标签的显示、界面字体大小、以及自定义字体。<br><br><b>① 图标标签</b><br>控制主页图标下方要不要显示文字说明（比如"聊天""角色档案"这样的文字）。<br>- 开：图标有文字说明，新手更容易认出每个功能<br>- 关：图标更简洁，桌面看起来更干净<br>切换开关后立刻生效。<br><br><b>② 字体大小（Font Size）</b><br>1) 找到字号滑块（左边小 A，右边大 A）<br>2) 左右拖动：拖右边字变大，拖左边字变小<br>3) 旁边的"Preview"区域会实时显示当前字号效果<br>4) 调好后点"保存字体大小"——不点保存就没用<br>5) 保存后全局字号立刻更新<br><br><b>③ 自定义字体（Custom Font）</b><br>你可以替换掉系统默认字体，用自己喜欢的字体。支持两种方式：<br><br>方式 A：Google Fonts CSS 链接<br>- 去 fonts.google.com 找字体<br>- 点"Get font" → "Get embed code"<br>- 复制 @import 里的 CSS 链接（形如 `https://fonts.googleapis.com/css2?family=...`）<br>- 粘贴到"字体地址 / URL"栏<br>- "字体名称 / Name"填字体的英文名（例如 `Noto Serif SC`）<br><br>方式 B：字体文件直链<br>- 字体文件需要是 .woff2 / .woff / .ttf / .otf 之一<br>- 把文件上传到能生成直链的服务（例如你自己的 GitHub 仓库或 CDN）<br>- 把直链粘贴到"字体地址 / URL"<br>- 字体名称随便取一个方便认的名字<br><br>添加字体后：<br>1) 点"预览"：在预览区看看字体效果<br>2) 点"添加字体"：把这个字体加进"已保存"列表<br>3) 在"已保存 / Saved"里找到它，点击激活<br>4) 不想用了：点"恢复默认字体"一键回到原始状态<br><br><b>注意</b><br>自定义字体只影响主界面正文区域，页面里的装饰性标题字体（Playfair Display / Space Mono 等）不受影响——这是设计上刻意保留的。',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-system-font-actions',
          title: '系统字体：预览 / 添加 / 恢复默认 (Font Actions)',
          keywords: '字体,预览,添加字体,恢复默认字体,preview,add,reset',
          description: '自定义字体的三个关键按钮：<br><br>- <b>预览</b>：先把字体效果显示在预览区，让你确认这个字体的长相，满意再添加<br>- <b>添加字体</b>：把这个字体正式存进"已保存"列表，之后随时可以切换；添加完后记得在列表里选中它并激活<br>- <b>恢复默认字体</b>：不想用自定义字体了，一键回到系统默认。你添加过的字体条目还在列表里，只是不生效了',
          action: () => Router.go('settings')
        },
        {
          id: 'settings-agent',
          title: 'Agent 引擎：后台生态 (Agent)',
          keywords: 'agent,引擎,后台,自动发帖,日记,论坛,后台生态,自动化',
          description: 'Agent 引擎让角色们在你不在线的时候，依然"活着"——自动刷动态、发帖、写日记、参与论坛。<br><br><b>非常重要：先开总开关</b><br>所有 Agent 功能都需要先打开最顶部的"启用 Agent 引擎"总开关，否则下面的子功能都不会生效。<br><br><b>① 社交互动 / Social Interaction</b><br>- <b>拟真回复延迟（秒）</b>：角色回复你的动态/评论前，会先"等一等"，模拟真实的阅读和思考时间。拖滑块设置：0 秒=立刻回，30 秒=等 30 秒再回。<br><br><b>② 主动发帖 / Proactive Posting</b><br>让角色主动在 Sparkle 和论坛广场里更新内容，像角色在经营自己的账号一样。<br>1) 打开"角色主动更新动态"开关<br>2) 设置"活跃频率判断（小时）"：系统每隔这么多小时，判断一次要不要让角色发帖<br>3) 想马上测试效果：点 🎲 Debug 按钮，强制让角色立刻发一条<br><br><b>③ 私密记录 / Private Diary</b><br>让角色在后台自动写日记，你可以在"日记"App 里阅读。<br>1) 打开"角色自动写日记"开关<br>2) 设置"日记触发间隔（小时）"：每隔这么多小时写一篇<br><br><b>④ 论坛生态 / Forum Ecosystem</b><br>让角色自动参与回声沙龙（论坛），在广场发帖、在树洞倾诉、发布世界事件。<br>1) 打开"角色自动发帖"开关<br>2) 设置"发帖冷却时间（小时）"：相邻两次发帖的最短间隔<br>3) 测试按钮：<br>&nbsp;&nbsp;&nbsp;- 测广场：强制让角色发一条广场动态<br>&nbsp;&nbsp;&nbsp;- 测树洞：强制让角色在树洞发一条<br>&nbsp;&nbsp;&nbsp;- 测事件：强制生成一条世界事件<br><br><b>注意事项</b><br>- 所有 Agent 功能都需要 API 配好才能生效（AI 需要接口才能生成内容）<br>- 这里大多数设置改完会自动保存，不需要额外点"保存"<br>- 如果你觉得角色太吵：关掉总开关就能让一切安静下来<br>- 频率不要设太高，避免 API 额度消耗过快',
          action: () => Router.go('settings')
        }
      ],
      action: () => Router.go('settings')
    },

    // ============================================================
    // 行程生活 (Lifestyle) — 外部模块 lifestyle.js
    // ============================================================
    {
      id: 'lifestyle',
      title: '行程生活 (Lifestyle)',
      keywords: '行程,生活,日程,时间表,lifestyle,schedule,routine',
      description: '这是"行程/生活系统"。你可以为角色生成或管理日程，让生活有节奏、有轨迹。<br><br><b>前提</b><br>行程是"按角色"来的：你需要先在<b>角色档案</b>里建立角色，否则行程列表里不会有可点的对象。<br><br><b>怎么用（新手 3 步）</b><br>1) 先去角色档案建立角色<br>2) 打开行程生活，选择一个角色进入详情<br>3) 查看/生成/记录这一天的行程<br><br><b>小提示</b><br>当你想写"日常感""现实时间推进"，行程会特别好用。',
      features: [
        {
          id: 'ls-choose',
          title: '选择角色 (Choose)',
          keywords: '选择,角色,列表,choose',
          description: '先在列表里选一个角色，进入它的行程详情。<br><br><b>前提</b><br>如果这里没有角色卡片：先去<b>角色档案</b>新建角色。<br><br><b>怎么用</b><br>1) 打开行程生活列表<br>2) 点一个角色卡片<br>3) 进入详情页',
          action: () => Router.go('lifestyle')
        },
        {
          id: 'ls-detail',
          title: '查看与记录 (Detail)',
          keywords: '详情,记录,log,detail',
          description: '在详情页里查看这一天发生了什么，也可以把关键事件记录下来，形成"生活痕迹"。',
          action: () => Router.go('lifestyle')
        },
        {
          id: 'ls-temporal-axis',
          title: '时间轴：点日期切换简报 (Temporal Axis)',
          keywords: '时间轴,日期,切换,brief,axis,day',
          description: '行程详情页上方通常有"时间轴/日期轴"。你可以点不同日期，切换当天的简报与记录视图，用来快速浏览这一段时间的生活轨迹。',
          action: () => Router.go('lifestyle')
        },
        {
          id: 'ls-routine-config',
          title: '作息配置：ROUTINE CONFIG 与重建 (Routine Config)',
          keywords: '作息,配置,routine config,重建,rebuild,确认',
          description: '行程里可能有一个"ROUTINE CONFIG"配置面板，用来查看/调整作息时间线。重建（rebuild）通常会先弹确认，再清理当天缓存并重新生成作息与日程。',
          action: () => Router.go('lifestyle')
        }
      ],
      action: () => Router.go('lifestyle')
    }
  ];

  // detail view 内的二级/三级导航
  let _detailItemId = null;
  let _detailFeatureId = null;

  // 模块初始化，负责注入 HTML 和绑定基础事件
  function init() {
    const html = `
      <div id="codex-screen" class="screen" style="z-index: 150;">
        <div class="bg-watermark">C</div>
        
        <div class="main-view" id="codex-main-view">
          <button class="main-back-btn" onclick="Router.back()">Back</button>
          <header class="main-header" style="margin-bottom: 24px;">
            <h1 class="main-title">Codex</h1>
            <div class="main-subtitle">MANUAL & INDEX</div>
          </header>

          <div class="input-wrapper" style="margin-bottom: 30px; padding: 0;">
            <input type="search" id="codex-search-input" class="input-line" placeholder="搜索功能..." autocomplete="off">
          </div>

          <div class="menu-list" id="codex-list"></div>
        </div>

        <div id="codex-detail-view" class="settings-page">
          <div class="nav-bar">
            <span class="nav-title" id="codex-detail-title">功能介绍</span>
            <button class="sub-back-btn" onclick="CodexModule.backDetail()">Back</button>
          </div>
          <div class="content-scroll" id="codex-detail-content" style="padding:30px 40px;"></div>
        </div>
      </div>
    `;
    
    const deviceEl = document.querySelector('.device');
    if (deviceEl) {
      deviceEl.insertAdjacentHTML('beforeend', html);
    }
    
    document.getElementById('codex-search-input')?.addEventListener('input', (e) => {
      renderList(e.target.value);
    });
  }

  function open() {
    Router.go('codex');
    const searchInput = document.getElementById('codex-search-input');
    if (searchInput) searchInput.value = '';
    renderList();
  }

  function renderList(query = '') {
    const listEl = document.getElementById('codex-list');
    if (!listEl) return;

    const lowerQuery = query.toLowerCase().trim();
    const filtered = TUTORIAL_DATA.filter(item => {
      if (!lowerQuery) return true;
      const fullText = `${item.title} ${item.keywords} ${item.description}`.toLowerCase();
      return fullText.includes(lowerQuery);
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align:center;color:var(--text-sub);padding:40px 0;font-family:'Space Mono',monospace;font-size:0.8rem;">NO RESULTS</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(item => `
      <div class="menu-item" onclick="CodexModule.openDetail('${item.id}')">
        <span class="menu-text-cn">${item.title}</span>
        <span class="menu-text-en">${item.keywords.split(',')[0]} & more</span>
      </div>
    `).join('');
  }

  function openDetail(id) {
    const item = TUTORIAL_DATA.find(i => i.id === id);
    if (!item) return;

    _detailItemId = item.id;
    _detailFeatureId = null;
    _renderDetail();
    document.getElementById('codex-detail-view').classList.add('active');
  }

  function backDetail() {
    if (_detailItemId && _detailFeatureId) {
      _detailFeatureId = null;
      _renderDetail();
      return;
    }
    closeDetail();
  }

  function closeDetail() {
    _detailItemId = null;
    _detailFeatureId = null;
    document.getElementById('codex-detail-view').classList.remove('active');
  }

  function openFeature(featureId) {
    if (!_detailItemId) return;
    const item = TUTORIAL_DATA.find(i => i.id === _detailItemId);
    if (!item || !Array.isArray(item.features)) return;
    const f = item.features.find(x => x.id === featureId);
    if (!f) return;
    _detailFeatureId = f.id;
    _renderDetail();
  }

  function _renderDetail() {
    if (!_detailItemId) return;
    const item = TUTORIAL_DATA.find(i => i.id === _detailItemId);
    if (!item) return;

    const titleEl = document.getElementById('codex-detail-title');
    const contentEl = document.getElementById('codex-detail-content');
    if (!titleEl || !contentEl) return;

    const hasFeatures = Array.isArray(item.features) && item.features.length > 0;
    if (!hasFeatures) {
      titleEl.textContent = item.title;
      contentEl.innerHTML = `
        <h2 style="font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:600; margin-bottom:24px;">${item.title}</h2>
        <p style="font-size:1rem; line-height:1.8; color:var(--s-text-primary); text-align: justify;">${item.description}</p>
        <button class="btn-primary" style="margin-top:40px; border-radius: 100px;" onclick="CodexModule.executeAction('${item.id}')">
          前往功能 (Go to Feature)
        </button>
      `;
      return;
    }

    // 二级：功能目录
    if (!_detailFeatureId) {
      titleEl.textContent = item.title;
      const list = item.features.map(f => `
        <div class="menu-item" onclick="CodexModule.openFeature('${f.id}')">
          <span class="menu-text-cn">${f.title}</span>
          <span class="menu-text-en">${(f.keywords || '').split(',')[0] || 'feature'} & more</span>
        </div>
      `).join('');
      contentEl.innerHTML = `
        <h2 style="font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:600; margin-bottom:14px;">${item.title}</h2>
        <p style="font-size:0.95rem; line-height:1.75; color:var(--s-text-primary); text-align: justify; opacity:0.9;">${item.description}</p>
        <div style="margin-top:26px; font-family:'Space Mono',monospace; font-size:0.65rem; letter-spacing:2px; text-transform:uppercase; color:var(--text-sub);">FEATURES</div>
        <div class="menu-list" style="margin-top:14px;">${list}</div>
        <button class="btn-primary" style="margin-top:34px; border-radius: 100px;" onclick="CodexModule.executeAction('${item.id}')">
          前往该 App (Open App)
        </button>
      `;
      return;
    }

    // 三级：功能详情
    const f = item.features.find(x => x.id === _detailFeatureId);
    if (!f) {
      _detailFeatureId = null;
      _renderDetail();
      return;
    }
    titleEl.textContent = f.title;
    contentEl.innerHTML = `
      <h2 style="font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:600; margin-bottom:24px;">${f.title}</h2>
      <p style="font-size:1rem; line-height:1.8; color:var(--s-text-primary); text-align: justify;">${f.description}</p>
      <button class="btn-primary" style="margin-top:40px; border-radius: 100px;" onclick="CodexModule.executeFeatureAction('${_detailItemId}','${f.id}')">
        前往功能 (Go to Feature)
      </button>
    `;
  }

  function executeAction(id) {
    const item = TUTORIAL_DATA.find(i => i.id === id);
    if (item && typeof item.action === 'function') {
      closeDetail();
      setTimeout(() => {
        item.action();
      }, 400);
    }
  }

  function executeFeatureAction(itemId, featureId) {
    const item = TUTORIAL_DATA.find(i => i.id === itemId);
    const f = item && Array.isArray(item.features) ? item.features.find(x => x.id === featureId) : null;
    if (f && typeof f.action === 'function') {
      closeDetail();
      setTimeout(() => f.action(), 400);
      return;
    }
    if (item && typeof item.action === 'function') executeAction(item.id);
  }

  return { init, open, renderList, openDetail, openFeature, backDetail, closeDetail, executeAction, executeFeatureAction };
})();

window.CodexModule = CodexModule;