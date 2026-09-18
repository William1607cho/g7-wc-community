#!/usr/bin/env python3
"""Font Awesome 서브셋 생성기 — 쓰이는 아이콘만 남긴 단일 CSS 를 만든다.

기존 `scripts/vendor-inline-css.mjs` 는 Font Awesome 6 의 세 페이스(Free 400·Free 900·
Brands 400)를 통째로 base64 인라인해 `all.inlined.css` 가 479KB(gzip 311KB)가 되었다.
이 파일은 렌더 차단 CSS 라 첫 화면 표시를 그만큼 늦춘다. 그런데 이 템플릿이 실제로 쓰는
아이콘은 `scripts/fa-icons.json` 의 목록뿐이고, 그 전부가 Solid 페이스에 있다 — Brands
글리프를 쓰는 화면은 0 이고(Footer 소셜 아이콘은 Free 에 글리프 자체가 없어 원래부터
빈 칸이다), Regular 전용 화면도 0 이다.

그래서 이 생성기는
  1. `fa-solid-900.woff2` 를 목록의 코드포인트만 남겨 서브셋하고,
  2. `Font Awesome 6 Free` 900 `@font-face` **하나만** 남겨 그 서브셋을 인라인하고,
  3. 아이콘 `:before{content}` 규칙도 목록에 있는 이름만 남긴다.
수식어·유틸리티 규칙(`fa-spin` · `fa-2x` · `fa-fw` · `fa-ul` 등)은 크기가 작고 레이아웃
JSON 이 자유롭게 쓰므로 **전부 유지한다**.

인라인을 유지하는 이유는 원 생성기 주석과 같다: 자산 URL 이 `?file=` 쿼리가 되는 구성에서
CSS 안의 상대 `url()` 이 풀리지 않아 아이콘이 통째로 사라진다. 아이콘만 있는 버튼이 많은
화면에서 그것은 곧 조작 불능이다. 인라인이면 그 조합에서도 뜬다.

의도된 차이:
  - `.fa-regular` / `.far` 는 Regular 페이스가 없어 Solid 모양으로 보인다.
    (저장소 전수 조사에서 방문자 화면의 Regular 사용처는 레이아웃 편집기의 빈 상태 표시
     한 곳뿐이고, 그 컴포넌트는 어느 레이아웃에서도 쓰이지 않는다.)
  - `.fa-brands` / `.fab` 규칙과 구버전 호환 패밀리(`Font Awesome 5 …` · `FontAwesome`)는
    제거된다. 호환 패밀리는 원래 파일 참조였으므로 `webfonts/` 동봉도 함께 불필요해진다.

사용:
    python3 scripts/fa-subset.py \
        node_modules/@fortawesome/fontawesome-free/css/all.min.css \
        node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2 \
        scripts/fa-icons.json \
        dist/vendor/font-awesome/6.4.0/css/all.inlined.css \
        [--woff2-out <서브셋 woff2 를 따로 저장할 경로>]

fontTools · brotli 가 필요하다(호스트에 설치하지 않는다 — README 의 컨테이너 실행 참고).
재생성이 재현 가능해야 하므로 입출력 경로·크기·sha256·글리프 수를 로그로 남긴다.
"""

from __future__ import annotations

import base64
import hashlib
import io
import json
import os
import re
import sys

# 인라인해 남길 단 하나의 페이스
KEEP_FAMILY = "Font Awesome 6 Free"
KEEP_WEIGHT = "900"

# 제거 대상 패밀리 — 남으면 참조할 폰트가 없어 빈 칸이 된다
DROP_FAMILIES = (
    "Font Awesome 6 Brands",
    "Font Awesome 5 Brands",
    "Font Awesome 5 Free",
    "FontAwesome",
)

# 제거 대상 커스텀 속성 (Brands 페이스 / Regular 페이스를 가리킨다)
DROP_CUSTOM_PROPS = ("--fa-style-family-brands", "--fa-font-brands", "--fa-font-regular")

