# Ponte website — Figma spec (Dev Handoff page, file jZUWslPXz0eClx2yj7Tp8y)

Desktop frames 1600 wide. Canvas padding 40. Section node ids on page 9710:25869.

## Tokens
- Colours: black #000000, ink #100F0F, near-black #0A0A0A, card-dark #0C0C0C (stroke #1F1F1F), lime #E8EE81 (alt #E7ED81), lime-dim #DCE277, lime-pale #FDFFDF, mint #D8FDF1, forest #173B2F, deep-teal #194E49, moss #2A4E42, grey #8C8C8C, grey-dim #6B6B6B, grey-dark #3A3A3A, olive-text #3A3D1E, cream #F1EEE5, glass stroke #606060
- Fonts: Clash Grotesk Regular (H1 72/0.96 ls-2; H2 56/1.0 ls-2.5; H3 40/1.15 ls-1; card title 32/1.1 ls-1; tab title 24/1.25 ls-0.5); At Aero Retina 20/1.35 (body L), At Aero Light 16/1.21 (body S); Geist Mono Medium 16/1.0 (buttons, nav, tags uppercase), Geist Mono Regular 14/1.2 (feature titles), 12/1.2 ls2 (chips/labels); Ponte Dot Regular (display numerals 88 ls-3, 66, 51, 41)
- Button pill: lime bg, r999, pad 0/2/0/24, gap16, label Geist Mono 16 uppercase ink; 47px ink circle with lime chevron icon on right. Inverse variant: ink bg, lime label, lime circle.
- Tag: forest #173B2F bg r2, 40 high, mint Geist Mono 16 uppercase label, pad ~17h/12v
- Lime square marker 10x10 r1 (nav active, timeline)
- Glass card: radial gradient #FDFFDA→#EEF3A6, r15, 0.3 white stroke gradient, glass effect; content rendered as image

## 01 Hero (9710:27227) 1600x900 (content 2152 tall, pinned)
- bg: grid image (9710:27230) 1717x1020 at (-59,85); blurred ellipses forest/teal; rays image (9710:27233) 1158x1701 at (456,-34); sky image (9710:27234) 1598x2841 at (0,-1550) 30% black overlay; video frame placeholder; black radial fade r1000 blur 230 at (251,-74) 1092x1144
- Nav: logo 115x28 at (31,31) white; links centred Geist Mono 16 uppercase gap24: P2P (lime, active, marker 10x10 at x636,y39) OTC WhatsApp About FAQ (mint); Launch App pill at (1395,20) 185x51
- H1 "Money moves. / Confidence stays." Clash 72 centre at y200 w954, "moves." "stays." in lime; body 20 centre w490 at y369: "Trade P2P with verified people. Execute larger trades via OTC. Buy and sell crypto in WhatsApp."
- Store buttons at y474: App Store (610) and Google Play (805) 185x51 pale-lime #FDFFDF pill, ink label Geist Mono 16 uppercase + icon
- Mockup: device frame image (9710:27281) 805x749 at (398,634) + OTC desktop screen image (9710:27285) 740x513 at (431,644) r16
- Bottom fade gradient #0A0A0A 0→1 at y1667 h485

## 02 Track record (9710:27501, about2 26231, about3 26326, about4 26467) 1600x841
- Left card (40,40) 755x755 mint #D8FDF1 r3: tag "about us" (67,67); escrow loops line illustration (402,67) 451x255 stroke forest; marker 10x10 at (388,320); H2 "Not just an idea. / Already in motion." Clash 56 black at (79,538) w623; body 20 black at (79,673) w520: "We have been building crypto-access products since 2022, growing from peer-to-peer verification into a broader platform for trading and moving digital assets."
- Right card (805,40) 755x755 lime r3: top-left label Geist Mono 16 moss (844,79); top-right label (right-aligned to 1521,79); 3D object image centred ~ (960,215) 424x411; bottom-left marker + caption (860,739); bottom-right Ponte Dot 88 #333333 right-aligned to x1527,y674
- Slides: 1 "Origin story" / "P2P → Platform" / "Where our journey began." / "2022"; 2 "Volume" / "Since 2022" / "Total transaction volume." / "$2.3M+"; 3 "Compliance" / "Crypto ↔ Fiat" / "Crypto–fiat operations." / "LICENSED"; 4 "Access" / "iOS · Android · Web · WhatsApp" / "Four ways to access the platform." / "04"
- 3D images: node 27517 (cube), 26247 (bars), 26342 (S-block), 26483 (X)

