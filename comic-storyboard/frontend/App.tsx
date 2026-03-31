import { StatusBar } from "expo-status-bar";
import { useState, useRef, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform as ExpoPlatform } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Modal,
  FlatList,
  Share,
  KeyboardAvoidingView,
  Platform as RNPlatform,
} from "react-native";
import Svg, { Path, Defs, Stop, Rect, Circle, LinearGradient as SvgLinearGradient } from "react-native-svg";
import { API_BASE } from "./api";
import HomeScreen from "./screens/HomeScreen";
import { Colors, Radius, Fonts, Spacing, Shadows } from "./theme";
import { ScriptResult, StyleKey, STYLE_OPTIONS, PANEL_OPTIONS } from "./types";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Bokeh 背景（CSS 渐变光斑） ───
const BOKEH_BLOBS = [
  { w: 70, h: 70, x: -25, y: -14, colors: ["#46F080", "rgba(70,240,138,0.15)"], blur: 75 },
  { w: 74, h: 74, x: 63, y: 210, colors: ["#5F27FF", "#CAB8FF"], blur: 75 },
  { w: 60, h: 60, x: 324, y: 232, colors: ["#7C46F0", "rgba(124,70,240,0.15)"], blur: 75 },
  { w: 118, h: 118, x: 295, y: 331, colors: ["#EDF046", "rgba(240,233,70,0.15)"], blur: 75 },
  { w: 96, h: 96, x: -38, y: 540, colors: ["#46BDF0", "rgba(70,179,240,0.15)"], blur: 75 },
  { w: 58, h: 58, x: 231, y: 767, colors: ["#F0B646", "rgba(240,203,70,0.15)"], blur: 65 },
];
const BokehBG = () => (
  <View style={[StyleSheet.absoluteFill, { overflow: "hidden", backgroundColor: "#FFFFFF" }]} pointerEvents="none">
    {BOKEH_BLOBS.map((b, i) => (
      <View
        key={i}
        style={{
          position: "absolute",
          width: b.w,
          height: b.h,
          left: b.x,
          top: b.y,
          borderRadius: b.w / 2,
          backgroundImage: `linear-gradient(180deg, ${b.colors[0]} 0%, ${b.colors[1]} 100%)`,
          filter: `blur(${b.blur}px)`,
        } as any}
      />
    ))}
  </View>
);

