import SwiftUI
import UIKit

/// 보더 · 콜스가 같이 쓰는 아래 탭 막대 규칙(Bobby 11/10 「보더 탭 정본 컴포넌트를 콜스도 같이 쓰게 — 따로 베끼지 말고」).
/// 막대 자체는 시스템 TabView 막대(두 앱 높이 · 너비 · 모양이 같음). 이 패키지는 그 위의 움직임만 정함:
/// - 내리면 막대와 + 가 함께 부드럽게 숨고, 올리거나 맨 위 가까이면 함께 나옴(Threads 처럼).
/// - 화면을 밀어 연 동안(스레드 · 설정 상세)은 막대를 숨김.
@MainActor @Observable
public final class TabBarState {
    /// 내려서 숨긴 상태
    public private(set) var lowered = false
    /// 밀어 연 화면 수(그동안 막대 숨김)
    public var pushed = 0
    public init() {}

    /// 막대 · + 가 지금 숨었는지
    public var hidden: Bool { lowered || pushed > 0 }

    /// 스크롤 위치(위에서부터 잰 내용 위치)가 old → new 로 바뀜. 맨 위 60pt 안이면 늘 보임.
    /// 같은 방향으로 쌓인 거리가 12pt 를 넘어야 바뀜(천천히 내려도 결국 숨고, 숨긴 뒤 손 떨림 1~11pt 로는 안 나옴). 방향이 바뀌면 다시 셈.
    public func scrolled(from old: CGFloat, to new: CGFloat) {
        if new < Self.topZone { run = 0; set(false); return }
        let d = new - old
        guard d != 0 else { return }
        if (d > 0) != (run > 0) { run = 0 }   // 방향이 바뀜
        run += d
        if run > Self.step { set(true); run = 0 }
        else if run < -Self.step { set(false); run = 0 }
    }
    /// 탭을 바꾸면 새 탭은 막대가 보이는 채로 시작
    public func reset() { run = 0; set(false) }

    public static let topZone: CGFloat = 60
    public static let step: CGFloat = 12
    private var run: CGFloat = 0

    private func set(_ v: Bool) { if lowered != v { withAnimation(.easeInOut(duration: 0.25)) { lowered = v } } }
}

public extension View {
    /// 그 탭의 스크롤 화면에 — 굴림을 막대 상태로
    func lowersTabBarOnScroll(_ state: TabBarState) -> some View {
        onScrollGeometryChange(for: CGFloat.self, of: { $0.contentOffset.y + $0.contentInsets.top }) { old, new in state.scrolled(from: old, to: new) }
    }
    /// 탭마다 내용 맨 바깥에 — 시스템 탭 막대가 상태를 따라 숨고 나옴
    func tabBarFollows(_ state: TabBarState) -> some View {
        toolbar(state.hidden ? .hidden : .visible, for: .tabBar)
            .animation(.easeInOut(duration: 0.25), value: state.hidden)
    }
    /// 밀어 연 화면에 — 열린 동안 막대를 숨김
    func pushedOverTabBar(_ state: TabBarState) -> some View {
        toolbar(.hidden, for: .tabBar)
            .onAppear { state.pushed += 1 }
            .onDisappear { state.pushed = max(0, state.pushed - 1) }
    }
}

/// 막대 오른쪽 위의 둥근 + (보더 새 글 · 콜스 새 통화 등) — 막대와 함께 숨고 나옴.
/// TabView 에 `.overlay(alignment: .bottomTrailing)` 로 얹음.
public struct FloatingTabAction<Icon: View>: View {
    var state: TabBarState
    var label: String
    var id: String
    var action: () -> Void
    @ViewBuilder var icon: () -> Icon
    @Environment(\.colorScheme) private var scheme

    public init(state: TabBarState, label: String, id: String, action: @escaping () -> Void, @ViewBuilder icon: @escaping () -> Icon) {
        self.state = state; self.label = label; self.id = id; self.action = action; self.icon = icon
    }

    /// 막대 위 자리: 오른쪽은 막대 끝과 맞춤, 아래는 막대 위 12
    public static var trailing: CGFloat { DGitTabBar<Int>.margin + 6 }
    public static var bottom: CGFloat { DGitTabBar<Int>.reserved + 12 }

    public var body: some View {
        Group {
            if !state.hidden {
                Button(action: action) {
                    icon().frame(width: 60, height: 60).contentShape(Circle())
                }
                .buttonStyle(.plain)
                .glassEffect(.regular.tint(scheme == .dark ? Color.white.opacity(0.10) : nil).interactive(), in: Circle())
                .accessibilityLabel(label).accessibilityIdentifier(id)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .padding(.trailing, Self.trailing).padding(.bottom, Self.bottom)
        .ignoresSafeArea(.container, edges: .bottom)
        .animation(.easeInOut(duration: 0.25), value: state.hidden)
    }
}

/// 오른쪽 끝 「나」 탭 아이콘 = 사용자 얼굴(Bobby 11/10 「설정 아이콘이 아니라 보더처럼 사용자 얼굴」).
/// 앱이 그린 얼굴 화면을 탭 막대가 쓸 수 있는 그림으로 바꿈(시스템 막대는 그림 · 기호만 받음). 고른 탭이면 테두리.
@MainActor
public enum FaceTabIcon {
    public static let size: CGFloat = 28
    public static func image<Face: View>(_ face: Face, selected: Bool) -> Image {
        let v = face.frame(width: size, height: size)
            .clipShape(Circle())
            .overlay(Circle().stroke(selected ? Color.primary : Color.clear, lineWidth: 2))
            .frame(width: size + 4, height: size + 4)
        let r = ImageRenderer(content: v); r.scale = UITraitCollection.current.displayScale
        guard let ui = r.uiImage else { return Image(systemName: "person.crop.circle") }
        return Image(uiImage: ui.withRenderingMode(.alwaysOriginal))
    }
}
