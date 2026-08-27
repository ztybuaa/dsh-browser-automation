# 元素定位用 accessibility 快照 + 数字索引 ref

浏览器插件让模型定位页面元素时，不采用「模型手写 CSS/XPath selector」，而是每轮先用 `browser_snapshot` 返回带数字索引（`[1]` `[2]`…）的可交互元素列表，模型用 `click(ref=3)` 这类索引引用。

理由：raw selector 需要模型猜测选择器，页面微调即失效；accessibility 快照 + 索引是 browser-use / playwright-mcp / npm `dsh-browser-playwright` 的通用做法，模型只需引用稳定编号，稳健得多。代价是每轮多一次 snapshot 往返。

快照只列出当前可见（有实际渲染框、非 `display:none`/`visibility:hidden`）的元素；被 CSS 隐藏的元素（如隐藏的提交按钮）不进入快照，避免模型对着点不到的元素发动作。

考虑过的替代：raw selector（`xu1132/dsh-plugin-browser` 现状）——实现简单但脆弱，已弃用。
