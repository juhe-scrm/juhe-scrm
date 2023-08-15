<p style="text-align: center">
  <img alt="logo" height="48" src="https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/openscrm_logo.svg">
</p>

<h3 style="text-align: center">
安全，强大，易开发的企业微信SCRM
</h3>

[安装](#如何安装) |
[截图](#项目截图) 

### 项目简介

> 此项目为OpenSCRM管理后台前端项目

### 在线演示

http://dashboard.demo.openscrm.cn:8000/

### 如何安装
- 修改config/proxy.ts，将后端接口地址修改为你的后端服务地址，如：http://127.0.0.1:8080/
```shell
  dev: { #开发环境
    '/api/': {
      target: 'http://127.0.0.1:8080/', # 后端接口地址
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
```

- 安装tyarn，安装tyarn是淘宝加速过的yarn
```shell
npm -g install tyarn
```

- 安装项目依赖
```shell
tyarn install
```

- 修改配置文件
```shell
config/config.ts
```


- 启动开发环境
```shell
tyarn start
```

此前端项目是基于Antd Pro的，备查文档：https://pro.ant.design/zh-CN/docs/overview

### 项目截图
![](https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/%E7%99%BB%E5%BD%95.png)
![](https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/%E5%90%8E%E5%8F%B0%E9%A6%96%E9%A1%B5.png)
![](https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/%E4%BF%AE%E6%94%B9%E6%B8%A0%E9%81%93%E6%B4%BB%E7%A0%81.png)
![](https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/%E4%BC%9A%E8%AF%9D%E5%AD%98%E6%A1%A3.png)
![](https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/%E4%BF%AE%E6%94%B9%E6%B8%A0%E9%81%93%E6%B4%BB%E7%A0%812.png)
![](https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/%E5%AE%A2%E6%88%B7%E6%A0%87%E7%AD%BE%E7%AE%A1%E7%90%86.png)
![](https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/%E4%BF%AE%E6%94%B9%E7%BE%A4%E5%8F%91.png)
![](https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/%E4%BF%AE%E6%94%B9%E6%AC%A2%E8%BF%8E%E8%AF%AD.png)

### 技术栈
* [React](https://zh-hans.reactjs.org/)
* [TypeScript](https://www.tslang.cn/docs/handbook/typescript-in-5-minutes.html)
* [Ant Design](https://ant.design/components/overview-cn/)
* [Ant Design Pro](https://pro.ant.design/zh-CN/docs/overview)
* [Pro Components](https://procomponents.ant.design/components)

### 联系作者

<img src="https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/screenshots/qrcode.png" width="200" />

扫码可加入交流群

### 版权声明

OpenSCRM遵循Apache2.0协议，可免费商用
