import Testing
@testable import DGitTabs

/// 굴림 → 막대 숨김 판정(보더 · 콜스 같은 규칙)
@MainActor @Suite struct TabBarStateRules {
    @Test func hidesOnScrollDownShowsOnUp() {
        let s = TabBarState()
        s.scrolled(from: 100, to: 110); #expect(s.hidden, "6pt 넘게 내리면 숨김")
        s.scrolled(from: 110, to: 109); #expect(!s.hidden, "조금이라도 올리면 보임")
    }
    @Test func jitterDoesNotHide() {
        let s = TabBarState()
        s.scrolled(from: 100, to: 104); #expect(!s.hidden, "손가락 떨림(4pt)은 그대로")
    }
    @Test func nearTopAlwaysShows() {
        let s = TabBarState()
        s.scrolled(from: 100, to: 200); #expect(s.hidden)
        s.scrolled(from: 200, to: 40); #expect(!s.hidden, "맨 위 60pt 안이면 보임")
        s.scrolled(from: 40, to: 55); #expect(!s.hidden, "맨 위 근처에선 내려도 보임")
    }
    @Test func pushedHides() {
        let s = TabBarState()
        s.pushed = 1; #expect(s.hidden)
        s.pushed = 0; #expect(!s.hidden)
        s.scrolled(from: 100, to: 120); s.reset(); #expect(!s.hidden, "탭 바꾸면 보임")
    }
}