## 03 P2P (9710:28270) 1600x900
- Lime panel (533,0) 1174x950 r3 with "Pattern tile — lines" overlay (555,0) 1065x950; phone-in-hand image (28273) 870x870 at (688,80) + Orders screen perspective (28275) 883x883 at (681,75)
- Left text on black: tag "PEER-TO-PEER TRADING" (40,40) 226x40; H3 "The right people. / A better way to trade." Clash 40 white (40,140) w623; body 20 grey #8C8C8C (40,262) w425: "Buy and sell crypto directly with verified users through an escrow-protected marketplace. Find an offer, agree on terms, and follow a clear process from payment to completion."; button "OPEN P2P" (38,418) 166x51
- Features (x40, y593/693/795, each 376x65): glyph 62x62 lime icon + title Geist Mono 14 lime (gradient fade) + body At Aero Light 16 grey w312: "Know who you're trading with" / "Counterparty verification makes for a more accountable marketplace"; "Protection while you trade" / "Escrow holds the crypto until the agreed conditions are met"; "Clarity from start to finish" / "Follow your trade through each stage, from offer to settlement"
- Glass fee cards (images): takers (652,162) 270x290; makers (1189,452) 221x238. Fees: Makers 0.3%, Takers 0%

## 04 OTC (9710:28373) 1600x900
- Lime panel on LEFT (-107,-31) 1174x950 with pattern; composite phone-hand image (28378) 1057x869 at (51,59); OTC mobile screen frame (28380) 311x696 at (367,105) r41
- Glass cards: Quote card (86,197) 332x279: "OTC · Quote" label; status pill "Sized for large trades" (#2E2E2E, lime dot); "You buy" / "250 USDT" Space Grotesk 40; "1 USDT = 1,612.40 NGN"; counterparty row cream #F1EEE5 r6: avatar, "Quote held for 15:00" / "Rate, amount and total fixed". Terms card (624,510) 273x230: "OTC · Terms"; "Stated before you confirm"; "You pay" / "403.1M NGN"; "Rate and fee included"; row "250,000 USDT to receive" / "Straight to your wallet"
- Right text on black (x1114): tag "OTC TRADING" 140x40 (1114,40); H3 "Trade beyond the marketplace." (1114,140) w461; body (1114,262) w415: "A direct route for larger trades. See the quote, confirm the terms, and complete the trade in one focused flow, without working through the P2P offer book."; button "Explore OTC" (1111,418) 195x51
- Features (x1114, y593/693/795): "A quote, not an order book" / "Review the amount, rate and total before you commit."; "Built for size" / "A route designed for trades that are too large for the marketplace."; "Terms upfront" / "What you pay and what you receive, stated before you confirm."

## 05 WhatsApp (9710:29239) 1600x900
- Full lime panel (23,22) 1553x854 r3. Left: tag "CRYPTO ON WHATSAPP" (50,49) 207x40; H3 "A message is all / it takes." black (63,141) w307; body 20 forest (63,263) w447: "Buy and sell crypto through a conversation you already know. Our WhatsApp AI assistant guides you from request to quote to completion."; inverse button "Start on WhatsApp" (60,390) 253x51 ink bg lime text, WhatsApp icon
- Centre: hand+phone image (29318) 736x758 at (534,119) + WhatsApp chat dark screen (29320) 501x757; glass card "UI / Fees — WhatsApp" (405,393) 251x198 (1% fee)
- Right timeline (1063,153): vertical line x1068 y164-364 lime, 3 lime squares 10x10 at y156/256/358; numerals Ponte Dot 51 ink "01" (1098,146) "02" (1098,244) "03" (1098,344); step text blocks at x1185 y153/253/355 w312 (titles Geist Mono 14, body At Aero Light 16) — content TBD from deeper dump (step 1 "Say what you need" / "Start with a simple message." from mobile)

## 06 Trust (9710:29003 + 26520/26750/26995 tab states) 1600x900
- bg black + video frame (rays) placeholder; H2 "Know what's happening. / At every step." Clash 56 (40,118) w543 (gradient/white); body 20 white (799,124) w559: "Every transaction deserves clarity. We build verification, transparent terms and the right safeguards for each product, so you can act on what you know, not what you hope."
- Tabs column (40,302) 537x480, 4 tabs 537x111 r3 gap12: inactive #0C0C0C stroke #1F1F1F, numeral Ponte Dot 41 #3A3A3A, label Geist Mono 12 ls2 #6B6B6B right-aligned at y+22, title Clash 24 #8C8C8C at (24,61), chevron circle 32 stroke #333; active lime bg, numeral ink, label #3A3D1E, title black, circle #DCE277 fill
  1 "Verified counterparties" / "Verification"; 2 "Escrow · Quote · Confirm" / "Safeguards built for each product"; 3 "Nothing after the fact" / "Clear terms"; 4 "Real people, fast replies" / "Support when you need it"
- Panel (799,302) 761x480 lime r3: numeral Ponte Dot 66 (818,314); "0N / 04" Geist Mono 12 (1135,327); title Clash 32 ink (824,602) w360; body At Aero Light 16 #3A3D1E (824,651) w360; strip pill #DCE277 r100 (824,713) 360x44 label Geist Mono 12 + ink circle lime chevron; illustration tile #DCE277 r3 (1203,311) 348x462 with line drawing (rings / spiral / lens / support) and 3 chips (ink bg r4, lime dot, label Geist Mono 12 cream) at y662/694/726
  1 "Verification" / "Checks designed to improve accountability across the platform." / "See how verification works" / chips Identity · Checked, Phone · Confirmed, Trades · 1,240 completed
  2 "Safeguards built for each product" / "Escrow protection in the P2P marketplace; clear quotes and confirmation steps across OTC and WhatsApp." / "See how escrow works" / P2P · Escrow, OTC · Quote, WhatsApp · Confirm
  3 "Clear terms" / "Rate, fee and what you receive, shown before you confirm." / "See an example quote" / Rate · 1 USDT = 1.00 USD, Fee · 2.00 USD, You receive · 200.00 USDT
  4 "Support when you need it" / "Reach our team if you have a question or something needs a second look." / "Contact support" / Trade #4821 · Need help?, Replies · Within minutes, Support · 7 days a week

## 05 WhatsApp steps (x1185, titles Geist Mono 14 black, body At Aero Light 16 forest, w312)
1 "Say what you need" / "Start with a simple message."  2 "See your quote" / "Review the amount, rate and fee before you go ahead."  3 "Follow the conversation" / "Complete each step with guidance along the way, and reach our team if you need a person."

## 07 Our story (9710:27585 / 25871 / 25986 / 26096) 1600x900 slider
- bg photo (hikers on ridge, 27586) 2116x1406 at (-116,-369); green #173B2F overlay (blend?); scrims: left 900 wide black 0.70→0, right mirrored, bottom y520 h380 0→0.85
- Top-left: "We started with trust. / We kept building." Geist Mono 16 mint (40,40)
- Big Ponte Dot 88 cream #F4F2EC: left word at (33,376): 2022 / P2P / OTC / RAMP; right counter at (1403,376): 1/4 … 4/4
- Milestone chips column (40,731) gap6: 2022, P2P, OTC, Ramp — active lime bg ink text r2/r4 pad6/10, inactive black@0.45 grey text
- Body At Aero 20 (799,719) w470: 1 "Our story began in 2022 with a simple belief: people should be able to trade crypto with greater confidence." 2 "We started with counterparty verification and protected peer-to-peer trades." 3 "As our users’ needs grew, we added OTC trading and crypto access through WhatsApp." 4 "Today it all comes together on one platform for accessing and moving digital assets."
- Progress line (804,855) w751 cream@0.25; segments lime fill up to active; 4 markers 10x10 at x799/1049/1300/1550 (#41403F inactive, lime done); active marker 14x14 lime outline + 4x4 dot

## 08 FAQ (9710:27716) 1600x1662
- H2 "Questions? / Let’s make things clear." (40,54) w664; right: body grey (1067,59) w440 "Can’t find your answer? Our team replies on WhatsApp, usually within minutes."; button "Ask support" (1066,149) 195x51
- Rows from y340, each: divider #2A2A2A full width 40..1560; square 10x10 (41,+31) lime when open else #3A3A3A; index Geist Mono 14 at x62 ("01 / answer" when open, cream; else "02" grey); question Clash 32 cream at x423 w760; "Hide"/"Show" Geist Mono 14 at right x1526; closed row h96; open row: answer At Aero 20 grey at (423,+86) w585 + tag chips (forest bg, mint label Geist Mono 16, pad12/18) at +238
- Questions: 01 What can I do on the platform? (answer: "Trade crypto with verified people in the P2P marketplace, execute larger trades through OTC, and buy or sell crypto through our WhatsApp assistant. Availability varies by product and country." chips: P2P marketplace · OTC desk · W/A assistant) 02 How does P2P trading work? 03 What is OTC trading? 04 Can I buy and sell crypto through WhatsApp? 05 What are the fees? 06 What happens if something goes wrong? 07 Where can I use the platform? 08 How do I get started?  — ANSWERS 02–08 NOT IN FIGMA (outstanding)
- Right tile when row 1 open: (1067,410) 493x494 forest r3, label "OTC DESK · VETME" Geist Mono 12 grey (1092,435), OTC mobile screen mock (1117,514) 393 wide r36 clipped

## 08b Final CTA (9710:28088) 1600x900 → shrinks to plate (28114/28203)
- Lime panel full (-111,-110) 1806x1020 r3 → pinned/shrinks to (40,-148) 1520x780 with margins revealing animated gradient video bg
- Routes graphic: 4 bezier routes stroke ink 1.5 from two origin squares (8x8 ink, lime stroke 2) to stations (14x14 lime, ink stroke) with labels Geist Mono 12 ls2 #3A3D1E: P2P MARKETPLACE (top-right), OTC DESK (bottom-right), WHATSAPP ASSISTANT (top-left), MORE ROUTES SOON (bottom-left, 35% opacity)
- Ponte mark 65x65 ink at (768,158); H2 "Your next move / starts here." Clash 56 ink centre (490,264) w620; body At Aero 20 #3A3D1E centre w428 at y400: "Trade peer-to-peer, request an OTC quote or buy crypto on WhatsApp. One account, the same clear rules."; inverse button "Launch App" (700,547) 185x51; caption "Web · iOS · Android" Geist Mono 16 #545454 (709,844)

## 09 Footer plate (40,522) 1520x571 #0C0C0C stroke white@0.06 r3
- Big logo wordmark 402x99 at (88,581) #272727 (cut-out); H2 "One bridge. / Every route." Clash 56 (798,585) w326 (gradient/white); button "Launch App" lime (1331,646)
- divider (88,746) w1424 #2A2A2A; columns at x88/325/563/800/1037/1209, heading Geist Mono 12 ls2 #6B6B6B at y786, links Geist Mono 16 cream #F4F2EC at y818/848/878 (gap30):
  PRODUCTS: P2P Trading, OTC Trading, WhatsApp Ramp · COMPANY: About, Contact, Support · RESOURCES: FAQs, Help Centre · LEGAL: terms, Policy, Risk Disclosure · CONNECT: X, Telegram (external arrow icons) · GET THE APP: App Store, Google Play
- divider (88,1034); "© 2026 Ponte. All rights reserved." Geist Mono 12 #6B6B6B (88,1057); lime square 8x8 + "Money moves. Confidence stays." Geist Mono 12 #8C8C8C right-aligned (1289,1057)

## Compact header (9742:273) after hero: black pill (578,0) 445x52 with angled ends (vector), inside: mark 20x20 white, links Geist Mono 13 mint gap22 (P2P active w/ marker, OTC, WhatsApp, About, FAQ), lime circle 36 chevron
