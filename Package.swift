// swift-tools-version: 6.0
// DGIT UI 의 iOS 부품(웹 부품은 registry/ — 이 파일은 Swift 패키지 관리자만 읽음).
// 보더 · 콜스가 같은 판을 가져다 씀: .package(url: "https://github.com/dgitco/ui", ...) → product "DGitTabs".
import PackageDescription

let package = Package(
    name: "DGitUI",
    platforms: [.iOS("26.0")],
    products: [.library(name: "DGitTabs", targets: ["DGitTabs"])],
    targets: [
        .target(name: "DGitTabs", path: "ios/Sources/DGitTabs"),
        .testTarget(name: "DGitTabsTests", dependencies: ["DGitTabs"], path: "ios/Tests/DGitTabsTests"),
    ]
)