# 패밀리 이름이 선언에 없어 문자열로는 못 잡는 규칙. 원본에 정확히 1번씩 있어야 한다.
DROP_EXACT_RULES = {
    ".fa-brands,.fab": "font-weight:400",
    ".fa-regular,.far": "font-weight:400",
}

# 남은 규칙의 셀렉터 목록에서 지울 셀렉터 (Brands 페이스 전용)
DROP_SELECTORS = {".fa-brands", ".fab"}

ICON_RULE_RE = re.compile(r'^content:"\\([0-9a-fA-F]+)"$')


def sha256_of(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fail(message: str) -> None:
    print(f"[fa-subset] 중단: {message}", file=sys.stderr)
    sys.exit(1)


def assert_vendor_version(input_path: str, output_path: str) -> str:
    """출력 경로의 버전 디렉토리와 입력 패키지의 실제 버전을 대조한다.

    출력 경로 `.../font-awesome/6.4.0/…` 는 "여기 든 것은 6.4.0 이다"라는 배포 선언이다.
    입력은 `node_modules` 라 오래된 트리가 남을 수 있고, 그대로 쓰면 다른 버전을 `6.4.0/`
    에 써 넣는 조용한 거짓말이 된다. 검증할 수 없으면 쓰지 않는다. (원 생성기와 같은 규칙)
    """
    declared = None
    for segment in os.path.abspath(output_path).split(os.sep):
        if re.fullmatch(r"\d+\.\d+\.\d+", segment):
            declared = segment
    if declared is None:
        fail(f"출력 경로에 버전 디렉토리가 없습니다: {output_path}")

    directory = os.path.dirname(os.path.abspath(input_path))
    manifest = None
    for _ in range(8):
        candidate = os.path.join(directory, "package.json")
        if os.path.exists(candidate):
            with open(candidate, encoding="utf-8") as handle:
                manifest = json.load(handle)
            break
        parent = os.path.dirname(directory)
        if parent == directory:
            break
        directory = parent

    if not manifest or not manifest.get("version"):
        fail(f"입력 패키지의 package.json 을 찾지 못해 버전을 검증할 수 없습니다: {input_path}")
    if manifest["version"] != declared:
        fail(
            f"버전 불일치: 설치본 {manifest['version']} ≠ 동봉 선언 {declared}\n"
            f"  입력: {input_path}\n  출력: {output_path}\n"
            "`npm ci` 로 lock 에 선언된 버전을 설치한 뒤 다시 실행하세요."
        )

    print(f"[fa-subset] 버전 확인: {manifest.get('name', '(이름 없음)')} {manifest['version']} → {declared}")
    return declared


def split_top_level(css: str) -> list[str]:
    """CSS 한 줄을 최상위 규칙 단위로 자른다 (`@media` 중첩은 중괄호 수로 처리)."""
    nodes: list[str] = []
    depth = 0
    start = 0
    for index, char in enumerate(css):
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                nodes.append(css[start : index + 1])
                start = index + 1
            elif depth < 0:
                fail("CSS 중괄호 짝이 맞지 않습니다. 입력 파일을 확인하세요.")
    tail = css[start:].strip()
    if tail:
        fail(f"규칙 밖에 남은 내용이 있습니다: {tail[:80]}")
    return nodes


def parse_font_face(block: str) -> dict[str, str]:
    body = block[block.index("{") + 1 : -1]
    declarations: dict[str, str] = {}
    for declaration in split_declarations(body):
        name, _, value = declaration.partition(":")
        declarations[name.strip()] = value.strip()
    return declarations


def split_declarations(body: str) -> list[str]:
    """선언을 `;` 로 자른다. 괄호 안(`url(...)` · `format(...)`)의 `;` 는 무시한다."""
    parts: list[str] = []
    depth = 0
    current: list[str] = []
    for char in body:
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        if char == ";" and depth == 0:
            if "".join(current).strip():
                parts.append("".join(current).strip())
            current = []
            continue
        current.append(char)
    if "".join(current).strip():
        parts.append("".join(current).strip())
    return parts


class Stats:
    def __init__(self) -> None:
        self.font_faces_kept = 0
        self.font_faces_dropped = 0
        self.icon_rules_kept = 0
        self.icon_rules_dropped = 0
        self.icon_selectors_kept = 0
        self.icon_selectors_dropped = 0
        self.other_rules_kept = 0
        self.other_rules_dropped = 0
        self.exact_rules_seen: dict[str, int] = {key: 0 for key in DROP_EXACT_RULES}
        self.names_seen: set[str] = set()


def transform_node(node: str, wanted: dict[str, str], inline_src: str, stats: Stats) -> str | None:
    """규칙 하나를 변환한다. 버릴 규칙이면 None 을 돌려준다."""
    brace = node.index("{")
    selector = node[:brace].strip()
    body = node[brace + 1 : -1]

    # @media 등 중첩 블록: 수식어 규칙이므로 그대로 둔다
    if selector.startswith("@media") or selector.startswith("@supports"):
        stats.other_rules_kept += 1
        return node

    if selector == "@font-face":
        declarations = parse_font_face(node)
        family = declarations.get("font-family", "").strip('"')
        weight = declarations.get("font-weight", "")
        if family != KEEP_FAMILY or weight != KEEP_WEIGHT:
            stats.font_faces_dropped += 1
            return None
        stats.font_faces_kept += 1
        kept = []
        for declaration in split_declarations(body):
            name, _, _value = declaration.partition(":")
            if name.strip() == "src":
                kept.append(f"src:{inline_src}")
            else:
                kept.append(declaration)
        return "@font-face{" + ";".join(kept) + "}"

    declarations = split_declarations(body)

    # 아이콘 규칙: content 하나뿐인 규칙
    if len(declarations) == 1 and ICON_RULE_RE.match(declarations[0]):
        codepoint = ICON_RULE_RE.match(declarations[0]).group(1).lower()
        kept_selectors = []
        for one in selector.split(","):
            one = one.strip()
            name = one[len(".fa-") :].removesuffix("::before").removesuffix(":before")
            if not one.startswith(".fa-"):
                fail(f"예상하지 못한 아이콘 셀렉터 형태입니다: {one}")
            if name in wanted:
                if wanted[name] != codepoint:
                    fail(
                        f"코드포인트 불일치: {name} 목록 U+{wanted[name].upper()} ≠ CSS U+{codepoint.upper()}"
                    )
                stats.names_seen.add(name)
                kept_selectors.append(one)
                stats.icon_selectors_kept += 1
            else:
                stats.icon_selectors_dropped += 1
        if not kept_selectors:
            stats.icon_rules_dropped += 1
            return None
        stats.icon_rules_kept += 1
        return ",".join(kept_selectors) + "{" + body + "}"

    # 제거 대상 패밀리를 가리키는 규칙
    if any(f'"{family}"' in body for family in DROP_FAMILIES):
        stats.other_rules_dropped += 1
        return None

    # 패밀리 이름이 없어 문자열로는 못 잡는 규칙 (원본에 정확히 1번씩 있어야 한다)
    normalized = selector.replace(" ", "")
    if normalized in DROP_EXACT_RULES and body.strip() == DROP_EXACT_RULES[normalized]:
        stats.exact_rules_seen[normalized] += 1
        stats.other_rules_dropped += 1
        return None

    # 커스텀 속성 블록: Brands·Regular 를 가리키는 선언만 뺀다
    kept_declarations = [
        declaration
        for declaration in declarations
        if not any(declaration.startswith(prop + ":") for prop in DROP_CUSTOM_PROPS)
    ]
    if not kept_declarations:
        stats.other_rules_dropped += 1
        return None

    # 남은 규칙의 셀렉터에서 Brands 전용 셀렉터를 뺀다
    kept_selectors = [one.strip() for one in selector.split(",") if one.strip() not in DROP_SELECTORS]
    if not kept_selectors:
        stats.other_rules_dropped += 1
        return None

    stats.other_rules_kept += 1
    return ",".join(kept_selectors) + "{" + ";".join(kept_declarations) + "}"


def subset_font(woff2_path: str, codepoints: set[int]) -> tuple[bytes, int]:
    """Solid woff2 를 주어진 코드포인트만 남겨 서브셋하고, cmap 을 대조한다."""
    try:
        from fontTools import subset
        from fontTools.ttLib import TTFont
    except ImportError:
        fail("fontTools 를 찾을 수 없습니다. README 의 컨테이너 실행 절차를 따르세요.")

    font = TTFont(woff2_path)
    original_glyphs = len(font.getGlyphOrder())
    original_cmap = set(font.getBestCmap())
    missing = sorted(codepoints - original_cmap)
    if missing:
        fail(
            "원본 Solid 폰트에 없는 코드포인트가 목록에 있습니다: "
            + ", ".join(f"U+{value:04X}" for value in missing)
        )

    options = subset.Options()
    options.flavor = "woff2"
    options.desubroutinize = False
    options.layout_features = []          # 아이콘 폰트라 GSUB/GPOS 기능이 필요 없다
    options.name_IDs = ["*"]              # 라이선스·저작권 name 레코드를 남긴다 (SIL OFL)
    options.name_legacy = True
    options.notdef_outline = True
    options.recalc_bounds = True
    options.drop_tables += ["FFTM"]

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)

    result_cmap = set(font.getBestCmap())
    if result_cmap != codepoints:
        extra = sorted(result_cmap - codepoints)
        lost = sorted(codepoints - result_cmap)
        fail(
            "서브셋 폰트의 cmap 이 목록과 다릅니다. "
            f"추가 {len(extra)}개, 누락 {len(lost)}개 "
            f"(추가 예: {[f'U+{v:04X}' for v in extra[:5]]}, 누락 예: {[f'U+{v:04X}' for v in lost[:5]]})"
        )

    buffer = io.BytesIO()
    font.flavor = "woff2"
    font.save(buffer)
    font.close()
    print(
        f"[fa-subset] 서브셋: 글리프 {original_glyphs} → {len(result_cmap) + 1}"
        f" (cmap {len(original_cmap)} → {len(result_cmap)}, 목록과 일치)"
    )
    return buffer.getvalue(), original_glyphs