// ─── App Logo ───
const AppLogo = ({ size = 48 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
    <Rect width="200" height="200" rx="60" fill="#5727D7" />
    <Path d="M107.374 87.5956C103.322 86.0408 103.322 80.4614 107.374 78.9066L113.39 76.5981C114.627 76.1234 115.606 75.1706 116.094 73.967L118.466 68.1137C120.064 64.1714 125.799 64.1714 127.397 68.1137L129.769 73.967C130.257 75.1706 131.236 76.1234 132.474 76.5981L138.489 78.9066C142.541 80.4614 142.541 86.0408 138.489 87.5956L132.474 89.9041C131.236 90.3788 130.257 91.3316 129.769 92.5352L127.397 98.3885C125.799 102.331 120.064 102.331 118.466 98.3885L116.094 92.5352C115.606 91.3316 114.627 90.3788 113.39 89.9041L107.374 87.5956Z" fill="white" />
    <Path d="M138.548 58.0793C134.48 56.4751 134.48 50.7185 138.548 49.1143L140.21 48.4588C141.452 47.969 142.435 46.986 142.924 45.7441L143.58 44.082C145.184 40.0145 150.941 40.0145 152.545 44.082L153.2 45.7441C153.69 46.986 154.673 47.969 155.915 48.4588L157.577 49.1143C161.645 50.7185 161.645 56.4751 157.577 58.0793L155.915 58.7348C154.673 59.2246 153.69 60.2076 153.2 61.4494L152.545 63.1115C150.941 67.1791 145.184 67.1791 143.58 63.1115L142.924 61.4494C142.435 60.2076 141.452 59.2246 140.21 58.7348L138.548 58.0793Z" fill="white" />
    <Path d="M100.038 43.3758C97.7252 42.4636 97.7252 39.1904 100.038 38.2782C100.744 37.9997 101.303 37.4408 101.582 36.7346C102.494 34.4218 105.767 34.4218 106.679 36.7346C106.958 37.4408 107.517 37.9997 108.223 38.2782C110.536 39.1904 110.536 42.4636 108.223 43.3758C107.517 43.6543 106.958 44.2132 106.679 44.9194C105.767 47.2322 102.494 47.2322 101.582 44.9194C101.303 44.2132 100.744 43.6543 100.038 43.3758Z" fill="white" />
    <Path d="M91.2672 62.4661C97.0965 62.4661 101.822 67.1917 101.822 73.021C101.822 78.8503 97.0965 83.5759 91.2672 83.5759C85.3028 83.5759 79.4722 85.3445 74.513 88.6581C69.5537 91.9717 65.6879 96.6819 63.4054 102.192C61.123 107.703 60.5259 113.766 61.6894 119.616C62.853 125.466 65.7258 130.839 69.9433 135.057C74.1608 139.274 79.5341 142.147 85.384 143.311C91.2337 144.474 97.2973 143.877 102.808 141.595C108.318 139.312 113.028 135.446 116.342 130.487C119.656 125.528 121.424 119.697 121.424 113.733C121.424 107.904 126.15 103.178 131.979 103.178C137.808 103.178 142.534 107.904 142.534 113.733C142.534 123.872 139.527 133.784 133.894 142.215C128.261 150.646 120.254 157.217 110.886 161.098C101.518 164.978 91.2104 165.993 81.2659 164.015C71.3211 162.037 62.1858 157.154 55.016 149.984C47.8462 142.814 42.9631 133.679 40.985 123.734C39.007 113.79 40.0224 103.482 43.9025 94.1142C47.7828 84.7464 54.3542 76.739 62.785 71.1058C71.2157 65.4726 81.1276 62.4661 91.2672 62.4661Z" fill="white" />
  </Svg>
);

// ─── Tab 栏图标 ───
const IconSparkle = ({ color = Colors.primary, size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </Svg>
);
const IconGlobe = ({ color = "#717171", size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    <Path d="M2 12h20" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
  </Svg>
);

// ─── Lucide SVG 图标 ───
const IconBell = ({ color = Colors.foreground, size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  </Svg>
);
const IconArrowLeft = ({ color = Colors.foreground, size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="m12 19-7-7 7-7" />
    <Path d="M19 12H5" />
  </Svg>
);
const IconCheck = ({ color = "#fff", size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6 9 17l-5-5" />
  </Svg>
);
const IconSearch = ({ color = "#717171", size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);
const IconSettings = ({ color = Colors.foreground, size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  </Svg>
);
const IconUser = ({ color = "#FFFFFF", size = 28 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
  </Svg>
);
const IconChevronRight = ({ color = "#717171", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="m9 18 6-6-6-6" />
  </Svg>
);
const IconImage = ({ color = "#5F33E1", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <Path d="M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <Path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
  </Svg>
);
const IconFileText = ({ color = "#FF9500", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <Path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <Path d="M10 9H8" />
    <Path d="M16 13H8" />
    <Path d="M16 17H8" />
  </Svg>
);
const IconBookmark = ({ color = "#34C759", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </Svg>
);
const IconHeart = ({ color = "#FF3B30", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);
const IconHeartSmall = ({ color = "#FF6B6B", size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);
const IconHistory = ({ color = "#007AFF", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

// ─── 灵感卡片 mock 详情（6格完整脚本） ───
const MOCK_DETAIL_PANELS: Record<number, { image: string; scene: string; dialogue: string }[]> = {
  1: [
    { image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face", scene: "高档法式餐厅包间，暖黄色水晶吊灯映在红酒杯上。男人穿着深蓝西装，对面坐着一位妆容精致的年轻女孩，两人举杯碰杯，气氛暧昧。", dialogue: "（旁白）林昊以为，分手三个月后，一切都翻篇了。" },
    { image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face", scene: "餐厅大门被推开，一道纤细的身影逆光而入。红色连衣裙、波浪长发、唇角微扬——是前女友苏晚。她的目光精准地锁定了包间的方向。", dialogue: "好久不见啊，林昊。新女朋友挺漂亮的嘛。" },
    { image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&crop=face", scene: "林昊的笑容瞬间凝固，手中的酒杯微微发抖。额头渗出细密的汗珠，他下意识地把手机屏幕扣在桌面上。", dialogue: "苏晚？！你……你怎么知道我在这？" },
    { image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop&crop=face", scene: "苏晚优雅地坐到旁边的空位上，从包里掏出一个牛皮纸信封，轻轻推到林昊面前。信封上写着「给林昊的礼物」。新女友一脸茫然地看着两人。", dialogue: "别紧张，我不是来闹的。这个送你，我花了三个月准备的。打开看看？" },
    { image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face", scene: "林昊颤抖着打开信封——里面是一沓打印好的截图。聊天记录、转账记录、酒店开房记录……全部指向他在恋爱期间脚踩三条船的证据。新女友从他手中抢过截图，越看脸色越白。", dialogue: "（新女友）这……这些女生都是谁？你不是说你单身三年了吗？！" },
    { image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=face", scene: "苏晚起身，理了理裙摆，嘴角的弧度终于完整。她走到门口，回头看了一眼满脸惊恐的林昊和正在摔杯子的新女友。餐厅经理闻声赶来。", dialogue: "祝你们……聊得愉快。对了，这顿饭我已经买单了，当作分手礼。" },
  ],
  2: [
    { image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=800&fit=crop", scene: "午夜十二点的城市天际线，霓虹灯在雨水中晕成一片模糊的光斑。地铁末班车的广播声在空旷的站台回荡，只剩一个戴耳机的年轻人坐在长椅上发呆。", dialogue: "（旁白）陈默每天都坐末班地铁。不是因为加班，是因为只有这个时间，城市才像另一个世界。" },
    { image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=800&fit=crop", scene: "空无一人的车厢里，灯光突然闪烁了三下。当灯光恢复时，对面座位上凭空出现了一个穿着旧式校服的女孩，正低头翻看一本泛黄的书，仿佛一直在那里。", dialogue: "（陈默内心）等等……她刚才不在这里。我确定。" },
    { image: "https://images.unsplash.com/photo-1504714146340-959ca07e1f38?w=600&h=800&fit=crop", scene: "陈默摘下耳机试探着搭话，女孩抬头，露出一张干净的脸。她微笑着把书翻到某一页递过来——上面画着一幅城市地图，但所有建筑都是倒过来的。", dialogue: "你也看到了对吧？窗外的那些楼，和这张图是不是一模一样？" },
    { image: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=600&h=800&fit=crop", scene: "陈默猛地转头看向车窗外——原本应该是隧道的黑暗中，竟然出现了一整座倒悬的城市，建筑像钟乳石一样从「天花板」垂下来，街道上有微弱的灯火在流动。", dialogue: "这……这不可能……我们现在到底在哪？！" },
    { image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=800&fit=crop", scene: "地铁缓缓停靠在一个从未见过的站台。站名牌上写着三个字——「忘归站」。车门打开，温暖的橘色灯光和咖啡的香气涌入车厢。女孩站起来，向他伸出手。", dialogue: "每天午夜十二点零三分，这趟车会经过这里。你要不要下来看看？" },
    { image: "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=600&h=800&fit=crop", scene: "陈默犹豫了三秒，还是握住了那只手。他踏出车门的瞬间，身后的地铁无声地消失了。站台尽头，一扇旋转门后面是一条铺满星光的街道，两侧的店铺招牌全是他童年记忆中消失已久的名字。", dialogue: "（旁白）从那天起，陈默再也没有坐过末班地铁。但每到午夜，他的手机相册里就会多出一张——他从未拍过的照片。" },
  ],
  101: [
    { image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=800&fit=crop", scene: "凌晨两点急诊大厅，值班护士打瞌睡。自动门突然开了，冷风灌入，门外空无一人。", dialogue: "（护士）又是风吹的……" },
    { image: "https://picsum.photos/seed/w101b/600/800", scene: "走廊尽头一个穿病号服的男人面朝墙壁。背面写着404。但医院只有三层。", dialogue: "你好？你是哪个科的？" },
    { image: "https://picsum.photos/seed/w101c/600/800", scene: "男人用指甲在墙上刻字：「别回头」。手电灭了。再亮时走廊空无一人。", dialogue: "（电话里自己的声音）别回头。别回头。" },
    { image: "https://picsum.photos/seed/w101d/600/800", scene: "白班护士进来，夜班同事安静坐着微笑。日志最后一行：「404病人已出院。」", dialogue: "（旁白）这家医院从来没有404房间。" },
  ],
  102: [
    { image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&crop=face", scene: "大学校园樱花飘落，校花林诗雨从图书馆出来。快递箱砸到脚边，寄件人写着「你未婚夫」。", dialogue: "谁寄的！我没有未婚夫！" },
    { image: "https://picsum.photos/seed/w102b/600/800", scene: "食堂一个戴眼镜的理工男坐到对面递饭卡。", dialogue: "我叫周也。我爸说我们订过娃娃亲。" },
    { image: "https://picsum.photos/seed/w102c/600/800", scene: "一周来他每天远远撑伞等她——天气预报说下午有雨。每次都准。", dialogue: "（闺蜜）打着灯笼找不到这种男的！" },
    { image: "https://picsum.photos/seed/w102f/600/800", scene: "暴雨天他走到面前，眼镜全是水。", dialogue: "不是因为娃娃亲。是因为喜欢你，从大一你弹吉他那天起。" },
  ],
  103: [
    { image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=800&fit=crop", scene: "仙尊渡劫失败，睁眼躺在高三宿舍下铺。数学23分。", dialogue: "修仙万年不曾受此屈辱！" },
    { image: "https://picsum.photos/seed/w103b/600/800", scene: "数学课被点名做三角函数，想用灵力——粉笔断了。全班笑。", dialogue: "（老师）这题初中就会了！" },
    { image: "https://picsum.photos/seed/w103d/600/800", scene: "体育课用轻功跑800米，9秒58。老师秒表掉了。", dialogue: "这破世界纪录了！" },
    { image: "https://picsum.photos/seed/w103e/600/800", scene: "同桌递纸条「你好帅」。万年仙尊脸红了。", dialogue: "（内心）凡人小女子怎么让本座心跳加速？" },
    { image: "https://picsum.photos/seed/w103f/600/800", scene: "深夜天台丹田灵力微恢复，天空闪过裂痕。", dialogue: "（旁白）他要学的第一课是做个普通人。" },
  ],
  104: [
    { image: "https://images.unsplash.com/photo-1504714146340-959ca07e1f38?w=600&h=800&fit=crop", scene: "老楼走廊贴满封条的铁门。新租客路过，门自己开了一条缝。", dialogue: "（房东）那扇门不要碰。" },
    { image: "https://picsum.photos/seed/w104b/600/800", scene: "半夜三点，指甲刮铁门的声音。清晨门口一双小孩红布鞋。", dialogue: "（大爷）十年前住过母女，后来只有母亲走了。" },
    { image: "https://picsum.photos/seed/w104e/600/800", scene: "贴着门听——小女孩哼歌。是妈妈唱过的摇篮曲。", dialogue: "（门后）姐姐……妈妈说你会来接我。" },
    { image: "https://picsum.photos/seed/w104f/600/800", scene: "手电照门缝，地上小脚印通向她房间。门，开着。", dialogue: "（旁白）她低头看向脚印终点。门里有人看着她。" },
  ],
  105: [
    { image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face", scene: "HR递过解聘通知：岗位取消。收拾工位翻到三个月前买的彩票——全中。", dialogue: "五百万？！" },
    { image: "https://picsum.photos/seed/w105b/600/800", scene: "彩票中心：当期唯一中奖，奖金池累积一个亿。扣税到手七千万。", dialogue: "（工作人员）需要理财顾问吗？" },
    { image: "https://picsum.photos/seed/w105c/600/800", scene: "商场偶遇前老板。穿着拖鞋短裤拎限量球鞋。老板一脸尴尬。", dialogue: "（老板）裁员的事是误会，要不回来？给你升总监。" },
    { image: "https://picsum.photos/seed/w105d/600/800", scene: "指了指身后写字楼——招牌正换成他的公司名。他买下了这栋楼。", dialogue: "不用了王总。对了你们租约到期了吧？续不续随你。" },
    { image: "https://picsum.photos/seed/w105e/600/800", scene: "走出大楼，阳光洒下。前同事群消息爆炸：「张远买了咱们公司那栋楼。」", dialogue: "（旁白）命运欠你的，会连本带利一起还。" },
  ],
};

// 动态生成独立6格故事（兜底）
const getDetailPanels = (cardId: number, cardImage: string, cardTitle: string) => {
  if (MOCK_DETAIL_PANELS[cardId]) return MOCK_DETAIL_PANELS[cardId];
  return [
    { image: cardImage, scene: `${cardTitle}——清晨主角收到一条神秘消息，指引去一个从未去过的地方。`, dialogue: "（旁白）命运的齿轮开始转动。" },
    { image: `https://picsum.photos/seed/${cardId}x2/600/800`, scene: "按指引来到陌生地点，门口站着一个似曾相识的人，微笑着说出不可能知道的秘密。", dialogue: "我等你很久了。你果然会来。" },
    { image: `https://picsum.photos/seed/${cardId}x3/600/800`, scene: "真相浮出水面——每个随机事件背后都有一只看不见的手。一张旧照片暴露了所有人不愿提起的过去。", dialogue: "你骗了我……从头到尾全是假的？" },
    { image: `https://picsum.photos/seed/${cardId}x4/600/800`, scene: "最终对决：不是武力较量，而是一个改变所有人命运的选择。", dialogue: "（旁白）最勇敢的事不是战斗，而是放手。" },
    { image: `https://picsum.photos/seed/${cardId}x5/600/800`, scene: "故事画上句号。手机再次亮起——又一条未知消息。一模一样的内容。", dialogue: "（旁白）也许故事从未结束。" },
  ];
};

// ─── Mock 评论数据池 ───
const COMMENT_POOL = [
  { user: "小红薯7749", avatar: "🧑", text: "天啊这个反转绝了，看完鸡皮疙瘩都起来了", time: "2小时前", likes: 42 },
  { user: "追剧少女", avatar: "👧", text: "画风好绝！每一帧都可以当壁纸", time: "3小时前", likes: 128 },
  { user: "吃瓜路人甲", avatar: "🧔", text: "感谢分享", time: "5小时前", likes: 3 },
  { user: "暴躁老哥", avatar: "👨", text: "就这？第二格剧情也太拉了吧", time: "6小时前", likes: 17 },
  { user: "文学少女", avatar: "👩", text: "台词写得真好，有种看电影的感觉", time: "8小时前", likes: 56 },
  { user: "路过的大叔", avatar: "🧓", text: "收藏了收藏了，回头慢慢看", time: "10小时前", likes: 8 },
  { user: "AI创作爱好者", avatar: "🤖", text: "这个是AI生成的吗？太强了吧！怎么做到的", time: "12小时前", likes: 89 },
  { user: "专业喷子", avatar: "😤", text: "人物表情不太自然，画风还需要改进", time: "1天前", likes: 24 },
  { user: "甜妹一枚", avatar: "🥰", text: "好好看好好看！！催更催更！", time: "1天前", likes: 201 },
  { user: "独角兽", avatar: "🦄", text: "已转发给朋友们了", time: "1天前", likes: 5 },
  { user: "深夜食堂", avatar: "🍜", text: "半夜看得停不下来，明天还要上班啊啊啊", time: "1天前", likes: 67 },
  { user: "画手小透明", avatar: "🎨", text: "作为画手表示这个构图非常专业", time: "2天前", likes: 34 },
  { user: "故事控", avatar: "📖", text: "剧情逻辑有点问题，但是画面确实好看", time: "2天前", likes: 45 },
  { user: "课代表", avatar: "🤓", text: "总结：第一格开场不错，中间节奏太快了", time: "2天前", likes: 12 },
  { user: "打工人小王", avatar: "💼", text: "摸鱼的时候看到的，差点笑出声被老板发现", time: "3天前", likes: 156 },
  { user: "二次元少女", avatar: "🌸", text: "这种画风我超喜欢的！求出教程", time: "3天前", likes: 78 },
  { user: "老六", avatar: "🎭", text: "我猜到结局了哈哈哈", time: "3天前", likes: 9 },
  { user: "热心网友", avatar: "❤️", text: "加油！期待更多作品", time: "4天前", likes: 31 },
  { user: "杠精本精", avatar: "🙄", text: "第三格的光影不对吧，太阳从西边出来了？", time: "4天前", likes: 22 },
  { user: "脑洞大开", avatar: "💡", text: "如果结尾换成主角其实是AI就更好了", time: "5天前", likes: 47 },
  { user: "退休老师", avatar: "👵", text: "年轻人的创意真是不错，就是字太小了", time: "5天前", likes: 6 },
  { user: "学生党", avatar: "📚", text: "能不能出个教程啊，我也想做这种", time: "6天前", likes: 18 },
  { user: "沉默的大多数", avatar: "😐", text: "看完了，不评价", time: "6天前", likes: 2 },
  { user: "柠檬精", avatar: "🍋", text: "酸了酸了，我怎么做不出来这种效果", time: "1周前", likes: 95 },
  { user: "夜猫子", avatar: "🦉", text: "凌晨三点刷到这个，后背发凉", time: "1周前", likes: 113 },
  { user: "颜控", avatar: "✨", text: "主角帅到我了！请问是什么模型生成的", time: "1周前", likes: 52 },
  { user: "挑刺王", avatar: "🔍", text: "第一格和第三格背景不一致，穿帮了", time: "1周前", likes: 14 },
  { user: "佛系玩家", avatar: "🧘", text: "随缘看看", time: "1周前", likes: 1 },
  { user: "催更狂魔", avatar: "📢", text: "更新更新更新！！！等到花儿都谢了！！", time: "2周前", likes: 167 },
  { user: "职业路人", avatar: "🚶", text: "从探索页刷到的，意外地好看", time: "2周前", likes: 29 },
];

// 根据 cardId 生成固定的评论列表（5~25条）
const getComments = (cardId: number) => {
  const seed = cardId * 7;
  const count = 5 + (seed % 21); // 5~25条
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(COMMENT_POOL[(seed + i * 3) % COMMENT_POOL.length]);
  }
  return result;
};

// ─── 探索页分类 & 瀑布流数据 ───
const EXPLORE_TABS = ["全部", "悬疑反转", "搞笑沙雕", "治愈温情", "暗黑爆爽"];
interface WaterfallItem { id: string; image: string; imgH: number; title: string; author: string; likes: string; tag: string }
const ALL_WATERFALL: WaterfallItem[] = [
  { id: "w1", tag: "悬疑反转", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=500&fit=crop", imgH: 200, title: "深夜医院来了一个奇怪的病人", author: "小月亮", likes: "328" },
  { id: "w2", tag: "搞笑沙雕", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=350&fit=crop&crop=face", imgH: 140, title: "校花竟是我的未婚妻", author: "甜橙子", likes: "1.5k" },
  { id: "w3", tag: "搞笑沙雕", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=400&fit=crop", imgH: 160, title: "修仙大佬重生回到高中", author: "大梦一场", likes: "96" },
  { id: "w4", tag: "悬疑反转", image: "https://images.unsplash.com/photo-1504714146340-959ca07e1f38?w=400&h=550&fit=crop", imgH: 220, title: "那扇门不要打开", author: "午夜鬼话", likes: "2.1k" },
  { id: "w5", tag: "暗黑爆爽", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=450&fit=crop&crop=face", imgH: 180, title: "被辞退后我成了亿万富翁", author: "逆袭君", likes: "5.2k" },
  { id: "w6", tag: "治愈温情", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=350&fit=crop", imgH: 140, title: "AI觉醒后爱上了程序员", author: "科幻迷", likes: "670" },
  { id: "w7", tag: "暗黑爆爽", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face", imgH: 160, title: "闺蜜背叛后的完美反击", author: "酷girl", likes: "890" },
  { id: "w8", tag: "悬疑反转", image: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=400&h=480&fit=crop", imgH: 190, title: "双胞胎姐妹的身份交换", author: "悬疑控", likes: "4.3k" },
  { id: "w9", tag: "悬疑反转", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=500&fit=crop", imgH: 200, title: "午夜末班车上的乘客", author: "深夜故事", likes: "3.4k" },
  { id: "w10", tag: "治愈温情", image: "https://images.unsplash.com/photo-1495314736024-fa5e4b37b979?w=400&h=400&fit=crop", imgH: 160, title: "暗恋十年终于表白", author: "心动瞬间", likes: "2.9k" },
  { id: "w11", tag: "搞笑沙雕", image: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=400&h=400&fit=crop", imgH: 150, title: "我家猫咪会说话", author: "猫奴日记", likes: "756" },
  { id: "w12", tag: "暗黑爆爽", image: "https://images.unsplash.com/photo-1540206395-68808572332f?w=400&h=500&fit=crop", imgH: 200, title: "荒岛求生30天", author: "探险家", likes: "1.3k" },
  { id: "w13", tag: "搞笑沙雕", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=450&fit=crop", imgH: 180, title: "穿越回古代当厨神", author: "美食家", likes: "1.8k" },
  { id: "w14", tag: "搞笑沙雕", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=350&fit=crop&crop=face", imgH: 140, title: "网红翻车现场实录", author: "吃瓜群众", likes: "8.7k" },
  { id: "w15", tag: "治愈温情", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=350&fit=crop", imgH: 140, title: "海边小屋的秘密", author: "旅行者", likes: "445" },
  { id: "w16", tag: "悬疑反转", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=450&fit=crop", imgH: 180, title: "消失的第七节车厢", author: "推理王", likes: "3.6k" },
  { id: "w17", tag: "治愈温情", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face", imgH: 200, title: "她的眼泪能预知未来", author: "奇幻师", likes: "2.7k" },
  { id: "w18", tag: "治愈温情", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=380&fit=crop", imgH: 150, title: "在旧金山遇见前任", author: "都市漫游", likes: "567" },
  { id: "w19", tag: "悬疑反转", image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=380&fit=crop", imgH: 150, title: "电影院里的第13排", author: "恐怖角", likes: "1.1k" },
  { id: "w20", tag: "治愈温情", image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=500&fit=crop&crop=face", imgH: 200, title: "奶奶的神秘日记本", author: "温情派", likes: "1.9k" },
];

// ─── 待制作图标 ───
const IconClock = ({ color = "#FF9500", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

// ─── 个人主页菜单数据 ───
const PROFILE_MENU = [
  { key: "works", label: "我的作品", icon: IconImage, iconColor: "#5F33E1" },
  { key: "favs", label: "我的收藏", icon: IconBookmark, iconColor: "#34C759" },
  { key: "likes", label: "我的点赞", icon: IconHeart, iconColor: "#FF3B30" },
  { key: "history", label: "使用记录", icon: IconHistory, iconColor: "#007AFF" },
];

// ─── 消息数据 ───
interface MessageItem {
  id: string;
  type: "system" | "like" | "comment" | "follow" | "ai";
  title: string;
  body: string;
  time: string;
  read: boolean;
  avatar?: string;
}
const MOCK_MESSAGES: MessageItem[] = [
  { id: "m1", type: "ai", title: "AI 创作完成通知", body: "您的脚本「渣男被前女友报复」已生成完毕，共 6 格分镜，快去查看吧！", time: "刚刚", read: false },
  { id: "m2", type: "like", title: "有人点赞了你的作品", body: "用户 @甜橙子 赞了你的作品《午夜城市的秘密》", time: "3分钟前", read: false },
  { id: "m3", type: "comment", title: "新评论", body: "@AI创作爱好者：这个分镜太绝了！第三格的镜头语言超专业", time: "1小时前", read: false },
  { id: "m4", type: "follow", title: "新增关注", body: "@职业路人 开始关注了你，快去看看他的作品吧", time: "3小时前", read: true },
  { id: "m5", type: "like", title: "有人点赞了你的作品", body: "用户 @漫画狂人 赞了你的作品《少年觉醒之路》", time: "昨天", read: true },
  { id: "m6", type: "system", title: "系统通知", body: "🎉 灵镜AI已升级至 v2.0，新增「一键生图」功能，快来体验吧！", time: "2天前", read: true },
  { id: "m7", type: "comment", title: "新评论", body: "@夜深人静：结局反转得真的很爽，期待下一集！", time: "3天前", read: true },
  { id: "m8", type: "system", title: "系统通知", body: "您上传的作品已通过审核，现已在探索页公开展示。", time: "1周前", read: true },
];

// ─── 时长选项 ───
const DURATION_OPTIONS = [
  { value: 10, label: "10秒" },
  { value: 15, label: "15秒" },
  { value: 30, label: "30秒" },
  { value: 60, label: "60秒" },
];

// ─── 比例选项 ───
const RATIO_OPTIONS = [
  { value: "3:4", label: "3:4 竖版" },
  { value: "1:1", label: "1:1 方形" },
  { value: "16:9", label: "16:9 横版" },
];

// ─── 页面类型 ───
type Screen = "login" | "home" | "wizard" | "loading" | "result" | "profile" | "explore" | "drafts" | "works" | "detail" | "pending" | "messages" | "settings" | "agreement" | "privacy" | "about";

// ─── 后台任务状态 ───
type TaskStatus = "generating" | "done" | "failed";
interface BgTask {
  id: string;
  title: string;   // 故事前20字
  status: TaskStatus;
  result: ScriptResult | null;
  createdAt: number;
}

// ─── 作品 ───
type WorkStatus = "generating" | "in_progress" | "imaging" | "completed";
interface WorkItem {
  id: string;
  title: string;
  story: string;
  style: StyleKey;
  scriptResult: ScriptResult | null;
  panelImages: Record<number, string>;
  editedPanels: Record<number, Partial<{ scene: string; characters: string; dialogue: string; camera_angle: string; mood: string }>>;
  status: WorkStatus;  // generating=脚本生成中, in_progress=脚本完成可编辑/生图, completed=确定完成
  createdAt: number;
  updatedAt: number;
}

// 向后兼容：保留 DraftItem 类型别名以防旧代码引用
type DraftItem = WorkItem;

export default function App() {
  const [story, setStory] = useState("");
  const [screen, setScreen] = useState<Screen>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  // 登录页 state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const screenHistoryRef = useRef<Screen[]>([]);
  // 转场动画
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 触感反馈
  const hapticLight = () => { if (ExpoPlatform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const hapticMedium = () => { if (ExpoPlatform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };
  const hapticSuccess = () => { if (ExpoPlatform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); };

  // 带动画的页面切换
  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  // 导航到新页面（记录历史 + 触感 + 动画）
  const navigateTo = useCallback((target: Screen) => {
    hapticLight();
    animateTransition(() => setScreen((cur) => {
      screenHistoryRef.current.push(cur);
      return target;
    }));
  }, []);

  // 返回上一层（触感 + 动画）
  const goBack = useCallback(() => {
    hapticLight();
    animateTransition(() => {
      const prev = screenHistoryRef.current.pop();
      setScreen(prev || "home");
    });
  }, []);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardStory, setWizardStory] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [selectedStyle, setSelectedStyle] = useState<StyleKey>("suspense_twist");
  const [selectedPanels, setSelectedPanels] = useState(6);
  const [selectedRatio, setSelectedRatio] = useState("3:4");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ScriptResult | null>(null);
  // 后台任务列表
  const [bgTasks, setBgTasks] = useState<BgTask[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  // 作品（持久化）
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null); // 当前编辑中的作品 ID
  const drafts = works.filter((w) => w.status !== "completed"); // 兼容旧代码引用
  const setDrafts = (_fn: any) => {}; // no-op, 兼容旧代码
  const [storageLoaded, setStorageLoaded] = useState(false);

  // 启动时从 AsyncStorage 读取
  useEffect(() => {
    (async () => {
      try {
        const [wStr, token, savedName] = await Promise.all([
          AsyncStorage.getItem("@works"),
          AsyncStorage.getItem("@authToken"),
          AsyncStorage.getItem("@userName"),
        ]);
        if (wStr) setWorks(JSON.parse(wStr));
        if (savedName) setUserName(savedName);
        if (token) {
          setAuthToken(token);
          setIsLoggedIn(true);
          setScreen("home");
        }
      } catch {}
      setStorageLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (ExpoPlatform.OS !== "web" || typeof document === "undefined") return;

    const root = document.getElementById("root");
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;
    const prevRootOverflowX = root?.style.overflowX ?? "";
    const prevRootWidth = root?.style.width ?? "";

    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
    if (root) {
      root.style.overflowX = "hidden";
      root.style.width = "100%";
    }

    return () => {
      document.documentElement.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
      if (root) {
        root.style.overflowX = prevRootOverflowX;
        root.style.width = prevRootWidth;
      }
    };
  }, []);

  // works 变化时自动存储
  useEffect(() => {
    if (!storageLoaded) return;
    AsyncStorage.setItem("@works", JSON.stringify(works)).catch(() => {});
  }, [works, storageLoaded]);

  // 图片生成状态：panel_number → image_url
  const [panelImages, setPanelImages] = useState<Record<number, string>>({});
  const [generatingImages, setGeneratingImages] = useState(false);
  const [imageGenProgress, setImageGenProgress] = useState({ done: 0, total: 0 });
  // 编辑状态：panel_number → edited fields
  const [editedPanels, setEditedPanels] = useState<Record<number, Partial<{ scene: string; characters: string; dialogue: string; camera_angle: string; mood: string }>>>({});
  const [editingPanel, setEditingPanel] = useState<number | null>(null);
  // 底部 Tab
  const [activeMainTab, setActiveMainTab] = useState<"create" | "explore" | "profile">("create");
  // 作品详情
  const [detailData, setDetailData] = useState<{ title: string; author: string; likes: number; panels: { image: string; scene: string; dialogue: string }[] } | null>(null);
  const [detailIndex, setDetailIndex] = useState(0);
  const [detailLiked, setDetailLiked] = useState(false);
  const [detailBookmarked, setDetailBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [detailComments, setDetailComments] = useState<typeof COMMENT_POOL>([]);
  const [commentText, setCommentText] = useState("");
  // 设置页
  const [userName, setUserName] = useState("创作者小明");
  const [userBio, setUserBio] = useState("这个人很懒，什么都没写~");
  const [userId] = useState("10086");
  // 积分系统
  const [pointsBalance, setPointsBalance] = useState(100);
  const [todayCheckin, setTodayCheckin] = useState(false);
  const [showPointsShop, setShowPointsShop] = useState(false);

  // 加载积分余额
  useEffect(() => {
    fetch(`${API_BASE}/api/points/balance`).then(r => r.json()).then(d => {
      setPointsBalance(d.balance);
      setTodayCheckin(d.today_checkin);
    }).catch(() => {});
  }, []);

  // 消耗积分（操作前调用，返回 true=可继续，false=积分不足）
  const consumePoints = async (action: string): Promise<boolean> => {
    try {
      const resp = await fetch(`${API_BASE}/api/points/consume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await resp.json();
      setPointsBalance(data.balance);
      if (!data.success) {
        Alert.alert("积分不足", data.message, [
          { text: "去充值", onPress: () => setShowPointsShop(true) },
          { text: "取消" },
        ]);
        return false;
      }
      return true;
    } catch {
      return true; // 后端不可用时放行
    }
  };

  // 每日签到
  const handleCheckin = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/points/checkin`, { method: "POST" });
      const data = await resp.json();
      setPointsBalance(data.balance);
      setTodayCheckin(true);
      hapticSuccess();
      Alert.alert("签到成功", data.message);
    } catch {
      Alert.alert("签到失败", "请检查网络");
    }
  };

  const openDetail =(title: string, image: string, id: number, author?: string) => {
    const panels = getDetailPanels(id, image, title);
    setDetailData({
      title,
      author: author || "创作者",
      likes: 100 + (id * 73) % 5000,
      panels,
    });
    setDetailIndex(0);
    setDetailLiked(false);
    setDetailBookmarked(false);
    setDetailComments(getComments(id));
    setCommentText("");
    setShowComments(false);
    navigateTo("detail");
  };

  // ── 自动同步图片/编辑到当前作品 ──
  useEffect(() => {
    if (!currentDraftId || !storageLoaded) return;
    setWorks((prev) =>
      prev.map((w) =>
        w.id === currentDraftId
          ? { ...w, panelImages, editedPanels, updatedAt: Date.now() }
          : w
      )
    );
  }, [panelImages, editedPanels, currentDraftId, storageLoaded]);

  const syncDraft = useCallback(() => {
    if (!currentDraftId) return;
    setWorks((prev) =>
      prev.map((w) =>
        w.id === currentDraftId
          ? { ...w, panelImages, editedPanels, updatedAt: Date.now() }
          : w
      )
    );
  }, [currentDraftId, panelImages, editedPanels]);

  // ── SSE 一键生图 ──
  const handleGenerateImages = useCallback(async () => {
    if (!result) return;
    // 积分检查
    const canProceed = await consumePoints("generate_images");
    if (!canProceed) return;
    setGeneratingImages(true);
    setImageGenProgress({ done: 0, total: result.panels.length });
    // 标记作品为生图中
    if (currentDraftId) {
      setWorks((prev) => prev.map((w) => w.id === currentDraftId ? { ...w, status: "imaging" as WorkStatus, updatedAt: Date.now() } : w));
    }

    try {
      const resp = await fetch(`${API_BASE}/api/generate-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panels: result.panels.map((p) => {
            const edits = editedPanels[p.panel_number];
            return edits ? { ...p, ...edits } : p;
          }),
          aspect_ratio: result.aspect_ratio,
          style: result.style,
        }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.event === "done") continue;
            if (data.image_url && data.status !== "failed") {
              setPanelImages((prev) => ({ ...prev, [data.panel_number]: data.image_url }));
              setImageGenProgress((prev) => ({ ...prev, done: prev.done + 1 }));
              hapticLight();
            } else if (data.status === "failed") {
              setImageGenProgress((prev) => ({ ...prev, done: prev.done + 1 }));
            }
          } catch {}
        }
      }
    } catch (err: any) {
      Alert.alert("生图失败", err.message || "请检查后端是否运行");
    } finally {
      setGeneratingImages(false);
      // 生图完成，状态改回 in_progress
      if (currentDraftId) {
        setWorks((prev) => prev.map((w) => w.id === currentDraftId && w.status === "imaging" ? { ...w, status: "in_progress" as WorkStatus, updatedAt: Date.now() } : w));
      }
    }
  }, [result, editedPanels, currentDraftId]);

  // ── 单格重新生图 ──
  const handleRegeneratePanel = useCallback(async (panelNumber: number) => {
    if (!result) return;
    const panel = result.panels.find((p) => p.panel_number === panelNumber);
    if (!panel) return;

    const edits = editedPanels[panelNumber];
    const finalPanel = edits ? { ...panel, ...edits } : panel;

    setPanelImages((prev) => ({ ...prev, [panelNumber]: "__loading__" }));

    try {
      const resp = await fetch(`${API_BASE}/api/regenerate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel: finalPanel, aspect_ratio: result.aspect_ratio, style: result.style }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.image_url) {
        setPanelImages((prev) => ({ ...prev, [panelNumber]: data.image_url }));
      } else {
        setPanelImages((prev) => { const n = { ...prev }; delete n[panelNumber]; return n; });
        Alert.alert("生图失败", "未获取到图片");
      }
    } catch (err: any) {
      setPanelImages((prev) => { const n = { ...prev }; delete n[panelNumber]; return n; });
      Alert.alert("生图失败", err.message);
    }
  }, [result, editedPanels]);

  // ── 确定完成 → 草稿转作品 ──
  const handleConfirmWork = () => {
    if (!result || !currentDraftId) return;
    const allImagesReady = result.panels.every(
      (p) => panelImages[p.panel_number] && panelImages[p.panel_number] !== "__loading__"
    );
    if (!allImagesReady) {
      Alert.alert("提示", "还有图片未生成完成，请先生成全部图片");
      return;
    }
    // 把当前作品标记为 completed
    setWorks((prev) =>
      prev.map((w) => w.id === currentDraftId
        ? { ...w, panelImages: { ...panelImages }, editedPanels: { ...editedPanels }, status: "completed" as WorkStatus, updatedAt: Date.now() }
        : w
      )
    );
    setCurrentDraftId(null);
    hapticSuccess();
    Alert.alert("已完成", "作品已保存到「我的作品」", [
      { text: "好的", onPress: () => { screenHistoryRef.current = []; setScreen("home"); } },
    ]);
  };

  // ── 导出图片 ──
  const handleExport = async () => {
    if (!result) return;
    const imageUrls = result.panels
      .map((p) => panelImages[p.panel_number])
      .filter((url) => url && url !== "__loading__");

    if (imageUrls.length === 0) {
      Alert.alert("提示", "没有可导出的图片");
      return;
    }

    if (ExpoPlatform.OS === "web") {
      // Web：逐张新标签页打开
      imageUrls.forEach((url, i) => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = `panel_${i + 1}.png`;
        link.click();
      });
      Alert.alert("导出成功", `已导出 ${imageUrls.length} 张图片`);
    } else {
      // Native：调用系统分享
      try {
        await Share.share({
          message: `我的漫剧分镜作品（${imageUrls.length}张）\n${imageUrls.join("\n")}`,
        });
      } catch {}
    }
  };

  // ── AI 重写单格 ──
  const [rewritingPanel, setRewritingPanel] = useState<number | null>(null);
  const handleRewritePanel = async (panelNumber: number) => {
    if (!result) return;
    const panel = result.panels.find((p) => p.panel_number === panelNumber);
    if (!panel) return;

    setRewritingPanel(panelNumber);
    try {
      const resp = await fetch(`${API_BASE}/api/rewrite-panel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel, style: result.style }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const rewritten = data.panel;
      // 更新编辑状态
      setEditedPanels((prev) => ({
        ...prev,
        [panelNumber]: {
          scene: rewritten.scene,
          characters: rewritten.characters,
          dialogue: rewritten.dialogue,
          camera_angle: rewritten.camera_angle,
          mood: rewritten.mood,
        },
      }));
    } catch (err: any) {
      Alert.alert("重写失败", err.message);
    } finally {
      setRewritingPanel(null);
    }
  };

  // ── 从草稿恢复编辑 ──
  const openWork = (work: WorkItem) => {
    if (!work.scriptResult) return;
    setResult(work.scriptResult);
    setPanelImages(work.panelImages || {});
    setEditedPanels(work.editedPanels || {});
    setCurrentDraftId(work.status === "completed" ? null : work.id);
    navigateTo("result");
  };
  const openDraft = openWork; // 兼容旧引用

  // ── 编辑面板字段 ──
  const updatePanelField = (panelNumber: number, field: string, value: string) => {
    setEditedPanels((prev) => ({
      ...prev,
      [panelNumber]: { ...prev[panelNumber], [field]: value },
    }));
  };

  // ── 打开引导式创作 ──
  const openWizard = () => {
    // 同一时间只能生成一个
    if (bgTasks.some((t) => t.status === "generating")) {
      Alert.alert("提示", "您的创作正在生成中，生成好以后才可以继续生成。");
      return;
    }
    setWizardStory(story.trim());
    setWizardStep(0);
    navigateTo("wizard");
  };

  // ── 调后端生成脚本（支持多任务并行） ──
  const handleGenerate = async () => {
    if (!wizardStory.trim()) {
      Alert.alert("提示", "请先输入故事内容");
      return;
    }

    // 积分检查
    const canProceed = await consumePoints("generate_script");
    if (!canProceed) return;

    // 先同步当前草稿（如果有正在编辑的）
    syncDraft();

    // 创建后台任务
    const taskId = `task_${Date.now()}`;
    const taskTitle = wizardStory.trim().slice(0, 20) + (wizardStory.trim().length > 20 ? "..." : "");
    const capturedStory = wizardStory.trim();
    const capturedStyle = selectedStyle;
    const capturedDuration = selectedDuration;
    const capturedPanels = selectedPanels;
    const capturedRatio = selectedRatio;

    const newTask: BgTask = { id: taskId, title: taskTitle, status: "generating", result: null, createdAt: Date.now() };
    setBgTasks((prev) => [newTask, ...prev]);
    setCurrentTaskId(taskId);

    navigateTo("loading");
    setLoading(true);
    setLoadingStep(0);

    const stepTimer = setInterval(() => {
      setLoadingStep((s) => (s < 3 ? s + 1 : s));
    }, 2000);

    // 后台执行（不 await，允许用户退出 loading 页面）
    fetch(`${API_BASE}/api/generate-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story: capturedStory,
        panels: capturedPanels,
        style: capturedStyle,
      }),
    })
      .then((resp) => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
      })
      .then((data: ScriptResult) => {
        setBgTasks((prev) =>
          prev.map((t) => t.id === taskId ? { ...t, status: "done", result: data } : t)
        );

        // 自动存入作品（in_progress 状态）
        const workId = `work_${Date.now()}`;
        const newWork: WorkItem = {
          id: workId,
          title: taskTitle,
          story: capturedStory,
          style: capturedStyle,
          scriptResult: data,
          panelImages: {},
          editedPanels: {},
          status: "in_progress",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setWorks((prev) => [newWork, ...prev]);

        // 只有当用户还在等待这个任务（loading 页）时，才切换到结果页
        setScreen((cur) => {
          if (cur === "loading") {
            screenHistoryRef.current.push(cur);
            setResult(data);
            setCurrentDraftId(workId);
            setPanelImages({});
            setEditedPanels({});
            return "result";
          }
          // 用户在其他页面（首页、编辑另一个草稿等），不打扰
          return cur;
        });
      })
      .catch((err: any) => {
        setBgTasks((prev) =>
          prev.map((t) => t.id === taskId ? { ...t, status: "failed" } : t)
        );
        Alert.alert("生成失败", err.message || "网络错误，请检查后端是否运行");
        setScreen((cur) => { if (cur === "loading") { screenHistoryRef.current = []; return "home"; } return cur; });
      })
      .finally(() => {
        clearInterval(stepTimer);
        setLoading(false);
        setLoadingStep(0);
      });
  };

  // ════════════════════════════════════════
  // 登录页
  // ════════════════════════════════════════
  const handleSendCode = () => {
    if (!/^1\d{10}$/.test(loginPhone)) {
      Alert.alert("提示", "请输入正确的手机号");
      return;
    }
    setCodeSent(true);
    setCodeCountdown(60);
    const timer = setInterval(() => {
      setCodeCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    // TODO: 调后端发送验证码
  };

  const handleLogin = async () => {
    const phone = loginPhone.trim() || "13800000000";
    const code = loginCode.trim() || "1234";
    try {
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setAuthToken(data.token);
        setIsLoggedIn(true);
        if (data.userName) setUserName(data.userName);
        await AsyncStorage.setItem("@authToken", data.token);
        if (data.userName) await AsyncStorage.setItem("@userName", data.userName);
        setScreen("home");
        return;
      }
    } catch {}
    // 后端不可用 → 直接进入演示模式
    setIsLoggedIn(true);
    setAuthToken("demo_token");
    await AsyncStorage.setItem("@authToken", "demo_token");
    setScreen("home");
  };

  const renderLogin = () => (
    <View style={[styles.screen, { backgroundColor: "#fff" }]}>
      <StatusBar style="dark" />
      <BokehBG />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 100, gap: 32 }}>
        {/* Logo + 标题 */}
        <View style={{ alignItems: "center", gap: 12 }}>
          <View style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" }}>
            <IconSparkle color="#fff" size={36} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "700", color: Colors.foreground }}>灵镜 AI</Text>
          <Text style={{ fontSize: 14, color: Colors.mutedForeground }}>一句话，生成你的漫剧分镜</Text>
        </View>

        {/* 手机号输入 */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", backgroundColor: Colors.greyBg, borderRadius: Radius.m, height: 52, alignItems: "center", paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 15, color: Colors.foreground, marginRight: 8 }}>+86</Text>
            <View style={{ width: 1, height: 20, backgroundColor: Colors.border, marginRight: 12 }} />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: Colors.foreground }}
              placeholder="请输入手机号"
              placeholderTextColor="#C4C4C4"
              keyboardType="phone-pad"
              maxLength={11}
              value={loginPhone}
              onChangeText={setLoginPhone}
            />
          </View>

          {/* 验证码 */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: Colors.greyBg, borderRadius: Radius.m, height: 52, justifyContent: "center", paddingHorizontal: 16 }}>
              <TextInput
                style={{ fontSize: 15, color: Colors.foreground }}
                placeholder="请输入验证码"
                placeholderTextColor="#C4C4C4"
                keyboardType="number-pad"
                maxLength={6}
                value={loginCode}
                onChangeText={setLoginCode}
              />
            </View>
            <TouchableOpacity
              style={{ width: 110, height: 52, borderRadius: Radius.m, backgroundColor: codeCountdown > 0 ? Colors.greyBg : Colors.primaryBg, justifyContent: "center", alignItems: "center" }}
              activeOpacity={0.7}
              onPress={codeCountdown > 0 ? undefined : handleSendCode}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: codeCountdown > 0 ? Colors.mutedForeground : Colors.primary }}>
                {codeCountdown > 0 ? `${codeCountdown}s` : codeSent ? "重新发送" : "获取验证码"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity
          style={[styles.primaryBtn, Shadows.purple]}
          activeOpacity={0.85}
          onPress={handleLogin}
        >
          <Text style={styles.primaryBtnText}>登录 / 注册</Text>
        </TouchableOpacity>

        {/* 第三方登录 */}
        <View style={{ alignItems: "center", gap: 20, marginTop: 16 }}>
          <Text style={{ fontSize: 13, color: Colors.mutedForeground }}>其他登录方式</Text>
          <View style={{ flexDirection: "row", gap: 32 }}>
            <TouchableOpacity
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#07C160", justifyContent: "center", alignItems: "center" }}
              activeOpacity={0.7}
              onPress={() => Alert.alert("微信登录", "微信登录功能开发中")}
            >
              <Text style={{ fontSize: 20, color: "#fff" }}>W</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}
              activeOpacity={0.7}
              onPress={() => Alert.alert("Apple 登录", "Apple ID 登录功能开发中")}
            >
              <Text style={{ fontSize: 20, color: "#fff" }}>A</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 协议 */}
        <View style={{ alignItems: "center", marginTop: "auto" as any, paddingBottom: 40 }}>
          <Text style={{ fontSize: 12, color: Colors.mutedForeground, textAlign: "center", lineHeight: 18 }}>
            登录即表示同意{" "}
            <Text style={{ color: Colors.primary }} onPress={() => navigateTo("agreement")}>用户协议</Text>
            {" "}和{" "}
            <Text style={{ color: Colors.primary }} onPress={() => navigateTo("privacy")}>隐私政策</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  // ════════════════════════════════════════
  // 创作首页（PRD 3.3）
  // ════════════════════════════════════════
  const renderHome = () => {
    const generatingTask = bgTasks.find((t) => t.status === "generating");
    const completedTask = bgTasks.find((t) => t.status === "done" && t.id === currentTaskId);

    return (
      <HomeScreen
        userName={userName}
        story={story}
        generatingTaskTitle={generatingTask?.title}
        showGeneratingTaskBubble={Boolean(generatingTask)}
        showCompletedTaskBubble={Boolean(completedTask?.result) && screen !== "result"}
        showImageProgressBubble={generatingImages && screen !== "result"}
        imageGenProgress={imageGenProgress}
        BellIcon={IconBell}
        UserIcon={IconUser}
        onStoryChange={setStory}
        onOpenProfile={() => navigateTo("profile")}
        onOpenMessages={() => navigateTo("messages")}
        onOpenLoading={() => navigateTo("loading")}
        onOpenCompletedResult={() => {
          if (completedTask?.result) {
            setResult(completedTask.result);
            navigateTo("result");
          }
        }}
        onOpenImageProgress={() => navigateTo("result")}
        onOpenGenerateWizard={() => {
          if (!story.trim()) {
            Alert.alert("提示", "请先输入故事内容");
            return;
          }
          openWizard();
        }}
        onOpenExplore={() => navigateTo("explore")}
        onOpenDetail={openDetail}
      />
    );
  };

  // ════════════════════════════════════════
  // 3 步引导式创作流程
  // ════════════════════════════════════════
  const WIZARD_TITLES = ["选择时长", "选择风格", "镜头与比例"];

  const renderWizardContent = () => {
    switch (wizardStep) {
      case 0:
        return (
          <View style={{ gap: Spacing.md }}>
            <Text style={styles.wizLabel}>选择视频时长</Text>
            <Text style={styles.wizDesc}>默认 15 秒，适合标准漫剧节奏</Text>
            <View style={styles.chipRow}>
              {DURATION_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.chip, selectedDuration === d.value && styles.chipActive]}
                  onPress={() => setSelectedDuration(d.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, selectedDuration === d.value && styles.chipTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View style={{ gap: Spacing.md }}>
            <Text style={styles.wizLabel}>选择脚本风格</Text>
            <Text style={styles.wizDesc}>每种风格有不同叙事方式和视觉效果</Text>
            <View style={styles.styleGrid}>
              {STYLE_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.styleCard, selectedStyle === s.key && styles.styleCardActive]}
                  onPress={() => setSelectedStyle(s.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.styleEmoji}>{s.emoji}</Text>
                  <Text style={[styles.styleLabel, selectedStyle === s.key && styles.styleLabelActive]}>
                    {s.label}
                  </Text>
                  {selectedStyle === s.key && (
                    <View style={styles.checkMark}>
                      <IconCheck />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={{ gap: Spacing.lg }}>
            <View style={{ gap: Spacing.sm }}>
              <Text style={styles.wizLabel}>选择镜头数</Text>
              <View style={styles.chipRow}>
                {PANEL_OPTIONS.map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.chip, selectedPanels === n && styles.chipActive]}
                    onPress={() => setSelectedPanels(n)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, selectedPanels === n && styles.chipTextActive]}>
                      {n} 格
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ gap: Spacing.sm }}>
              <Text style={styles.wizLabel}>选择图片比例</Text>
              <View style={styles.chipRow}>
                {RATIO_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.chip, selectedRatio === r.value && styles.chipActive]}
                    onPress={() => setSelectedRatio(r.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, selectedRatio === r.value && styles.chipTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderWizard = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => (wizardStep === 0 ? goBack() : setWizardStep(wizardStep - 1))}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>步骤 {wizardStep + 1}/3 — {WIZARD_TITLES[wizardStep]}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 圆点进度指示器 */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i <= wizardStep && styles.dotActive]} />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderWizardContent()}
      </ScrollView>

      <View style={styles.fixedBottom}>
        <TouchableOpacity
          style={[styles.primaryBtn, Shadows.purple]}
          activeOpacity={0.85}
          onPress={() => (wizardStep < 2 ? setWizardStep(wizardStep + 1) : handleGenerate())}
        >
          <Text style={styles.primaryBtnText}>
            {wizardStep < 2 ? "下一步" : "开始生成"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ════════════════════════════════════════
  // 加载页
  // ════════════════════════════════════════
  const LOADING_STEPS = ["解析故事结构", "分配叙事节奏", "生成分镜描述", "润色与优化"];

  const renderLoading = () => (
    <View style={[styles.screen, styles.loadingCenter]}>
      <StatusBar style="dark" />
      {/* 用户输入展示 */}
      <View style={{ backgroundColor: Colors.greyBg, borderRadius: Radius.m, paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 24, maxWidth: 340 }}>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 20 }} numberOfLines={3}>
          {wizardStory || story}
        </Text>
      </View>
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      <Text style={styles.loadingTitle}>AI 正在创作中...</Text>
      <Text style={styles.loadingDesc}>正在分析故事结构，拆解分镜脚本{"\n"}请稍候片刻</Text>
      <View style={styles.loadingSteps}>
        {LOADING_STEPS.map((step, i) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepDot, i <= loadingStep && styles.stepDotActive]} />
            <Text style={[styles.stepLabel, i <= loadingStep && styles.stepLabelActive]}>{step}</Text>
          </View>
        ))}
      </View>
      {/* 双按钮：后台等待 or 取消生成 */}
      <View style={{ marginTop: Spacing.xl, gap: 12, alignItems: "center" }}>
        <TouchableOpacity
          style={[styles.primaryBtn, { paddingHorizontal: 32, height: 44 }]}
          onPress={() => { screenHistoryRef.current = []; setScreen("home"); }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>返回首页（后台生成）</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.outlineBtn]}
          onPress={() => {
            screenHistoryRef.current = []; setScreen("home");
            setLoading(false);
            // 把正在 generating 的任务标为 failed
            if (currentTaskId) {
              setBgTasks((prev) =>
                prev.map((t) => t.id === currentTaskId && t.status === "generating" ? { ...t, status: "failed" } : t)
              );
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.outlineBtnText}>取消生成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ════════════════════════════════════════
  // 脚本编辑页（PRD 3.5）
  // ════════════════════════════════════════
  const phaseColor: Record<string, string> = {
    Hook: Colors.warning,
    Escalate: Colors.info,
    Twist: Colors.error,
    Cliffhanger: Colors.primary,
  };
  const phaseCN: Record<string, string> = {
    Hook: "开场钩子",
    Escalate: "剧情推进",
    Twist: "反转",
    Cliffhanger: "悬念收尾",
  };

  const renderResult = () => {
    const hasAnyImages = Object.keys(panelImages).length > 0;
    const allImagesGenerated = result ? result.panels.every(
      (p) => panelImages[p.panel_number] && panelImages[p.panel_number] !== "__loading__"
    ) : false;
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <View style={styles.navBar}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconArrowLeft />
          </TouchableOpacity>
          <Text style={styles.navBarTitle}>分镜脚本</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.infoBar}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>
              {STYLE_OPTIONS.find((s) => s.key === result?.style)?.emoji}{" "}
              {STYLE_OPTIONS.find((s) => s.key === result?.style)?.label}
            </Text>
          </View>
          <Text style={styles.infoText}>{result?.panels.length} 格 · {result?.aspect_ratio}</Text>
          {generatingImages && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginLeft: "auto" as any }}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: "600" }}>
                {imageGenProgress.done}/{imageGenProgress.total}
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {result?.panels.map((p) => {
            const imgUrl = panelImages[p.panel_number];
            const isImgLoading = imgUrl === "__loading__";
            const edits = editedPanels[p.panel_number] || {};
            const isEditing = editingPanel === p.panel_number;

            return (
              <View key={p.panel_number} style={[styles.panelCard, Shadows.standard]}>
                {/* 头部 */}
                <View style={styles.panelHeader}>
                  <View style={styles.panelNumBadge}>
                    <Text style={styles.panelNumText}>{p.panel_number}</Text>
                  </View>
                  <View style={[styles.phaseBadge, { backgroundColor: (phaseColor[p.narrative_phase] || Colors.primary) + "18" }]}>
                    <Text style={[styles.phaseText, { color: phaseColor[p.narrative_phase] || Colors.primary }]}>
                      {phaseCN[p.narrative_phase] || p.narrative_phase}
                    </Text>
                  </View>
                  <Text style={styles.cameraText}>{edits.camera_angle || p.camera_angle}</Text>
                  <TouchableOpacity
                    style={[rs.editToggle, { backgroundColor: Colors.primaryBg }]}
                    onPress={() => handleRewritePanel(p.panel_number)}
                    activeOpacity={0.7}
                    disabled={rewritingPanel === p.panel_number}
                  >
                    {rewritingPanel === p.panel_number ? (
                      <ActivityIndicator size={12} color={Colors.primary} />
                    ) : (
                      <Text style={rs.editToggleText}>AI重写</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={rs.editToggle}
                    onPress={() => setEditingPanel(isEditing ? null : p.panel_number)}
                    activeOpacity={0.7}
                  >
                    <Text style={rs.editToggleText}>{isEditing ? "完成" : "编辑"}</Text>
                  </TouchableOpacity>
                </View>

                {/* 内容区：编辑模式 or 展示模式 */}
                {isEditing ? (
                  <View style={{ gap: 8 }}>
                    <Text style={rs.fieldLabel}>场景</Text>
                    <TextInput
                      style={rs.fieldInput}
                      value={edits.scene ?? p.scene}
                      onChangeText={(v) => updatePanelField(p.panel_number, "scene", v)}
                      multiline
                    />
                    <Text style={rs.fieldLabel}>角色</Text>
                    <TextInput
                      style={rs.fieldInput}
                      value={edits.characters ?? p.characters}
                      onChangeText={(v) => updatePanelField(p.panel_number, "characters", v)}
                      multiline
                    />
                    <Text style={rs.fieldLabel}>对白</Text>
                    <TextInput
                      style={rs.fieldInput}
                      value={edits.dialogue ?? p.dialogue}
                      onChangeText={(v) => updatePanelField(p.panel_number, "dialogue", v)}
                      multiline
                    />
                    <Text style={rs.fieldLabel}>情绪</Text>
                    <TextInput
                      style={rs.fieldInput}
                      value={edits.mood ?? p.mood}
                      onChangeText={(v) => updatePanelField(p.panel_number, "mood", v)}
                    />
                  </View>
                ) : (
                  <>
                    <Text style={styles.panelScene}>{edits.scene ?? p.scene}</Text>
                    <Text style={styles.panelCharacters}>{edits.characters ?? p.characters}</Text>
                    <View style={styles.dialogueBubble}>
                      <Text style={styles.dialogueText}>「{edits.dialogue ?? p.dialogue}」</Text>
                    </View>
                    <Text style={styles.panelMood}>{edits.mood ?? p.mood}</Text>
                  </>
                )}

                {/* 图片区域（文字下方） */}
                {imgUrl && !isImgLoading && (
                  <View style={{ borderRadius: Radius.m, overflow: "hidden", marginTop: 8 }}>
                    <Image
                      source={{ uri: imgUrl }}
                      style={{ width: "100%", aspectRatio: result?.aspect_ratio === "16:9" ? 16 / 9 : result?.aspect_ratio === "1:1" ? 1 : 3 / 4, borderRadius: Radius.m }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={rs.regenBtn}
                      onPress={() => handleRegeneratePanel(p.panel_number)}
                      activeOpacity={0.7}
                    >
                      <Text style={rs.regenBtnText}>重新生成</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {isImgLoading && (
                  <View style={rs.imgPlaceholder}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginTop: 4 }}>生成中...</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.fixedBottom}>
          {/* 已完成作品 → 导出 + 重新生成 */}
          {!currentDraftId && allImagesGenerated && !generatingImages ? (
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                style={[styles.primaryBtn, Shadows.purple]}
                onPress={handleExport}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>导出</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={handleGenerateImages}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineBtnText}>重新生成全部图片</Text>
              </TouchableOpacity>
            </View>
          ) : allImagesGenerated && !generatingImages ? (
            /* 草稿，全部图片已生成 → 确定 + 导出 + 重新生成 */
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={[styles.primaryBtn, Shadows.purple, { flex: 1 }]}
                  onPress={handleConfirmWork}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>确定</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, Shadows.purple, { flex: 1 }]}
                  onPress={handleExport}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>导出</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={handleGenerateImages}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineBtnText}>重新生成全部图片</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, Shadows.purple, generatingImages && { opacity: 0.6 }]}
              onPress={generatingImages ? undefined : handleGenerateImages}
              activeOpacity={0.85}
            >
              {generatingImages ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.primaryBtnText}>生成中 {imageGenProgress.done}/{imageGenProgress.total}</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>
                  {hasAnyImages ? "重新生成全部图片" : "一键生成全部图片"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ════════════════════════════════════════
  // 我的草稿列表
  // ════════════════════════════════════════
  const renderDrafts = () => renderWorks(); // 草稿跳转到作品页

  // ════════════════════════════════════════
  // 我的作品列表（4 种状态 + 删除）
  // ════════════════════════════════════════
  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    generating: { label: "脚本生成中", color: "#FF9500" },
    in_progress: { label: "脚本已完成", color: Colors.primary },
    imaging: { label: "生图中", color: "#007AFF" },
    completed: { label: "已完成", color: "#34C759" },
  };

  const renderWorks = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>我的作品</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md, gap: 12 }} showsVerticalScrollIndicator={false}>
        {works.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
            <IconImage color="#EBEBEB" size={48} />
            <Text style={{ fontSize: 15, color: Colors.mutedForeground }}>暂无作品</Text>
            <Text style={{ fontSize: 13, color: Colors.mutedForeground }}>生成脚本后，作品会出现在这里</Text>
          </View>
        ) : (
          works.map((w) => {
            const firstImg = w.panelImages?.[1] || Object.values(w.panelImages || {})[0];
            const imgCount = Object.keys(w.panelImages || {}).filter((k) => {
              const v = (w.panelImages || {})[Number(k)];
              return v && v !== "__loading__";
            }).length;
            const panelCount = w.scriptResult?.panels?.length || 0;
            const sc = STATUS_CONFIG[w.status] || STATUS_CONFIG.in_progress;

            return (
              <TouchableOpacity
                key={w.id}
                style={[ls.card, Shadows.standard]}
                onPress={() => {
                  if (w.status === "generating") {
                    navigateTo("loading");
                  } else {
                    openWork(w);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {/* 缩略图 */}
                  {firstImg ? (
                    <Image source={{ uri: firstImg }} style={{ width: 64, height: 64, borderRadius: 10 }} resizeMode="cover" />
                  ) : (
                    <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: Colors.primaryBg, justifyContent: "center", alignItems: "center" }}>
                      {w.status === "generating" ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <IconImage color={Colors.primary} size={24} />
                      )}
                    </View>
                  )}
                  {/* 信息 */}
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={ls.cardTitle} numberOfLines={1}>{w.title}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {/* 状态标签 */}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: sc.color + "15", borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 }}>
                        {(w.status === "generating" || w.status === "imaging") && (
                          <ActivityIndicator size={10} color={sc.color} />
                        )}
                        <Text style={{ fontSize: 11, fontWeight: "600", color: sc.color }}>
                          {w.status === "imaging" && imgCount > 0 ? `生图中 ${imgCount}/${panelCount}` : sc.label}
                        </Text>
                      </View>
                      {panelCount > 0 && w.status !== "generating" && (
                        <Text style={ls.cardInfo}>{panelCount} 格</Text>
                      )}
                      {imgCount > 0 && w.status === "completed" && (
                        <Text style={ls.cardInfo}>{imgCount} 张图</Text>
                      )}
                    </View>
                    <Text style={ls.cardTime}>{new Date(w.updatedAt || w.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
                {/* 删除按钮 */}
                <TouchableOpacity
                  style={{ position: "absolute" as any, top: 12, right: 12 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert("删除作品", `确定删除「${w.title}」？`, [
                      { text: "取消" },
                      { text: "删除", style: "destructive", onPress: () => setWorks((prev) => prev.filter((x) => x.id !== w.id)) },
                    ]);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={ls.deleteBtnText}>删除</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  // ════════════════════════════════════════
  // 待制作内容列表
  // ════════════════════════════════════════
  const renderPending = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>待制作内容</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md, gap: 12 }} showsVerticalScrollIndicator={false}>
        {bgTasks.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
            <IconClock color="#EBEBEB" size={48} />
            <Text style={{ fontSize: 15, color: Colors.mutedForeground }}>暂无待制作内容</Text>
          </View>
        ) : (
          bgTasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[ls.card, Shadows.standard]}
              activeOpacity={0.8}
              onPress={() => {
                if (t.status === "generating") {
                  navigateTo("loading");
                } else if (t.status === "done" && t.result) {
                  // 找到对应草稿打开，或直接展示
                  const draft = drafts.find((d) => d.story === t.title.replace("...", ""));
                  if (draft) { openDraft(draft); } else { setResult(t.result); navigateTo("result"); }
                }
              }}
            >
              <View style={ls.cardHeader}>
                <Text style={ls.cardTitle} numberOfLines={1}>{t.title}</Text>
                <View style={{
                  backgroundColor: t.status === "generating" ? "#FF950020" : t.status === "done" ? "#34C75920" : "#FF3B3020",
                  borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2,
                }}>
                  <Text style={{
                    fontSize: 12, fontWeight: "600",
                    color: t.status === "generating" ? "#FF9500" : t.status === "done" ? "#34C759" : "#FF3B30",
                  }}>
                    {t.status === "generating" ? "生成中" : t.status === "done" ? "已完成" : "失败"}
                  </Text>
                </View>
              </View>
              <Text style={ls.cardTime}>{new Date(t.createdAt).toLocaleString()}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  // ════════════════════════════════════════
  // 消息列表页
  // ════════════════════════════════════════
  const [messages, setMessages] = useState<MessageItem[]>(MOCK_MESSAGES);

  const MSG_TYPE_ICON: Record<MessageItem["type"], { emoji: string; bg: string }> = {
    ai:     { emoji: "✨", bg: "#5F33E120" },
    like:   { emoji: "❤️", bg: "#FF3B3020" },
    comment:{ emoji: "💬", bg: "#007AFF20" },
    follow: { emoji: "👤", bg: "#34C75920" },
    system: { emoji: "📢", bg: "#FF950020" },
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  const renderMessages = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>消息通知</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setMessages((prev) => prev.map((m) => ({ ...m, read: true })))}
          >
            <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: "600" }}>全部已读</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md, gap: 10 }} showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
            <IconBell color="#EBEBEB" size={48} />
            <Text style={{ fontSize: 15, color: Colors.mutedForeground }}>暂无消息</Text>
          </View>
        ) : (
          messages.map((msg) => {
            const typeInfo = MSG_TYPE_ICON[msg.type];
            return (
              <TouchableOpacity
                key={msg.id}
                activeOpacity={0.85}
                style={[
                  ls.card,
                  Shadows.standard,
                  { flexDirection: "row", gap: 12, alignItems: "flex-start" },
                  !msg.read && { borderLeftWidth: 3, borderLeftColor: Colors.primary },
                ]}
                onPress={() =>
                  setMessages((prev) =>
                    prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
                  )
                }
              >
                {/* 类型图标 */}
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: typeInfo.bg,
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Text style={{ fontSize: 20 }}>{typeInfo.emoji}</Text>
                </View>

                {/* 消息内容 */}
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.foreground }}>{msg.title}</Text>
                    <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>{msg.time}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: Colors.mutedForeground, lineHeight: 19 }} numberOfLines={2}>
                    {msg.body}
                  </Text>
                </View>

                {/* 未读红点 */}
                {!msg.read && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30", marginTop: 4, flexShrink: 0 }} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  // ════════════════════════════════════════
  // 作品详情页（左右滑动分镜）
  // ════════════════════════════════════════
  const renderDetail = () => {
    if (!detailData) return null;
    const panel = detailData.panels[detailIndex];
    const total = detailData.panels.length;
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <View style={styles.navBar}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconArrowLeft />
          </TouchableOpacity>
          <Text style={styles.navBarTitle} numberOfLines={1}>{detailData.title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            setDetailIndex(idx);
          }}
          style={{ flex: 1 }}
        >
          {detailData.panels.map((p, i) => (
            <ScrollView key={i} style={{ width: SCREEN_W }} contentContainerStyle={{ padding: 16, paddingBottom: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
              {/* 图片卡片 */}
              <View style={{ borderRadius: 16, overflow: "hidden", position: "relative" as any }}>
                <Image
                  source={{ uri: p.image }}
                  style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 16 }}
                  resizeMode="cover"
                />
                <View style={dt.pageIndicator}>
                  <Text style={dt.pageText}>{i + 1} / {total}</Text>
                </View>
              </View>
              {/* 文字 */}
              <Text style={dt.sceneText}>{p.scene}</Text>
              <View style={styles.dialogueBubble}>
                <Text style={styles.dialogueText}>「{p.dialogue}」</Text>
              </View>
            </ScrollView>
          ))}
        </ScrollView>

        {/* 底部社交栏 */}
        <View style={dt.socialBar}>
          <TouchableOpacity
            style={dt.socialBtn}
            onPress={() => { hapticLight(); setDetailLiked(!detailLiked); }}
            activeOpacity={0.7}
          >
            <IconHeart color={detailLiked ? "#FF3B30" : "#717171"} size={22} />
            <Text style={[dt.socialText, detailLiked && { color: "#FF3B30" }]}>
              {detailLiked ? detailData.likes + 1 : detailData.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={dt.socialBtn}
            onPress={() => { hapticLight(); setDetailBookmarked(!detailBookmarked); }}
            activeOpacity={0.7}
          >
            <IconBookmark color={detailBookmarked ? "#34C759" : "#717171"} size={22} />
            <Text style={[dt.socialText, detailBookmarked && { color: "#34C759" }]}>
              {detailBookmarked ? "已收藏" : "收藏"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={dt.socialBtn} activeOpacity={0.7} onPress={() => setShowComments(true)}>
            <IconFileText color="#717171" size={22} />
            <Text style={dt.socialText}>{detailComments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dt.socialBtn} activeOpacity={0.7} onPress={async () => {
            try {
              await Share.share({ message: `来看看「${detailData.title}」这个漫剧分镜作品！`, title: detailData.title });
            } catch {}
          }}>
            <IconChevronRight color="#717171" size={22} />
            <Text style={dt.socialText}>转发</Text>
          </TouchableOpacity>
        </View>

        {/* 评论弹窗 */}
        <Modal visible={showComments} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "75%", paddingBottom: 30 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 0.5, borderBottomColor: "#EBEBEB" }}>
                <Text style={{ fontSize: 17, fontWeight: "600" }}>评论 ({detailComments.length})</Text>
                <TouchableOpacity onPress={() => setShowComments(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ fontSize: 15, color: Colors.mutedForeground }}>关闭</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={detailComments}
                keyExtractor={(_, i) => String(i)}
                style={{ paddingHorizontal: 16 }}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: "row", paddingVertical: 12, gap: 10, borderBottomWidth: 0.5, borderBottomColor: "#F5F5F5" }}>
                    <Text style={{ fontSize: 24 }}>{item.avatar}</Text>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.foreground }}>{item.user}</Text>
                        <Text style={{ fontSize: 11, color: Colors.mutedForeground }}>{item.time}</Text>
                      </View>
                      <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 20 }}>{item.text}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <IconHeartSmall color="#C4C4C4" size={12} />
                        <Text style={{ fontSize: 11, color: Colors.mutedForeground }}>{item.likes}</Text>
                      </View>
                    </View>
                  </View>
                )}
              />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: "#EBEBEB" }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: "#F5F5F5", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 }}
                  placeholder="写评论..."
                  placeholderTextColor="#C4C4C4"
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity activeOpacity={0.7} onPress={() => {
                  if (!commentText.trim()) return;
                  setDetailComments((prev) => [{ user: "我", avatar: "😊", text: commentText.trim(), time: "刚刚", likes: 0 }, ...prev]);
                  setCommentText("");
                }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.primary }}>发送</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // ════════════════════════════════════════
  // 设置页
  // ════════════════════════════════════════
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");

  const renderSettings = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setScreen("profile")} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>个人设置</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* 个人资料 */}
        <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.mutedForeground, marginBottom: -8 }}>个人资料</Text>
        <View style={[st.card, Shadows.standard]}>
          {/* 头像 */}
          <TouchableOpacity style={st.row} activeOpacity={0.7} onPress={() => Alert.alert("更换头像", "头像功能开发中")}>
            <Text style={st.rowLabel}>头像</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" }}>
                <IconUser color="#fff" size={18} />
              </View>
              <IconChevronRight color="#C4C4C4" size={16} />
            </View>
          </TouchableOpacity>
          <View style={st.divider} />
          {/* 昵称 */}
          <TouchableOpacity style={st.row} activeOpacity={0.7} onPress={() => { setTempName(userName); setEditingName(true); }}>
            <Text style={st.rowLabel}>昵称</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={st.rowValue}>{userName}</Text>
              <IconChevronRight color="#C4C4C4" size={16} />
            </View>
          </TouchableOpacity>
          <View style={st.divider} />
          {/* 个人简介 */}
          <TouchableOpacity style={st.row} activeOpacity={0.7} onPress={() => { setTempBio(userBio); setEditingBio(true); }}>
            <Text style={st.rowLabel}>个人简介</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>
              <Text style={[st.rowValue, { maxWidth: 180 }]} numberOfLines={1}>{userBio}</Text>
              <IconChevronRight color="#C4C4C4" size={16} />
            </View>
          </TouchableOpacity>
          <View style={st.divider} />
          {/* ID */}
          <View style={st.row}>
            <Text style={st.rowLabel}>ID</Text>
            <Text style={st.rowValue}>{userId}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 修改昵称弹窗 */}
      <Modal visible={editingName} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: SCREEN_W - 64, gap: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", textAlign: "center" }}>修改昵称</Text>
            <TextInput
              style={{ backgroundColor: Colors.greyBg, borderRadius: Radius.m, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 }}
              value={tempName}
              onChangeText={setTempName}
              placeholder="输入新昵称"
              maxLength={20}
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, height: 44, borderRadius: Radius.pill, backgroundColor: Colors.greyBg, justifyContent: "center", alignItems: "center" }}
                onPress={() => setEditingName(false)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 15, color: Colors.foreground }}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, height: 44, borderRadius: Radius.pill, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" }}
                onPress={() => {
                  if (tempName.trim()) {
                    setUserName(tempName.trim());
                  }
                  setEditingName(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 修改简介弹窗 */}
      <Modal visible={editingBio} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: SCREEN_W - 64, gap: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", textAlign: "center" }}>修改简介</Text>
            <TextInput
              style={{ backgroundColor: Colors.greyBg, borderRadius: Radius.m, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, minHeight: 80, textAlignVertical: "top" }}
              value={tempBio}
              onChangeText={setTempBio}
              placeholder="介绍一下自己吧"
              maxLength={100}
              multiline
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, height: 44, borderRadius: Radius.pill, backgroundColor: Colors.greyBg, justifyContent: "center", alignItems: "center" }}
                onPress={() => setEditingBio(false)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 15, color: Colors.foreground }}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, height: 44, borderRadius: Radius.pill, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" }}
                onPress={() => {
                  if (tempBio.trim()) setUserBio(tempBio.trim());
                  setEditingBio(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ════════════════════════════════════════
  // 个人主页（匹配 Pencil 设计稿 8sgPZ）
  // ════════════════════════════════════════
  const renderProfile = () => {
    const userMenuItems = [
      { key: "works", label: "我的作品", icon: IconImage, iconColor: "#5F33E1", count: works.length },
      { key: "favs", label: "我的收藏", icon: IconBookmark, iconColor: "#34C759", count: 0 },
      { key: "likes", label: "我的点赞", icon: IconHeart, iconColor: "#FF3B30", count: 0 },
    ];
    const systemMenuItems = [
      { key: "cache", label: "清除缓存" },
      { key: "agreement", label: "用户协议" },
      { key: "privacy", label: "隐私政策" },
      { key: "about", label: "关于 · v1.0.0" },
    ];

    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={ps.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 标题行 */}
          <View style={ps.headerRow}>
            <TouchableOpacity onPress={() => setScreen("home")} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <IconArrowLeft />
            </TouchableOpacity>
            <Text style={ps.title}>我的</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* 用户卡片 — 点击进入设置 */}
          <TouchableOpacity style={ps.profileCard} activeOpacity={0.8} onPress={() => navigateTo("settings")}>
            <View style={ps.avatarWrap}>
              <View style={ps.avatarCircle}>
                <IconUser />
              </View>
            </View>
            <View style={ps.profileInfo}>
              <Text style={ps.userName}>{userName}</Text>
              <Text style={ps.userId}>ID: {userId} · 新手创作者</Text>
            </View>
            <IconChevronRight color="#C4C4C4" size={16} />
          </TouchableOpacity>

          {/* 积分栏 */}
          <View style={[ps.statsCard, { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: Colors.mutedForeground }}>我的积分</Text>
              <Text style={{ fontSize: 28, fontWeight: "700", color: Colors.primary }}>{pointsBalance}</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: todayCheckin ? Colors.greyBg : Colors.primary, borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 8 }}
              onPress={todayCheckin ? undefined : handleCheckin}
              activeOpacity={todayCheckin ? 1 : 0.7}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: todayCheckin ? Colors.mutedForeground : "#fff" }}>
                {todayCheckin ? "已签到" : "签到 +5"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: Colors.primaryBg, borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 8 }}
              onPress={() => setShowPointsShop(true)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.primary }}>充值</Text>
            </TouchableOpacity>
          </View>

          {/* 生图进度提示 */}
          {generatingImages && (
            <TouchableOpacity
              style={[styles.bgTaskBubble, { backgroundColor: "#007AFF", marginHorizontal: 0 }]}
              onPress={() => navigateTo("result")}
              activeOpacity={0.9}
            >
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.bgTaskBubbleText}>图片生成中 {imageGenProgress.done}/{imageGenProgress.total}，点击查看</Text>
            </TouchableOpacity>
          )}

          {/* 用户数据 — 横排三块 */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {userMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={{ flex: 1, backgroundColor: "#fff", borderRadius: Radius.lg, paddingVertical: 16, alignItems: "center", gap: 6, ...Shadows.standard }}
                  activeOpacity={0.7}
                  onPress={() => { if (item.key === "works") navigateTo("works"); }}
                >
                  <Icon color={item.iconColor} size={24} />
                  <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.foreground }}>{item.label}</Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.foreground }}>{item.count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 系统功能菜单 */}
          <View style={ps.menuCard}>
            {systemMenuItems.map((item, idx) => (
              <View key={item.key}>
                {idx > 0 && <View style={ps.divider} />}
                <TouchableOpacity
                  style={ps.menuItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.key === "cache") {
                      Alert.alert("清除缓存", `当前 ${works.length} 个作品。确定清除所有本地数据？`, [
                        { text: "取消" },
                        { text: "清除", style: "destructive", onPress: async () => {
                          setWorks([]);
                          setBgTasks([]);
                          await AsyncStorage.multiRemove(["@drafts", "@works"]);
                          Alert.alert("已清除", "所有本地数据已清除");
                        }},
                      ]);
                    } else if (item.key === "agreement") {
                      navigateTo("agreement");
                    } else if (item.key === "privacy") {
                      navigateTo("privacy");
                    } else if (item.key === "about") {
                      navigateTo("about");
                    }
                  }}
                >
                  <Text style={ps.menuText}>{item.label}</Text>
                  <View style={{ marginLeft: "auto" as any }}>
                    <IconChevronRight color="#C4C4C4" size={16} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* 退出登录 */}
          <TouchableOpacity
            style={{ paddingVertical: 16, alignItems: "center" }}
            activeOpacity={0.7}
            onPress={() => Alert.alert("退出登录", "确定要退出登录吗？", [
              { text: "取消" },
              { text: "退出", style: "destructive", onPress: async () => {
                setIsLoggedIn(false);
                setAuthToken(null);
                await AsyncStorage.multiRemove(["@authToken", "@userName"]);
                setScreen("login");
              }},
            ])}
          >
            <Text style={{ fontSize: 14, color: Colors.mutedForeground }}>退出登录</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

      </View>
    );
  };

  // ════════════════════════════════════════
  // 用户协议页
  // ════════════════════════════════════════
  const renderAgreement = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>用户协议</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: Colors.foreground }}>AI 漫剧分镜脚本助手用户协议</Text>
        <Text style={{ fontSize: 13, color: Colors.mutedForeground }}>更新日期：2026年3月29日 · 生效日期：2026年3月29日</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>一、服务说明</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>AI 漫剧分镜脚本助手（以下简称"本产品"）是一款由灵镜科技提供的 AI 辅助创作工具，帮助用户通过文字描述自动生成漫剧分镜脚本和配图。本产品利用人工智能技术为用户提供内容创作服务。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>二、用户注册与账号</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>1. 用户须提供真实、准确的个人信息进行注册。{"\n"}2. 用户应妥善保管账号和密码，因账号管理不善造成的损失由用户自行承担。{"\n"}3. 一个手机号仅可注册一个账号。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>三、知识产权</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>1. 用户通过本产品生成的文本内容和图片，其知识产权归用户所有。{"\n"}2. 用户授予本产品在合理范围内展示、推荐其公开发布的作品的权利。{"\n"}3. 本产品的软件、界面设计、AI 模型等知识产权归灵镜科技所有。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>四、用户行为规范</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>用户在使用本产品时，不得：{"\n"}1. 生成违反法律法规、公序良俗的内容；{"\n"}2. 生成侵犯他人知识产权、肖像权、隐私权的内容；{"\n"}3. 利用本产品进行任何违法活动；{"\n"}4. 恶意攻击、干扰本产品的正常运行。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>五、免责声明</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>1. AI 生成的内容可能存在不准确之处，用户应自行判断和审核。{"\n"}2. 因不可抗力、系统维护等原因导致服务中断，本产品不承担责任。{"\n"}3. 用户发布的内容由用户自行负责，本产品不对其合法性、准确性承担责任。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>六、协议变更</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>本产品有权根据业务发展需要修改本协议内容，修改后的协议将在产品内公布。用户继续使用本产品即视为同意修改后的协议。</Text>

        <Text style={{ fontSize: 13, color: Colors.mutedForeground, marginTop: 16 }}>如有疑问，请联系：support@lingjing.ai</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );

  // ════════════════════════════════════════
  // 隐私政策页
  // ════════════════════════════════════════
  const renderPrivacy = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>隐私政策</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: Colors.foreground }}>隐私政策</Text>
        <Text style={{ fontSize: 13, color: Colors.mutedForeground }}>更新日期：2026年3月29日 · 生效日期：2026年3月29日</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>一、我们收集的信息</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>为了向您提供服务，我们可能收集以下信息：{"\n"}1. 注册信息：手机号码、昵称、头像等；{"\n"}2. 创作内容：您输入的故事文案、生成的脚本和图片；{"\n"}3. 设备信息：设备型号、操作系统版本、唯一设备标识符；{"\n"}4. 使用数据：功能使用频率、页面访问记录等。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>二、信息使用目的</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>1. 提供、维护和改进我们的服务；{"\n"}2. 个性化用户体验和内容推荐；{"\n"}3. 安全防护和风险控制；{"\n"}4. 遵守法律法规要求。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>三、信息存储与保护</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>1. 您的数据存储在中国境内的阿里云服务器上；{"\n"}2. 我们采用加密传输（HTTPS）和存储加密等技术保护您的数据安全；{"\n"}3. 我们不会将您的个人信息出售给第三方。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>四、信息共享</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>除以下情况外，我们不会与第三方共享您的个人信息：{"\n"}1. 经您明确同意；{"\n"}2. 法律法规要求；{"\n"}3. 为保护用户或公众安全所必需。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>五、您的权利</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>1. 访问权：您可以随时查看和修改您的个人信息；{"\n"}2. 删除权：您可以请求删除您的账号和相关数据；{"\n"}3. 撤回同意：您可以撤回对数据处理的同意；{"\n"}4. 导出权：您可以导出您创作的内容和数据。</Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground, marginTop: 8 }}>六、未成年人保护</Text>
        <Text style={{ fontSize: 14, color: Colors.foreground, lineHeight: 22 }}>我们重视未成年人的个人信息保护。若您是未满 14 周岁的未成年人，请在监护人同意后使用本产品。</Text>

        <Text style={{ fontSize: 13, color: Colors.mutedForeground, marginTop: 16 }}>如有疑问，请联系：privacy@lingjing.ai</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );

  // ════════════════════════════════════════
  // 关于页
  // ════════════════════════════════════════
  const renderAbout = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>关于</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={{ flex: 1, alignItems: "center", paddingTop: 60, paddingHorizontal: 24, gap: 16 }}>
        {/* Logo */}
        <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" }}>
          <IconSparkle color="#fff" size={40} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700", color: Colors.foreground }}>AI 漫剧分镜脚本助手</Text>
        <Text style={{ fontSize: 14, color: Colors.mutedForeground }}>版本 1.0.0 (MVP)</Text>

        <View style={{ backgroundColor: "#fff", borderRadius: Radius.lg, padding: 20, width: "100%", gap: 12, marginTop: 16, ...Shadows.standard }}>
          <Text style={{ fontSize: 15, color: Colors.foreground, lineHeight: 22 }}>
            一款面向漫剧创作小白的 AI 工具。输入一句简单文案，AI 自动完成故事拆解、分镜脚本生成、漫画图片生成的全流程。
          </Text>
        </View>

        <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginTop: 20 }}>© 2026 灵镜科技 · All Rights Reserved</Text>
      </View>
    </View>
  );

  // ════════════════════════════════════════
  // 探索页（匹配 Pencil 设计稿 er1FZ）
  // ════════════════════════════════════════
  const [activeTab, setActiveTab] = useState(0);
  const [exploreQuery, setExploreQuery] = useState("");

  const WaterfallCard = ({ card }: { card: WaterfallItem }) => (
    <TouchableOpacity style={es.wCard} activeOpacity={0.85} onPress={() => openDetail(card.title, card.image, 100 + parseInt(card.id.replace("w", "")), card.author)}>
      <Image source={{ uri: card.image }} style={[es.wCardImg, { height: card.imgH }]} resizeMode="cover" />
      <View style={es.wCardInfo}>
        <Text style={es.wCardTitle} numberOfLines={2}>{card.title}</Text>
        <View style={es.wCardMeta}>
          <Text style={es.wCardAuthor}>{card.author}</Text>
          <View style={es.wCardLike}>
            <IconHeartSmall />
            <Text style={es.wCardLikeCount}>{card.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExplore = () => (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {/* 标题栏 + 返回 */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconArrowLeft />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>探索</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={es.content}
        showsVerticalScrollIndicator={false}
      >

        {/* 搜索栏 */}
        <View style={es.searchBar}>
          <IconSearch />
          <TextInput
            style={[es.searchInput]}
            placeholder="搜索作品、风格、创作者..."
            placeholderTextColor="#717171"
            value={exploreQuery}
            onChangeText={setExploreQuery}
          />
          {exploreQuery.length > 0 && (
            <TouchableOpacity onPress={() => setExploreQuery("")} activeOpacity={0.7}>
              <Text style={{ fontSize: 14, color: Colors.mutedForeground }}>取消</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 风格标签 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {EXPLORE_TABS.map((tab, idx) => (
            <TouchableOpacity
              key={tab}
              style={[es.tab, activeTab === idx && es.tabActive]}
              onPress={() => setActiveTab(idx)}
              activeOpacity={0.7}
            >
              <Text style={[es.tabText, activeTab === idx && es.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 瀑布流（按标签+搜索过滤） */}
        {(() => {
          const selectedTag = EXPLORE_TABS[activeTab];
          const q = exploreQuery.trim().toLowerCase();
          const filtered = ALL_WATERFALL.filter((c) => {
            if (selectedTag !== "全部" && c.tag !== selectedTag) return false;
            if (q && !c.title.toLowerCase().includes(q) && !c.author.toLowerCase().includes(q) && !c.tag.includes(q)) return false;
            return true;
          });
          const col1 = filtered.filter((_, i) => i % 2 === 0);
          const col2 = filtered.filter((_, i) => i % 2 === 1);
          return filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 40, gap: 8 }}>
              <Text style={{ fontSize: 15, color: Colors.mutedForeground }}>没有找到相关作品</Text>
            </View>
          ) : (
            <View style={es.waterfall}>
              <View style={es.wCol}>
                {col1.map((c) => <WaterfallCard key={c.id} card={c} />)}
              </View>
              <View style={es.wCol}>
                {col2.map((c) => <WaterfallCard key={c.id} card={c} />)}
              </View>
            </View>
          );
        })()}
      </ScrollView>
    </View>
  );

  // ════════════════════════════════════════
  // 底部 Tab 栏
  // ════════════════════════════════════════
  const TAB_ITEMS: { key: typeof activeMainTab; label: string; Icon: typeof IconSparkle }[] = [
    { key: "create", label: "创作", Icon: IconSparkle },
    { key: "explore", label: "探索", Icon: IconGlobe },
    { key: "profile", label: "我的", Icon: IconUser },
  ];

  const showTabBar = screen === "home" || screen === "explore" || screen === "profile";

  // ════════════════════════════════════════
  // 主渲染
  // ════════════════════════════════════════
  return (
    <View style={{ flex: 1, width: "100%" as any, maxWidth: "100%" as any, backgroundColor: Colors.background, overflow: "hidden" as any }}>
      <BokehBG />
      <View style={styles.safeTop} />

      {/* Tab 内容（带转场动画） */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {screen === "login" && renderLogin()}
      {screen === "home" && renderHome()}
      {screen === "wizard" && renderWizard()}
      {screen === "loading" && renderLoading()}
      {screen === "result" && result && renderResult()}
      {screen === "profile" && renderProfile()}
      {screen === "explore" && renderExplore()}
      {screen === "drafts" && renderDrafts()}
      {screen === "works" && renderWorks()}
      {screen === "detail" && renderDetail()}
      {screen === "pending" && renderPending()}
      {screen === "messages" && renderMessages()}
      {screen === "settings" && renderSettings()}
      {screen === "agreement" && renderAgreement()}
      {screen === "privacy" && renderPrivacy()}
      {screen === "about" && renderAbout()}
      </Animated.View>

      {/* 底部 Tab 栏 */}
      {false && showTabBar && (
        <View style={tb.bar} />
      )}

      {/* 积分商店弹窗 */}
      <Modal visible={showPointsShop} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 0.5, borderBottomColor: "#EBEBEB" }}>
              <Text style={{ fontSize: 17, fontWeight: "600" }}>积分充值</Text>
              <TouchableOpacity onPress={() => setShowPointsShop(false)}>
                <Text style={{ fontSize: 15, color: Colors.mutedForeground }}>关闭</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16, gap: 8 }}>
              <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginBottom: 8 }}>当前积分：<Text style={{ color: Colors.primary, fontWeight: "700", fontSize: 20 }}>{pointsBalance}</Text></Text>
              {[
                { id: "trial", name: "体验包", points: 50, price: "1元", desc: "新用户首购" },
                { id: "basic", name: "基础包", points: 100, price: "6元", desc: "约6个作品" },
                { id: "pro", name: "进阶包", points: 300, price: "12元", badge: "8折", desc: "约20个作品" },
                { id: "premium", name: "豪华包", points: 1000, price: "30元", badge: "5折", desc: "约66个作品" },
              ].map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={{
                    flexDirection: "row", alignItems: "center", backgroundColor: Colors.greyBg,
                    borderRadius: Radius.m, padding: 16, gap: 12,
                  }}
                  activeOpacity={0.7}
                  onPress={async () => {
                    try {
                      const resp = await fetch(`${API_BASE}/api/points/purchase`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ package_id: pkg.id }),
                      });
                      const data = await resp.json();
                      setPointsBalance(data.balance);
                      hapticSuccess();
                      Alert.alert("购买成功", `+${pkg.points} 积分，当前余额 ${data.balance}`);
                      setShowPointsShop(false);
                    } catch {
                      Alert.alert("购买失败", "请检查网络");
                    }
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.foreground }}>{pkg.name}</Text>
                      {pkg.badge && (
                        <View style={{ backgroundColor: Colors.error, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{pkg.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 13, color: Colors.mutedForeground, marginTop: 2 }}>{pkg.points} 积分 · {pkg.desc}</Text>
                  </View>
                  <View style={{ backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingHorizontal: 20, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>{pkg.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── 样式 ───
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  safeTop: { height: 54, backgroundColor: "transparent" },

  // ── 通用按钮 ──
  primaryBtn: {
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: { fontSize: Fonts.sizes.lg, fontWeight: "600", color: "#fff" },
  outlineBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlineBtnText: { fontSize: Fonts.sizes.sm, color: Colors.mutedForeground },
  fixedBottom: {
    padding: Spacing.md,
    paddingBottom: 34,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderTopColor: "transparent",
  },

  // ── 导航栏（引导 & 结果页复用）──
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing.md, height: 56, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  navBarTitle: { fontSize: Fonts.sizes.lg, fontWeight: "600", color: Colors.foreground },

  // ── 圆点进度指示器 ──
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 24 },

  // ── 引导式创作 ──
  wizLabel: { fontSize: Fonts.sizes.lg, fontWeight: "600", color: Colors.foreground },
  wizDesc: { fontSize: Fonts.sizes.sm, color: Colors.mutedForeground },
  wizInputBox: { backgroundColor: Colors.card, borderRadius: Radius.m, padding: Spacing.md, height: 200 },
  wizInput: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.foreground, textAlignVertical: "top" },

  // ── 胶囊选择 (时长 / 镜头 / 比例) ──
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.pill,
    backgroundColor: Colors.greyBg, ...Shadows.standard,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: Fonts.sizes.sm, fontWeight: "500", color: Colors.foreground },
  chipTextActive: { color: "#fff", fontWeight: "600" },

  // ── 风格卡片网格 ──
  styleGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  styleCard: {
    width: (SCREEN_W - Spacing.md * 2 - Spacing.sm * 3) / 4,
    aspectRatio: 0.85,
    borderRadius: Radius.m,
    backgroundColor: Colors.greyBg,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  styleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  styleEmoji: { fontSize: 28 },
  styleLabel: { fontSize: Fonts.sizes.xs, fontWeight: "500", color: Colors.foreground, textAlign: "center" },
  styleLabelActive: { color: Colors.primary, fontWeight: "600" },
  checkMark: {
    position: "absolute", top: 6, right: 6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center",
  },

  // ── 后台任务气泡 ──
  bgTaskBubble: {
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  } as any,
  bgTaskBubbleText: { flex: 1, fontSize: Fonts.sizes.sm, fontWeight: "600", color: "#fff" },

  // ── 加载页 ──
  loadingCenter: { justifyContent: "center", alignItems: "center", gap: Spacing.md },
  loadingTitle: { fontSize: Fonts.sizes.xxl, fontWeight: "700", color: Colors.foreground, marginTop: Spacing.sm },
  loadingDesc: { fontSize: Fonts.sizes.sm, color: Colors.mutedForeground, textAlign: "center", lineHeight: 20 },
  loadingSteps: { marginTop: Spacing.md, gap: 12 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: Fonts.sizes.md, color: Colors.mutedForeground },
  stepLabelActive: { color: Colors.foreground },

  // ── 脚本编辑 / 结果页 ──
  infoBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: Spacing.md, paddingVertical: 10 },
  infoBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  infoBadgeText: { fontSize: Fonts.sizes.sm, fontWeight: "600", color: Colors.primary },
  infoText: { fontSize: Fonts.sizes.sm, color: Colors.mutedForeground },
  panelCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 12, gap: Spacing.sm },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  panelNumBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  panelNumText: { color: "#fff", fontSize: Fonts.sizes.sm, fontWeight: "700" },
  phaseBadge: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 2 },
  phaseText: { fontSize: Fonts.sizes.xs, fontWeight: "600" },
  cameraText: { fontSize: Fonts.sizes.xs, color: Colors.mutedForeground, marginLeft: "auto" as any },
  panelScene: { fontSize: Fonts.sizes.md, color: Colors.foreground, lineHeight: 22 },
  panelCharacters: { fontSize: Fonts.sizes.sm, color: Colors.mutedForeground },
  dialogueBubble: { backgroundColor: Colors.greyBg, borderRadius: Radius.m, padding: 12 },
  dialogueText: { fontSize: Fonts.sizes.md, color: Colors.foreground, lineHeight: 22 },
  panelMood: { fontSize: Fonts.sizes.sm, color: Colors.mutedForeground },

  // ── 个人主页 ── (old, kept for reference — replaced by ps)
  profileAvatar: {} as any,
  profileName: {} as any,
  profileBio: {} as any,
  statsRow: {} as any,
  statItem: {} as any,
  statNum: {} as any,
  statLabel: {} as any,
  statDivider: {} as any,
  menuItem: {} as any,
  menuItemText: {} as any,

  // ── 探索页 ── (old, kept for reference — replaced by es)
  catChip: {} as any,
  catChipActive: {} as any,
  catChipText: {} as any,
  catChipTextActive: {} as any,
  exploreGrid: {} as any,
  exploreCard: {} as any,
  exploreCardImg: {} as any,
  exploreCardBody: {} as any,
  exploreCardTitle: {} as any,
  exploreCardMeta: {} as any,
});

// ─── 探索页样式（匹配 Pencil 设计稿） ───
const es = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 28, gap: 20 },
  title: { fontSize: 28, fontWeight: "700", color: "#1A1A1A" },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#F7F7F7", borderRadius: 12, height: 44,
    paddingHorizontal: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  searchText: { fontSize: 15, color: "#717171" },
  searchInput: { flex: 1, fontSize: 15, color: "#1A1A1A", paddingVertical: 0 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 100,
    backgroundColor: "#F7F7F7",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  tabActive: { backgroundColor: "#5F33E1" },
  tabText: { fontSize: 13, fontWeight: "500", color: "#1A1A1A" },
  tabTextActive: { color: "#FFFFFF", fontWeight: "600" },
  waterfall: { flexDirection: "row", gap: 12 },
  wCol: { flex: 1, gap: 12 },
  wCard: {
    borderRadius: 12, backgroundColor: "#FFFFFF", overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  wCardImg: { width: "100%" as any, borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: "hidden" },
  wCardInfo: { padding: 10, paddingTop: 4, gap: 6 },
  wCardTitle: { fontSize: 14, fontWeight: "600", color: "#1A1A1A", lineHeight: 20 },
  wCardMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wCardAuthor: { fontSize: 11, color: "#717171" },
  wCardLike: { flexDirection: "row", alignItems: "center", gap: 3 },
  wCardLikeCount: { fontSize: 11, color: "#717171" },
  backBtn: {
    position: "absolute", top: 8, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
});

// ─── 个人主页样式（匹配 Pencil 设计稿） ───
const ps = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 28, gap: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "700", color: "#1A1A1A" },
  profileCard: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  avatarWrap: { position: "relative", width: 64, height: 64 },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#5F33E1",
    justifyContent: "center", alignItems: "center",
  },
  profileInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  userId: { fontSize: 13, color: "#717171" },
  statsCard: {
    flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  statItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  statNum: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
  statLabel: { fontSize: 12, color: "#717171" },
  menuCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    height: 52, paddingHorizontal: 16,
  },
  menuText: { fontSize: 15, fontWeight: "500", color: "#1A1A1A" },
  badge: {
    marginLeft: "auto" as any,
    backgroundColor: "#FF9500",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  divider: { height: 1, backgroundColor: "#EBEBEB", marginHorizontal: 16 },
  backBtn: {
    position: "absolute", top: 8, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
});

