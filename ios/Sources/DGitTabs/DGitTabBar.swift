import SwiftUI

/// 보더 · 콜스가 같이 쓰는 아래 탭 막대(Bobby 11/10 「보더와 같은 높이 · 너비 · 탭 모양 — 메뉴 구성만 다름」).
/// 시스템 막대는 탭 수만큼만 넓어져 셋(콜스)과 다섯(보더)의 폭이 달라서, 탭 수와 상관없이 같은 폭으로 그림.
/// 치수는 보더 iOS 26 막대를 잰 값(402pt 폭 화면): 양옆 15 · 높이 56 · 화면 아래 끝에서 8.
public struct DGitTabBar<ID: Hashable>: View {
    public struct Item: Identifiable {
        public var id: ID
        public var label: String
        /// 고름 → 아이콘(채운 · 빈 아이콘, 또는 얼굴 그림)
        public var icon: (Bool) -> Image
        public var badge: Int
        /// 배지를 VoiceOver 로 읽을 말(예 콜스 「3 missed」, 보더 「안 읽음 3」) — 없으면 숫자
        public var badgeSpoken: ((Int) -> String)?
        public init(id: ID, label: String, badge: Int = 0, badgeSpoken: ((Int) -> String)? = nil, icon: @escaping (Bool) -> Image) {
            self.id = id; self.label = label; self.badge = badge; self.badgeSpoken = badgeSpoken; self.icon = icon
        }
    }

    public static var margin: CGFloat { 15 }
    public static var height: CGFloat { 56 }
    public static var bottom: CGFloat { 8 }
    /// 막대가 차지하는 화면 아래 높이(내용 아래 여백 · + 자리 계산용)
    public static var reserved: CGFloat { height + bottom }

    @Binding var selection: ID
    var items: [Item]
    var state: TabBarState
    @Namespace private var pill
    @Environment(\.colorScheme) private var scheme
    @Environment(\.accessibilityReduceTransparency) private var solid

    public init(selection: Binding<ID>, items: [Item], state: TabBarState) { _selection = selection; self.items = items; self.state = state }

    public var body: some View {
        HStack(spacing: 0) {
            ForEach(items) { it in
                let on = it.id == selection
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) { selection = it.id }
                } label: {
                    it.icon(on)
                        .font(.system(size: 22, weight: on ? .semibold : .regular))
                        .foregroundStyle(.primary)
                        .overlay(alignment: .topTrailing) {
                            if it.badge > 0 {
                                Text(it.badge > 99 ? "99+" : "\(it.badge)").font(.caption2.weight(.bold)).foregroundStyle(.white)
                                    .padding(.horizontal, 5).frame(minWidth: 18, minHeight: 18)
                                    .background(Color.red, in: Capsule()).offset(x: 12, y: -8)
                            }
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background {
                            if on {
                                Capsule().fill(scheme == .dark ? Color.white.opacity(0.12) : Color.black.opacity(0.07))
                                    .padding(4).matchedGeometryEffect(id: "pill", in: pill)
                            }
                        }
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(it.label)
                .accessibilityValue(it.badge > 0 ? (it.badgeSpoken?(it.badge) ?? "\(it.badge)") : "")   // 배지도 읽어 줌(리뷰)
                .accessibilityAddTraits(on ? .isSelected : [])
                .accessibilityIdentifier("tab.\(String(describing: it.id))")
            }
        }
        .frame(height: Self.height)
        .background {
            if solid { Capsule().fill(Color(.secondarySystemBackground)) }
        }
        .glassEffect(.regular.interactive(), in: Capsule())
        .padding(.horizontal, Self.margin)
        .padding(.bottom, Self.bottom)
        // 내리면 막대가 아래로 미끄러져 숨음(+ 와 같은 때 · 같은 움직임)
        .offset(y: state.hidden ? Self.reserved + 40 : 0)
        .opacity(state.hidden ? 0 : 1)
        .animation(.easeInOut(duration: 0.25), value: state.hidden)
        .ignoresSafeArea(.container, edges: .bottom)
        .ignoresSafeArea(.keyboard)   // 키보드가 떠도 화면 아래에 머묾(키보드 뒤로 가려짐)
    }
}

public extension View {
    /// 탭마다 내용에 — 시스템 막대는 숨기고, 아래 내용이 DGitTabBar 에 가리지 않게 자리를 남김(굴린 내용은 막대 밑으로 지나감)
    func reservesDGitTabBar() -> some View { modifier(ReservesTabBar()) }
}

/// 남길 자리 = 막대(높이 + 아래 끝 간격) + 8 − 이미 있는 아래 안전 영역(홈 표시 줄). 홈 표시 줄이 없는 화면도 가리지 않게 실제 값을 잼(리뷰)
private struct ReservesTabBar: ViewModifier {
    @State private var safeBottom: CGFloat = 34
    func body(content: Content) -> some View {
        content
            .toolbarVisibility(.hidden, for: .tabBar)
            .safeAreaPadding(.bottom, max(8, DGitTabBar<Int>.reserved + 8 - safeBottom))
            // 홈 표시 줄만 잼 — 키보드 높이는 빼야 키보드가 떠도 남길 자리가 줄지 않음(리뷰)
            .background { Color.clear.onGeometryChange(for: CGFloat.self, of: { $0.safeAreaInsets.bottom }) { safeBottom = $0 }.ignoresSafeArea(.keyboard) }   // 재는 쪽까지 키보드 제외 안에(리뷰)
    }
}
