import CoreGraphics
import Testing
@testable import DGitTabs

/// 굴림 → 막대 숨김 판정(보더 · 콜스 같은 규칙)
@MainActor @Suite struct TabBarStateRules {
    @Test func hidesOnScrollDownShowsOnUp() {
        let s = TabBarState()
        s.scrolled(from: 100, to: 120); #expect(s.hidden, "12pt 넘게 내리면 숨김")
        s.scrolled(from: 120, to: 100); #expect(!s.hidden, "12pt 넘게 올리면 보임")
    }
    @Test func slowScrollDownStillHides() {
        let s = TabBarState()
        var y: CGFloat = 100
        for _ in 0..<5 { s.scrolled(from: y, to: y + 4); y += 4 }
        #expect(s.hidden, "4pt 씩 천천히 내려도 쌓이면 숨김(리뷰)")
    }
    @Test func jitterDoesNotToggle() {
        let s = TabBarState()
        s.scrolled(from: 100, to: 104); s.scrolled(from: 104, to: 101); s.scrolled(from: 101, to: 105)
        #expect(!s.hidden, "손 떨림은 그대로")
        s.scrolled(from: 105, to: 140); #expect(s.hidden)
        s.scrolled(from: 140, to: 139); s.scrolled(from: 139, to: 141); s.scrolled(from: 141, to: 135)
        #expect(s.hidden, "숨긴 뒤 작은 떨림(6pt)으로 안 나옴(리뷰)")
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
        s.scrolled(from: 100, to: 130); s.reset(); #expect(!s.hidden, "탭 바꾸면 보임")
    }
}