def main() -> None:
    argv = sys.argv[1:]
    woff2_out = None
    if "--woff2-out" in argv:
        index = argv.index("--woff2-out")
        woff2_out = argv[index + 1]
        argv = argv[:index] + argv[index + 2 :]

    if len(argv) != 4:
        print(__doc__)
        sys.exit(1)

    input_css, input_woff2, icons_json, output_css = argv

    assert_vendor_version(input_css, output_css)

    with open(icons_json, encoding="utf-8") as handle:
        manifest = json.load(handle)
    icons = manifest["icons"]
    wanted = {name: entry["codepoint"].lower() for name, entry in icons.items()}
    codepoints = {int(value, 16) for value in wanted.values()}
    print(f"[fa-subset] 목록: {icons_json} — 이름 {len(wanted)}개 / 고유 코드포인트 {len(codepoints)}개")

    subset_bytes, original_glyphs = subset_font(input_woff2, codepoints)
    inline_src = (
        'url(data:font/woff2;base64,'
        + base64.b64encode(subset_bytes).decode("ascii")
        + ') format("woff2")'
    )

    with open(input_css, encoding="utf-8") as handle:
        source = handle.read()

    header_match = re.match(r"/\*!.*?\*/", source, re.S)
    if not header_match:
        fail("입력 CSS 의 라이선스 머리말을 찾지 못했습니다.")
    header = header_match.group(0)
    rest = source[header_match.end() :]

    stats = Stats()
    output_lines: list[str] = []
    for line in rest.split("\n"):
        if not line.strip():
            continue
        kept = [
            transformed
            for transformed in (
                transform_node(node, wanted, inline_src, stats) for node in split_top_level(line)
            )
            if transformed is not None
        ]
        if kept:
            output_lines.append("".join(kept))

    for selector, count in stats.exact_rules_seen.items():
        if count != 1:
            fail(
                f"제거 대상 규칙 `{selector}{{{DROP_EXACT_RULES[selector]}}}` 을 {count}번 찾았습니다(1번이어야 함). "
                "Font Awesome 쪽 구조가 바뀐 것이므로 생성기를 갱신해야 합니다."
            )

    unseen = sorted(set(wanted) - stats.names_seen)
    if unseen:
        fail("CSS 에서 찾지 못한 아이콘 이름이 있습니다: " + ", ".join(unseen))
    if stats.font_faces_kept != 1:
        fail(f"남은 @font-face 가 {stats.font_faces_kept}개입니다(1개여야 함).")

    subset_header = (
        "/*!\n"
        " * Subset of Font Awesome Free 6.4.0 — Solid face only, "
        f"{len(wanted)} icon names / {len(codepoints)} glyphs.\n"
        " * Generated by scripts/fa-subset.py from scripts/fa-icons.json. Do not edit by hand.\n"
        " * Regular and Brands faces and the Font Awesome 5 / v4 compatibility families are removed;\n"
        " * .fa-regular / .far therefore render with the Solid face.\n"
        " */\n"
    )
    output = subset_header + header + "\n" + "\n".join(output_lines) + "\n"

    for family in DROP_FAMILIES:
        if family in output:
            fail(f"제거했어야 할 패밀리가 출력에 남아 있습니다: {family}")
    if "../webfonts/" in output:
        fail("출력에 파일 참조(`../webfonts/`)가 남아 있습니다. 동봉 폰트 파일이 필요해집니다.")
    if output.count("@font-face") != 1:
        fail("출력의 @font-face 가 1개가 아닙니다.")

    os.makedirs(os.path.dirname(os.path.abspath(output_css)), exist_ok=True)
    with open(output_css, "w", encoding="utf-8") as handle:
        handle.write(output)

    if woff2_out:
        os.makedirs(os.path.dirname(os.path.abspath(woff2_out)), exist_ok=True)
        with open(woff2_out, "wb") as handle:
            handle.write(subset_bytes)
        print(f"[fa-subset] 서브셋 woff2 사본: {woff2_out} ({len(subset_bytes)} bytes)")

    input_css_bytes = os.path.getsize(input_css)
    input_woff2_bytes = os.path.getsize(input_woff2)
    output_bytes = os.path.getsize(output_css)
    with open(input_css, "rb") as handle:
        input_css_sha = sha256_of(handle.read())
    with open(input_woff2, "rb") as handle:
        input_woff2_sha = sha256_of(handle.read())
    with open(output_css, "rb") as handle:
        output_sha = sha256_of(handle.read())

    print(f"[fa-subset] 입력 CSS  : {input_css} ({input_css_bytes} bytes, sha256:{input_css_sha})")
    print(f"[fa-subset] 입력 폰트 : {input_woff2} ({input_woff2_bytes} bytes, sha256:{input_woff2_sha}, 글리프 {original_glyphs})")
    print(f"[fa-subset] 서브셋 폰트: {len(subset_bytes)} bytes (sha256:{sha256_of(subset_bytes)})")
    print(
        f"[fa-subset] 규칙: @font-face 유지 {stats.font_faces_kept} / 제거 {stats.font_faces_dropped}, "
        f"아이콘 규칙 유지 {stats.icon_rules_kept} / 제거 {stats.icon_rules_dropped} "
        f"(셀렉터 유지 {stats.icon_selectors_kept} / 제거 {stats.icon_selectors_dropped}), "
        f"그 밖의 규칙 유지 {stats.other_rules_kept} / 제거 {stats.other_rules_dropped}"
    )
    print(f"[fa-subset] 출력 CSS  : {output_css} ({output_bytes} bytes, sha256:{output_sha})")


if __name__ == "__main__":
    main()
