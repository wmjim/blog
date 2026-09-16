import { test } from "node:test";
import assert from "node:assert/strict";
// Node 24 内置类型剥离，直接 import .ts 源码，测试即真实运行时模块
import { addClassNames } from "../src/plugins/markdown.custom.ts";

// 构造仅含一个 <a> 的 HAST 树，跑插件后返回该节点
function runLink(href) {
  const tree = {
    type: "root",
    children: [{ type: "element", tagName: "a", properties: { href }, children: [{ type: "text", value: "链接" }] }],
  };
  addClassNames({ base: "/blog/", site: "https://wmjim.github.io/blog" })(tree);
  return tree.children[0];
}

test("站外链接：新窗口打开并标记 noopener noreferrer nofollow", () => {
  const node = runLink("https://example.com/post");
  assert.equal(node.properties.target, "_blank");
  assert.equal(node.properties.rel, "noopener noreferrer nofollow");
});

test("站内绝对链接：不新窗口、不加 nofollow，避免权重流失", () => {
  for (const href of [
    "https://wmjim.github.io/blog/article/abc",
    "https://wmjim.github.io/blog/tags/NixOS",
  ]) {
    const node = runLink(href);
    assert.equal(node.properties.target, undefined, href);
    assert.equal(node.properties.rel, undefined, href);
  }
});

test("相对路径链接：视为站内，不加 target/rel", () => {
  for (const href of ["/blog/article/abc", "article/abc", "../archives", "/about"]) {
    const node = runLink(href);
    assert.equal(node.properties.target, undefined, href);
    assert.equal(node.properties.rel, undefined, href);
  }
});

test("页内锚点：不加 target/rel，避免错误跳转", () => {
  const node = runLink("#标题");
  assert.equal(node.properties.target, undefined);
  assert.equal(node.properties.rel, undefined);
});

test("非 http(s) 协议链接：不按外链处理", () => {
  for (const href of ["mailto:a@b.com", "tel:+8613800138000"]) {
    const node = runLink(href);
    assert.equal(node.properties.target, undefined, href);
    assert.equal(node.properties.rel, undefined, href);
  }
});

test("协议相对链接（//example.com）：按站外处理", () => {
  const node = runLink("//example.com/x");
  assert.equal(node.properties.target, "_blank");
  assert.equal(node.properties.rel, "noopener noreferrer nofollow");
});

test("无 href 链接（如未填地址的 btn）：不加 target/rel，子元素仍包裹 span", () => {
  const node = runLink(undefined);
  assert.equal(node.properties.target, undefined);
  assert.equal(node.children.length, 1);
  assert.equal(node.children[0].tagName, "span");
});

test("子元素 span 包裹对站内外链接均保留（btn 组件 a>span 样式依赖此结构）", () => {
  for (const href of ["https://example.com", "/blog/article/abc"]) {
    const node = runLink(href);
    assert.equal(node.children[0].tagName, "span", href);
    assert.deepEqual(node.children[0].children, [{ type: "text", value: "链接" }]);
  }
});