// ─── 底部 Tab 栏样式 ───
const tb = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
    borderTopColor: "#EBEBEB",
    paddingBottom: 28, // safe area
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  label: { fontSize: 11, fontWeight: "500", color: "#717171" },
  labelActive: { color: Colors.primary, fontWeight: "600" },
});

// ─── 脚本结果页扩展样式（图片+编辑） ───
const rs = StyleSheet.create({
  imgPlaceholder: {
    width: "100%", aspectRatio: 3 / 4, borderRadius: Radius.m,
    backgroundColor: Colors.greyBg, justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  regenBtn: {
    position: "absolute", bottom: 8, right: 8,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  regenBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  editToggle: {
    marginLeft: "auto" as any,
    backgroundColor: Colors.primaryBg, borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  editToggleText: { fontSize: 12, fontWeight: "600", color: Colors.primary },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: Colors.mutedForeground },
  fieldInput: {
    backgroundColor: Colors.greyBg, borderRadius: Radius.sm, padding: 10,
    fontSize: 14, color: Colors.foreground, minHeight: 36,
  },
});

// ─── 草稿/作品列表样式 ───
const ls = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: Radius.lg, padding: Spacing.md, gap: 8,
    position: "relative" as any,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.foreground, flex: 1 },
  cardTime: { fontSize: 12, color: Colors.mutedForeground },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardBadge: { fontSize: 12, color: Colors.primary, backgroundColor: Colors.primaryBg, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  cardInfo: { fontSize: 12, color: Colors.mutedForeground },
  deleteBtn: { marginLeft: "auto" as any, paddingLeft: 12 },
  deleteBtnText: { fontSize: 12, color: Colors.error },
});

// ─── 详情页样式 ───
const dt = StyleSheet.create({
  arrow: {
    position: "absolute", top: "45%",
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  pageIndicator: {
    position: "absolute", bottom: 12, alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  pageText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  textArea: { padding: 16, gap: 10, backgroundColor: "#fff" },
  sceneText: { fontSize: 15, color: Colors.foreground, lineHeight: 22 },
  socialBar: {
    flexDirection: "row", backgroundColor: "#fff",
    borderTopWidth: 0.5, borderTopColor: "#EBEBEB",
    paddingVertical: 10, paddingBottom: 32, paddingHorizontal: 20,
  },
  socialBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  socialText: { fontSize: 14, color: "#717171" },
});

// ─── 设置页样式 ───
const st = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: Radius.lg, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 52 },
  rowLabel: { fontSize: 15, color: Colors.foreground },
  rowValue: { fontSize: 15, color: Colors.mutedForeground },
  divider: { height: 0.5, backgroundColor: "#EBEBEB", marginLeft: 16 },
});
