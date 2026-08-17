# Example policies

## Minimal

    rules:
      - match: "(生成|画).{0,12}(图|海报|banner)"
        pour: [media-tools]

## URL-first ordering (high precision before broad rules)

    rules:
      - match: "feishu\\.cn/(docx|wiki|drive|sheets|base|slides)/"
        pour: [lark-doc]
      - match: "(发|写|查).{0,6}(邮件|email)"
        pour: [lark-mail]

## False-positive guard

    rules:
      - match: "((今天|本周).{0,6}(安排|日程|待办))"
        pour: [lark-workflow-standup-report]
      - match: "(安排|订).{0,4}(会议|会)"
        pour: [lark-calendar]
