// remarkMermaid — 将 mermaid 代码块转为原始 HTML，避免 Shiki 处理，供客户端 mermaid 渲染
import { visit } from 'unist-util-visit';

const remarkMermaid = () => {
  return (tree: any) => {
    visit(tree, 'code', (node: any, index: number | null, parent: any) => {
      if (node.lang !== 'mermaid') return;
      if (!parent || index === null) return;

      // 将 mermaid 代码块替换为原生 HTML 节点
      // 这样 Shiki 和 rehype 的 addClassNames 都不会处理它
      const htmlNode = {
        type: 'html',
        value: `<pre class="mermaid">${node.value}</pre>`,
      };

      parent.children.splice(index, 1, htmlNode);
    });
  };
};

export default remarkMermaid;
