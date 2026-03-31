import { StatusBar } from "expo-status-bar";
import type { ComponentType } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Fonts, Radius, Spacing, Shadows } from "../theme";

type IconComponent = ComponentType<{ color?: string; size?: number }>;

interface HomeScreenProps {
  userName: string;
  story: string;
  generatingTaskTitle?: string;
  showGeneratingTaskBubble: boolean;
  showCompletedTaskBubble: boolean;
  showImageProgressBubble: boolean;
  imageGenProgress: { done: number; total: number };
  BellIcon: IconComponent;
  UserIcon: IconComponent;
  onStoryChange: (value: string) => void;
  onOpenProfile: () => void;
  onOpenMessages: () => void;
  onOpenLoading: () => void;
  onOpenCompletedResult: () => void;
  onOpenImageProgress: () => void;
  onOpenGenerateWizard: () => void;
  onOpenExplore: () => void;
  onOpenDetail: (title: string, image: string, id: number) => void;
}

interface InspirationCard {
  id: number;
  tag: string;
  title: string;
  episodes: string;
  views: string;
  image: string;
}

const INSPIRATION_CARDS: InspirationCard[] = [
  { id: 1, tag: "悬疑反转", title: "渣男被前女友报复", episodes: "3集", views: "12.4w", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop&crop=face" },
  { id: 2, tag: "都市奇幻", title: "午夜城市的秘密", episodes: "8集", views: "15.7w", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&h=400&fit=crop" },
  { id: 3, tag: "热血冒险", title: "少年觉醒之路", episodes: "6集", views: "20.1w", image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=300&h=400&fit=crop" },
  { id: 4, tag: "甜宠恋爱", title: "校园暗恋日记", episodes: "5集", views: "8.3w", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=400&fit=crop" },
  { id: 5, tag: "搞笑日常", title: "社恐打工人的一天", episodes: "10集", views: "25.6w", image: "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=300&h=400&fit=crop" },
  { id: 6, tag: "悬疑反转", title: "密室逃脱之谜", episodes: "4集", views: "18.9w", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=400&fit=crop" },
  { id: 7, tag: "都市奇幻", title: "我在异世界开咖啡店", episodes: "12集", views: "30.2w", image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=300&h=400&fit=crop" },
  { id: 8, tag: "热血冒险", title: "末日生存指南", episodes: "7集", views: "22.0w", image: "https://images.unsplash.com/photo-1542856204-00101eb6def4?w=300&h=400&fit=crop" },
  { id: 9, tag: "甜宠恋爱", title: "总裁的契约女友", episodes: "9集", views: "35.1w", image: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=300&h=400&fit=crop" },
  { id: 10, tag: "搞笑日常", title: "猫咆咆的奇妙冒险", episodes: "6集", views: "14.8w", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=400&fit=crop" },
];

export default function HomeScreen({
  userName,
  story,
  generatingTaskTitle,
  showGeneratingTaskBubble,
  showCompletedTaskBubble,
  showImageProgressBubble,
  imageGenProgress,
  BellIcon,
  UserIcon,
  onStoryChange,
  onOpenProfile,
  onOpenMessages,
  onOpenLoading,
  onOpenCompletedResult,
  onOpenImageProgress,
  onOpenGenerateWizard,
  onOpenExplore,
  onOpenDetail,
}: HomeScreenProps) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onOpenProfile} activeOpacity={0.8}>
          <View style={styles.avatarCircle}>
            <UserIcon color="#FFFFFF" size={22} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.greetingBlock} onPress={onOpenProfile} activeOpacity={0.7}>
          <Text style={styles.greetingLabel}>你好！</Text>
          <Text style={styles.greetingName}>{userName}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bellWrap, { position: "relative" }]} activeOpacity={0.7} onPress={onOpenMessages}>
          <BellIcon />
          <View style={styles.unreadDot} />
        </TouchableOpacity>
      </View>

      {showGeneratingTaskBubble && (
        <TouchableOpacity style={styles.bgTaskBubble} onPress={onOpenLoading} activeOpacity={0.9}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.bgTaskBubbleText} numberOfLines={1}>
            AI 创作中：{generatingTaskTitle}
          </Text>
        </TouchableOpacity>
      )}

      {showCompletedTaskBubble && (
        <TouchableOpacity style={[styles.bgTaskBubble, styles.doneTaskBubble]} onPress={onOpenCompletedResult} activeOpacity={0.9}>
          <Text style={styles.bgTaskBubbleText}>✅ 脚本生成完成，点击查看</Text>
        </TouchableOpacity>
      )}

      {showImageProgressBubble && (
        <TouchableOpacity style={[styles.bgTaskBubble, styles.imageTaskBubble]} onPress={onOpenImageProgress} activeOpacity={0.9}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.bgTaskBubbleText}>
            图片生成中 {imageGenProgress.done}/{imageGenProgress.total}，点击查看
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.storySection}>
          <Text style={styles.storyTitle}>告诉灵镜AI你的故事</Text>
          <View style={[styles.storyInputBox, Shadows.standard]}>
            <TextInput
              style={styles.storyInput}
              placeholder="输入你的故事，比如：一只猫咪意外获得超能力，拯救了整个城市..."
              placeholderTextColor="#C4C4C4"
              multiline
              value={story}
              onChangeText={onStoryChange}
              textAlignVertical="top"
            />
          </View>
          <TouchableOpacity
            style={[styles.primaryBtn, Shadows.purple]}
            activeOpacity={0.85}
            onPress={onOpenGenerateWizard}
          >
            <Text style={styles.primaryBtnText}>生成分镜脚本</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inspirationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>探索灵感</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onOpenExplore}>
              <Text style={styles.seeAll}>查看全部</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.inspirationList}
          >
            {INSPIRATION_CARDS.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.inspCard}
                activeOpacity={0.85}
                onPress={() => onOpenDetail(card.title, card.image, card.id)}
              >
                <Image source={{ uri: card.image }} style={StyleSheet.absoluteFill} />
                <View style={styles.inspTag}>
                  <Text style={styles.inspTagText}>{card.tag}</Text>
                </View>
                <View style={styles.inspGradient} />
                <View style={styles.inspOverlay}>
                  <Text style={styles.inspTitle}>{card.title}</Text>
                  <Text style={styles.inspMeta}>{card.episodes} · {card.views}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg, gap: Spacing.xl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#5F33E1",
    justifyContent: "center",
    alignItems: "center",
  },
  greetingBlock: { flex: 1, gap: 2 },
  greetingLabel: { fontSize: 14, color: Colors.mutedForeground },
  greetingName: { fontSize: Fonts.sizes.xxl, fontWeight: "700", color: Colors.foreground },
  bellWrap: { width: 48, height: 48, borderRadius: Radius.m, justifyContent: "center", alignItems: "center" },
  unreadDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
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
  } as const,
  doneTaskBubble: { backgroundColor: "#34C759" },
  imageTaskBubble: { backgroundColor: "#007AFF" },
  bgTaskBubbleText: { flex: 1, fontSize: Fonts.sizes.sm, fontWeight: "600", color: "#fff" },
  storySection: { gap: Spacing.md },
  storyTitle: { fontSize: Fonts.sizes.xxl, fontWeight: "700", color: Colors.foreground },
  storyInputBox: { backgroundColor: Colors.card, borderRadius: Radius.m, padding: Spacing.md, minHeight: 220 },
  storyInput: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.foreground, textAlignVertical: "top", outlineColor: "#E0E0E0" } as const,
  primaryBtn: {
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: { fontSize: Fonts.sizes.lg, fontWeight: "600", color: "#fff" },
  inspirationSection: { gap: Spacing.sm },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: Fonts.sizes.xl, fontWeight: "700", color: Colors.foreground },
  seeAll: { fontSize: Fonts.sizes.sm, fontWeight: "500", color: Colors.primary },
  inspirationList: { paddingRight: Spacing.md, gap: Spacing.sm },
  inspCard: { width: 160, height: 215, borderRadius: Radius.m, overflow: "hidden", backgroundColor: "#333" },
  inspTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  inspTagText: { fontSize: 11, fontWeight: "600", color: "#fff" },
  inspGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundImage: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.75))",
  } as any,
  inspOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 10, gap: 3 },
  inspTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  inspMeta: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
});
