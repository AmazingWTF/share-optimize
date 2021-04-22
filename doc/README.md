# 性能优化指南

## 性能检测工具

+ `Chrome Devtools` [参考文章](https://juejin.cn/post/6844903961472974855)
  + [详解](./devtools.md)

+ `Lighthouse` Google Chrome推出的一个开源自动化工具，作为Chrome的扩展安装

  ![展示](./assets/lighthouse.png)

  > 名词解释：

  + First Contentful Paint（FCP），衡量页面开始加载到页面中第一个元素被渲染之间的时间。元素包含文本、图片、canvas等。

  + Speed Index， 速度指数，页面呈现出来的平均时间。

  + Largest Contentful Paint（LCP），衡量标准视口内可见的最大内容元素的渲染时间。元素包括img、video、div及其他块级元素。

  + Time to Interactive（TTI），首次可交互时间。页面可以开始响应用户输入事件。

  + Total Blocking Time（TBT），衡量从FCP到TTI之间主线程被阻塞时长的总和。

  + Cumulative Layout Shift（CLS，累计布局偏移），网页布局在加载期间的偏移量。

+ `PageSpeed Insights` 谷歌开发的一个免费的网页分析工具

+ `Speedcurve` 前端性能综合监控网站，可以在网站输入被测网站的 url 地址，进行测试

+ `SiteSpeed` 一款开源的，可以用于监控和检查网站性能的工具。可以通过 docker 镜像或 npm 方式来使用

## 优化事项

+ 代码层面(前端可以做)

  + 压缩静态资源(img js html css等)，使用webpack、gulp 等构建工具

  + 静态资源使用 CDN 加载

  + 使用`webpack`等类似工具，进行代码分包，按需加载

  + 事件绑定，使用事件委托

  + 减少http请求次数，将多个小文件合并为一个大文件
    + 浏览器并发限制：不同浏览器针对`统一域名下`的并发请求数量有限制，如果超出的话，就会阻塞

  + 将css放在页面顶部，js放在页面底部

  + 图片优化
    + 合适大小：不同分辨率使用合适大小图片，防止加载过大图片浪费带宽
    + 懒加载
    + 指定明确宽高：防止重排，防止CLS(累计布局偏移)
    + 使用webp格式图片，获取更小的体积

  + 使用 `requestAnimationFrame` 实现动画(兼容的情况下)

  + 使用 transform 和 opacity 属性更改来实现动画(配合 translate3D 开启硬件加速)

  + 尽量使用canvas或者css实现动画，不用dom实现

  + 减少[重绘、重排](./repaint-reflow.md)

  + 使用 `icon font` 替代小图标

  + SEO 针对爬虫优化
    <table>
      <caption>SPA vs SSR</caption>
      <tr>
        <th>模式</th>
        <th>开发成本</th>
        <th>SEO</th>
        <th>首屏渲染</th>
        <th>服务端压力</th>
      </tr>
      <tr>
        <td>SPA</td>
        <td>较低</td>
        <td>较差</td>
        <td>较差</td>
        <td>较低</td>
      </tr>
      <tr>
        <td>SSR</td>
        <td>较高</td>
        <td>较好</td>
        <td>较好</td>
        <td>较高</td>
      </tr>
    </table>

    + 如果可以的话，使用 `prerender-spa-plugin` 插件配合 `webpack` 将SPA页面转化成html
      + [参考文章](https://juejin.cn/post/6844903687580549128)
      + 原理：利用了 `Puppeteer` 的爬取页面的功能，将本地服务吐出的 HTLML 页面爬取存储，生成静态页面，优化SEO
      + 注意：
        + router 需要配成 history 模式
        + router 不能有懒加载路由

    ```js
      // webpack 配置
      // code /Users/wenjie/Documents/self/lottie
      const PrerenderSPAPlugin = require('prerender-spa-plugin')
      ...
      new PrerenderSPAPlugin({
        staticDir: config.build.assetsRoot,
        routes: [ '/', '/Contacts' ], // 需要预渲染的路由（视你的项目而定）
        minify: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          keepClosingSlash: true,
          sortAttributes: true
        }
      })
    ```

    + `meta`: 合理设计description keywords

    + `title`: 强调重点信息，重要的关键词放前面，尽量不要重复

    + `a`: 防止爬虫跳出当前网站
      + 页内链接：加title属性说明
      + 外部链接：加 rel="nofollow"，告诉爬虫不要爬，否则爬虫就不会回来了

    + `H1`: 一个页面有且只能有一个，爬虫认为 `H1标签最重要`

    + `strong em`: 表示强调
      + strong 标签权重比较高，可用于强调重要内容
      + 权重等级： strong > em

    + `display: none`: display: none 的内容，会被爬虫忽略

    + 重要内容不要放到js中渲染: 爬虫只会爬取html内容

  + 使用 `switch case` 代替 `if-else` (更直观，易拓展)

  + 降低css选择器的层级: css选择器解析是`从左向右` [参考链接](https://juejin.cn/post/6844903512447401991)

  + 如果可以，使用 `PWA - 渐进式Web应用程序`
    + 可以添加至主屏幕(类似app)
    + 离线缓存功能，离线情况下依然可以使用部分功能
    + 消息推送

+ 运维 or 后端
  + 域名分片 [哔哩哔哩](https://t.bilibili.com/?spm_id_from=333.851.b_696e7465726e6174696f6e616c486561646572.30)
    + 解决浏览器并发请求限制问题
    + 分离静态资源和请求接口，让请求静态资源的时候不携带无关的 `cookie` 等资源，增加请求数据大小

  + 尽可能使用缓存
    + 缓存处理
      + SPA项目的index.html：协商缓存 > 彻底不缓存
      + 其他静态资源：使用webpack的文件hash值，配合使用强缓存，设置较长缓存时间

    + [缓存分类](./cache.md)
      + 强缓存
      + 协商缓存

  + gzip：运维开启gzip的前提下，前段可以使用 `CompressionWebpackPlugin` 将文件打包成 .gz 文件，这样的话就不用占用服务器资源去压缩，而是直接取同名的 .gz 文件

  + 使用 `http2` [参考地址](https://developers.google.com/web/fundamentals/performance/http2?hl=zh-cn)
    + 完全兼容http1
      + http2是对http1的拓展，而非替代，提供的功能不变，HTTP 方法、状态代码、URI 和标头字段等这些核心概念也不变(无感切换)

    + 二进制分帧
      + http1使用`换行符`作为分隔符，而`http2`则将所有传输的信息分割为更小的消息和帧，并采用二进制编码，解析速度更快

    + 多路复用
      + http1中，多个并行请求使用多个TCP连接，并且每个连接每次只交付一个响应(响应排队)
      + http2中：同个域名的请求，只需要占用一个TCP连接，C和S将http消息分解为互不依赖的帧，然后交错发送，再在另一端重新组装起来
      + 可以减少使用针对http1的优化手段，e.g. `域名分片` `精灵图` 等 (精灵图还是需要的)

    + 服务器推送

    + 头部压缩
      + 每个http请求都会携带一个header，携带 `cookie` 等字段
      + http1中：元数据始终以文本形式携带，增加开销
      + http2中：通过编码+索引方式，做到类似diff算法的处理，使得相同的header字段不传输(使用索引替代)，只传输变化的

    + 流量控制(没理解)

    ![图例](./assets/header.png)

  
