import SITE_CONFIG from "@/config";
const { vhMusicApi } = SITE_CONFIG;
import { $GET } from '@/utils/index'
// 保留静态引入：CSS 随入口 JS 非阻塞注入；若改成动态 import，Astro 会将其提升为渲染阻塞的 <link>（与 waline 样式同理）
import 'aplayer/dist/APlayer.min.css';

// 初始化音乐播放器
export default async (MusicList: any[]) => {
  const musicDOM: any = document.querySelectorAll(".vh-node.vh-vhMusic");
  if (!musicDOM.length) return;
  // aplayer JS 按需加载：全站当前无音乐，静态引入会让 ~58KB 播放器 JS 常驻每页入口
  const { default: APlayer } = await import('aplayer');
  musicDOM.forEach(async (container: any) => {
    const { type = 'song', server = 'netease', id } = container.dataset;
    const audio = await $GET(`${vhMusicApi}?server=${server}&type=${type}&id=${id}&r=${Math.random()}`);
    const ap = new APlayer({ container, audio, lrcType: 3 });
    MusicList.push(ap);
  });
};
