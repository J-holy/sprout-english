/* 새싹영어 — 화면(View) 렌더러 */
const won = n => n.toLocaleString('ko-KR') + '원';
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const fmtDate = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const fmtDay = t => new Date(t).toLocaleDateString('ko-KR');
// 알파벳 따라 말하기 문장 (X는 끝소리)
const letterLine = (it, w = it.word) => it.ending ? `${w} ends with ${it.letter}` : `${it.letter} is for ${w}`;
// 설정의 목소리 목록: 자동 / AI 음성 / 이 기기 목소리(자연스러운 순)
const voiceOptions = () => [
  `<option value="">자동 (가장 자연스러운 목소리)</option>`,
  Speech.neuralAvailable ? `<option value="neural">🌟 또렷한 학습 목소리</option>` : '',
  ...Speech.voices().slice(0, 20).map(v => `<option value="${esc(v.uri)}">${v.natural ? '★ ' : ''}${esc(v.name)} (${esc(v.lang)})</option>`),
].join('');
const dayLabel = d => `Day ${d + 1}${Gen.isReviewDay(d) ? ' · 복습' : ''}`;
const scoreClass = s => s >= 80 ? 'good' : s >= 60 ? 'mid' : 'low';
// 꾸미기는 원이 아니라 캐릭터(ava-body)를 기준으로 놓는다. 효과는 캐릭터 둘레에 세 개를 띄운다
// 캐릭터마다 머리 꼭대기·눈·턱 높이가 달라서(글자 칸 높이에 대한 비율) 모자가 뜨지 않게 맞춘다
const AVATAR_FIT = { '🐰': [.42, .6, .92], '🐻': [.2, .5, .88], '🦊': [.24, .55, .9], '🐼': [.2, .5, .88], '🐯': [.2, .5, .88], '🐨': [.22, .52, .88], '🐸': [.2, .36, .86], '🦁': [.14, .5, .9], '🐧': [.12, .38, .72], '🦄': [.16, .42, .92] };
// 그린 캐릭터(img/a)는 둥근 얼굴 그림 위에 그린 꾸미기(img/x)를 얹는다. [머리 가운데 x, 머리 꼭대기 y, 머리 폭, 눈 높이, 턱 높이] (그림 크기에 대한 비율)
const DRAWN_FIT = {
  '🐰': [.5, .46, .52, .65, .8], '🐻': [.48, .2, .58, .52, .76], '🦊': [.5, .27, .6, .55, .76], '🐼': [.5, .2, .6, .5, .72], '🐯': [.49, .2, .64, .49, .75],
  '🐨': [.5, .22, .55, .53, .75], '🐸': [.5, .13, .6, .34, .8], '🦁': [.5, .17, .62, .53, .84], '🐧': [.49, .17, .58, .46, .7], '🦄': [.49, .28, .58, .54, .8],
};
// 그린 캐릭터의 눈 자리(왼눈 x,y · 오른눈 x,y · 반지름, 얼굴 그림 비율)와 눈꺼풀 색, 아이템을 쥐는 손 색
const DRAWN_EYES = {
  '🐰': [.378, .648, .611, .643, .03, '#fdfdfb', '#fbf9f5'], '🐻': [.373, .527, .617, .524, .031, '#c99063', '#b47b4e'], '🦊': [.396, .548, .613, .539, .036, '#f6b26b', '#e98a3d'],
  '🐼': [.385, .503, .604, .498, .028, '#2e2b29', '#2e2b29'], '🐯': [.38, .495, .609, .491, .036, '#f9b86a', '#f5a24a'], '🐨': [.372, .535, .626, .529, .03, '#c9c9c7', '#b9b9b7'],
  '🐸': [.298, .331, .707, .317, .105, '#a6d384', '#8cc46c'], '🦁': [.4, .534, .601, .533, .033, '#f4dba0', '#efc46c'], '🐧': [.357, .463, .645, .463, .034, '#f7f8f2', '#6f7a8a'],
  '🦄': [.375, .575, .616, .579, .023, '#fbfdfa', '#fbf8f4'],
};
// 미니룸 전신 캐릭터: 앞(f)·옆(s, 오른쪽을 봄)·뒤(b) × 서 있기(0)·걷기 두 장(a, b). 모두 같은 캔버스라 바꿔 끼워도 자리가 같다
//   fit: 앞모습 꾸미기 자리(얼굴 그림과 같은 순서), head: 보기마다 머리 가운데·폭, hand: 보기마다 손 끝 (그림 너비·높이에 대한 비율)
const MR_BODY = {
  '🐰': {"w": 184, "h": 300, "img": {"f0": "img/room/c-1f430-f0.webp?v=1126c", "fa": "img/room/c-1f430-fa.webp?v=1126c", "fb": "img/room/c-1f430-fb.webp?v=1126c", "s0": "img/room/c-1f430-s0.webp?v=1126c", "sa": "img/room/c-1f430-sa.webp?v=1126c", "sb": "img/room/c-1f430-sb.webp?v=1126c", "sc": "img/room/c-1f430-sc.webp?v=1126c", "b0": "img/room/c-1f430-b0.webp?v=1126c", "ba": "img/room/c-1f430-ba.webp?v=1126c", "bb": "img/room/c-1f430-bb.webp?v=1126c"}, "fit": [0.512, 0.325, 0.845, 0.514, 0.664], "head": {"front": [0.512, 0.845], "side": [0.546, 0.849], "back": [0.514, 0.841]}, "eyes": [0.314, 0.511, 0.693, 0.51, 0.036], "hand": {"front": [0.932, 0.81], "side": [0.707, 0.81], "back": [0.902, 0.81]}},
  '🐻': {"w": 223, "h": 300, "img": {"f0": "img/room/c-1f43b-f0.webp?v=1126c", "fa": "img/room/c-1f43b-fa.webp?v=1126c", "fb": "img/room/c-1f43b-fb.webp?v=1126c", "s0": "img/room/c-1f43b-s0.webp?v=1126c", "sa": "img/room/c-1f43b-sa.webp?v=1126c", "sb": "img/room/c-1f43b-sb.webp?v=1126c", "sc": "img/room/c-1f43b-sc.webp?v=1126c", "b0": "img/room/c-1f43b-b0.webp?v=1126c", "ba": "img/room/c-1f43b-ba.webp?v=1126c", "bb": "img/room/c-1f43b-bb.webp?v=1126c"}, "fit": [0.479, 0.001, 0.91, 0.374, 0.654], "head": {"front": [0.479, 0.91], "side": [0.484, 0.907], "back": [0.486, 0.896]}, "eyes": [0.311, 0.383, 0.694, 0.379, 0.048], "hand": {"front": [0.918, 0.769], "side": [0.687, 0.769], "back": [0.885, 0.769]}},
  '🦊': {"w": 238, "h": 300, "img": {"f0": "img/room/c-1f98a-f0.webp?v=1126c", "fa": "img/room/c-1f98a-fa.webp?v=1126c", "fb": "img/room/c-1f98a-fb.webp?v=1126c", "s0": "img/room/c-1f98a-s0.webp?v=1126c", "sa": "img/room/c-1f98a-sa.webp?v=1126c", "sb": "img/room/c-1f98a-sb.webp?v=1126c", "sc": "img/room/c-1f98a-sc.webp?v=1126c", "b0": "img/room/c-1f98a-b0.webp?v=1126c", "ba": "img/room/c-1f98a-ba.webp?v=1126c", "bb": "img/room/c-1f98a-bb.webp?v=1126c"}, "fit": [0.529, 0.144, 0.827, 0.45, 0.68], "head": {"front": [0.529, 0.827], "side": [0.613, 0.743], "back": [0.529, 0.827]}, "eyes": [0.386, 0.446, 0.685, 0.44, 0.029], "hand": {"front": [0.874, 0.78], "side": [0.664, 0.78], "back": [0.841, 0.78]}},
  '🐼': {"w": 229, "h": 300, "img": {"f0": "img/room/c-1f43c-f0.webp?v=1126c", "fa": "img/room/c-1f43c-fa.webp?v=1126f", "fb": "img/room/c-1f43c-fb.webp?v=1126f", "s0": "img/room/c-1f43c-s0.webp?v=1126c", "sa": "img/room/c-1f43c-sa.webp?v=1126c", "sb": "img/room/c-1f43c-sb.webp?v=1126d", "sc": "img/room/c-1f43c-sc.webp?v=1126d", "s1": "img/room/c-1f43c-s1.webp?v=1126e", "s2": "img/room/c-1f43c-s2.webp?v=1126e", "s3": "img/room/c-1f43c-s3.webp?v=1126e", "s4": "img/room/c-1f43c-s4.webp?v=1126e", "s5": "img/room/c-1f43c-s5.webp?v=1126e", "s6": "img/room/c-1f43c-s6.webp?v=1126e", "s7": "img/room/c-1f43c-s7.webp?v=1126e", "s8": "img/room/c-1f43c-s8.webp?v=1126e", "b0": "img/room/c-1f43c-b0.webp?v=1126c", "ba": "img/room/c-1f43c-ba.webp?v=1126c", "bb": "img/room/c-1f43c-bb.webp?v=1126c"}, "fit": [0.519, 0.041, 0.879, 0.376, 0.621], "head": {"front": [0.519, 0.879], "side": [0.539, 0.879], "back": [0.521, 0.876]}, "eyes": [0.351, 0.377, 0.672, 0.377, 0.04], "hand": {"front": [0.932, 0.759], "side": [0.69, 0.759], "back": [0.899, 0.759]}},
  '🐯': {"w": 237, "h": 300, "img": {"f0": "img/room/c-1f42f-f0.webp?v=1126c", "fa": "img/room/c-1f42f-fa.webp?v=1126c", "fb": "img/room/c-1f42f-fb.webp?v=1126c", "s0": "img/room/c-1f42f-s0.webp?v=1126c", "sa": "img/room/c-1f42f-sa.webp?v=1126c", "sb": "img/room/c-1f42f-sb.webp?v=1126c", "sc": "img/room/c-1f42f-sc.webp?v=1126c", "b0": "img/room/c-1f42f-b0.webp?v=1126c", "ba": "img/room/c-1f42f-ba.webp?v=1126c", "bb": "img/room/c-1f42f-bb.webp?v=1126c"}, "fit": [0.514, 0.031, 0.924, 0.361, 0.657], "head": {"front": [0.514, 0.924], "side": [0.498, 0.86], "back": [0.517, 0.924]}, "eyes": [0.354, 0.368, 0.685, 0.361, 0.052], "hand": {"front": [0.885, 0.782], "side": [0.684, 0.782], "back": [0.854, 0.782]}},
  '🐨': {"w": 276, "h": 300, "img": {"f0": "img/room/c-1f428-f0.webp?v=1126c", "fa": "img/room/c-1f428-fa.webp?v=1126c", "fb": "img/room/c-1f428-fb.webp?v=1126c", "s0": "img/room/c-1f428-s0.webp?v=1126c", "sa": "img/room/c-1f428-sa.webp?v=1126c", "sb": "img/room/c-1f428-sb.webp?v=1126c", "sc": "img/room/c-1f428-sc.webp?v=1126c", "b0": "img/room/c-1f428-b0.webp?v=1126c", "ba": "img/room/c-1f428-ba.webp?v=1126c", "bb": "img/room/c-1f428-bb.webp?v=1126c"}, "fit": [0.495, 0.079, 0.619, 0.4, 0.628], "head": {"front": [0.495, 0.619], "side": [0.629, 0.543], "back": [0.495, 0.615]}, "eyes": [0.351, 0.403, 0.637, 0.401, 0.027], "hand": {"front": [0.774, 0.791], "side": [0.573, 0.791], "back": [0.732, 0.791]}},
  '🐸': {"w": 316, "h": 300, "img": {"f0": "img/room/c-1f438-f0.webp?v=1126c", "fa": "img/room/c-1f438-fa.webp?v=1126c", "fb": "img/room/c-1f438-fb.webp?v=1126c", "s0": "img/room/c-1f438-s0.webp?v=1126c", "sa": "img/room/c-1f438-sa.webp?v=1126c", "sb": "img/room/c-1f438-sb.webp?v=1126c", "sc": "img/room/c-1f438-sc.webp?v=1126c", "b0": "img/room/c-1f438-b0.webp?v=1126c", "ba": "img/room/c-1f438-ba.webp?v=1126c", "bb": "img/room/c-1f438-bb.webp?v=1126c"}, "fit": [0.495, -0.102, 0.635, 0.132, 0.645], "head": {"front": [0.495, 0.635], "side": [0.53, 0.267], "back": [0.482, 0.672]}, "eyes": [0.281, 0.114, 0.714, 0.114, 0.06], "hand": {"front": [0.839, 0.754], "side": [0.613, 0.754], "back": [0.794, 0.754]}},
  '🦁': {"w": 219, "h": 300, "img": {"f0": "img/room/c-1f981-f0.webp?v=1126c", "fa": "img/room/c-1f981-fa.webp?v=1126c", "fb": "img/room/c-1f981-fb.webp?v=1126c", "s0": "img/room/c-1f981-s0.webp?v=1126c", "sa": "img/room/c-1f981-sa.webp?v=1126c", "sb": "img/room/c-1f981-sb.webp?v=1126c", "sc": "img/room/c-1f981-sc.webp?v=1126c", "b0": "img/room/c-1f981-b0.webp?v=1126c", "ba": "img/room/c-1f981-ba.webp?v=1126c", "bb": "img/room/c-1f981-bb.webp?v=1126c"}, "fit": [0.495, 0.052, 0.82, 0.399, 0.699], "head": {"front": [0.495, 0.82], "side": [0.471, 0.681], "back": [0.504, 0.805]}, "eyes": [0.363, 0.403, 0.629, 0.402, 0.036], "hand": {"front": [0.882, 0.597], "side": [0.68, 0.597], "back": [0.826, 0.597]}},
  '🐧': {"w": 254, "h": 300, "img": {"f0": "img/room/c-1f427-f0.webp?v=1126c", "fa": "img/room/c-1f427-fa.webp?v=1126c", "fb": "img/room/c-1f427-fb.webp?v=1126c", "s0": "img/room/c-1f427-s0.webp?v=1126c", "sa": "img/room/c-1f427-sa.webp?v=1126c", "sb": "img/room/c-1f427-sb.webp?v=1126c", "sc": "img/room/c-1f427-sc.webp?v=1126c", "b0": "img/room/c-1f427-b0.webp?v=1126c", "ba": "img/room/c-1f427-ba.webp?v=1126c", "bb": "img/room/c-1f427-bb.webp?v=1126c"}, "fit": [0.482, 0.014, 0.783, 0.345, 0.619], "head": {"front": [0.482, 0.783], "side": [0.516, 0.836], "back": [0.481, 0.78]}, "eyes": [0.303, 0.351, 0.692, 0.346, 0.03], "hand": {"front": [0.956, 0.72], "side": [0.693, 0.72], "back": [0.926, 0.72]}},
  '🦄': {"w": 240, "h": 300, "img": {"f0": "img/room/c-1f984-f0.webp?v=1126c", "fa": "img/room/c-1f984-fa.webp?v=1126c", "fb": "img/room/c-1f984-fb.webp?v=1126c", "s0": "img/room/c-1f984-s0.webp?v=1126c", "sa": "img/room/c-1f984-sa.webp?v=1126c", "sb": "img/room/c-1f984-sb.webp?v=1126c", "sc": "img/room/c-1f984-sc.webp?v=1126c", "b0": "img/room/c-1f984-b0.webp?v=1126c", "ba": "img/room/c-1f984-ba.webp?v=1126c", "bb": "img/room/c-1f984-bb.webp?v=1126c"}, "fit": [0.45, 0.214, 0.761, 0.487, 0.761], "head": {"front": [0.45, 0.761], "side": [0.47, 0.71], "back": [0.472, 0.693]}, "eyes": [0.3, 0.532, 0.616, 0.52, 0.032], "hand": {"front": [0.813, 0.798], "side": [0.606, 0.798], "back": [0.767, 0.798]}},
};
// 손 아이템을 쥐는 자리 (아이템 그림에 대한 비율, style.css 의 .paw 자리와 같다)
const MR_GRIP = { 'acc-lollipop': [50, 70], 'acc-wand': [62, 66], 'acc-balloon': [50, 92], 'acc-teddy': [18, 58], 'acc-icecream': [50, 80], 'acc-sunflower': [50, 74], 'acc-bubbles': [14, 88] };
// 걷기 그림마다: 머리 가운데 x · 머리 꼭대기 y · 머리 폭 · 목 y · 오른쪽 손 끝 x, y · (안 씀) · 왼쪽 손 끝 x, y · 가슴 앞 x · 머리 꼭대기 가운데 x (그림 비율)
const MR_FRAMES = {
  '🐰': {"f0": [0.482, 0.31, 0.807, 0.661, 0.921, 0.79, 0.62, 0.037, 0.783, 0.795, 0.479], "fa": [0.485, 0.31, 0.801, 0.661, 0.921, 0.793, 0.62, 0.049, 0.79, 0.795, 0.479], "fb": [0.491, 0.31, 0.801, 0.661, 0.921, 0.787, 0.62, 0.055, 0.787, 0.807, 0.491], "s0": [0.518, 0.31, 0.711, 0.661, 0.67, 0.82, 0.488, 0.158, 0.85, 0.819, 0.521], "sa": [0.515, 0.31, 0.717, 0.661, 0.66, 0.88, 0.506, 0.109, 0.83, 0.825, 0.518], "sb": [0.518, 0.31, 0.711, 0.661, 0.7, 0.87, 0.494, 0.164, 0.827, 0.819, 0.518], "sc": [0.518, 0.31, 0.711, 0.661, 0.7, 0.87, 0.494, 0.164, 0.827, 0.819, 0.518], "b0": [0.485, 0.317, 0.813, 0.668, 0.921, 0.79, 0.608, 0.043, 0.783, 0.801, 0.479], "ba": [0.485, 0.303, 0.753, 0.654, 0.842, 0.737, 0.524, 0.127, 0.737, 0.813, 0.479], "bb": [0.485, 0.303, 0.753, 0.654, 0.842, 0.73, 0.524, 0.133, 0.73, 0.813, 0.491]},
  '🐻': {"f0": [0.487, 0.043, 0.796, 0.645, 0.859, 0.733, 0.36, 0.114, 0.733, 0.836, 0.482], "fa": [0.487, 0.043, 0.796, 0.645, 0.859, 0.727, 0.364, 0.136, 0.723, 0.844, 0.484], "fb": [0.511, 0.043, 0.791, 0.645, 0.859, 0.723, 0.364, 0.136, 0.727, 0.844, 0.511], "s0": [0.471, 0.03, 0.711, 0.632, 0.5, 0.81, 0.391, 0.305, 0.713, 0.698, 0.462], "sa": [0.471, 0.03, 0.711, 0.632, 0.52, 0.8, 0.396, 0.261, 0.777, 0.738, 0.464], "sb": [0.471, 0.027, 0.711, 0.628, 0.45, 0.71, 0.4, 0.278, 0.79, 0.707, 0.467], "sc": [0.471, 0.027, 0.711, 0.628, 0.45, 0.71, 0.4, 0.278, 0.79, 0.707, 0.467], "b0": [0.493, 0.043, 0.782, 0.645, 0.859, 0.733, 0.364, 0.132, 0.737, 0.836, 0.489], "ba": [0.5, 0.04, 0.716, 0.642, 0.828, 0.693, 0.564, 0.198, 0.69, 0.84, 0.602], "bb": [0.496, 0.04, 0.716, 0.642, 0.797, 0.69, 0.564, 0.167, 0.693, 0.813, 0.393]},
  '🦊': {"f0": [0.531, 0.137, 0.825, 0.675, 0.848, 0.753, 0.825, 0.191, 0.76, 0.834, 0.515], "fa": [0.533, 0.137, 0.821, 0.675, 0.853, 0.767, 0.821, 0.195, 0.74, 0.834, 0.522], "fb": [0.52, 0.137, 0.821, 0.675, 0.857, 0.74, 0.821, 0.204, 0.753, 0.852, 0.531], "s0": [0.555, 0.137, 0.603, 0.675, 0.63, 0.77, 0.397, 0.073, 0.693, 0.729, 0.544], "sa": [0.557, 0.137, 0.598, 0.675, 0.62, 0.77, 0.402, 0.082, 0.693, 0.777, 0.546], "sb": [0.557, 0.137, 0.598, 0.675, 0.45, 0.72, 0.393, 0.248, 0.8, 0.677, 0.546], "sc": [0.557, 0.137, 0.598, 0.675, 0.45, 0.72, 0.393, 0.248, 0.8, 0.677, 0.546], "b0": [0.531, 0.137, 0.825, 0.675, 0.848, 0.75, 0.825, 0.208, 0.757, 0.834, 0.52], "ba": [0.541, 0.133, 0.803, 0.672, 0.835, 0.727, 0.803, 0.252, 0.727, 0.838, 0.541], "bb": [0.511, 0.133, 0.803, 0.672, 0.8, 0.72, 0.803, 0.217, 0.73, 0.812, 0.511]},
  '🐼': {"f0": [0.498, 0.053, 0.865, 0.631, 0.915, 0.76, 0.865, 0.081, 0.747, 0.87, 0.495], "fa": [0.498, 0.05, 0.874, 0.628, 0.91, 0.733, 0.874, 0.076, 0.747, 0.874, 0.495], "fb": [0.498, 0.05, 0.874, 0.628, 0.919, 0.747, 0.874, 0.085, 0.733, 0.874, 0.5], "s0": [0.498, 0.013, 0.735, 0.591, 0.68, 0.65, 0.302, 0.22, 0.68, 0.74, 0.514], "sa": [0.498, 0.01, 0.735, 0.588, 0.48, 0.77, 0.274, 0.123, 0.797, 0.721, 0.509], "sb": [0.5, 0.01, 0.721, 0.588, 0.46, 0.74, 0.302, 0.216, 0.817, 0.693, 0.509], "sc": [0.5, 0.01, 0.721, 0.588, 0.46, 0.74, 0.302, 0.216, 0.817, 0.693, 0.509], "s1": [0.5, 0.01, 0.721, 0.588, 0.46, 0.74, 0.302, 0.216, 0.817, 0.693, 0.509], "s2": [0.5, 0.021, 0.721, 0.599, 0.46, 0.751, 0.302, 0.216, 0.828, 0.693, 0.509], "s3": [0.5, 0.031, 0.721, 0.609, 0.46, 0.761, 0.302, 0.216, 0.838, 0.693, 0.509], "s4": [0.5, 0.021, 0.721, 0.599, 0.46, 0.751, 0.302, 0.216, 0.828, 0.693, 0.509], "s5": [0.5, 0.01, 0.721, 0.588, 0.46, 0.74, 0.302, 0.216, 0.817, 0.693, 0.509], "s6": [0.5, 0.021, 0.721, 0.599, 0.46, 0.751, 0.302, 0.216, 0.828, 0.693, 0.509], "s7": [0.5, 0.031, 0.721, 0.609, 0.46, 0.761, 0.302, 0.216, 0.838, 0.693, 0.509], "s8": [0.5, 0.021, 0.721, 0.599, 0.46, 0.751, 0.302, 0.216, 0.828, 0.693, 0.509], "b0": [0.502, 0.06, 0.847, 0.638, 0.877, 0.74, 0.847, 0.127, 0.74, 0.837, 0.5], "ba": [0.502, 0.057, 0.8, 0.634, 0.849, 0.723, 0.8, 0.174, 0.717, 0.833, 0.505], "bb": [0.493, 0.057, 0.8, 0.634, 0.822, 0.717, 0.8, 0.146, 0.723, 0.809, 0.491]},
  '🐯': {"f0": [0.489, 0.033, 0.827, 0.645, 0.833, 0.753, 0.827, 0.153, 0.75, 0.796, 0.487], "fa": [0.489, 0.033, 0.827, 0.645, 0.842, 0.727, 0.827, 0.162, 0.733, 0.823, 0.489], "fb": [0.507, 0.033, 0.827, 0.645, 0.833, 0.733, 0.827, 0.153, 0.727, 0.81, 0.507], "s0": [0.462, 0.043, 0.704, 0.655, 0.57, 0.76, 0.451, 0.251, 0.827, 0.708, 0.429], "sa": [0.462, 0.043, 0.704, 0.655, 0.56, 0.76, 0.447, 0.242, 0.827, 0.721, 0.431], "sb": [0.462, 0.043, 0.704, 0.655, 0.54, 0.76, 0.451, 0.255, 0.82, 0.677, 0.434], "sc": [0.462, 0.043, 0.704, 0.655, 0.54, 0.76, 0.451, 0.255, 0.82, 0.677, 0.434], "b0": [0.493, 0.033, 0.827, 0.645, 0.833, 0.747, 0.827, 0.162, 0.76, 0.801, 0.493], "ba": [0.504, 0.023, 0.77, 0.635, 0.82, 0.717, 0.77, 0.211, 0.707, 0.81, 0.507], "bb": [0.491, 0.023, 0.77, 0.635, 0.785, 0.707, 0.77, 0.175, 0.717, 0.779, 0.489]},
  '🐨': {"f0": [0.491, 0.1, 0.703, 0.614, 0.749, 0.743, 0.703, 0.239, 0.737, 0.707, 0.494], "fa": [0.489, 0.1, 0.699, 0.614, 0.806, 0.69, 0.699, 0.187, 0.7, 0.793, 0.494], "fb": [0.504, 0.1, 0.699, 0.614, 0.806, 0.693, 0.699, 0.19, 0.683, 0.782, 0.498], "s0": [0.5, 0.067, 0.684, 0.581, 0.48, 0.76, 0.32, 0.096, 0.79, 0.628, 0.679], "sa": [0.502, 0.063, 0.68, 0.577, 0.52, 0.76, 0.316, 0.145, 0.77, 0.673, 0.677], "sb": [0.511, 0.06, 0.654, 0.574, 0.42, 0.75, 0.094, 0.172, 0.823, 0.628, 0.585], "sc": [0.511, 0.06, 0.654, 0.574, 0.42, 0.75, 0.094, 0.172, 0.823, 0.628, 0.585], "b0": [0.489, 0.1, 0.699, 0.614, 0.746, 0.74, 0.699, 0.247, 0.737, 0.711, 0.496], "ba": [0.474, 0.08, 0.571, 0.594, 0.749, 0.69, 0.571, 0.266, 0.693, 0.729, 0.654], "bb": [0.521, 0.08, 0.568, 0.594, 0.727, 0.69, 0.568, 0.243, 0.69, 0.707, 0.34]},
  '🐸': {"f0": [0.507, 0.113, 0.795, 0.621, 0.94, 0.72, 0.795, 0.082, 0.7, 0.93, 0.502], "fa": [0.507, 0.11, 0.795, 0.618, 0.936, 0.717, 0.795, 0.082, 0.697, 0.921, 0.502], "fb": [0.487, 0.11, 0.79, 0.618, 0.909, 0.693, 0.79, 0.06, 0.703, 0.908, 0.489], "s0": [0.555, 0.113, 0.332, 0.621, 0.48, 0.76, 0.332, 0.165, 0.653, 0.769, 0.524], "sa": [0.557, 0.113, 0.336, 0.621, 0.46, 0.76, 0.336, 0.099, 0.807, 0.856, 0.524], "sb": [0.555, 0.113, 0.332, 0.621, 0.45, 0.72, 0.332, 0.169, 0.64, 0.725, 0.526], "sc": [0.555, 0.113, 0.332, 0.621, 0.45, 0.72, 0.332, 0.169, 0.64, 0.725, 0.526], "b0": [0.489, 0.107, 0.838, 0.614, 0.918, 0.7, 0.838, 0.099, 0.687, 0.917, 0.487], "ba": [0.483, 0.08, 0.79, 0.588, 0.892, 0.677, 0.79, 0.112, 0.667, 0.886, 0.483], "bb": [0.509, 0.08, 0.79, 0.588, 0.883, 0.68, 0.79, 0.099, 0.677, 0.878, 0.509]},
  '🦁': {"f0": [0.493, 0.01, 0.959, 0.693, 0.839, 0.773, 0.434, 0.147, 0.757, 0.837, 0.484], "fa": [0.493, 0.01, 0.959, 0.693, 0.853, 0.747, 0.43, 0.156, 0.727, 0.86, 0.486], "fb": [0.505, 0.01, 0.955, 0.693, 0.839, 0.727, 0.43, 0.143, 0.747, 0.86, 0.509], "s0": [0.452, 0.023, 0.688, 0.706, 0.56, 0.79, 0.416, 0.179, 0.84, 0.706, 0.502], "sa": [0.452, 0.023, 0.688, 0.706, 0.56, 0.77, 0.416, 0.165, 0.83, 0.688, 0.502], "sb": [0.448, 0.02, 0.688, 0.703, 0.54, 0.77, 0.416, 0.224, 0.82, 0.665, 0.498], "sc": [0.448, 0.02, 0.688, 0.703, 0.54, 0.77, 0.416, 0.224, 0.82, 0.665, 0.498], "b0": [0.502, 0.013, 0.941, 0.696, 0.839, 0.787, 0.407, 0.156, 0.77, 0.833, 0.502], "ba": [0.5, 0.01, 0.928, 0.693, 0.812, 0.73, 0.389, 0.211, 0.727, 0.833, 0.502], "bb": [0.495, 0.01, 0.928, 0.693, 0.785, 0.727, 0.389, 0.183, 0.73, 0.805, 0.493]},
  '🐧': {"f0": [0.498, 0.013, 0.779, 0.628, 0.958, 0.7, 0.379, 0.038, 0.69, 0.962, 0.498], "fa": [0.498, 0.01, 0.762, 0.625, 0.942, 0.657, 0.371, 0.058, 0.657, 0.962, 0.502], "fb": [0.477, 0.01, 0.762, 0.625, 0.917, 0.65, 0.371, 0.038, 0.643, 0.942, 0.477], "s0": [0.485, 0.013, 0.712, 0.628, 0.45, 0.79, 0.396, 0.096, 0.793, 0.779, 0.485], "sa": [0.488, 0.013, 0.708, 0.628, 0.44, 0.77, 0.396, 0.1, 0.79, 0.85, 0.485], "sb": [0.51, 0.013, 0.662, 0.628, 0.4, 0.74, 0.371, 0.188, 0.857, 0.758, 0.506], "sc": [0.51, 0.013, 0.662, 0.628, 0.4, 0.74, 0.371, 0.188, 0.857, 0.758, 0.506], "b0": [0.496, 0.013, 0.775, 0.628, 0.958, 0.703, 0.371, 0.038, 0.69, 0.958, 0.498], "ba": [0.483, 0.01, 0.658, 0.625, 0.867, 0.643, 0.354, 0.096, 0.643, 0.892, 0.485], "bb": [0.494, 0.01, 0.662, 0.625, 0.879, 0.643, 0.35, 0.108, 0.643, 0.9, 0.492]},
  '🦄': {"f0": [0.46, 0.01, 0.876, 0.781, 0.807, 0.81, 0.049, 0.122, 0.81, 0.832, 0.454], "fa": [0.46, 0.01, 0.876, 0.781, 0.767, 0.8, 0.049, 0.14, 0.827, 0.774, 0.454], "fb": [0.46, 0.01, 0.876, 0.781, 0.714, 0.87, 0.049, 0.158, 0.8, 0.668, 0.454], "s0": [0.456, 0.01, 0.699, 0.781, 0.52, 0.78, 0.04, 0.286, 0.85, 0.681, 0.781], "sa": [0.456, 0.01, 0.699, 0.781, 0.4, 0.79, 0.044, 0.229, 0.873, 0.642, 0.779], "sb": [0.456, 0.01, 0.699, 0.781, 0.44, 0.78, 0.04, 0.242, 0.863, 0.664, 0.781], "sc": [0.456, 0.01, 0.699, 0.781, 0.44, 0.78, 0.04, 0.242, 0.863, 0.664, 0.781], "b0": [0.48, 0.013, 0.801, 0.784, 0.789, 0.807, 0.058, 0.175, 0.803, 0.814, 0.467], "ba": [0.48, 0.017, 0.765, 0.788, 0.639, 0.807, 0.053, 0.321, 0.807, 0.659, 0.469], "bb": [0.482, 0.017, 0.77, 0.788, 0.643, 0.807, 0.053, 0.326, 0.807, 0.664, 0.496]},
};
// 귀(뿔·눈) 사이 머리 꼭대기 폭 (머리 폭에 대한 비율): 머리에 쓰는 것은 이 폭에 맞춰 귀 사이에 쓴다
const MR_GAP = { '🐰': .5, '🐻': .6, '🦊': .5, '🐼': .58, '🐯': .58, '🐨': .55, '🐸': .45, '🦁': .58, '🐧': .62, '🦄': .55 };
// 머리 꼭대기로 잰 자리가 머리보다 높은 캐릭터(유니콘의 뿔)는 귀처럼 머리에 붙이는 것을 그만큼 내린다
const MR_CDROP = { '🦄': .13 }, MR_SDROP = { '🦄': .075 };
// 머리·목 꾸미기의 옆모습·뒷모습 그림 (있는 것만, 없으면 앞모습 그림을 쓴다)
const MR_ACC_VIEW = {"🧢": {"side": "img/room/acc/side-1f9e2.png", "back": "img/room/acc/back-1f9e2.png"}, "👒": {"side": "img/room/acc/side-1f452.png", "back": "img/room/acc/back-1f452.png"}, "🎩": {"side": "img/room/acc/side-1f3a9.png", "back": "img/room/acc/back-1f3a9.png"}, "🎓": {"side": "img/room/acc/side-1f393.png", "back": "img/room/acc/back-1f393.png"}, "👑": {"side": "img/room/acc/side-1f451.png", "back": "img/room/acc/back-1f451.png"}, "🎉": {"side": "img/room/acc/side-1f389.png", "back": "img/room/acc/back-1f389.png"}, "🍄": {"side": "img/room/acc/side-1f344.png", "back": "img/room/acc/back-1f344.png"}, "🧣": {"back": "img/room/acc/back-1f9e3.png"}, "📿": {"side": "img/room/acc/side-1f4ff.png"}, "🏅": {"side": "img/room/acc/side-1f3c5.png"}, "🎗️": {"side": "img/room/acc/side-1f397.png"}, "🔔": {"side": "img/room/acc/side-1f514.png"}, "🕶️": {"side": "img/room/acc/side-1f576.png"}, "👓": {"side": "img/room/acc/side-1f453.png"}, "🩷": {"side": "img/room/acc/side-1fa77.png"}, "🤿": {"side": "img/room/acc/side-1f93f.png"}};
const accViewArt = (emoji, view) => (view !== 'front' && MR_ACC_VIEW[emoji]?.[view]) || WORN_ART[emoji] || (PICS.x[emoji] ? 'img/' + PICS.x[emoji] : '');
// 전신 캐릭터 (미니룸·별 상점). key: f0 fa fb s0 sa sb b0 ba bb (보기 앞·옆·뒤 × 서 있기·걷기 두 장)
// 걷는 그림마다 머리 자리가 조금씩 달라서, 그 보기의 서 있는 그림에 머리가 맞도록 몸 전체를 옮긴다 (머리가 흔들리지 않고 다리만 움직이게)
const mrFrame = (el, avatar, key, up = 0) => {
  const b = MR_BODY[avatar] || MR_BODY['🐰'], F = MR_FRAMES[avatar] || MR_FRAMES['🐰'], f = F[key], base = F[key[0] + '0'], body = el.querySelector('.ava-body'), ava = el.querySelector('.mr-ava');
  const eye = (b.eyes[1] + b.eyes[3]) / 2 + (f[1] - F.f0[1]), view = { f: 'front', s: 'side', b: 'back' }[key[0]];
  const hand = view === 'back' ? [f[7], f[8]] : [f[4], f[5]];
  [['--hx', f[0]], ['--top', f[1]], ['--hw', f[2]], ['--ny', f[3]], ['--handx', hand[0]], ['--handy', hand[1]], ['--eye', eye], ['--chest', f[9]], ['--crown', f[10]]].forEach(([k, v]) => body.style.setProperty(k, v));
  body.style.translate = `${((base[0] - f[0]) * 100).toFixed(2)}% ${((base[1] - f[1] - up) * 100).toFixed(2)}%`;
  if (ava.dataset.view !== view) { ava.dataset.view = view; ava.querySelectorAll('.acc[data-emoji]').forEach(a => { const src = accViewArt(a.dataset.emoji, view), im = a.querySelector('img'); if (im && src && !im.src.endsWith(src)) im.src = src; }); }
  const im = body.querySelector('.mr-img'); if (!im.src.endsWith(b.img[key])) im.src = b.img[key];
};
const roomAvatar = (p, cls = '') => {
  const b = MR_BODY[p.avatar] || MR_BODY['🐰'], de = DRAWN_EYES[p.avatar] || DRAWN_EYES['🐰'], f = (MR_FRAMES[p.avatar] || MR_FRAMES['🐰']).f0;
  const acc = Store.worn(p).filter(w => w.slot !== 'pet').map(w => (w.slot === 'fx' ? ['f1', 'f2', 'f3'] : ['']).map(x => {
    const g = MR_GRIP[w.id] || [50, 75];
    return `<i class="acc acc-${w.slot} ${w.id} ${x}" data-emoji="${w.emoji}" style="--px:${g[0]}%;--py:${g[1]}%" aria-hidden="true">${accArt(w, 1)}</i>`;
  }).join('')).join('');
  const lids = [0, 2].map(i => `<i class="ava-lid" aria-hidden="true" style="left:${b.eyes[i] * 100}%;top:${b.eyes[i + 1] * 100}%;--r:${b.eyes[4] * 100}%;background:${de[5]}"></i>`).join('');
  return `<span class="avatar drawn huge mr-ava ${cls}" data-view="front"><span class="ava-body" style="--hx:${f[0]};--top:${f[1]};--hw:${f[2]};--ny:${f[3]};--handx:${f[4]};--handy:${f[5]};--eye:${(b.eyes[1] + b.eyes[3]) / 2};--chest:${f[9]};--crown:${f[10]};--gap:${MR_GAP[p.avatar] || .58};--cdrop:${MR_CDROP[p.avatar] || 0};--sdrop:${MR_SDROP[p.avatar] || 0};--paw:${de[6]};aspect-ratio:${b.w}/${b.h}"><img class="mr-img" src="${b.img.f0}" alt="" draggable="false">${lids}${acc}</span></span>`;
};
// 캐릭터가 쓸 때만 다른 그림 (상점 아이콘은 그대로): 화관은 머리에 얹은 납작한 타원
const WORN_ART = { '🌸': 'img/room/acc/wear-1f338.png?v=1', '📿': 'img/room/acc/wear-1f4ff.png?v=1' };
const accArt = (w, worn) => (worn && WORN_ART[w.emoji]) ? `<img src="${WORN_ART[w.emoji]}" alt="" draggable="false">` : PICS.x[w.emoji] ? `<img src="img/${PICS.x[w.emoji]}" alt="" draggable="false">` : w.emoji;
const avatarHtml = (p, cls = '') => {
  const acc = Store.worn(p).map(w => (w.slot === 'fx' ? ['f1', 'f2', 'f3'] : ['']).map(x => `<i class="acc acc-${w.slot} ${w.id} ${x}" aria-hidden="true">${PICS.a[p.avatar] ? accArt(w, 1) + (w.slot === 'hand' ? '<b class="paw"></b>' : '') : w.emoji}</i>`).join('')).join('');
  if (PICS.a[p.avatar]) { const [hx, hy, hw, ey, ny] = DRAWN_FIT[p.avatar] || [.5, .4, .56, .62, .9]; const eyes = DRAWN_EYES[p.avatar], lids = eyes ? [0, 2].map(i => `<i class="ava-lid" aria-hidden="true" style="left:${eyes[i] * 100}%;top:${eyes[i + 1] * 100}%;--r:${eyes[4] * 100}%;background:${eyes[5]}"></i>`).join('') : ''; return `<span class="avatar drawn ${cls}"><span class="ava-body" style="--hx:${hx};--hy:${hy};--hw:${hw};--ey:${ey};--ny:${ny}${eyes ? `;--paw:${eyes[6]}` : ''}"><img class="ava-face" src="img/${PICS.a[p.avatar]}" alt="" draggable="false">${lids}${acc}</span></span>`; }
  const [hy, ey, ny] = AVATAR_FIT[p.avatar] || [.2, .5, .88]; return `<span class="avatar ${cls}"><span class="ava-body" style="--hy:${hy};--ey:${ey};--ny:${ny}">${p.avatar}${acc}</span></span>`;
};
// 놀이터·카드에 쓸 그림 단어 (알파벳 단어 + 파닉스 단어)
const PICTURE_WORDS = [...LETTERS.flatMap(l => l.words.map(([en, emoji]) => ({ en, emoji }))), ...Object.values(PHONICS).flat().map(([en, emoji]) => ({ en, emoji }))]
  .filter((w, i, a) => a.findIndex(x => x.en === w.en) === i);

const Views = {};

/* ---------- 공용 컴포넌트 ---------- */
const UI = {
  mascot(text, mood = '🌱') { return `<div class="mascot-say"><span class="mascot-face" aria-hidden="true">${mood}</span><p class="bubble-say">${text}</p></div>`; },
  stageCarousel(id = 'carousel') {
    return `<div class="carousel" id="${id}" tabindex="0" aria-roledescription="carousel">
      <button class="car-nav prev" aria-label="이전 단계">‹</button>
      <div class="car-stage"></div>
      <button class="car-nav next" aria-label="다음 단계">›</button>
      <div class="car-dots">${STAGES.map((s, i) => `<button aria-label="STAGE ${s.id}" data-i="${i}"></button>`).join('')}</div>
    </div>`;
  },
  wireCarousel(root, { auto = true } = {}) {
    let i = 0, timer;
    const stage = $('.car-stage', root);
    const sample = s => Gen.levelItems(s.levels[0]).slice(0, 3).map(it => {
      const en = it.letter ? `${it.letter} ${it.word}` : it.en || it.q;
      return `<button class="sample-chip" data-say="${esc(it.letter ? letterLine(it) : en)}">${it.emoji || '💬'} ${esc(en)} 🔊</button>`;
    }).join('');
    const draw = () => {
      const s = STAGES[i];
      stage.style.setProperty('--c', s.color);
      stage.innerHTML = `<div class="anim-in">
        <div class="island" aria-hidden="true">${['🏝️', '🌋', '🏔️', '🏕️', '🌳', '🏰', '🛸', '🚀'][i]}</div>
        <em class="stage-tag">STAGE ${s.id} · ${s.title}섬</em>
        <div class="level-row">${s.levels.map(l => `<span class="level-box">${l}</span>`).join('')}</div>
        <p class="stage-desc">${s.desc}</p>
        <p class="fine">레벨 ${s.levels.length}개 · ${s.levels.length * LESSONS_PER_LEVEL}일 (하루 1레슨이면 ${durationText(studyWeeks(s.levels.length * LESSONS_PER_LEVEL))})</p>
        <div class="chips center-chips">${s.skills.map(k => `<span class="chip">${k}</span>`).join('')}</div>
        <div class="stage-sample">${sample(s)}</div></div>`;
      $$('.car-dots button', root).forEach((b, k) => b.classList.toggle('on', k === i));
      $$('[data-say]', stage).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
    };
    const go = k => { i = (k + STAGES.length) % STAGES.length; draw(); restart(); };
    const restart = () => { clearInterval(timer); if (auto) timer = setInterval(() => { if (!document.body.contains(root)) return clearInterval(timer); i = (i + 1) % STAGES.length; draw(); }, 6000); };
    $('.prev', root).onclick = () => go(i - 1);
    $('.next', root).onclick = () => go(i + 1);
    $$('.car-dots button', root).forEach(b => b.onclick = () => go(+b.dataset.i));
    root.onkeydown = e => { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); };
    root.onmouseenter = () => clearInterval(timer); root.onmouseleave = restart;
    draw(); restart();
  },
  plans() {
    return `<div class="plans">
      <p class="plan-kids center"></p>
      <div class="plan-cards"></div>
      <p class="fine center">모든 상품은 한 번만 결제하는 이용권이에요. 자동으로 다시 결제되지 않고, 이용 기간이 끝나기 3일 전에 알려 드려요.${!API.on || API.cfg.payments === 'demo' ? ' · 데모라 실제 결제는 일어나지 않아요.' : ''}</p>
    </div>`;
  },
  wirePlans(root) {
    const loggedIn = !!Store.user(), kids = Store.kidsPlan();
    $('.plan-kids', root).innerHTML = kids === 'two'
      ? `👧👦 아이 ${Store.user().profiles.length}명을 등록해서 <b>형제·자매 요금</b>이 적용되고 있어요.`
      : '👧👦 형제·자매가 함께 배우나요? 아이를 추가하면 <b>형제·자매 할인</b>이 자동으로 적용돼요.';
    const draw = () => {
      const P = PLANS[kids];
      $('.plan-cards', root).innerHTML = [12, 6, 3, 1].map(months => {
        const monthly = planMonthly(kids, months);
        // 로그인 전에는 웰컴쿠폰을 받는다고 보고 보여준다
        const promo = promoMonthly(kids, months);
        const q = loggedIn ? Store.quote(kids, months) : promo ? { rate: 0, promo: true, monthly: promo } : { rate: WELCOME_RATE, monthly: round10(monthly * (1 - WELCOME_RATE)) };
        q.total = q.monthly * months;
        const disc = Math.round((1 - monthly / P.list) * 100);
        const perDay = Math.round((q.rate || q.promo ? q.monthly : monthly) / 30 / 10) * 10;
        return `<div class="plan-card ${months === 12 ? 'best' : ''}">
          ${months === 12 ? `<span class="ribbon">${q.promo ? `1년 특가 · ${promoEndText()}까지` : '가장 인기'}</span>` : ''}
          <h4>${months}개월</h4>
          <p class="plan-fit">${{ 1: '먼저 한 달 해보기', 3: '한 계절 꾸준히 해보기', 6: `하루 2레슨이면 전체 과정 완주 (${durationText(studyWeeks(TOTAL_LESSONS, 2))})`, 12: `하루 1레슨으로 전체 과정 완주 (${durationText(studyWeeks(TOTAL_LESSONS))})` }[months]}</p>
          <dl>${disc ? `<dt>1개월 요금</dt><dd class="strike">월 ${won(P.list)}</dd>` : ''}
          <dt>플러스</dt><dd><b>월 ${won(monthly)}</b> ${disc ? `<small>${disc}%↓</small>` : ''}</dd>
          ${q.promo ? `<dt>1년 특가</dt><dd class="hot"><span class="pct">특가</span>월 ${won(q.monthly)}</dd>` : ''}
          ${q.rate ? `<dt>첫 결제 쿠폰</dt><dd class="hot"><span class="pct">${Math.round(q.rate * 100)}%</span>월 ${won(q.monthly)}</dd>` : ''}</dl>
          <div class="plan-total">하루 약 <b>${won(perDay)}</b> · 총 ${won(q.total)}</div>
          <button class="btn btn-primary full" data-buy="${months}">선택하기</button></div>`;
      }).join('');
      $$('[data-buy]', root).forEach(b => b.onclick = () => App.buy(+b.dataset.buy));
    };
    draw();
  },
  // 요금·할인 기준을 한곳에: 기간 할인 → 형제·자매 → 첫 결제 쿠폰 → 1년 특가. 한 결제에는 할인 하나만 (서버 pricing.js와 같은 규칙)
  discountRules() {
    const pct = Math.round(WELCOME_RATE * 100), on = promoOn();
    const rows = [
      ['📅', '기간 할인', `기간이 길수록 월 요금이 내려가요. 1개월 ${won(PLANS.one.m1)} → 3개월 월 ${won(PLANS.one.m3)} → 6개월 월 ${won(PLANS.one.m6)} → 12개월 월 ${won(PLANS.one.m12)}`],
      ['👫', '형제·자매 요금', `아이를 2명 이상 등록하면 자동으로 적용돼요. 1개월 ${won(PLANS.two.m1)} ~ 12개월 월 ${won(PLANS.two.m12)} (아이 모두 함께)`],
      ['🎟️', `첫 결제 쿠폰 ${pct}%`, `가입하면 받는 웰컴쿠폰이에요. 가입 후 10일 안에 하는 첫 결제에서 위 요금의 ${pct}%를 더 할인해요.${on ? ' (1년 특가가 적용되는 12개월은 제외)' : ''}`],
      ...(on ? [['🎉', `1년 특가 · ${promoEndText()}까지`, `이 기간에 12개월을 고르면 월 ${won(PROMO.one)}(형제·자매 월 ${won(PROMO.two)})예요. 쿠폰을 쓸 때보다 싸서 특가가 적용되고, 쿠폰은 쓰지 않고 남아요.`]] : []),
    ];
    return `<div class="card discount-rules"><h2>🧾 할인은 이렇게 적용돼요</h2>
      <ol>${rows.map(([i, t, d]) => `<li><span class="dr-ico">${i}</span><div><b>${t}</b><small>${d}</small></div></li>`).join('')}</ol>
      <p class="fine">한 번 결제할 때 쿠폰과 특가는 함께 쓰지 않아요. 아래 상품 카드에 적힌 금액이 실제로 결제되는 금액이에요.</p></div>`;
  },
  // 후기 부탁을 이미 했는지 (이 기기 기준, 쓰거나 '다음에'를 누르면 30일 동안 다시 묻지 않음)
  reviewAsked(set) {
    try { if (set) { localStorage.setItem('rvAsked', String(Date.now())); return true; } return Date.now() - Number(localStorage.getItem('rvAsked') || 0) < 30 * 864e5; } catch (e) { return false; }
  },
  faq(list) {
    return `<div class="faq">${list.map(f => `<details class="faq-item"><summary><span class="q">Q</span>${esc(f.q)}</summary><div class="faq-a">${esc(f.a)}</div></details>`).join('')}</div>`;
  },
  ratingBars(reviews) {
    const n = reviews.length || 1;
    return `<div class="rating-bars"><div class="rb-total">후기 ${reviews.length}개</div>${[4, 3, 2, 1].map(r => {
      const c = reviews.filter(x => x.rating === r).length; const pct = Math.round(c / n * 100);
      return `<div class="rb-row"><span class="rb-label">${['', '😢', '😐', '🙂', '😍'][r]} ${RATING_LABELS[r]}</span><div class="rb-bar"><i style="width:${pct}%"></i></div><span class="rb-pct">${pct}%</span><span class="rb-cnt">${c}명</span></div>`;
    }).join('')}</div>`;
  },
  reviewCard(r, admin = false) {
    return `<article class="review-card"><div class="rv-top"><span class="rv-rate r${r.rating}">${['', '😢', '😐', '🙂', '😍'][r.rating]} ${RATING_LABELS[r.rating]}</span>${r.sample ? '<span class="tag">예시</span>' : ''}
      ${admin ? `<button class="link-btn danger" data-delrev="${r.id}">삭제</button>` : ''}</div>
      <p>${esc(r.text)}</p><footer>${esc(r.name)} · ${esc(r.date)}</footer></article>`;
  },
  empty(icon, text, action = '') { return `<div class="empty"><div class="empty-ico">${icon}</div><p>${text}</p>${action}</div>`; },
  starsInfo() {
    return `<ul class="earn"><li>📚 레슨 마치기 <b>⭐1~3</b></li><li>📖 새 스토리 완독 <b>⭐2</b></li><li>🎤 말하기 80점 이상 <b>⭐1</b> <small>(하루 5개)</small></li><li>🎈 놀이터 게임 <b>⭐1~3</b> <small>(하루 6개)</small></li></ul>`;
  },
};

/* ---------- 📒 내 단어장 ---------- */
// 배운 단어·문장을 모두 모아 보고 듣는다. 망각 곡선 복습의 익힘 정도(box)로 단계를 보여준다.
const MASTERY = b => b >= 4 ? { k: 'master', label: '완전히 익힘', icon: '🌳' } : b >= 2 ? { k: 'good', label: '익숙해요', icon: '🌿' } : { k: 'new', label: '배우는 중', icon: '🌱' };
Views.words = el => {
  const p = Store.profile();
  const rows = Object.entries(p.srs || {}).map(([id, c]) => {
    const info = Gen.itemInfo(id); if (!info) return null;
    const it = info.it, m = MASTERY(c.box);
    const en = it.letter ? `${it.letter} ${it.letter.toLowerCase()} · ${it.words.map(w => w[0]).join(', ')}` : it.q ? `${it.q} — ${it.a}` : it.en;
    const say = it.letter ? letterLine(it) : it.q ? `${it.q} ${it.a}` : it.en;
    const ko = it.ko || (it.letter ? '알파벳' : '');
    return { id, en, say, ko, emoji: it.emoji || (it.letter ? it.emoji : '💬'), level: info.level, m, due: c.due, seen: c.seen || '' };
  }).filter(Boolean).sort((a, b) => (b.seen > a.seen ? 1 : -1));
  let filter = 'all', q = '';
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">📒 내 단어장 <small>${rows.length}개</small></h1>
    <p class="sec-desc left">레슨에서 배운 단어와 문장이 자동으로 모여요. 눌러서 들어 보고, 🌱→🌿→🌳 로 자라는 걸 확인해요.</p>
    <input class="search" type="search" placeholder="영어나 우리말로 찾기" aria-label="단어 찾기">
    <div class="chips filter">${[['all', '전체'], ['new', '🌱 배우는 중'], ['good', '🌿 익숙해요'], ['master', '🌳 완전히 익힘']].map(([k, t]) => `<button class="chip ${k === 'all' ? 'on' : ''}" data-f="${k}">${t} <small>${k === 'all' ? rows.length : rows.filter(r => r.m.k === k).length}</small></button>`).join('')}</div>
    <div class="word-list"></div>
  </div>`;
  const list = $('.word-list', el);
  const draw = () => {
    const shown = rows.filter(r => (filter === 'all' || r.m.k === filter) && (!q || (r.en + ' ' + r.ko).toLowerCase().includes(q.toLowerCase())));
    list.innerHTML = shown.length ? shown.map(r => `<button class="word-row" data-say="${esc(r.say)}">
      <span class="wr-pic">${pic(r.emoji)}</span><span class="wr-text"><b>${esc(r.en)}</b><small>${esc(r.ko)}</small></span>
      <span class="wr-meta"><span class="wr-m ${r.m.k}">${r.m.icon} ${r.m.label}</span><small>Level ${r.level} · 다음 복습 ${r.due.slice(5).replace('-', '/')}</small></span><span class="wr-play">🔊</span></button>`).join('')
      : UI.empty('📒', rows.length ? '찾는 단어가 없어요.' : '아직 단어장이 비어 있어요. 레슨을 하면 배운 단어가 모여요!', rows.length ? '' : '<a class="btn btn-primary" href="#/study">레슨 하러 가기</a>');
    $$('[data-say]', list).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
  };
  $('.search', el).oninput = e => { q = e.target.value.trim(); draw(); };
  $$('[data-f]', el).forEach(b => b.onclick = () => { filter = b.dataset.f; $$('[data-f]', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  draw();
};

/* ---------- 🧭 자유 학습 (Free Choice) ---------- */
Views.free = el => {
  const p = Store.profile(), w = Store.wordStats();
  const cards = [
    ['#/review', '🔁', '오늘의 복습', w.due ? `${w.due}개 기다려요` : '오늘은 끝!', '#4fc3f7'],
    ['#/words', '📒', '내 단어장', `${w.learned}개 모았어요`, '#ffd23f'],
    ['#/stories', '📖', '스토리북', `${Object.keys(p.stories).length}/${STORIES.length}권 읽음`, '#7ed957'],
    ['#/speak', '🎤', '말하기 연습', '발음 점수 받기', '#b388ff'],
    ['#/play/balloon', '🎈', '풍선 팡팡', `최고 ${(p.games || {}).balloon || 0}점`, '#ff8a65'],
    ['#/play/match', '🃏', '짝꿍 카드', `최고 ${(p.games || {}).match || 0}점`, '#4db6ac'],
    ['#/wrong', '✏️', '오답노트', `${p.wrong.length}문제`, '#f06292'],
    ['#/shop', '🛍️', '별 상점', `⭐ ${p.stars || 0}`, '#ffb74d'],
    ['#/worksheet/' + Store.currentLevel(), '🖨️', '워크시트', `Level ${Store.currentLevel()} 인쇄`, '#90a4ae'],
    ['#/leveltest', '🧪', '레벨 테스트', p.placed ? '다시 보기' : '출발 레벨 찾기', '#64b5f6'],
  ];
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">🧭 자유 학습</h1>
    ${UI.mascot('오늘은 뭐 하고 놀까? 하고 싶은 걸 골라 봐!')}
    <div class="free-grid">${cards.map(([h, e, t, d, c]) => `<a class="free-card" href="${h}" style="--c:${c}"><span>${ico(e)}</span><b>${t}</b><small>${esc(d)}</small></a>`).join('')}</div>
  </div>`;
};

// 📊 영역별 학습 분석 (부모 리포트)
UI.skillReport = p => {
  const now = Store.skillWeek(p, 0), prev = Store.skillWeek(p, 1), all = p.skills || {}, w = Store.wordStats(p);
  const pct = a => a && a[1] ? Math.round(a[0] / a[1] * 100) : null;
  const rows = Object.entries(SKILLS).map(([k, label]) => {
    const n = pct(now[k]), b = pct(prev[k]), total = pct(all[k]);
    const diff = n !== null && b !== null ? n - b : null;
    return { k, label, n, b, total, diff, count: (now[k] || [0, 0])[1] };
  });
  const scored = rows.filter(r => (r.n ?? r.total) !== null);
  const weak = scored.length ? scored.reduce((m, r) => ((r.n ?? r.total) < (m.n ?? m.total) ? r : m)) : null;
  const tips = { listen: '🔊 스토리북 "읽어주기"를 천천히로 들으며 단어를 짚어 주세요.', read: '📖 레슨의 뜻 고르기·빈칸 문제를 소리 내어 읽게 해 주세요.', speak: '🗣️ 스토리북 "따라 읽기"를 켜고 하루 한 권 따라 읽어요.', write: '✏️ 워크시트를 인쇄해 따라 쓰기를 해 보세요.' };
  const certs = Object.keys(p.certs || {});
  return `<div class="card skill-card">
    <h3>📊 영역별 학습 분석 <small>최근 7일 정답률 · 지난주와 비교</small></h3>
    <div class="skill-rows">${rows.map(r => `<div class="skill-row"><span class="sk-label">${r.label}</span>
      <div class="rb-bar"><i style="width:${r.n ?? r.total ?? 0}%"></i></div>
      <b>${r.n !== null ? r.n + '%' : r.total !== null ? r.total + '%' : '-'}</b>
      <small class="${r.diff > 0 ? 'up' : r.diff < 0 ? 'down' : ''}">${r.diff === null ? (r.n === null ? '이번 주 기록 없음' : '첫 주') : r.diff > 0 ? `▲ ${r.diff}` : r.diff < 0 ? `▼ ${-r.diff}` : '그대로'}</small></div>`).join('')}</div>
    <div class="word-stats"><div><b>${w.learned}</b><small>배운 단어·문장</small></div><div><b>${w.mastered}</b><small>완전히 익힘</small></div><div><b>${w.due}</b><small>오늘 복습할 것</small></div><div><b>${certs.length}</b><small>수료증</small></div></div>
    ${weak ? `<p class="tip">💡 <b>${weak.label}</b> 영역을 더 연습하면 좋아요. ${tips[weak.k]}</p>` : '<p class="fine">레슨을 하면 영역별 분석이 나와요.</p>'}
    ${certs.length ? `<p class="certs">🎓 ${certs.map(id => `<a href="#/certificate/${id}">${id}단계 ${esc(STAGES[id - 1].title)} 수료증</a>`).join(' · ')}</p>` : ''}
  </div>`;
};

// ✅ 할 수 있게 된 것 (부모 리포트): 진도율 대신, 레벨을 절반 넘게 한 곳마다 실제로 배운 글자·단어·문장으로 '할 수 있는 일'을 문장으로 보여 준다
UI.canDoReport = p => {
  const pick = (a, n) => a.slice(0, n);
  const lines = ALL_LEVELS.filter(lv => Store.lessonsDone(lv, p) >= Math.ceil(LESSONS_PER_LEVEL / 2)).map(lv => {
    const st = stageOf(lv), items = Gen.levelItems(lv), done = Store.lessonsDone(lv, p) >= LESSONS_PER_LEVEL;
    let t;
    if (st.id === 1) t = `알파벳 <b>${items[0].letter}~${items[items.length - 1].letter}</b> ${items.length}글자의 소리와 이름을 알아요 (예: ${items.slice(0, 3).map(x => `${x.letter} is for ${esc(x.word)}`).join(', ')})`;
    else if (st.id === 2) t = `<b>${pick(items, 3).map(x => esc(x.en)).join(', ')}</b> 같은 단어 ${items.length}개를 글자 소리를 이어 읽어요`;
    else if (items[0].q) t = `"${esc(items[0].q)}" 같은 질문을 듣고 "${esc(items[0].a)}"처럼 대답해요`;
    else t = `"${esc(items[0].en)}" 같은 ${esc(st.title)} 문장을 읽고 말해요`;
    return `<li><span class="level-box sm" style="--c:${st.color}">${lv}</span> ${t}${done ? '' : ' <small class="muted">(배우는 중)</small>'}</li>`;
  });
  return `<div class="card cando-card"><h3>✅ ${esc(p.name)}${GEN.hasBatchim(p.name) ? '이' : ''}가 할 수 있게 된 것</h3>
    ${lines.length ? `<ul class="cando-list">${lines.slice(-6).reverse().join('')}</ul>` : '<p class="fine">한 레벨을 절반 넘게 하면 아이가 할 수 있게 된 것을 여기에 적어 드려요.</p>'}</div>`;
};

// 🌱 보충이 필요한 내용 (부모 리포트): 다시 해 볼 레슨 · 자주 틀리는 단어·문장 · 쉬움으로 낮춘 레벨
UI.boostReport = p => {
  const lows = ALL_LEVELS.flatMap(lv => ((p.progress[lv] || {}).lessons || []).map((r, d) => r && r.score < Store.BOOST_BELOW ? { lv, d, score: r.score } : null).filter(Boolean));
  const weak = Object.entries(p.weak || {}).sort((a, b) => b[1].miss - a[1].miss || (a[1].last < b[1].last ? 1 : -1)).slice(0, 8);
  const eased = Object.entries(p.levelLow || {}).filter(([, n]) => n >= 2).map(([lv]) => lv);
  const none = !lows.length && !weak.length && !eased.length;
  return `<div class="card boost-report"><h3>🌱 보충이 필요한 내용</h3>
    ${none ? (p.wrong.length ? `<ul class="wrong-list small">${p.wrong.slice(0, 8).map(w => `<li>${esc(w.q.show || (w.q.say ? '🔊 ' + w.q.say : w.q.title))} → <b>${esc(w.q.type === 'tiles' ? w.q.answer.join(w.q.joiner) : w.q.answer)}</b></li>`).join('')}</ul>` : '<p>지금은 보충할 내용이 없어요 👏</p>') : ''}
    ${lows.length ? `<h4>🔁 다시 해 보면 좋은 레슨 <small>정답률 ${Store.BOOST_BELOW}% 미만</small></h4><ul class="wrong-list small">${lows.slice(-6).reverse().map(x => `<li>Level ${x.lv} · ${dayLabel(x.d)} <b>${x.score}%</b></li>`).join('')}</ul>` : ''}
    ${weak.length ? `<h4>✏️ 자주 틀리는 단어·문장 <small>다른 날 두 번 맞히면 빠져요</small></h4><ul class="wrong-list small">${weak.map(([id, w]) => `<li>${esc(Gen.itemLabel(id))} <small class="muted">· ${w.miss}번 틀림${w.boost ? ' · 🌱 보충 연습에서 맞힘' : ''}</small></li>`).join('')}</ul>
      <p class="fine">이 단어들은 '오늘의 복습'과 다음 레슨에 먼저 나와요.</p>` : ''}
    ${eased.length ? `<p class="tip">🐣 Level ${eased.join(', ')}은(는) 정답률이 연달아 낮아 쉬움(보기 2개·힌트)으로 하고 있어요. 80% 넘게 맞히면 보통으로 돌아가요.</p>` : ''}
  </div>`;
};

// 🎯 오늘 카드: 미션 3개와 망각 곡선 복습
UI.todayCard = () => {
  const m = Store.missions(), w = Store.wordStats();
  return `<div class="today-grid">
    <div class="card mission-card">
      <h3>🎯 오늘의 미션 <small>${m.list.filter(x => x.ok).length}/3</small></h3>
      <ul class="missions">${m.list.map(x => `<li class="${x.ok ? 'ok' : ''}"><span>${x.ok ? '✅' : x.icon}</span>${x.text}${x.id === 'speak' && !x.ok ? ` <small>(${m.progress.speak}/3)</small>` : ''}</li>`).join('')}</ul>
      ${m.claimed ? '<p class="fine">🎉 오늘 보상을 받았어요. 내일 또 만나요!</p>' : `<button class="btn ${m.all ? 'btn-primary pulse' : 'btn-ghost'} sm" data-claim ${m.all ? '' : 'disabled'}>🎁 보상 상자 ${m.all ? '열기' : '(미션을 모두 끝내면)'}</button>`}
    </div>
    <div class="card review-card-today">
      <h3>🔁 오늘의 복습</h3>
      <p class="big-num">${w.due}<small>개</small></p>
      <p class="fine">배운 단어·문장 ${w.learned}개 · 완전히 익힌 것 ${w.mastered}개<br>잊을 때쯤 다시 나와서 오래 기억해요 (1·3·7·14·30일 간격)</p>
      ${w.due ? '<a class="btn btn-primary sm" href="#/review">▶ 복습 시작</a>' : '<p class="fine">✅ 오늘 복습할 게 없어요!</p>'}
    </div></div>`;
};

// 🔁 망각 곡선 복습 세션
Views.review = el => {
  const due = Store.dueItems();
  if (!due.length) { el.innerHTML = `<div class="wrap sec narrow">${UI.empty('✅', '오늘 복습할 게 없어요. 레슨을 하면 복습할 단어가 생겨요!', '<a class="btn btn-primary" href="#/study">모험 지도</a>')}</div>`; return; }
  // 자주 틀린 항목(dueItems가 앞에 둔다)을 먼저 넣고, 나머지는 섞어서 채운다
  const weak = new Set(Store.weakIds()), top = due.slice(0, 20);
  const qs = shuffle(Gen.reviewQuestions([...shuffle(top.filter(id => weak.has(id))), ...shuffle(top.filter(id => !weak.has(id)))], 8));
  el.innerHTML = '<div class="wrap lesson-wrap"></div>';
  const root = $('.lesson-wrap', el);
  Lesson.run(root, qs, {
    title: `오늘의 복습 · ${due.length}개 중 ${qs.length}개`, difficulty: Store.difficulty(),
    onExit: () => (location.hash = '#/study'),
    onDone: r => {
      Store.finishReview(r);
      const left = Store.dueItems().length, score = Math.round(r.correct / r.total * 100);
      root.innerHTML = `<div class="result card anim-in"><div class="stamp">복습<br>완료</div><h2>${r.correct} / ${r.total} 정답 · ${score}%</h2>
        <p>맞힌 것은 더 오래 뒤에, 틀린 것은 내일 다시 나와요.${left ? ` 남은 복습 ${left}개` : ' 오늘 복습을 다 했어요! 🎉'}</p>
        <div class="row-center">${left ? '<a class="btn btn-primary" href="#/review" data-again>복습 더 하기</a>' : ''}<a class="btn btn-ghost" href="#/study">모험 지도</a></div></div>`;
      const again = $('[data-again]', root); if (again) again.onclick = e => { e.preventDefault(); App.route(); };
      Speech.sfx.cheer(); if (score >= 70) Lesson.confetti(); App.refreshHeader();
    },
  });
};

// 🎓 단계 수료증 (인쇄용)
Views.certificate = (el, stageId) => {
  const p = Store.profile(), st = STAGES[stageId - 1];
  if (!st || !p.certs || !p.certs[stageId]) { el.innerHTML = `<div class="wrap sec narrow">${UI.empty('🎓', '아직 받지 않은 수료증이에요. 단계의 모든 레벨을 마치면 받을 수 있어요.', '<a class="btn btn-primary" href="#/study">모험 지도</a>')}</div>`; return; }
  const items = st.levels.flatMap(lv => Gen.levelItems(lv));
  el.innerHTML = `<div class="wrap sec narrow">
    <div class="no-print row"><a class="link-btn" href="#/parent/report">← 부모페이지</a><button class="btn btn-primary" data-print>🖨️ 인쇄 / PDF 저장</button></div>
    <article class="certificate">
      <div class="cert-top"><img class="logo-inline" src="img/logo.svg" alt=""> 새싹스쿨</div>
      <h1>수 료 증</h1>
      <p class="cert-name">${esc(p.name)}</p>
      <p class="cert-body">위 어린이는 새싹영어 <b>${st.id}단계 「${esc(st.title)}」</b>의 레벨 ${st.levels.join('·')} 과정<br>${st.levels.length * LESSONS_PER_LEVEL}레슨을 모두 훌륭하게 마쳤기에 이 증서를 드립니다.</p>
      <p class="cert-learned">배운 내용: ${esc(st.skills.join(' · '))}</p>
      <p class="cert-learned">익힌 표현 ${items.length}개 · 예) ${esc(items.slice(0, 3).map(it => it.letter ? it.letter + ' is for ' + it.word : it.en || it.a).join(' / '))}</p>
      <p class="cert-date">${new Date(p.certs[stageId]).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <div class="cert-seal">🏅</div>
    </article></div>`;
  $('[data-print]', el).onclick = () => window.print();
};

// 🌱 새싹 나무 키우기 카드 (모험 지도)
UI.treeCard = () => {
  const t = Store.tree(), watered = Store.wateredToday();
  return `<div class="card tree-card">
    <div class="tree-pic ${watered ? 'happy' : ''}" aria-hidden="true">${t.emoji}</div>
    <div class="tree-info"><b>새싹 나무 · ${t.name}</b>
      <div class="rb-bar"><i style="width:${Math.round(t.pct * 100)}%"></i></div>
      <small>${t.next ? `다음 '${t.next.name}' ${t.next.emoji}까지 ${t.toNext}점` : '최고 단계! 🌈'} · 레슨 +10점, 챌린지·스토리·말하기로 더 자라요</small></div>
    <button class="btn ${watered ? 'btn-ghost' : 'btn-primary'} sm" data-water ${watered ? 'disabled' : ''}>${watered ? '💧 오늘 물 줬어요' : '💧 물 주기 +5'}</button>
  </div>`;
};

// 스토리북 그림: 쪽마다 배경(공원·집·농장·바다·비·눈·밤·우주…)을 그리고, 그림 친구들이 그 장면 땅 위에 서 있게 한다.
// 첫 그림이 주인공이라 크게, 영어 글자는 이름표로. 책마다 기본 장소가 있고, 문장에 비·눈·밤·바다·집 안이 나오면 그 장면으로 바꾼다.
const STORY_PLACE = { 1: 'park', 9: 'park', 17: 'shop', 18: 'park', 2: 'home', 10: 'road', 19: 'farm', 20: 'farm', 3: 'home', 11: 'home', 21: 'school', 22: 'farm',
  4: 'park', 12: 'shop', 23: 'home', 24: 'party', 5: 'rain', 13: 'park', 25: 'home', 26: 'snow', 6: 'home', 14: 'park', 27: 'home', 28: 'sea',
  7: 'park', 15: 'park', 29: 'park', 30: 'park', 8: 'sky', 31: 'sea', 16: 'space', 32: 'home' };
function placeOf(s, text) {
  const t = text.toLowerCase(), base = STORY_PLACE[s.id] || 'park';
  if (base === 'space' || base === 'sky') return base;
  if (/\bsnow|winter|snowball|snowman/.test(t)) return 'snow';
  if (/\b(rain|rained|umbrella|puddle|drops|raincoat|boots)\b/.test(t) && !/stopped/.test(t)) return 'rain';
  if (/\b(night|tonight|stars|owl|dark|hoo|slept|good night)\b/.test(t)) return 'night';
  if (/\b(beach|sea|sand|sandcastle|crab|lake|pool|ocean)\b/.test(t)) return 'sea';
  if (/\b(home|house|kitchen|bed|sofa|bathroom|bath|room|inside|door|window|poster|diary)\b/.test(t)) return /school|shop/.test(base) ? base : 'home';
  if (/\b(garden|park|outside|hill|tree|zoo|farm|grass|picnic)\b/.test(t) && /home|school|shop|party|rain/.test(base)) return 'park';
  if (/sun is out|bright and blue|rainbow/.test(t)) return 'park';
  return base;
}
const SCENE_DECO = { park: ['☀️ s1', '☁️ c1', '☁️ c2', '🌳 g1', '🌼 g2'], farm: ['☀️ s1', '☁️ c1', '🌾 g1', '🌾 g2'], road: ['☁️ c1', '☁️ c2', '🌳 g1'],
  home: ['🪟 w1', '🖼️ w2', '🪴 g1'], party: ['🎈 w1', '🎉 w2', '🎈 g2'], school: ['🕘 w2', '🪴 g1'], shop: ['🛒 g1', '🏷️ w2'],
  sea: ['☀️ s1', '☁️ c1', '⛵ w3'], rain: ['☁️ c1', '☁️ c2', '☁️ c3'], snow: ['❄️ f1', '❄️ f2', '❄️ f3', '🌲 g1'], night: ['🌙 s1', '✨ f1', '⭐ f2', '✨ f3'],
  space: ['🪐 s1', '✨ f1', '⭐ f2', '✨ f3'], sky: ['☁️ c1', '☁️ c2', '☁️ c3'] };
const sceneHtml = (pic, place = 'park') => {
  const parts = pic.split(' ');
  const deco = (SCENE_DECO[place] || []).map(d => d.split(' ')).filter(([e]) => !parts.includes(e));
  return `<div class="story-art scene-${place}"><div class="ground"></div>${deco.map(([e, c]) => `<span class="deco ${c}">${e}</span>`).join('')}
    <div class="actors ${parts.length === 1 ? 'solo' : ''}">${parts.map((x, i) => `<span class="${/^[A-Za-z]+$/.test(x) ? 'tag' : i === 0 ? 'main' : ''}" style="animation-delay:${i * 0.15}s">${esc(x)}</span>`).join('')}</div></div>`;
};
// 🧩 이야기 순서 맞추기: 연속된 4쪽을 섞어 놓고 차례대로 고르기
function storyOrder(box, s) {
  const start = Math.floor(Math.random() * (s.pages.length - 3));
  const pages = s.pages.slice(start, start + 4).map((pg, k) => ({ k, text: pg[0], pic: pg[1], img: storyPic(s.id, start + k) }));
  const cards = shuffle(pages);
  let picked = [];
  const draw = () => {
    box.innerHTML = `<div class="order-game anim-in"><h3>🧩 일어난 순서대로 눌러요</h3>
      <div class="order-line">${pages.map((_, k) => `<span class="order-slot">${picked[k] !== undefined ? (pages[picked[k]].img ? `${k + 1} <img class="order-thumb" src="${pages[picked[k]].img}" alt="">` : `${k + 1}. ${pages[picked[k]].pic.split(' ')[0]}`) : k + 1}</span>`).join('')}</div>
      <div class="order-cards">${cards.map(c => `<button class="order-card" data-k="${c.k}" ${picked.includes(c.k) ? 'disabled' : ''}><span>${c.img ? `<img class="order-pic" src="${c.img}" alt="" draggable="false">` : c.pic}</span>${esc(c.text)}</button>`).join('')}</div>
      <div class="row-center"><button class="btn btn-ghost sm" data-reset>처음부터</button></div></div>`;
    box.querySelectorAll('.order-card').forEach(b => b.onclick = () => { Speech.speak(pages[+b.dataset.k].text); picked.push(+b.dataset.k); picked.length === pages.length ? check() : draw(); });
    box.querySelector('[data-reset]').onclick = () => { picked = []; draw(); };
  };
  const check = () => {
    const ok = picked.every((k, i) => k === i);
    let got = 0;
    if (ok && Store.profile()) { got = Store.addStars(1, 'order', 3); Store.addXp(5); }
    box.innerHTML = `<div class="order-game anim-in"><div class="pic">${ok ? '🏆' : '🤔'}</div><h3>${ok ? '순서를 모두 맞혔어요!' : '조금 달라요. 이야기를 떠올려 볼까요?'}</h3>
      <ol class="order-answer">${pages.map(p => `<li>${p.pic} ${esc(p.text)}</li>`).join('')}</ol>
      ${got ? '<p>⭐ 별 1개 획득!</p>' : ''}
      <div class="row-center">${ok ? '' : '<button class="btn btn-primary" data-retry>다시 해보기</button>'}<a class="btn btn-ghost" href="#/stories">다른 책</a></div></div>`;
    ok ? (Speech.sfx.cheer(), Lesson.confetti()) : Speech.sfx.wrong();
    const r = box.querySelector('[data-retry]'); if (r) r.onclick = () => { picked = []; draw(); };
  };
  draw();
}

/* ---------- 홈 ---------- */
Views.home = el => {
  const u = Store.user();
  // 예시 후기는 빼고, 실제 회원이 남긴 후기 중 '매우 좋아요'(4점)만 최신순으로 보여준다
  const realReviews = Store.reviews().filter(r => !r.sample);
  const bestReviews = realReviews.filter(r => r.rating === 4).slice(0, 3);
  const cta = u ? '#/study' : '#/signup';
  el.innerHTML = `
  <section class="hero">
    <div class="clouds" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="wrap hero-inner">
      <div class="hero-text">
        <span class="eyebrow">5~10세 · 하루 15분 · 엄마표 영어를 대신해요</span>
        <h1>엄마가 영어를 몰라도,<br>아이가 <mark>혼자</mark> 끝내는 영어</h1>
        <p>레벨 진단으로 매일 할 레슨이 정해지고, 아이는 놀이처럼 듣고 말하고 읽어요. 부모님은 옆에 앉아 있지 않아도 돼요. 오늘 무엇을 할 수 있게 됐는지는 리포트로 받아요.</p>
        <div class="row">
          <a class="btn btn-primary lg" href="#/sample/A">▶ 가입 없이 3분 체험</a>
          <a class="btn btn-ghost lg" href="#/leveltest">🧪 무료 레벨 진단</a>
        </div>
        <ul class="trust"><li>✅ ${FREE().name}은 평생 무료</li><li>✅ 다음 단계도 7일 무료 체험</li><li>✅ 부모님이 옆에 없어도 아이 혼자 끝까지</li><li>✅ 스토리북 ${STORIES.length}권을 또박또박 읽어줘요</li></ul>
      </div>
      <div class="card mini-quiz tilt" id="miniQuiz" aria-label="지금 바로 풀어보는 문제"></div>
    </div>
  </section>

  <section class="wrap sec">
    <h2 class="sec-title">이런 고민, 있으셨죠?</h2>
    <div class="worry-grid">
      ${[['😩', '영어만 하자고 하면 도망가요', '🎈', '게임·스티커·별 모으기로 아이가 먼저 하자고 해요'],
         ['🤷', '집에서 뭘 어떻게 가르쳐야 할지 모르겠어요', '🗺️', '레벨 진단 후 매일 할 레슨이 정해져요. 버튼 하나만 누르면 돼요'],
         ['🗣️', '읽기는 해도 입 밖으로 말을 못 해요', '🎤', '말하면 단어마다 발음을 짚어주고 칭찬해줘요'],
         ['⏰', '바빠서 옆에서 봐줄 시간이 없어요', '📊', '아이 혼자 끝까지 하고, 결과는 부모님 리포트로 받아요']]
        .map(([a, q, b, ans]) => `<div class="worry card"><p class="w-q"><span>${a}</span>${q}</p><p class="w-a"><span>${b}</span>${ans}</p></div>`).join('')}
    </div>
  </section>

  <section class="band"><div class="wrap sec">
    <h2 class="sec-title">꾸준히 하면 이렇게 자라요</h2>
    <p class="sec-desc">눌러서 아이가 하게 될 말을 들어보세요.</p>
    <ol class="grow">
      ${[['🔤', '알파벳 소리', '대소문자와 첫소리를 알아요', 'A is for apple.'], ['🐱', '단어 읽기', '파닉스로 처음 보는 단어도 읽어요', 'c, a, t. cat!'],
         ['💬', '문장 말하기', '묻고 대답하며 대화해요', 'My name is Mia. I am seven.'], ['📖', '내 이야기', '어제 한 일, 내 꿈을 영어로 말해요', 'Yesterday I went to the park. I will be a doctor.']]
        .map(([e, t, d, say], k) => `<li><button class="grow-step" data-say="${esc(say)}"><span class="g-n">${k + 1}</span><span class="g-e">${e}</span><b>${t}</b><small>${d}</small><em>🔊 “${esc(say)}”</em></button></li>`).join('')}
    </ol>
    <p class="center fine">8단계 26레벨 · 레슨 ${TOTAL_LESSONS}개 · 하루 1레슨(주 5일)이면 ${durationText(studyWeeks(TOTAL_LESSONS))}, 하루 2레슨이면 ${durationText(studyWeeks(TOTAL_LESSONS, 2))} 과정</p>
    <div class="center"><a class="btn btn-ghost" href="#/study">📚 학습 내용 자세히 보기</a></div>
  </div></section>

  <section class="wrap sec two-col">
    <div>
      <h2 class="sec-title left">부모님은 확인만 하세요</h2>
      <ul class="check-list big">
        <li>레슨을 마치면 바로 학습 알림</li>
        <li>정답률·학습 시간·발음 점수를 한눈에</li>
        <li>약한 단어와 문장은 자동으로 복습</li>
        <li>레벨별 워크시트 바로 인쇄</li>
      </ul>
      <p class="fine">카카오톡 연동 없이 부모페이지에서 언제든 볼 수 있어요.</p>
    </div>
    <div class="card report-preview" aria-label="부모 리포트 예시">
      <span class="sticker-label">예시 화면</span>
      <div class="rp-head"><span class="avatar">🐰</span><div><b>하린이의 이번 주</b><small>Level C · 파닉스 시작섬</small></div></div>
      <div class="rp-kpis"><div><b>🔥 5일</b><small>연속 학습</small></div><div><b>86%</b><small>정답률</small></div><div><b>72분</b><small>학습 시간</small></div></div>
      <div class="rp-bars">${[8, 12, 0, 15, 10, 14, 13].map((m, k) => `<div><i style="height:${m / 15 * 100}%"></i><small>${'월화수목금토일'[k]}</small></div>`).join('')}</div>
      <div class="rp-noti">📚 하린이가 Level C Day 2를 완료했어요! 정답률 88%</div>
    </div>
  </section>

  <section class="band"><div class="wrap sec two-col">
    <div class="card speak-demo" id="speakDemo"></div>
    <div>${UI.mascot('마이크 버튼을 누르고 따라 말해봐! 단어마다 초록·노랑·빨강으로 알려줄게.', '🌱')}
      <h3 class="sec-sub">AI 발음 코치, 지금 해보세요</h3>
      <p class="sec-desc left">아이 목소리에 맞춰 너그럽게 채점해서 자신감부터 키워요.</p></div>
  </div></section>

  <section class="wrap sec two-col">
    <div>
      <h2 class="sec-title left">부모님들의 ‘매우 좋아요’ 후기</h2>
      ${realReviews.length ? UI.ratingBars(realReviews) : `<p class="sec-desc left">새싹스쿨은 막 문을 연 서비스라 후기를 모으고 있어요. 대신 결제 전에 직접 확인해 보실 수 있게 해 두었어요.</p>
      <ul class="trust-list"><li>🌱 ${FREE().name}(${FREE().range})은 <b>평생 무료</b>, 다음 단계는 <b>7일 무료 체험</b>으로 써 봐요</li>
        <li>🧾 카드 등록·자동결제 없이 <b>한 번만 결제</b>하는 이용권이에요</li>
        <li>↩️ 결제 후 7일 이내·플러스 학습 전이면 부모페이지에서 바로 <b>전액 환불</b></li>
        <li>🏢 사업자등록·통신판매업 신고를 마친 사업자예요 (맨 아래 사업자 정보)</li>
        <li>📞 고객센터 010-5117-1247 · support@saessakschool.co.kr · <a href="${KAKAO_CHANNEL.chat}" target="_blank" rel="noopener">💬 카카오톡 채널 문의</a></li></ul>`}
      <div class="row"><a class="btn btn-ghost" href="#/reviews">후기 전체 보기</a>${u ? '<a class="btn btn-ghost" href="#/reviews">✍️ 후기 남기기</a>' : ''}</div>
    </div>
    <div class="review-stack">${bestReviews.length ? bestReviews.map(r => UI.reviewCard(r)).join('')
      : `<div class="card empty-review"><div class="empty-ico">💌</div><p>첫 번째 ‘매우 좋아요’ 후기를 기다리고 있어요.</p><a class="btn btn-primary" href="${u ? '#/reviews' : '#/signup'}">${u ? '후기 남기기' : '7일 무료로 써 보기'}</a></div>`}</div>
  </section>

  <section class="wrap sec final-cta">
    <div class="card cta-card">
      <div class="cta-emoji" aria-hidden="true">🌱🐰🎈</div>
      <h2>오늘 저녁 15분, 아이와 함께 시작해보세요</h2>
      <p>${FREE().name}은 평생 무료예요. 다음 단계는 7일 동안 무료로 체험할 수 있고, 자동으로 결제되지 않아요.</p>
      <div class="row-center"><a class="btn btn-primary lg" href="${cta}">${u ? '📚 학습하러 가기' : '🌱 무료로 시작하기'}</a><a class="btn btn-ghost lg" href="#/pricing">💰 요금·할인 보기</a></div>
    </div>
  </section>`;

  $$('[data-say]', el).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
  UI.miniQuiz($('#miniQuiz', el));
  Views.speakWidget($('#speakDemo', el), ['I like apples.', 'This is a cat.', 'How are you?', 'I will be a doctor.'], false);
};

// 홈 히어로: 가입 없이 바로 푸는 3문제
UI.miniQuiz = box => {
  let n = 0, right = 0, asked = [];
  // 그림만 보고 헷갈리지 않는 단어만 쓴다
  const CLEAR = ['apple', 'ball', 'cat', 'dog', 'egg', 'fish', 'hat', 'lion', 'moon', 'pig', 'sun', 'bus', 'cup', 'fox', 'bed', 'whale', 'zebra', 'tiger', 'rabbit', 'cheese', 'ship', 'chick'];
  const pool = PICTURE_WORDS.filter(w => CLEAR.includes(w.en));
  const draw = () => {
    if (n >= 3) {
      box.innerHTML = `<span class="sticker-label">바로 해보기</span><div class="mq-done anim-in"><div class="mq-big">${right === 3 ? '🏆' : '🌟'}</div>
        <h3>${right}개 맞혔어요!</h3><p>이런 문제를 놀이처럼 하루 8개씩 풀어요.</p>
        <a class="btn btn-primary full" href="#/sample/A">▶ 3분 체험 레슨 이어하기</a><button class="link-btn" data-again>다시 풀기</button></div>`;
      $('[data-again]', box).onclick = () => { n = 0; right = 0; asked = []; draw(); };
      if (right >= 2) Lesson.confetti();
      return;
    }
    // 방금 문제와 같은 단어는 다시 내지 않는다
    const left = pool.filter(w => !asked.includes(w.en)), ans = left[Math.floor(Math.random() * left.length)] || pool[0];
    asked.push(ans.en);
    const opts = shuffle([ans, ...pictureOthers(pool, 2, ans)]);
    box.innerHTML = `<span class="sticker-label">바로 해보기 ${n + 1}/3</span>
      <p class="mq-q">소리를 듣고 그림을 골라요</p>
      <button class="mq-play" aria-label="다시 듣기">🔊</button>
      <div class="mq-opts">${opts.map(o => `<button class="mq-opt" data-en="${esc(o.en)}" aria-label="${esc(o.en)}">${pic(o.emoji)}</button>`).join('')}</div>
      <p class="mq-fb" aria-live="polite">눌러서 들어보세요 👆</p>`;
    const play = () => Speech.speak(ans.en);
    $('.mq-play', box).onclick = play;
    if (n > 0) Speech.speakLater(ans.en, 300); // 첫 문제는 아이가 직접 🔊를 누르게 한다
    $$('.mq-opt', box).forEach(b => b.onclick = () => {
      const ok = b.dataset.en === ans.en;
      $$('.mq-opt', box).forEach(x => { x.disabled = true; if (x.dataset.en === ans.en) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong'); else right++;
      ok ? Speech.sfx.correct() : Speech.sfx.wrong();
      $('.mq-fb', box).innerHTML = `${ok ? '정답! 👏' : '아쉬워요!'} <b>${esc(ans.en)}</b>`;
      Speech.speakLater(ans.en, 300);
      setTimeout(() => { if (document.body.contains(box)) { n++; draw(); } }, 1400); // 다른 화면으로 가면 멈춘다
    });
  };
  draw();
};

/* 말하기 위젯 (홈 데모 + AI 말하기 공용) */
Views.speakWidget = (box, sentences, record = true) => {
  let k = 0;
  const draw = () => {
    const s = sentences[k];
    box.innerHTML = `<div class="sw-head"><span class="chip">🎤 AI 발음 코치</span><button class="link-btn" data-next>다른 문장 ↻</button></div>
      <div class="speak-target big">${words(s).map(w => `<span>${esc(w)}</span>`).join(' ')}</div>
      <div class="speak-result" aria-live="polite"></div>
      <div class="row-center"><button class="btn btn-ghost" data-listen>🔊 듣기</button><button class="btn btn-ghost" data-slow>🐢 천천히</button>
      ${Speech.canListen ? '<button class="btn btn-primary mic" data-mic>🎤 말하기</button>' : Speech.canRecord ? '<button class="btn btn-primary mic" data-rec>🎙️ 녹음해서 비교하기</button>' : ''}</div>
      ${Speech.canListen ? '' : Speech.canRecord
        ? '<p class="hint mic-hint">🎙️ 이 브라우저는 점수를 매길 수 없어서, 내 목소리를 녹음해 원어민 소리와 비교해 들어요. 점수는 Safari(아이폰·아이패드)나 Chrome(컴퓨터·안드로이드)에서 받을 수 있어요.</p>'
        : `<p class="hint mic-hint">🎤 ${esc(Speech.unsupportedReason())}</p>`}`;
    $('[data-next]', box).onclick = () => { k = (k + 1) % sentences.length; draw(); };
    $('[data-listen]', box).onclick = () => Speech.speak(s);
    $('[data-slow]', box).onclick = () => Speech.speak(s, { slow: true });
    // 점수를 못 매기는 브라우저: 녹음해서 내 목소리와 원어민 소리를 번갈아 듣기
    const rec = $('[data-rec]', box);
    if (rec) rec.onclick = async () => {
      if (rec.classList.contains('rec')) return Speech.stopRecording(); // 한 번 더 누르면 멈춤
      rec.classList.add('rec'); rec.textContent = '🎙️ 녹음 중… 다 말하면 저절로 멈춰요';
      const res = $('.speak-result', box);
      try {
        const wav = await Speech.record();
        if (!wav) throw new Error('no-speech');
        const url = URL.createObjectURL(wav);
        res.innerHTML = `<div class="row-center"><button class="btn btn-ghost" data-mine>▶ 내 목소리</button><button class="btn btn-ghost" data-native>🔊 원어민</button></div>
          <div class="hint">두 소리를 번갈아 들어 보고, 다른 부분을 다시 말해 봐요.</div>`;
        let mine = null;
        $('[data-mine]', res).onclick = () => { Speech.stop(); if (mine) mine.pause(); mine = new Audio(url); mine.play().catch(() => {}); };
        $('[data-native]', res).onclick = () => { if (mine) mine.pause(); Speech.speak(s); };
        if (record && Store.profile()) Store.bumpDaily && Store.bumpDaily('speak');
      } catch (e) {
        res.innerHTML = `<div class="hint mic-hint">${esc(Speech.micHelp(e.name === 'NotAllowedError' ? 'not-allowed' : e.message))}</div>`;
      }
      rec.classList.remove('rec'); rec.textContent = '🎙️ 다시 녹음하기';
    };
    const mic = $('[data-mic]', box);
    if (mic) mic.onclick = async () => {
      if (mic.classList.contains('rec')) return Speech.stopRecording(); // 녹음 방식이면 한 번 더 눌러 멈출 수 있다
      mic.classList.add('rec'); mic.textContent = '⏳ 마이크 준비 중…';
      if (!Speech.usesServerStt) mic.disabled = true;
      const res = $('.speak-result', box);
      const onStart = () => { mic.textContent = Speech.usesServerStt ? '🎙️ 지금 말해요! 다 말하면 저절로 멈춰요' : '🎙️ 지금 말해요!'; };
      try {
        const r = Speech.score(s, await Speech.listen({ hint: s, onStart, onThinking: () => { mic.disabled = true; mic.textContent = '🤔 점수를 매기는 중…'; } }));
        $$('.speak-target span', box).forEach((sp, j) => { const w = r.words[j]; if (w) sp.className = w.ok === 1 ? 'ok' : w.ok ? 'mid' : 'no'; });
        const miss = r.words.filter(w => w.ok < 1).map(w => w.w);
        let got = 0;
        if (record && Store.profile()) got = Store.recordSpeaking(s, r.score);
        res.innerHTML = `<div class="score-pill ${scoreClass(r.score)}">${r.score}점</div><div class="heard">들은 말: "${esc(r.heard)}"</div>
          <div class="hint">${miss.length ? `<b>${miss.map(esc).join(', ')}</b>을(를) 다시 들어보고 말해봐요.` : '완벽해요! 🌟'}${got ? ' · ⭐ 별 1개 획득!' : ''}</div>`;
        if (r.score >= 80) Speech.sfx.correct();
      } catch (e) {
        res.innerHTML = `<div class="hint mic-hint">${esc(Speech.micHelp(e.message))}${e.detail ? ` <small class="fine">(${esc(e.detail)})</small>` : ''}</div>`;
      }
      mic.disabled = false; mic.classList.remove('rec'); mic.textContent = '🎤 다시 말하기';
    };
  };
  draw();
};

/* ---------- 학습하기 (처음 오신 분 / 전체 학습 내용) ---------- */
Views.study = (el, params) => {
  const u = Store.user(), p = Store.profile(), a = Store.access();
  // 학습 중인 아이가 있으면 바로 모험 지도로
  if (u && p && a.ok && params.get('view') !== 'all') return Views.learn(el);
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">📚 학습하기</h1>
    ${u && !p ? `<div class="card status-card">👶 아이 프로필을 만들면 바로 학습을 시작할 수 있어요. <a href="#/profiles">프로필 만들기 →</a></div>` : ''}

    ${u && p && a.ok ? `<div class="card status-card">📍 ${esc(p.name)}의 학습은 <a href="#/study">모험 지도</a>에서 이어갈 수 있어요.</div>` : ''}
    <div class="start-3">
      <a class="start-card" href="#/sample/A" style="--c:#ffd23f"><span>▶</span><b>3분 체험 레슨</b><small>가입 없이 알파벳 레슨 5문제</small></a>
      <a class="start-card" href="#/leveltest" style="--c:#7fd3ff"><span>${ico('🧪')}</span><b>무료 레벨 진단</b><small>섬마다 6~8문제로 출발 레벨 찾기</small></a>
      <a class="start-card" href="${u ? (p ? '#/study' : '#/profiles') : '#/signup'}" style="--c:#7ed957"><span>${ico('🌱')}</span><b>${u ? '내 학습 시작' : '무료로 시작'}</b><small>${u ? '진도·별·리포트가 저장돼요' : `${FREE().name} 평생 무료`}</small></a>
    </div>

    <h2 class="sec-sub">하루 학습은 이렇게 해요</h2>
    <ol class="day-flow">
      ${[['1', '🗺️', '지도에서 오늘 레슨 누르기'], ['2', '🎧', '듣고 · 고르고 · 따라 쓰고 · 말하기 8문제'], ['3', '⭐', '별 받고 스티커 모으기'], ['4', '📊', '부모님께 학습 알림 도착']]
        .map(([n, e, t]) => `<li><span class="df-n">${n}</span><span class="df-e">${e}</span><b>${t}</b></li>`).join('')}
    </ol>

    <h2 class="sec-sub">전체 과정은 얼마나 걸리나요?</h2>
    <p class="sec-desc left">8단계 26레벨, 레벨마다 10일(9일 학습 + 1일 복습)이라 모두 <b>${TOTAL_LESSONS}레슨</b>이에요. 레슨 하나는 8문제, 10~15분이에요.</p>
    <div class="table-wrap"><table class="table duration-table">
      <thead><tr><th>학습 속도 (주 5일)</th><th>한 레벨</th><th>전체 과정</th></tr></thead>
      <tbody>${[[1, '추천 · 무리 없이 꾸준히'], [2, '빠르게']].map(([n, t]) => `<tr><th>하루 ${n}레슨 <small>${t}</small></th><td>${durationText(studyWeeks(LESSONS_PER_LEVEL, n))}</td><td><b>${durationText(studyWeeks(TOTAL_LESSONS, n))}</b></td></tr>`).join('')}
      <tr><th>주 3일 · 하루 1레슨</th><td>${durationText(studyWeeks(LESSONS_PER_LEVEL, 1, 3))}</td><td><b>${durationText(studyWeeks(TOTAL_LESSONS, 1, 3))}</b></td></tr></tbody></table></div>
    <p class="fine">레벨 진단으로 중간 단계에서 시작하면 그만큼 짧아져요. 스토리북·놀이터·말하기는 레슨과 별도로 자유롭게 해요.</p>

    <h2 class="sec-sub">단계별 학습 내용 <small>레벨을 누르면 배우는 내용과 체험 레슨이 나와요</small></h2>
    <div class="az-grid">${STAGES.map(s => s.levels.map(l => `<button class="az" data-lv="${l}" style="--c:${s.color}"><b>${l}</b><small>${s.title}</small></button>`).join('')).join('')}</div>
    <div class="card lv-detail" id="lvDetail"></div>

    <h2 class="sec-sub">8단계 한눈에 보기</h2>
    ${UI.stageCarousel('curCar')}

    <h2 class="sec-sub">학습 방법</h2>
    <div class="grid3">
      <div class="card feat"><span class="feat-ico">🎯</span><h4>딱 맞는 난이도</h4><p>정답률에 따라 보기 수와 힌트가 자동으로 바뀌어 너무 쉽지도 어렵지도 않아요.</p></div>
      <div class="card feat"><span class="feat-ico">📖</span><h4>단계마다 스토리북</h4><p>읽어주는 소리에 맞춰 단어가 반짝이고, 단어를 누르면 소리를 들어요.</p></div>
      <div class="card feat"><span class="feat-ico">🎈</span><h4>놀이터 & 별 상점</h4><p>풍선·카드 게임으로 복습하고, 모은 별로 스티커와 꾸미기 아이템을 사요.</p></div>
    </div>
  </div>`;
  UI.wireCarousel($('#curCar', el));
  const detail = $('#lvDetail', el);
  const show = lv => {
    $$('.az', el).forEach(b => b.classList.toggle('on', b.dataset.lv === lv));
    const s = stageOf(lv), items = Gen.levelItems(lv);
    const label = it => it.letter ? `${it.emoji} ${it.letter}${it.letter.toLowerCase()} · ${it.words.map(w => w[0]).join(', ')}` : it.q ? `${it.q} → ${it.a}` : `${it.emoji || ''} ${it.en}`;
    const sayOf = it => it.letter ? letterLine(it) : it.q ? `${it.q} ${it.a}` : it.en;
    detail.innerHTML = `<div class="lvd-head"><span class="level-box" style="--c:${s.color}">${lv}</span><div><b>${s.id}단계 · ${s.title}</b><p>${s.desc}</p></div>
      <button class="btn btn-primary" data-sample>▶ 이 레벨 체험하기</button></div>
      <div class="lvd-items">${items.map(it => `<button class="sample-chip" data-say="${esc(sayOf(it))}">${esc(label(it))} 🔊</button>`).join('')}</div>`;
    $$('[data-say]', detail).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
    $('[data-sample]', detail).onclick = () => App.sampleLesson(lv);
  };
  $$('.az', el).forEach(b => b.onclick = () => show(b.dataset.lv));
  show('A');
};

/* ---------- 사용 후기 ---------- */
Views.reviews = el => {
  let filter = 0, shown = 6;
  const admin = Store.isAdmin();
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">💬 이용 후기</h1>
    <div class="two-col top"><div class="card"><div id="bars"></div></div>
    <form class="card review-form" id="rvForm">
      <h3>후기 남기기</h3>
      ${Store.user() ? `<div class="rate-pick">${[4, 3, 2, 1].map(r => `<label><input type="radio" name="rating" value="${r}" ${r === 4 ? 'checked' : ''}><span>${['', '😢', '😐', '🙂', '😍'][r]} ${RATING_LABELS[r]}</span></label>`).join('')}</div>
      <input name="name" maxlength="20" placeholder="표시 이름 (예: 7살 하린 보호자)" required>
      <textarea name="text" rows="3" maxlength="400" placeholder="좋았던 점, 아쉬운 점을 알려주세요. 개선에 반영할게요!" required></textarea>
      <button class="btn btn-primary">등록하기</button>` : `<p>후기를 쓰려면 로그인해 주세요.</p><a class="btn btn-primary" href="#/login?next=/reviews">로그인</a>`}
    </form></div>
    <div class="chips filter">${[0, 4, 3, 2, 1].map(r => `<button class="chip ${r === 0 ? 'on' : ''}" data-f="${r}">${r ? RATING_LABELS[r] : '전체'}</button>`).join('')}</div>
    <div class="review-grid" id="rvList"></div>
    <div class="center"><button class="btn btn-ghost" id="more">후기 더보기</button></div>
  </div>`;
  const draw = () => {
    const all = Store.reviews();
    $('#bars', el).innerHTML = UI.ratingBars(all);
    const list = all.filter(r => !filter || r.rating === filter);
    $('#rvList', el).innerHTML = list.slice(0, shown).map(r => UI.reviewCard(r, admin)).join('') || UI.empty('📝', '아직 후기가 없어요.');
    $('#more', el).hidden = list.length <= shown;
    $$('[data-delrev]', el).forEach(b => b.onclick = async () => { if (confirm('이 후기를 삭제할까요?')) { await Store.deleteReview(b.dataset.delrev).catch(x => App.toast(x.message)); draw(); } });
  };
  $$('[data-f]', el).forEach(b => b.onclick = () => { filter = +b.dataset.f; shown = 6; $$('[data-f]', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  $('#more', el).onclick = () => { shown += 6; draw(); };
  const f = $('#rvForm', el);
  f.onsubmit = async e => {
    e.preventDefault(); if (!Store.user()) return;
    const d = new FormData(f);
    try { await Store.addReview({ rating: +d.get('rating'), name: d.get('name').trim(), text: d.get('text').trim() }); }
    catch (x) { return App.toast(x.message); }
    f.reset(); UI.reviewAsked(true); App.toast('후기가 등록되었어요. 고마워요! 💚'); draw();
  };
  draw();
};

/* ---------- 요금·할인 ---------- */
Views.pricing = (el, params) => {
  const u = Store.user(), a = Store.access();
  const pct = r => Math.round(r * 100) + '%', F = FREE();
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">💰 요금·할인</h1>
    ${u ? `<div class="card status-card">${statusText(a, u)} ${a.kind === 'member' ? '<a href="#/parent/member">멤버십 보기 →</a>' : ''}</div>` : ''}
    ${params && params.get('error') ? `<div class="card notice error-card">⚠️ 결제를 완료하지 못했어요: ${esc(params.get('error'))}</div>` : ''}

    <div class="free-plan card">
      <div><span class="chip">무료</span><h2>${F.name}은 평생 무료</h2>
        <p>${F.range}(${F.levels}, <b>${F.lessons}레슨</b>)와 스토리북 ${F.books}권, 놀이터·말하기 연습·부모 리포트까지 <b>기간 제한 없이 무료</b>예요.
        아이가 ${F.plusFrom}에 들어갈 때 <b>7일 무료 체험</b>을 시작할 수 있어요. 카드 등록도 자동결제도 없어요.</p></div>
      <a class="btn btn-primary lg" href="${u ? '#/study' : '#/signup'}">${u ? '📚 학습하러 가기' : '🌱 무료로 시작하기'}</a>
    </div>

    ${UI.discountRules()}

    <h2 class="sec-sub">💎 플러스에 들어 있는 것 <small>하루 약 ${won(Math.round(lowestMonthly() / 30 / 10) * 10)} (12개월 기준)</small></h2>
    <div class="value-grid">${[
      ['📚', '1년 커리큘럼', `8단계 26레벨 ${TOTAL_LESSONS}레슨 · 미국 킨더~초2 수준`],
      ['🔁', '망각 곡선 복습', '배운 단어·문장을 1·3·7·14·30일에 다시 꺼내 오래 기억'],
      ['📊', '영역별 분석 리포트', '듣기·읽기·말하기·쓰기 정답률, 주간 변화, 맞춤 추천'],
      ['🎤', 'AI 발음 코치', '단어마다 초록·노랑·빨강으로 발음 피드백'],
      ['📖', `스토리북 ${STORIES.length}권`, '천천히·한 단어씩 읽어주기, 노래방식 따라 읽기, 순서 맞추기'],
      ['🎮', '게임으로 학습', '⚡ 레슨 중 챌린지, 🔥 콤보, 🏅 배지 26개, 🌱 새싹 나무'],
      ['🎯', '매일 미션', '레슨·복습·말하기 미션과 보상 상자로 매일 습관'],
      ['🎓', '단계 수료증 · 워크시트', '단계를 마칠 때마다 수료증, 레벨별 인쇄 워크시트'],
    ].map(([i, t, d]) => `<div class="value-item"><span>${i}</span><b>${t}</b><small>${d}</small></div>`).join('')}</div>

    <h2 class="sec-sub">💎 플러스 요금 <small>${F.plus} ${F.plusWhat}까지 · 스토리북 ${STORIES.length}권 전체</small></h2>
    ${UI.plans()}

    <h2 class="sec-sub">무료 vs 플러스</h2>
    <div class="table-wrap"><table class="table compare">
      <thead><tr><th>기능</th><th>무료 (평생)</th><th>💎 플러스</th></tr></thead>
      <tbody>${[[`${F.range} ${F.name} (${F.lessons}레슨)`, '✅', '✅'], [`${F.plus} ${F.plusWhat} (${F.plusLessons}레슨)`, '7일 무료 체험', '✅'], ['스토리북', `${F.books}권`, `${STORIES.length}권 전체`],
        ['AI 발음 코치 · 놀이터 · 별 상점', '✅', '✅'], ['부모 리포트 · 학습 알림 · 워크시트', '✅', '✅'], ['아이 프로필', '여러 명', '여러 명 (형제·자매 할인)'], ['결제', '없음', `월 ${won(lowestMonthly())}부터 · 한 번만 결제`]]
        .map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>

    <h2 class="sec-sub">결제 · 환불 안내</h2>
    <div class="grid3">
      <div class="card feat"><span class="feat-ico">🧾</span><h4>한 번만 결제</h4><p>이용권은 구매할 때 한 번만 결제돼요. 자동으로 다시 결제되지 않고, 끝나기 3일 전에 알려 드려요.</p></div>
      <div class="card feat"><span class="feat-ico">↩️</span><h4>환불</h4><p>결제 후 7일 이내, 플러스 학습 전이면 부모페이지에서 바로 전액 환불해요. 학습을 시작했다면 남은 달만큼 1개월 단위로 환불해요.</p></div>
      <div class="card feat"><span class="feat-ico">🌱</span><h4>끝나도 무료로 계속</h4><p>플러스가 끝나도 학습 기록은 그대로이고, ${F.range}는 계속 무료로 쓸 수 있어요.</p></div>
    </div>
    <div class="card"><h3>📋 상품·결제 정보</h3><dl class="summary pay-terms">
      <dt>상품</dt><dd>새싹스쿨 플러스 이용권 (온라인 학습 서비스, 배송 없음) · 1개월 / 3개월 / 6개월 / 12개월</dd>
      <dt>서비스 제공 기간</dt><dd>결제하면 바로 이용 시작 · 1개월 30일, 3개월 90일, 6개월 180일, 12개월 360일</dd>
      <dt>결제 방식</dt><dd>한 번만 결제(단건결제) · 신용·체크카드(토스페이먼츠) 또는 카카오페이</dd>
      <dt>결제 시기</dt><dd>구매할 때 한 번 결제해요. 자동으로 다시 결제되지 않고, 이용 기간이 끝나기 3일 전에 종료일을 알려 드려요. 계속 이용하려면 이용권을 다시 구매해요.</dd>
      <dt>이용 종료</dt><dd>자동결제가 없어 해지할 필요가 없어요. 이용 기간이 끝나면 무료 이용(${F.range})으로 돌아가요.</dd>
      <dt>환불(청약철회)</dt><dd>결제 후 7일 이내이고 플러스 학습(${F.plusFrom} 이상 레슨, 플러스 스토리북)을 시작하지 않았으면 부모페이지에서 바로 전액 환불돼요. 플러스 학습을 시작했거나 7일이 지났으면 고객센터로 신청해 주세요. 이용을 시작한 달(30일 단위)을 빼고 남은 달만큼 환불해 드려요(예: 12개월 이용권을 5일 썼다면 1개월치를 빼고 11개월치 환불). 1개월 이용권은 이용을 시작하면 환불되지 않아요. 회사 사정으로 이용하지 못한 기간은 늘려 드리거나 환불해요.</dd>
      <dt>교환·상품 변경</dt><dd>디지털 이용권이라 교환은 없어요. 기간을 바꾸려면 고객센터로 문의해 주세요.</dd>
      <dt>문의·이의신청</dt><dd>고객센터 010-5117-1247 · support@saessakschool.co.kr · <a href="${KAKAO_CHANNEL.chat}" target="_blank" rel="noopener">카카오톡 채널 '새싹스쿨'</a></dd>
      <dt>약관</dt><dd><a href="terms.html" target="_blank" rel="noopener">이용약관</a> 제5조(플러스 이용권과 결제)·제6조(청약철회와 환불)</dd></dl></div>
    ${UI.faq(FAQ.filter(f => f.cat === '요금' || f.cat === '멤버십'))}
    ${!API.on || API.cfg.payments === 'demo' ? '<p class="fine center">이 앱은 데모라 실제 결제는 일어나지 않아요.</p>' : ''}
  </div>`;
  UI.wirePlans($('.plans', el));
};
function statusText(a, u) {
  if (a.kind === 'admin') return '🛠️ 관리자 계정 · 모든 기능을 제한 없이 이용 중';
  if (a.kind === 'member') return `💎 멤버십 이용 중 · <b>${a.daysLeft}일</b> 남음 · ${u.membership.autoRenew ? `다음 결제일 ${fmtDay(u.membership.until)}` : `${fmtDay(u.membership.until)}까지`}`;
  if (a.kind === 'free') { const f = FREE(); return `🌱 무료 이용 중 · ${f.range}(${f.name})는 평생 무료예요. ${a.trialReady ? `${f.plusFrom}에 들어가면 7일 무료 체험을 시작할 수 있어요.` : `💎 플러스로 ${f.plusFrom}부터 이어갈 수 있어요.`}`; }
  if (a.beta) return `🧪 베타 테스트 기간 · <b>${fmtDay(API.cfg.betaUntil)}</b>까지 전체 단계 무료 · 끝나도 ${FREE().range}는 계속 무료 (자동결제 없음)`;
  return `🎁 전체 단계 체험 중 · <b>${a.daysLeft}일</b> 남음 · 끝나도 ${FREE().range}는 계속 무료 (자동결제 없음)`;
}

/* ---------- 도움말 ---------- */
Views.help = el => {
  let cat = '전체', q = '';
  const cats = ['전체', ...new Set(FAQ.map(f => f.cat))];
  el.innerHTML = `<div class="wrap sec narrow">
    <h1 class="page-title">🙋 도움말</h1>
    <input class="search" type="search" placeholder="궁금한 내용을 검색해 보세요 (예: 해지, 소리, 별)" aria-label="도움말 검색">
    <div class="chips filter">${cats.map(c => `<button class="chip ${c === '전체' ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
    <div id="faqList"></div>
    <div class="card contact-card"><h3>💬 찾는 답이 없으면 문의해 주세요</h3>
      <p>결제·환불·학습·소리 문제 모두 도와드려요. 카카오톡 채널로 물어보시면 가장 빨리 답해 드려요.</p>
      <div class="row"><a class="btn btn-primary sm btn-kakao" href="${KAKAO_CHANNEL.chat}" target="_blank" rel="noopener">💬 카카오톡으로 문의</a><a class="btn btn-ghost sm" href="tel:010-5117-1247">📞 010-5117-1247</a><a class="btn btn-ghost sm" data-mail href="mailto:support@saessakschool.co.kr">✉️ 이메일 문의</a></div>
      <p class="fine">이메일 문의를 누르면 사용 중인 기기·브라우저 정보가 미리 적혀 있어서 더 빨리 확인할 수 있어요.</p></div>
    <div class="card notice"><b>🔧 이 기기 진단</b>
      <p>음성 합성 ${Speech.canSpeak ? '✅' : '❌'} · 음성 인식 ${Speech.canListen ? '✅' : '❌'} · 알림 ${'Notification' in window ? '✅' : '❌'}</p>
      ${Speech.canListen ? '' : `<p class="mic-hint">🎤 ${esc(Speech.unsupportedReason())}</p>`}
      <div class="row"><button class="btn btn-ghost sm" data-test-voice>🔊 목소리 테스트</button><button class="btn btn-ghost sm" data-test-sfx>🎵 효과음 테스트</button>
        <button class="btn btn-primary sm" data-test-mic ${Speech.canListen ? '' : 'disabled'}>🎤 마이크 테스트</button></div>
      <p class="mic-test-result" aria-live="polite"></p></div>
  </div>`;
  const draw = () => {
    const list = FAQ.filter(f => (cat === '전체' || f.cat === cat) && (!q || (f.q + f.a).includes(q)));
    $('#faqList', el).innerHTML = list.length ? UI.faq(list) : UI.empty('🔍', `"${esc(q)}"에 대한 결과가 없어요.`);
    if (q && list.length === 1) $('details', el).open = true;
  };
  $('.search', el).oninput = e => { q = e.target.value.trim(); draw(); };
  $$('[data-c]', el).forEach(b => b.onclick = () => { cat = b.dataset.c; $$('[data-c]', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  // 이메일 문의: 제목과 기기 정보를 미리 넣는다 (사용자가 직접 보내는 메일)
  const E = Speech.env, dev = `${E.ipad ? 'iPad' : E.ios ? 'iPhone' : E.android ? 'Android' : 'PC'} · ${(navigator.userAgent.match(/(CriOS|Chrome|Firefox|Edg|Whale|SamsungBrowser|Version)\/[\d.]+/) || ['브라우저'])[0].replace('Version', 'Safari')} · 음성 인식 ${Speech.canListen ? '가능' : '불가'}`;
  $('[data-mail]', el).href = 'mailto:support@saessakschool.co.kr?subject=' + encodeURIComponent('[새싹스쿨 문의] ') + '&body=' + encodeURIComponent(`문의 내용:\n\n\n---\n(확인용) 기기: ${dev}`);
  $('[data-test-voice]', el).onclick = () => Speech.speak('Hello! Can you hear me?');
  $('[data-test-sfx]', el).onclick = () => Speech.sfx.cheer();
  // 마이크 테스트: "Hello"라고 말하면 들은 말을 보여주고, 안 되면 원인과 해결 방법을 알려준다
  const micBtn = $('[data-test-mic]', el), micOut = $('.mic-test-result', el);
  micBtn.onclick = async () => {
    micBtn.disabled = true; micBtn.textContent = '⏳ 마이크 준비 중…';
    try { const alts = await Speech.listen({ onStart: () => { micBtn.textContent = '🎙️ 지금 "Hello!" 라고 말해 보세요'; } });micOut.innerHTML = `✅ 마이크가 잘 돼요! 들은 말: "<b>${esc(alts[0])}</b>"`; }
    catch (e) { micOut.innerHTML = `⚠️ ${esc(Speech.micHelp(e.message))} <small class="fine">(코드: ${esc(e.message)}${e.detail ? ' · ' + esc(e.detail) : ''})</small>`; }
    micBtn.disabled = false; micBtn.textContent = '🎤 다시 테스트';
  };
  draw();
};

/* ---------- 로그인 / 회원가입 (SNS 또는 이메일 인증, 비밀번호 없음) ---------- */
Views.auth = (el, mode, params) => {
  const isUp = mode === 'signup';
  const next = params.get('next') || '/study';
  const LAST_KEY = 'sprout-last-login';
  let last = {}; try { last = JSON.parse(localStorage.getItem(LAST_KEY)) || {}; } catch (e) { /* ignore */ }
  const remember = (method, email) => { try { localStorage.setItem(LAST_KEY, JSON.stringify({ method, email })); } catch (e) { /* ignore */ } };
  let email = last.email || '', phone = '', timer = null;
  // 인증코드를 어디로 받을지: 휴대폰 인증이 준비되어 있으면 휴대폰이 먼저, 지난번에 이메일을 썼으면 이메일
  let via = Store.phoneReady() && last.method !== 'email' ? 'phone' : 'email';
  const showPhone = p => p.length > 7 ? `${p.slice(0, 3)}-****-${p.slice(-4)}` : p;
  const steps = isUp ? ['방법 선택', '본인 확인', '정보 입력'] : ['방법 선택', '본인 확인'];
  const NAMES = { kakao: '카카오', naver: '네이버', google: 'Google', apple: 'Apple', email: '이메일', phone: '휴대폰' };
  const providers = Object.entries(CONFIG.AUTH_PROVIDERS).filter(([k]) => Store.providerReady(k));
  const done = () => { App.refreshHeader(); location.hash = Store.profile() ? '#' + next : '#/profiles'; };
  const busy = (btn, on) => { if (!btn) return; btn.disabled = on; btn.classList.toggle('loading', on); };
  // 화면을 열 때마다 인사말과 맞이하는 동물 친구 셋을 새로 고른다 (같은 화면 안에서는 그대로)
  const hello = greeting();
  const friends = Object.keys(PICS.a).sort(() => Math.random() - .5).slice(0, 3);
  const hero = () => `<div class="auth-hero" aria-hidden="true">${friends.length === 3
    ? friends.map(e => `<img src="img/${PICS.a[e]}" alt="" draggable="false">`).join('')
    : '<img class="sprout" src="img/logo-live.svg" alt="">'}</div>`;
  // SNS 버튼이 있으면 이메일·휴대폰 칸은 접어 두고, 지난번에 그 방법을 썼을 때만 펼친다
  let showForm = !providers.length || last.method === 'email' || last.method === 'phone';

  const shell = (step, inner) => {
    clearInterval(timer);
    const q = next !== '/study' ? '?next=' + encodeURIComponent(next) : '';
    el.innerHTML = `<div class="wrap sec auth"><div class="card auth-card">
      <div class="seg auth-tabs" role="tablist"><a href="#/login${q}" class="${isUp ? '' : 'on'}" role="tab">로그인</a><a href="#/signup${q}" class="${isUp ? 'on' : ''}" role="tab">회원가입</a></div>
      ${isUp ? `<ol class="steps">${steps.map((s, k) => `<li class="${k < step ? 'done' : k === step ? 'now' : ''}"><span>${k < step ? '✓' : k + 1}</span>${s}</li>`).join('')}</ol>` : ''}
      ${inner}</div></div>`;
  };

  const choose = (error = '') => {
    const viaName = via === 'phone' ? '휴대폰' : '이메일';
    shell(0, `${hero()}
      ${isUp ? `<h1>무료로 시작해요 🌱</h1><ul class="perks"><li>🌱 ${FREE().name}(${FREE().range}) 평생 무료</li><li>🎁 다음 단계 7일 무료 체험</li><li>🎟️ 플러스 첫 결제 20% 쿠폰</li><li>🔒 카드 등록·자동결제 없음</li></ul>`
        : `<h1 class="hello">${esc(hello[0])}</h1><p class="center hello-sub">${esc(hello[1])}</p>`}
      ${error ? `<p class="form-err center">${esc(error)}</p>` : ''}
      ${providers.length ? `<div class="sns">${providers.map(([k, p]) => `<button class="sns-btn ${k}" data-sns="${k}"><span class="sns-ico">${p.icon}</span>${NAMES[k]}로 ${isUp ? '가입하기' : '로그인'}${last.method === k ? '<em class="last">최근 사용</em>' : ''}</button>`).join('')}</div>
      ${showForm ? `<div class="or"><span>또는 ${viaName}로${last.method === via ? ' <em class="last">최근 사용</em>' : ''}</span></div>` : ''}` : ''}
      ${!showForm ? `<div class="row-center"><button class="link-btn" data-show-form>${via === 'phone' ? '💬' : '✉️'} ${viaName}로 ${isUp ? '가입하기' : '로그인'}</button></div>`
        : via === 'phone' ? `<form class="email-form" novalidate><label>휴대폰 번호<input name="phone" type="tel" autocomplete="tel" inputmode="numeric" maxlength="13" placeholder="010-1234-5678" required></label>
      <p class="form-err" role="alert"></p><button class="btn btn-primary full lg">💬 인증번호 받기</button>
      <p class="fine center">카카오톡으로 6자리 숫자가 와요. 카카오톡을 못 받으면 문자로 보내요.</p></form>` : `<form class="email-form" novalidate><label>이메일 주소<input name="email" type="email" autocomplete="email" inputmode="email" placeholder="parent@example.com" required></label>
      <p class="form-err" role="alert"></p><button class="btn btn-primary full lg">📮 인증코드 받기</button>
      <p class="fine center">입력한 메일로 6자리 숫자가 와요. 그 숫자만 넣으면 끝!</p></form>`}
      ${showForm && Store.phoneReady() ? `<div class="row-center"><button class="link-btn" data-via>${via === 'phone' ? '이메일로 받을래요' : '휴대폰으로 받을래요'}</button></div>` : ''}
      ${isUp ? '' : '<p class="fine center">비밀번호 없이, 가입할 때 쓴 방법으로 들어와요.</p>'}
      <p class="center switch">${isUp ? '이미 계정이 있나요? <a href="#/login">로그인</a>' : '처음이세요? <a href="#/signup">무료로 회원가입</a>'}</p>`);
    $$('[data-sns]', el).forEach(b => b.onclick = () => snsFlow(b.dataset.sns));
    const toggle = $('[data-via]', el);
    if (toggle) toggle.onclick = () => { via = via === 'phone' ? 'email' : 'phone'; choose(); };
    const open = $('[data-show-form]', el);
    if (open) open.onclick = () => { showForm = true; choose(error); };
    const f = $('form', el);
    if (!f) return;
    const input = via === 'phone' ? f.phone : f.email;
    input.value = via === 'phone' ? phone : email;
    if (!input.value) input.focus();
    f.onsubmit = async e => {
      e.preventDefault();
      const btn = $('button', f); busy(btn, true);
      try {
        if (via === 'phone') phone = f.phone.value.replace(/\D/g, ''); else email = f.email.value.trim();
        await send();
      } catch (x) { $('.form-err', el).textContent = x.message; busy(btn, false); }
    };
  };

  const send = async () => {
    const r = via === 'phone' ? await Store.sendPhoneCode(phone) : await Store.sendCode(email);
    if (r.code) App.demoMail(via === 'phone' ? showPhone(phone) : email, r.code);
    codeStep(r);
  };

  const codeStep = r => {
    const isPhone = via === 'phone', shown = isPhone ? showPhone(phone) : email;
    shell(1, `<h1>${isPhone ? '카카오톡을 확인해 주세요 💬' : '메일함을 확인해 주세요 📬'}</h1>
      <p class="center"><b>${esc(shown)}</b>(으)로 보낸<br>6자리 인증코드를 입력해 주세요.</p>
      <form class="code-form" novalidate>
        <input class="code-input" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="인증코드 6자리" placeholder="••••••">
        <p class="timer" aria-live="polite"></p><p class="form-err" role="alert"></p>
        <button class="btn btn-primary full lg">확인</button>
      </form>
      <div class="row-center"><button class="link-btn" data-back>← ${isPhone ? '번호' : '이메일'} 바꾸기</button><button class="link-btn" data-resend>코드 다시 받기</button></div>
      <p class="fine center">${isPhone ? '카카오톡에 없으면 문자함을 확인해 주세요.' : '메일이 안 보이면 스팸함을 확인해 주세요.'}${r.code ? ' (테스트 모드: 화면 오른쪽 아래에 코드가 보여요)' : ''}</p>`);
    const f = $('form', el), t = $('.timer', el), err = $('.form-err', el);
    f.code.focus();
    const tick = () => {
      const left = Math.max(0, Math.round((r.expires - Date.now()) / 1000));
      t.textContent = left ? `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} 남음` : '⌛ 코드가 만료되었어요. 다시 받아 주세요.';
      if (!left) clearInterval(timer);
    };
    tick(); timer = setInterval(tick, 1000);
    let sending = false;
    f.code.oninput = () => { f.code.value = f.code.value.replace(/\D/g, '').slice(0, 6); if (f.code.value.length === 6 && !sending) f.requestSubmit(); };
    f.onsubmit = async e => {
      e.preventDefault(); if (sending) return;
      err.textContent = ''; sending = true; busy($('button', f), true);
      try {
        const res = isPhone ? await Store.verifyPhoneCode(phone, f.code.value) : await Store.verifyCode(email, f.code.value);
        clearInterval(timer);
        if (!res.needSignup) { remember(via, email); App.toast(isUp ? '이미 가입된 계정이라 바로 로그인했어요 👋' : hello[0]); return done(); }
        isUp ? signupStep(via, shown) : notMember(via, shown);
      } catch (x) { err.textContent = x.message; f.code.value = ''; f.code.focus(); }
      sending = false; busy($('button', f), false);
    };
    $('[data-back]', el).onclick = () => choose();
    $('[data-resend]', el).onclick = async () => { try { await send(); App.toast('새 코드를 보냈어요.'); } catch (x) { err.textContent = x.message; } };
  };

  // 로그인하려는데 가입 기록이 없을 때: 바로 가입으로 이어준다
  const notMember = (provider, em) => {
    shell(1, `<div class="auth-logo">🤔</div><h1>아직 가입하지 않은 계정이에요</h1>
      <p class="center"><b>${esc(em || NAMES[provider] + ' 계정')}</b><br>이 계정으로 바로 가입할까요? 무료로 시작하고 7일 동안 전체 단계를 써볼 수 있어요.</p>
      <button class="btn btn-primary full lg" data-join>🌱 이 계정으로 가입하기</button>
      <button class="btn btn-ghost full" data-other>다른 방법으로 로그인</button>`);
    $('[data-join]', el).onclick = () => signupStep(provider, em);
    $('[data-other]', el).onclick = () => choose();
  };

  const signupStep = (provider, em, name = '') => {
    if (steps.length < 3) steps.push('정보 입력');
    shell(2, `<h1>마지막 단계예요! 🎉</h1><p class="center">${NAMES[provider] || provider}${em ? ' · ' + esc(em) : ''}</p>
      <form class="auth-form" novalidate>
        <label>보호자 이름 (닉네임)<input name="parentName" maxlength="20" autocomplete="nickname" placeholder="예: 하린맘" required></label>
        ${API.on ? `<label>추천인 회원번호 <small class="fine">(선택 · 숫자 7자리)</small><input name="referrer" inputmode="numeric" maxlength="7" pattern="\\d{7}" autocomplete="off" placeholder="예: 4827153"></label>` : ''}
        <label class="check all"><input type="checkbox" name="all"> <b>모두 동의해요</b></label>
        <label class="check"><input type="checkbox" name="terms" required> (필수) <a href="terms.html" target="_blank">이용약관</a> · <a href="privacy.html" target="_blank">개인정보 처리방침</a> 동의</label>
        <label class="check"><input type="checkbox" name="age" required> (필수) 만 14세 이상 보호자이고, 아이의 법정대리인으로서 아이 이름·나이·학습 기록 수집에 동의해요</label>
        <label class="check"><input type="checkbox" name="voice"> (선택) 말하기 연습 음성 인식 동의 <a href="privacy.html#voice" target="_blank">자세히</a><small class="fine block">아이가 말한 소리를 알아듣는 데만 쓰고 저장하지 않아요. 동의하지 않으면 듣고 따라 말하기로 연습해요. 부모페이지 설정에서 언제든 바꿀 수 있어요.</small></label>
        <label class="check"><input type="checkbox" name="mkt"> (선택) 학습 소식·혜택 알림 받기</label>
        <p class="form-err" role="alert"></p>
        <button class="btn btn-primary full lg">가입 완료 →  아이 프로필 만들기</button></form>`);
    const f = $('form', el);
    f.parentName.value = name; f.parentName.focus();
    // 추천 링크로 들어왔으면 추천인 번호를 미리 넣어 둔다 (30일 동안)
    if (f.referrer) try { const r = JSON.parse(localStorage.getItem('sprout-ref') || 'null'); if (r && Date.now() - r.at < 30 * 864e5) f.referrer.value = r.no; } catch { /* ignore */ }
    f.all.onchange = () => ['terms', 'age', 'voice', 'mkt'].forEach(k => f[k].checked = f.all.checked);
    f.onsubmit = async e => {
      e.preventDefault();
      const nm = f.parentName.value.trim();
      if (!nm) return $('.form-err', el).textContent = '이름을 입력해 주세요.';
      if (!f.terms.checked || !f.age.checked) return $('.form-err', el).textContent = '필수 항목에 동의해 주세요.';
      const ref = f.referrer ? f.referrer.value.replace(/\D/g, '') : '';
      if (ref && ref.length !== 7) return $('.form-err', el).textContent = '추천인 회원번호는 숫자 7자리예요. 모르면 비워 두세요.';
      busy($('button', f), true);
      try {
        await Store.completeSignup({ provider, email: em, parentName: nm, marketing: f.mkt.checked, voice: f.voice.checked, referrer: ref });
        remember(provider, em); App.toast('가입 완료! 웰컴쿠폰이 도착했어요 🎟️'); done();
      } catch (x) { $('.form-err', el).textContent = x.message; busy($('button', f), false); }
    };
  };

  const snsFlow = provider => {
    // 서버 모드: 실제 SNS 로그인 창으로 이동
    if (API.on) { remember(provider, ''); location.href = `api/auth/${provider}/start?mode=${mode}&next=${encodeURIComponent(next)}`; return; }
    // 로컬 데모: 동의 화면을 흉내 낸다
    const P = CONFIG.AUTH_PROVIDERS[provider], name = NAMES[provider];
    const m = App.modal(`<div class="sns-consent ${provider}"><div class="sns-head"><span class="sns-ico">${P.icon}</span>${name} 로그인</div>
      <p class="fine">⚠️ 서버 없이 실행 중인 데모예요. 서버에 ${name} 키를 설정하면 실제 ${name} 로그인 창이 열려요.</p>
      <form novalidate><label>${name} 계정 이메일<input name="email" type="email" required value="${last.method === provider ? esc(last.email || '') : ''}" placeholder="me@${{ kakao: 'kakao.com', naver: 'naver.com', apple: 'icloud.com', google: 'gmail.com' }[provider]}"></label>
      <p class="fine">새싹스쿨이 받는 정보: 이메일, 닉네임</p><p class="form-err" role="alert"></p>
      <div class="row-center"><button type="button" class="btn btn-ghost" data-close>취소</button><button class="btn btn-primary">동의하고 계속하기</button></div></form></div>`);
    const f = $('form', m.el); f.email.focus();
    f.onsubmit = e => {
      e.preventDefault();
      const em = f.email.value.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(em)) return $('.form-err', m.el).textContent = '이메일 형식을 확인해 주세요.';
      m.close();
      if (Store.exists(em)) { Store.snsLocalLogin(provider, em); remember(provider, em); App.toast(isUp ? '이미 가입된 계정이라 바로 로그인했어요 👋' : hello[0]); done(); }
      else isUp ? signupStep(provider, em) : notMember(provider, em);
    };
  };

  if (Store.user()) return done();
  // SNS에서 돌아왔는데 가입이 필요한 경우 (서버가 가입 대기 정보를 쿠키로 갖고 있다)
  if (API.on && params.get('step') === 'finish') {
    Store.pendingSignup().then(p => signupStep(p.provider, p.email, p.name)).catch(x => choose(x.message));
    return;
  }
  choose(params.get('error') || '');
};

/* ---------- 프로필 ---------- */
Views.profiles = (el, { adding = false } = {}) => {
  const u = Store.user();
  el.innerHTML = `<div class="wrap sec narrow">
    <h1 class="page-title center">누가 모험을 떠날까요?</h1>
    <div class="profile-grid">${u.profiles.map(p => `<button class="profile-pick" data-id="${p.id}">${avatarHtml(p)}<b>${esc(p.name)}</b><small>Level ${Store.currentLevel(p)} · ⭐${p.stars || 0}</small></button>`).join('')}
      <button class="profile-pick add" data-add><span class="avatar">＋</span><b>${u.profiles.length ? '형제·자매 추가' : '프로필 추가'}</b></button></div>
    <form class="card profile-form" hidden>
      <h3>${u.profiles.length ? '형제·자매 프로필 만들기' : '아이 프로필 만들기'}</h3>
      <label>이름<input name="name" required maxlength="10"></label>
      <label>나이<select name="age">${[4, 5, 6, 7, 8, 9, 10].map(a => `<option ${a === 6 ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
      <div><b class="lbl">캐릭터를 골라요</b><div class="avatar-pick">${AVATARS.map((a, i) => `<label><input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}><span>${avaFace(a)}</span></label>`).join('')}</div></div>
      <label class="check"><input type="checkbox" name="notify" checked> 학습알림 켜기 (레슨 완료·리마인더)</label>
      <button class="btn btn-primary full">만들기</button>
    </form></div>`;
  $$('[data-id]', el).forEach(b => b.onclick = () => { Store.selectProfile(b.dataset.id); App.refreshHeader(); location.hash = '#/study'; });
  const f = $('.profile-form', el);
  $('[data-add]', el).onclick = () => { f.hidden = false; f.name.focus(); };
  if (!u.profiles.length || adding) { f.hidden = false; f.name.focus(); }
  f.onsubmit = async e => {
    e.preventDefault(); const d = new FormData(f);
    if (!d.get('name').trim()) return;
    // 자동갱신 중에 두 번째 아이를 추가하면 다음 결제 금액이 바뀌니 먼저 알린다
    const m = u.membership;
    if (m && !m.granted && m.autoRenew && u.profiles.length === 1 && !confirm(`아이를 추가하면 다음 결제부터 형제·자매 요금(월 ${won(planMonthly('two', m.months))})으로 바뀌어요. 추가할까요?`)) return;
    Store.addProfile({ name: d.get('name').trim(), age: +d.get('age'), avatar: d.get('avatar') });
    u.settings.notify = !!d.get('notify'); Store.persist();
    // 알림에 동의했으면 이 기기를 학습 시간 알림에 등록한다 (아이폰은 홈 화면 앱에서만)
    if (u.settings.notify && 'Notification' in window && Notification.permission !== 'denied') {
      try { if (await Push.state() === 'off') await Push.enable(); else if (Notification.permission === 'default') await Notification.requestPermission(); } catch (x) { /* ignore */ }
    }
    App.refreshHeader();
    siblingStep(el, d.get('name').trim());
  };
};

// 프로필을 만든 뒤: 형제·자매를 더 등록하거나 레벨 테스트로 출발한다
function siblingStep(el, name) {
  const u = Store.user(), n = u.profiles.length;
  el.innerHTML = `<div class="wrap sec narrow"><div class="card auth-card center sibling-step">
    <div class="auth-logo">🎉</div><h1>${esc(name)} 프로필을 만들었어요!</h1>
    <p>${n >= 2 ? `아이 ${n}명이 함께 배워요. 플러스를 결제할 때 <b>형제·자매 요금</b>이 자동으로 적용돼요.` : '형제·자매도 함께 배우나요? 지금 추가하면 플러스를 결제할 때 <b>형제·자매 할인</b>이 자동으로 적용돼요.'}</p>
    <p class="fine">플러스 12개월 기준: 1명 월 ${won(PLANS.one.m12)} · 2명 이상 월 ${won(PLANS.two.m12)}</p>
    <div class="mic-ask" hidden><p>🎤 말하기 연습에는 마이크가 필요해요. 지금 한 번 허용해 두면 공부하는 중에 다시 묻지 않아요.</p>
      <button class="btn btn-ghost full" data-mic>🎤 마이크 허용하기</button><p class="fine mic-ask-out"></p></div>
    <button class="btn btn-ghost full" data-more>👧👦 형제·자매 추가하기</button>
    ${u.profiles.map(p => `<button class="btn btn-primary full" data-go="${p.id}">🧪 ${esc(p.name)} 레벨 테스트로 출발</button>`).join('')}
  </div></div>`;
  $('[data-more]', el).onclick = () => Views.profiles(el, { adding: true });
  $$('[data-go]', el).forEach(b => b.onclick = () => { Store.selectProfile(b.dataset.go); App.refreshHeader(); location.hash = '#/leveltest'; });
  // 마이크는 가입할 때 한 번 허용받는다 (이미 허용했거나 앱 안 브라우저처럼 쓸 수 없으면 묻지 않는다)
  const ask = $('.mic-ask', el), E = Speech.env;
  // 보호자가 말하기 연습(음성 인식)에 동의하지 않았으면 마이크를 묻지 않는다
  const u0 = Store.user(), voiceOk = !u0 || !!(u0.settings && u0.settings.voice);
  if (voiceOk && !E.inApp && E.secure && navigator.mediaDevices) Speech.micPermission().then(st => {
    if (st === 'granted') return;
    ask.hidden = false;
    // 예전에 막아 두었으면 허용 창이 다시 뜨지 않으니, 켜는 방법을 바로 알려준다
    if (st === 'denied') { $('[data-mic]', el).hidden = true; $('.mic-ask-out', el).textContent = Speech.micHelp('not-allowed'); }
  });
  $('[data-mic]', el).onclick = async () => {
    const b = $('[data-mic]', el), out = $('.mic-ask-out', el);
    b.disabled = true; b.textContent = '⏳ 허용 창을 확인해 주세요…';
    const st = await Speech.askMic();
    if (st === 'granted') {
      b.textContent = '✅ 마이크를 허용했어요';
      out.textContent = E.ios && !E.iosNotSafari && !E.iosApp ? 'Safari가 나중에 또 물으면: 주소창 왼쪽 가가(aA) 버튼 › 웹사이트 설정 › 마이크 › "허용"으로 바꿔 두면 다시 묻지 않아요.'
        : E.ios ? 'iPhone·iPad의 Chrome과 홈 화면 앱은 사이트를 새로 열 때 한 번 더 물을 수 있어요. 공부하는 동안에는 다시 묻지 않아요.' : '';
    } else {
      b.disabled = false; b.textContent = '🎤 다시 시도';
      out.textContent = st === 'denied' ? Speech.micHelp('not-allowed') : '이 브라우저에서는 마이크를 쓸 수 없어요. 말하기 없이도 공부할 수 있어요.';
    }
  };
}

/* ---------- 학습 홈 (모험 지도) ---------- */
Views.learn = el => {
  const p = Store.profile(), a = Store.access(), cur = Store.currentLevel();
  const todayN = p.stamps[Store.today()] || 0;
  const curLessons = Store.levelProgress(cur).lessons;
  let curIdx = Array.from({ length: LESSONS_PER_LEVEL }, (_, d) => d).find(d => !curLessons[d]);
  if (curIdx === undefined) curIdx = LESSONS_PER_LEVEL - 1;
  // 전체 진도와 남은 기간 (출발 레벨 앞쪽은 건너뛴 것으로 본다)
  const startI = ALL_LEVELS.indexOf(p.startLevel);
  const course = (ALL_LEVELS.length - startI) * LESSONS_PER_LEVEL;
  const doneAll = ALL_LEVELS.slice(startI).reduce((n, lv) => n + Store.lessonsDone(lv), 0);
  const left = Math.max(0, course - doneAll);
  const diff = Store.difficulty(p, cur);
  const greet = todayN >= p.dailyGoal ? `오늘 목표 달성! 놀이터에서 놀아도 좋아 🎈` : todayN ? `잘하고 있어! 레슨 ${p.dailyGoal - todayN}개만 더 하면 목표 달성!` : `안녕 ${esc(p.name)}! 오늘도 같이 모험하자!`;
  el.innerHTML = `<div class="wrap sec">
    <div class="learner-bar card">
      <a class="ava-link" href="#/room" aria-label="${esc(p.name)}의 미니룸 가기" title="내 미니룸">${avatarHtml(p, 'big')}<span class="ava-room-tag" aria-hidden="true">🏠</span></a>
      <div class="lb-info"><h1>${esc(p.name)}의 모험</h1><p>${a.kind === 'admin' ? '🛠️ 관리자 · 전체 열림' : a.kind === 'member' ? '💎 플러스' : a.kind === 'free' ? `🌱 무료 (${FREE().range}) · <a href="#/pricing">💎 플러스 보기</a>` : a.beta ? `🧪 베타 테스트 · ${fmtDay(API.cfg.betaUntil)}까지 전체 무료` : `🎁 전체 체험 ${a.daysLeft}일 남음`} · <a href="#/profiles">프로필 변경</a></p></div>
      <div class="lb-stats">
        <div><b>🔥 ${Store.streak()}</b><small>연속 학습일</small></div>
        <a href="#/shop"><b>⭐ ${p.stars || 0}</b><small>별 (상점 가기)</small></a>
        <div class="goal"><b>${Math.min(todayN, p.dailyGoal)}/${p.dailyGoal}</b><small>오늘 목표</small><i style="--p:${Math.min(1, todayN / p.dailyGoal) * 100}%"></i></div>
      </div>
    </div>
    ${UI.mascot(greet, todayN >= p.dailyGoal ? '🌻' : '🌱')}
    <div class="card notice mic-banner" hidden></div>
    ${UI.todayCard()}
    ${UI.treeCard()}
    <div class="continue card">
      <div><span class="chip">이어서 모험</span><h2>Level ${cur} · ${dayLabel(curIdx)}</h2><p>${stageOf(cur).title}섬 — ${stageOf(cur).desc}</p>
        <div class="course-prog"><div class="rb-bar"><i style="width:${doneAll / course * 100}%"></i></div>
          <small>전체 ${course}레슨 중 <b>${doneAll}개</b> 완료 · ${left ? `하루 ${p.dailyGoal}레슨(주 5일)이면 완주까지 <b>${durationText(studyWeeks(left, p.dailyGoal))}</b>` : '🎉 전체 과정 완주!'}</small></div>
        <p class="fine">난이도: ${{ easy: '🐣 쉬움 (보기 2개 + 힌트)', normal: '🐥 보통', hard: '🦅 도전 (보기 4개)' }[diff]}${p.difficulty === 'auto' ? ' · 정답률에 맞춰 자동 조절' : ''}</p></div>
      ${Store.needsPlus(cur) ? `<button class="btn btn-primary lg" data-upsell>${Store.access().trialReady ? '🎁 다음 단계 7일 무료 체험' : '💎 플러스로 이어가기'}</button>` : `<a class="btn btn-primary lg" href="#/lesson/${cur}/${curIdx}">▶ 출발!</a>`}
    </div>
    <div class="quick">
      <a class="quick-card" href="#/free" style="--r:-2deg"><span>${ico('🧭')}</span><b>자유 학습</b><small>하고 싶은 것 고르기</small></a>
      <a class="quick-card" href="#/words" style="--r:1.5deg"><span>${ico('📒')}</span><b>내 단어장</b><small>${Store.wordStats().learned}개 모음</small></a>
      <a class="quick-card" href="#/review" style="--r:-1deg"><span>${ico('🔁')}</span><b>오늘의 복습</b><small>${Store.wordStats().due}개</small></a>
      <a class="quick-card" href="#/stories" style="--r:2deg"><span>${ico('📖')}</span><b>스토리북</b><small>${Object.keys(p.stories).length}/${STORIES.length}권 읽음</small></a>
      <a class="quick-card" href="#/speak" style="--r:-1.5deg"><span>${ico('🎤')}</span><b>말하기 연습</b><small>발음 점수 받기</small></a>
      <a class="quick-card" href="#/play" style="--r:1deg"><span>${ico('🎈')}</span><b>놀이터</b><small>풍선·카드 게임</small></a>
      ${API.on ? `<a class="quick-card" href="#/friends" style="--r:-1deg"><span>${ico('👫')}</span><b>친구</b><small>친구 공부 보기 · 응원 쪽지</small></a>` : ''}
    </div>
    <div class="sw-head"><h2 class="sec-sub">🗺️ 모험 지도</h2><a class="link-btn" href="#/study?view=all">📚 전체 학습 내용 보기 →</a></div>
    <div class="path">${STAGES.map(s => {
      // 지금 공부하는 섬만 펼치고, 나머지 섬은 한 줄로 접어 둔다 (누르면 펼쳐짐)
      const isCur = s.id === stageOf(cur).id, done = s.levels.reduce((n, lv) => n + Store.lessonsDone(lv), 0), tot = s.levels.length * LESSONS_PER_LEVEL;
      const books = STORIES.filter(x => x.stage === s.id);
      const island = `
      <section class="path-island ${isCur ? 'cur-island' : ''}" style="--c:${s.color}">
        <header><em class="stage-tag">섬 ${s.id}</em><b>${s.title}</b>${isCur ? '<span class="chip">📍 지금 여기</span>' : ''}<details class="island-books"><summary>📖 스토리북 ${books.length}권</summary><span class="island-stories">${books.map(x => `<a class="link-btn" href="#/story/${x.id}">📖 ${esc(x.title)}</a>`).join('')}</span></details></header>
        <div class="nodes">${s.levels.map((lv, k) => {
          const open = Store.isUnlocked(lv), done = Store.lessonsDone(lv);
          const pct = Math.round(done / LESSONS_PER_LEVEL * 100); // 레벨 진도 (점수가 아니라 끝낸 날 수)
          return `<button class="node ${open ? '' : 'locked'} ${lv === cur ? 'current' : ''} ${done >= LESSONS_PER_LEVEL ? 'cleared' : ''}" data-lv="${lv}" style="--k:${k}" ${open ? '' : 'aria-disabled="true"'}>
            <span class="node-ball">${open ? lv : Store.needsPlus(lv) ? '💎' : '🔒'}${p.badges && p.badges[lv] ? '<i class="node-medal" title="레벨 배지">🏅</i>' : ''}</span><span class="node-prog" title="레벨 진도 ${pct}%">${done}/${LESSONS_PER_LEVEL}일</span><span class="node-bar" aria-hidden="true"><i style="width:${pct}%"></i></span>${lv === cur ? `<span class="node-me">${p.avatar}</span>` : ''}</button>`;
        }).join('')}</div>
      </section>`;
      if (isCur) return island;
      const state = done >= tot ? '✅ 다 마침' : done ? `${done}/${tot}일` : s.levels.every(lv => !Store.isUnlocked(lv)) ? (Store.needsPlus(s.levels[0]) ? '💎 플러스' : '🔒 아직 잠김') : '시작 전';
      return `<details class="path-fold" style="--c:${s.color}"><summary><em class="stage-tag">섬 ${s.id}</em><b>${s.title}</b><small>${state}</small></summary>${island}</details>`;
    }).join('')}</div>
  </div>`;
  const wbtn = $('[data-water]', el); if (wbtn) wbtn.onclick = () => App.waterTree(wbtn);
  const claim = $('[data-claim]', el);
  if (claim) claim.onclick = () => {
    const r = Store.claimMissions(); if (!r) return;
    Speech.sfx.cheer(); Lesson.confetti();
    App.toast(`🎁 보상 상자! ⭐ +${r.stars}, 새싹 나무 +${r.xp}점${r.grow ? ` · '${r.grow.name}'(으)로 자랐어요!` : ''}`);
    App.route();
  };
  const up = $('[data-upsell]', el); if (up) up.onclick = () => App.upsell();
  $$('.node', el).forEach(b => b.onclick = () => {
    const lv = b.dataset.lv;
    if (Store.needsPlus(lv)) return App.upsell();
    if (!Store.isUnlocked(lv)) return App.toast('앞 레벨을 마치면 열려요 🔒');
    const lp = Store.levelProgress(lv), s = stageOf(lv);
    const doneN = Store.lessonsDone(lv);
    const m = App.modal(`<h2><span class="level-box" style="--c:${s.color}">${lv}</span> Level ${lv}</h2><p>${s.desc}</p>
      <div class="course-prog"><div class="rb-bar"><i style="width:${doneN / LESSONS_PER_LEVEL * 100}%"></i></div><small>레벨 진도 <b>${doneN}/${LESSONS_PER_LEVEL}일</b> (${Math.round(doneN / LESSONS_PER_LEVEL * 100)}%) · 아래 %는 각 Day의 최고 정답률이에요</small></div>
      <div class="day-list">${Array.from({ length: LESSONS_PER_LEVEL }, (_, d) => {
        const r = lp.lessons[d]; const st = r ? (r.score >= 90 ? 3 : r.score >= 70 ? 2 : 1) : 0, low = r && r.score < Store.BOOST_BELOW;
        return `<a class="day-btn ${r ? 'done' : ''} ${low ? 'retry' : ''} ${Gen.isReviewDay(d) ? 'review' : ''}" href="#/lesson/${lv}/${d}" data-close ${low ? 'title="한 번 더 해 보면 좋아요"' : ''}><b>${dayLabel(d)}${low ? ' 🔁' : ''}</b><span>${r ? '⭐'.repeat(st) + '☆'.repeat(3 - st) + ` ${r.score}%` : '—'}</span></a>`;
      }).join('')}</div>
      <div class="row-center"><a class="btn btn-ghost" href="#/worksheet/${lv}" data-close>🖨️ 워크시트</a><button class="btn btn-ghost" data-close>닫기</button></div>`);
  });
  // 말하기가 안 되는 브라우저이거나 마이크가 꺼져 있으면 레슨 전에 미리 알려 준다 (말하기 없이도 레슨은 할 수 있다)
  const micBox = $('.mic-banner', el);
  const showMic = (title, msg, help = true) => { micBox.innerHTML = `🎤 <b>${title}</b> ${esc(msg)} ${help ? '<a href="#/help">마이크 점검하기 →</a>' : '<a href="#/parent/settings">부모페이지 설정 →</a>'}<br><small class="fine">말하기 없이도 레슨은 계속할 수 있어요.</small>`; micBox.hidden = false; };
  const u1 = Store.user(), noConsent = u1 && !(u1.settings && u1.settings.voice);
  if (noConsent) showMic('말하기 점수는 꺼져 있어요.', '부모님이 부모페이지 › 설정에서 "말하기 연습 음성 인식 사용"을 켜면 쓸 수 있어요. 지금은 듣고 따라 말해요.', false);
  else if (!Speech.canListen) showMic('이 브라우저에서는 말하기 점수를 받을 수 없어요.', Speech.unsupportedReason());
  else Speech.micPermission().then(st => { if (st === 'denied') showMic('마이크가 꺼져 있어요.', Speech.micHelp('not-allowed').replace(/^🎤 마이크가 꺼져 있어요\.\s*/, '')); });
};

/* ---------- 레슨 ---------- */
Views.lesson = (el, lv, idx) => {
  if (!ALL_LEVELS.includes(lv) || !(idx >= 0 && idx < LESSONS_PER_LEVEL)) return (location.hash = '#/study');
  if (Store.needsPlus(lv)) { location.hash = '#/study'; return App.upsell(); }
  if (!Store.isUnlocked(lv)) { App.toast('이전 레벨을 먼저 마쳐야 열려요 🔒'); return (location.hash = '#/study'); }
  const qs = Gen.lesson(lv, idx, 8, Store.recentKeys(), new Set(Store.weakIds()));
  el.innerHTML = '<div class="wrap lesson-wrap"></div>';
  const root = $('.lesson-wrap', el);
  Lesson.run(root, qs, {
    title: `Level ${lv} · ${dayLabel(idx)}`, difficulty: Store.difficulty(Store.profile(), lv), challenge: Gen.challenge(lv),
    onExit: () => (location.hash = '#/study'),
    onDone: r => {
      Store.rememberKeys(qs.map(q => q.key));
      // 점수·별·진도는 여기서 한 번만 기록한다 (보충 연습은 점수를 바꾸지 않는다)
      const { score, stars, badge, grow, cert, placeDown, eased, boost } = Store.finishLesson({ level: lv, index: idx, correct: r.correct, total: r.total, seconds: r.seconds, wrongItems: r.wrong, bonus: r.bonus, results: r.results });
      const nl = ALL_LEVELS[ALL_LEVELS.indexOf(lv) + 1];
      const next = idx + 1 < LESSONS_PER_LEVEL ? [lv, idx + 1] : nl ? [nl, 0] : null;
      const show = booster => {
        Views.result(root, { score, stars, badge: badge && lv, grow, cert, ...r, booster, eased, low: boost, again: `#/lesson/${lv}/${idx}`, next: next && Store.isUnlocked(next[0]) ? `#/lesson/${next[0]}/${next[1]}` : null, nextLabel: next ? `Level ${next[0]} ${dayLabel(next[1])}` : '' });
        App.refreshHeader();
        if (placeDown) App.toast(`조금 어려웠나 봐요. Level ${placeDown}부터 차근차근 다시 시작해요 🌱`);
      };
      // 틀린 항목마다 어떤 종류 문제를 틀렸는지 모은다 (보충 연습은 다른 종류로 낸다)
      const misses = [];
      for (const w of r.wrong) {
        if (!w.q.item) continue;
        const m = misses.find(x => x.item === w.q.item) || (misses.push({ item: w.q.item, kinds: new Set() }), misses[misses.length - 1]);
        m.kinds.add(Gen.kindOf(w.key));
      }
      if (boost && misses.length) Views.booster(root, misses.slice(0, 5), show); else show(null);
    },
  });
};
// 🌱 보충 연습: 정답률이 낮은 레슨 끝에 헷갈린 항목만 다시 보고(카드) → 다른 종류·쉬운 보기로 풀기.
// 다 맞힐 때까지 최대 3번 짧게 돌고, 끝나면 done({ solved, total, got, stopped })
const BOOST_ROUNDS = 3;
Views.booster = (root, misses, done) => {
  const t0 = Date.now(), solved = new Set(), total = misses.length;
  const card = id => {
    const h = Gen.itemInfo(id); if (!h) return '';
    const it = h.it, say = it.letter ? letterLine(it) : it.q ? `${it.q} ${it.a}` : it.en;
    const en = it.letter ? `${it.letter} ${it.letter.toLowerCase()}` : it.q ? `${it.q} — ${it.a}` : it.en;
    const emoji = it.emoji || (it.q ? '💬' : '');
    return `<button class="boost-card" data-say="${esc(say)}"><span class="bc-pic">${pic(emoji)}</span><b>${esc(en)}</b>${it.ko ? `<small>${esc(it.ko)}</small>` : ''}<span class="bc-play">🔊</span></button>`;
  };
  const finish = stopped => {
    const got = Store.finishBooster({ solved: [...solved], seconds: (Date.now() - t0) / 1000, finished: !stopped });
    if (stopped) return done({ solved: solved.size, total, got, stopped });
    const left = misses.filter(m => !solved.has(m.item));
    root.innerHTML = `<div class="result card boost anim-in"><div class="boost-sprout">🌱</div>
      <h2>${left.length ? '끝까지 해냈어요! 👏' : '헷갈린 것을 모두 맞혔어요! 🌟'}</h2>
      <p>${total}개 중 <b>${solved.size}개</b>를 다시 익혔어요.${got ? ` ⭐ +${got}` : ''}</p>
      ${left.length ? `<p class="fine">아직 헷갈리는 ${left.length}개는 내일 '오늘의 복습'에 먼저 나와요.</p>` : ''}
      <button class="btn btn-primary lg" data-ok>결과 보기 ▶</button></div>`;
    Speech.sfx.cheer(); if (!left.length) Lesson.confetti();
    $('[data-ok]', root).onclick = () => done({ solved: solved.size, total, got });
  };
  const round = n => {
    const left = misses.filter(m => !solved.has(m.item));
    const qs = Gen.boosterQuestions(left);
    if (!qs.length) return finish(false);
    Lesson.run(root, qs, {
      title: `🌱 보충 연습${n > 1 ? ` ${n}번째` : ''}`, difficulty: 'easy', recordSpeech: false,
      exitMsg: '보충 연습을 그만할까요? 레슨 점수는 이미 저장됐어요.',
      onExit: () => finish(true),
      onDone: r => {
        r.results.forEach((x, k) => {
          if (x.ok) solved.add(x.item);
          else { const m = misses.find(y => y.item === x.item); if (m) m.kinds.add(Gen.kindOf(qs[k].key)); }
        });
        const rest = misses.filter(m => !solved.has(m.item)).length;
        if (!rest || n >= BOOST_ROUNDS) return finish(false);
        root.innerHTML = `<div class="result card boost anim-in"><div class="boost-sprout">${r.correct ? '👏' : '💪'}</div>
          <h2>${r.correct ? `${r.correct}개 맞혔어요!` : '괜찮아요, 거의 다 왔어요!'}</h2><p>이제 <b>${rest}개</b>만 한 번 더 해 봐요.</p>
          <div class="boost-cards">${misses.filter(m => !solved.has(m.item)).map(m => card(m.item)).join('')}</div>
          <button class="btn btn-primary lg" data-go>한 번 더 ▶</button></div>`;
        Speech.sfx.correct();
        $$('[data-say]', root).forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
        $('[data-go]', root).onclick = () => { Speech.stop(); round(n + 1); };
      },
    });
  };
  // 시작: 헷갈린 항목을 카드로 다시 보고 들은 다음 연습한다
  root.innerHTML = `<div class="result card boost anim-in"><div class="boost-sprout">🌱</div>
    <h2>잘했어요! 조금만 더 연습해요</h2>
    <p>헷갈린 <b>${total}개</b>를 다시 만나 봐요. 눌러서 듣고, 짧게 풀어 봐요!</p>
    <div class="boost-cards">${misses.map(m => card(m.item)).join('')}</div>
    <button class="btn btn-primary lg" data-go>▶ 보충 연습 시작 (${total}문제)</button></div>`;
  const cards = $$('[data-say]', root);
  cards.forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
  // 카드를 차례로 한 번씩 읽어 준다
  cards.forEach((b, k) => setTimeout(() => { if (document.body.contains(b) && !b.closest('.lesson')) { b.classList.add('on'); Speech.speak(b.dataset.say); } }, 600 + k * 2200));
  $('[data-go]', root).onclick = () => { Speech.stop(); round(1); };
};
Views.result = (root, { score, correct, total, again, next, nextLabel, sample, stars: earned, badge, grow, cert, booster, eased, low }) => {
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
  root.innerHTML = `<div class="result card anim-in">
    <div class="stamp">${score >= 70 ? '참<br>잘했어요' : '노력<br>했어요'}</div>
    <div class="stars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}" style="animation-delay:${k * 0.2}s">★</span>`).join('')}</div>
    <h2>${correct} / ${total} 정답 · ${score}%</h2>
    ${badge ? `<div class="badge-get anim-in"><span>🏅</span><b>Level ${badge} 배지 획득!</b><small>레벨을 끝까지 해냈어요</small></div>` : ''}
    ${cert ? `<a class="badge-get cert anim-in" href="#/certificate/${cert.id}"><span>🎓</span><b>${cert.id}단계 '${esc(cert.title)}' 수료증이 나왔어요!</b><small>눌러서 보고 인쇄해요</small></a>` : ''}
    ${grow ? `<div class="badge-get grow anim-in"><span>${grow.emoji}</span><b>새싹 나무가 '${grow.name}'(으)로 자랐어요!</b></div>` : ''}
    ${!sample && Store.profile() ? `<p class="fine">🌱 새싹 나무 ${Store.tree().emoji} ${Store.tree().name}${Store.tree().next ? ` · 다음 단계까지 ${Store.tree().toNext}점` : ''}</p>` : ''}
    <p>${sample ? '샘플 레슨은 기록되지 않아요. 시작하면 진도와 별이 저장돼요!' : `⭐ 별 ${earned || 0}개를 받았어요! ${score >= 90 ? '완벽해요 🌟' : '틀린 문제는 오답노트에 저장했어요.'}`}</p>
    ${booster && !booster.stopped ? `<p class="boost-line">🌱 보충 연습 ${booster.total}개 중 ${booster.solved}개 다시 익힘${booster.got ? ` · ⭐ +${booster.got}` : ''}</p>` : ''}
    ${low ? `<div class="retry-tip"><b>💪 한 번 더 하면 별을 더 받을 수 있어요!</b><small>헷갈린 것은 내일 '오늘의 복습'에 먼저 나와요.${eased ? '<br>🐣 이 레벨은 당분간 쉬움(보기 2개·힌트)으로 해요.' : ''}</small></div>` : ''}
    <div class="row-center">
      <a class="btn ${low && !sample ? 'btn-primary' : 'btn-ghost'}" href="${again}" data-again>${low && !sample ? '🔁 다시 해 보기' : '다시 하기'}</a>
      ${sample ? '<a class="btn btn-primary" href="#/signup">무료로 가입하고 계속하기</a>' : `<a class="btn btn-ghost" href="#/study">모험 지도</a>${next ? `<a class="btn ${low ? 'btn-ghost' : 'btn-primary'}" href="${next}">다음: ${nextLabel} ▶</a>` : ''}`}
    </div></div>`;
  const a = $('[data-again]', root);
  if (location.hash === again) a.onclick = e => { e.preventDefault(); App.route(); };
  Speech.sfx.cheer(); if (score >= 70 || badge || grow || cert) Lesson.confetti();
};

/* ---------- AI 말하기 ---------- */
Views.speak = el => {
  const p = Store.profile(), cur = Store.isAdmin() ? 'Z' : Store.currentLevel();
  const pool = ALL_LEVELS.slice(0, ALL_LEVELS.indexOf(cur) + 1).flatMap(lv => Gen.levelItems(lv).flatMap(it => it.letter ? it.words.map(([w]) => letterLine(it, w)) : [it.a || it.en]));
  const recent = p.speaking.slice(0, 8);
  const avg = recent.length ? Math.round(recent.reduce((s, x) => s + x.score, 0) / recent.length) : null;
  el.innerHTML = `<div class="wrap sec narrow">
    <h1 class="page-title">🎤 말하기 연습</h1>
    ${UI.mascot('배운 문장 중에서 골랐어! 초록=정확, 노랑=비슷, 빨강=다시 들어보기야. 80점 넘으면 별을 줄게 ⭐')}
    <div class="card speak-demo" id="sw"></div>
    <h2 class="sec-sub">최근 기록 ${avg !== null ? `<small>평균 ${avg}점</small>` : ''}</h2>
    <div id="hist">${recent.length ? `<ul class="hist">${recent.map(r => `<li><span>${esc(r.text)}</span><b class="score-pill small ${scoreClass(r.score)}">${r.score}</b></li>`).join('')}</ul>` : UI.empty('🎙️', '아직 말하기 기록이 없어요.')}</div>
  </div>`;
  Views.speakWidget($('#sw', el), shuffle(pool));
};

/* ---------- 스토리북 ---------- */
Views.stories = el => {
  const p = Store.profile();
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">📖 스토리북</h1>
    <p class="sec-desc left">모두 ${STORIES.length}권이에요. 🐢 천천히·👆 한 단어씩 들으며 🗣️ 따라 읽어요. 읽다 멈춘 책은 그 쪽부터 이어 읽어요. 처음 읽은 책마다 도장과 ⭐2개!</p>
    ${STAGES.map(st => `<h3 class="book-stage" style="--c:${st.color}">섬 ${st.id} · ${st.title}</h3>
    <div class="book-grid">${STORIES.filter(s => s.stage === st.id).map(s => { const locked = bookNeedsPlus(s), open = !locked && Store.isUnlocked(st.levels[0]), plus = locked || Store.needsPlus(st.levels[0]), at = storyMark(s); return `
      <a class="book ${open ? '' : 'locked'}"${open ? '' : ` data-plus="${plus ? 1 : ''}"`} href="${open ? `#/story/${s.id}` : '#/stories'}" style="--c:${st.color}">
        <span class="cover">${bookCover(s)}${open ? '' : `<i class="cover-lock">${ico(plus ? '💎' : '🔒')}</i>`}</span><b>${esc(s.title)}</b><small>${s.pages.length}쪽${at ? ` · 📑 ${at + 1}쪽부터` : ''}${p.stories[s.id] ? ` · ${p.stories[s.id]}번 읽음 ✅` : ''}</small></a>`; }).join('')}</div>`).join('')}
  </div>`;
  $$('.book.locked', el).forEach(b => b.onclick = e => { e.preventDefault(); b.dataset.plus ? App.upsell() : App.toast('그 섬에 도착하면 열려요 🔒'); });
};
// 1~2단계에도 플러스로 읽는 책이 있다
const bookNeedsPlus = s => !!s.plus && !Store.hasPlus();
// 읽다 멈춘 쪽 (이 기기에만 기억)
const storyMark = s => { try { const v = +localStorage.getItem('sprout-story-pg-' + s.id); return v > 0 && v < s.pages.length ? v : 0; } catch (e) { return 0; } };
const setStoryMark = (s, v) => { try { v > 0 && v < s.pages.length ? localStorage.setItem('sprout-story-pg-' + s.id, v) : localStorage.removeItem('sprout-story-pg-' + s.id); } catch (e) { /* ignore */ } };
Views.story = (el, id) => {
  const s = STORIES.find(x => x.id === id); if (!s) return (location.hash = '#/stories');
  if (bookNeedsPlus(s) || Store.needsPlus(STAGES[s.stage - 1].levels[0])) { location.hash = '#/stories'; return App.upsell(); }
  if (!Store.isUnlocked(STAGES[s.stage - 1].levels[0])) { App.toast('그 섬에 도착하면 열려요 🔒'); return (location.hash = '#/stories'); }
  const pref = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const keep = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };
  // 읽기 속도: normal(보통) · slow(천천히) · word(한 단어씩), 따라 읽기: 읽은 뒤 아이가 따라 말할 시간을 준다
  let pg = storyMark(s), auto = false, speed = pref('sprout-story-speed') || 'slow', follow = pref('sprout-story-follow') === '1';
  let timers = [], run = 0; const t0 = Date.now();
  const cancelTurn = () => { timers.forEach(clearTimeout); timers = []; run++; };
  const later = (fn, ms) => { const my = run; timers.push(setTimeout(() => { if (my === run && document.body.contains(page)) fn(); }, ms)); };
  el.innerHTML = `<div class="wrap sec narrow">
    <a class="link-btn" href="#/stories">← 스토리북 목록</a>
    <div class="reader card" style="--c:${STAGES[s.stage - 1].color}">
      <div class="reader-title">${esc(s.title)} <span class="reader-page-no"></span></div>
      <div class="reader-page"></div>
      <div class="follow-box" hidden aria-live="polite"></div>
      <div class="reader-ctrl">
        <button class="icon-btn big" data-prev aria-label="이전 쪽">◀</button>
        <button class="btn btn-primary" data-read>🔊 읽어주기</button>
        <button class="icon-btn big" data-nextp aria-label="다음 쪽">▶</button>
      </div>
      <div class="reader-opts">
        <div class="seg speed-seg" role="radiogroup" aria-label="읽는 속도">
          <button data-speed="normal" role="radio">보통</button><button data-speed="slow" role="radio">🐢 천천히</button><button data-speed="word" role="radio">👆 한 단어씩</button>
        </div>
        <button class="btn btn-ghost sm" data-follow aria-pressed="false">🗣️ 따라 읽기</button>
        <button class="btn btn-ghost sm" data-auto>▶ 자동 넘김</button>
      </div>
      <div class="reader-dots"></div>
    </div></div>`;
  const page = $('.reader-page', el), box = $('.follow-box', el), autoBtn = $('[data-auto]', el), followBtn = $('[data-follow]', el);
  const spans = () => $$('.reader-text span', page);
  const clearHl = () => spans().forEach(sp => sp.classList.remove('hl', 'ok', 'mid', 'no', 'turn', 'turn-now'));
  const syncOpts = () => {
    $$('[data-speed]', el).forEach(b => { b.classList.toggle('on', b.dataset.speed === speed); b.setAttribute('aria-checked', b.dataset.speed === speed); });
    followBtn.classList.toggle('btn-primary', follow); followBtn.setAttribute('aria-pressed', follow);
    autoBtn.textContent = auto ? '⏸ 멈추기' : '▶ 자동 넘김';
  };
  const stopAuto = () => { auto = false; syncOpts(); };

  const draw = () => {
    cancelTurn(); Speech.stop(); box.hidden = true;
    setStoryMark(s, pg);
    if (pg >= s.pages.length) {
      const first = Store.readStory(s.id); Store.addMinutes((Date.now() - t0) / 1000);
      stopAuto();
      page.innerHTML = `<div class="the-end anim-in"><div class="pic">🎉</div><h2>The End</h2><p>${first ? '첫 완독! 도장과 ⭐2개를 받았어요!' : '또 읽었어요! 정말 잘했어요.'}</p>
        <div class="row-center"><button class="btn btn-primary" data-order>🧩 이야기 순서 맞추기</button><button class="btn btn-ghost" data-restart>처음부터</button><a class="btn btn-ghost" href="#/stories">다른 책</a></div></div>`;
      $('[data-restart]', page).onclick = () => { pg = 0; draw(); };
      $('[data-order]', page).onclick = () => storyOrder(page, s);
      $('.reader-page-no', el).textContent = '';
      Speech.sfx.cheer(); if (first) Lesson.confetti(); App.refreshHeader(); return;
    }
    const [text, art] = s.pages[pg];
    page.innerHTML = `<div class="anim-in">${storyPic(s.id, pg) ? `<div class="story-art story-photo"><img src="${storyPic(s.id, pg)}" alt=""></div>` : sceneHtml(art, placeOf(s, text))}<p class="reader-text">${text.split(' ').map((w, k) => `<span data-k="${k}" data-say="${esc(storyWord(text, w, k))}">${esc(w)}</span>`).join(' ')}</p></div>`;
    // 단어를 누르면 그 단어만 천천히 읽고, 자동 넘김은 멈춘다
    spans().forEach(sp => sp.onclick = () => {
      stopAuto(); cancelTurn(); clearHl();
      sp.classList.add('hl'); Speech.speak(sp.dataset.say, { slow: true, onEnd: () => sp.classList.remove('hl') });
    });
    $('.reader-page-no', el).textContent = `${pg + 1} / ${s.pages.length}`;
    $('.reader-dots', el).innerHTML = s.pages.map((_, k) => `<i class="${k === pg ? 'on' : ''}"></i>`).join('');
    $('[data-prev]', el).disabled = pg === 0;
    if (auto) later(read, 400);
    // 다음 두 쪽의 그림과 다음 쪽 소리를 미리 받아 둔다 (넘길 때 바로 보이고 바로 읽게)
    const next = s.pages[pg + 1];
    Speech.preload({ imgs: [storyPic(s.id, pg + 1), storyPic(s.id, pg + 2)], texts: next ? [next[0], ...storyChunks(next[0]).map(g => chunkSay(next[0], g))] : [] });
  };

  // 한 쪽 읽기 → 끝나면 afterRead
  const read = () => {
    cancelTurn(); box.hidden = true; clearHl();
    const [text] = s.pages[pg]; const sp = spans(); const my = run;
    if (speed === 'word' || speed === 'slow') {
      // 한 단어씩: 단어마다 / 천천히: 2~3단어 마디마다 끊어 읽고 잠깐 쉰다.
      // 음성 속도만 낮추면 iPhone 등에서는 차이가 거의 안 나서, 끊어 읽기로 확실히 느리게 한다.
      // 마디 나누기는 AI 음성 미리 만들기와 같은 storyChunks()를 쓴다 (마디마다 AI 음성 파일이 있게)
      const groups = speed === 'word' ? sp.map((_, k) => [k]) : storyChunks(text);
      const step = g => {
        if (my !== run) return;
        if (g >= groups.length) { clearHl(); return afterRead(); }
        sp.forEach((x, k) => x.classList.toggle('hl', groups[g].includes(k)));
        const say = chunkSay(text, groups[g]);
        Speech.speak(say, { slow: true, onEnd: () => later(() => step(g + 1), speed === 'word' ? 450 : 550) });
      };
      return step(0);
    }
    Speech.speak(text, {
      onWord: k => sp.forEach((x, j) => x.classList.toggle('hl', j === k)),
      onEnd: () => { clearHl(); afterRead(); },
    });
  };

  // 따라 읽기: 읽어준 뒤 "아이 차례". 단어가 아이 속도로 하나씩 초록색으로 켜지면(노래방처럼) 보면서 소리 내어 읽는다.
  // 마이크가 되는 기기에서는 🎤로 발음 점수도 받을 수 있다. (마이크가 없어도 따라 읽기는 그대로 된다)
  const afterRead = () => {
    const [text] = s.pages[pg];
    if (!follow) { if (auto) later(() => { pg++; draw(); }, 800); return; }
    const sp = spans(), per = speed === 'normal' ? 650 : 900; // 아이가 한 단어를 읽는 시간
    box.hidden = false;
    box.innerHTML = `<p class="follow-say">🗣️ <b>${Store.profile() ? esc(Store.profile().name) + '의' : '내'} 차례!</b> 초록색 단어를 따라 소리 내어 읽어요</p>
      <div class="row-center">
        <button class="btn btn-ghost sm" data-again>🔁 다시 듣기</button>
        <button class="btn btn-ghost sm" data-turn>👀 다시 따라 읽기</button>
        ${Speech.canListen ? '<button class="btn btn-ghost sm mic" data-mic>🎤 읽고 점수 받기</button>' : ''}
        <button class="btn btn-primary sm" data-go>다 읽었어요 ▶</button>
      </div><div class="follow-result"></div>`;
    // 단어를 하나씩 켜 주는 아이 차례
    const turn = () => {
      cancelTurn(); clearHl();
      sp.forEach((x, k) => later(() => { sp.forEach(y => y.classList.remove('turn-now')); x.classList.add('turn', 'turn-now'); }, 300 + k * per));
      later(() => {
        sp.forEach(y => y.classList.remove('turn-now'));
        $('[data-go]', box).classList.add('pulse');
        if (auto) later(() => { pg++; draw(); }, 1200);
      }, 300 + sp.length * per);
    };
    $('[data-again]', box).onclick = () => read();
    $('[data-turn]', box).onclick = turn;
    $('[data-go]', box).onclick = () => { pg++; draw(); };
    const mic = $('[data-mic]', box);
    if (mic) mic.onclick = async () => {
      cancelTurn(); // 아이가 말하는 동안은 자동으로 넘기지 않는다
      mic.disabled = true; mic.classList.add('rec'); mic.textContent = '⏳ 마이크 준비 중…';
      const res = $('.follow-result', box);
      try {
        const r = Speech.score(text, await Speech.listen({ hint: text, onStart: () => { mic.textContent = '🎙️ 지금 말해요!'; }, onThinking: () => { mic.textContent = '🤔 점수를 매기는 중…'; } }));
        clearHl(); sp.forEach((x, j) => { const w = r.words[j]; if (w) x.classList.add(w.ok === 1 ? 'ok' : w.ok ? 'mid' : 'no'); });
        const got = Store.profile() ? Store.recordSpeaking(text, r.score) : 0;
        res.innerHTML = `<span class="score-pill small ${scoreClass(r.score)}">${r.score}점</span> ${r.score >= 100 ? '완벽해요! 🌟' : r.score >= Lesson.passMark() ? '거의 다 왔어요! 한 번 더 말해서 만점에 도전해 볼까요?' : '한 번 더 들어볼까요?'}${got ? ' ⭐+1' : ''}`;
        if (r.score >= Lesson.passMark()) Speech.sfx.correct();
        // 자동 넘기기는 만점일 때만 한다. 만점이 아니면 그 쪽에 머물러 다시 말해 보게 한다 (다음 쪽 버튼으로 넘길 수 있다)
        if (auto && r.score >= 100) later(() => { pg++; draw(); }, 1800);
      } catch (e) {
        res.innerHTML = `<span class="mic-hint">${esc(Speech.micHelp(e.message))}${e.detail ? ` <small class="fine">(${esc(e.detail)})</small>` : ''}</span>`;
      }
      mic.disabled = false; mic.classList.remove('rec'); mic.textContent = '🎤 다시 점수 받기';
    };
    turn();
  };

  $('[data-read]', el).onclick = () => read();
  $('[data-prev]', el).onclick = () => { if (pg > 0) { pg--; draw(); } };
  $('[data-nextp]', el).onclick = () => { pg++; draw(); };
  $$('[data-speed]', el).forEach(b => b.onclick = () => { speed = b.dataset.speed; keep('sprout-story-speed', speed); syncOpts(); read(); });
  followBtn.onclick = () => { follow = !follow; keep('sprout-story-follow', follow ? '1' : '0'); syncOpts(); if (!follow) box.hidden = true; };
  autoBtn.onclick = () => { if (auto) { stopAuto(); cancelTurn(); Speech.stop(); } else { auto = true; syncOpts(); read(); } };
  syncOpts();
  draw();
};

/* ---------- 레벨 테스트 ---------- */
// 🧪 레벨 테스트 — 찍어서 맞힌 답으로 레벨이 올라가지 않게, 운 나쁜 실수 하나로 떨어지지 않게
// · 섬마다 레벨별로 고르게 2~3문제(레벨이 4개인 섬은 8문제, 나머지는 6문제). 같은 종류·같은 답 문제는 겹치지 않게 뽑고,
//   3섬부터는 찍기 어려운 문장 순서 맞추기 1문제를 넣는다
// · 2문제까지 틀려도 통과(6문제 중 5, 8문제 중 6). 딱 하나 모자라면 확인 문제 2개를 더 내서 둘 다 맞히면 통과
//   보기 3개를 찍어서 통과할 확률은 섬마다 약 3%, 85%쯤 아는 아이가 통과할 확률은 약 90%
// · 멈춘 섬에서는 레벨마다 다시 본다: 앞 레벨 문제를 2개 이상 모두 맞혔으면 그 레벨은 건너뛰고 다음 레벨에서 출발
// · 문제가 나오고 너무 빨리(글 문제 1.5초·소리 문제 2.5초 안에) 고른 정답은 찍은 것으로 보고 세지 않는다
// · '🤔 모르겠어요'를 고를 수 있고, 테스트 중에는 정답을 보여주지 않는다. 문제는 매번 새로 뽑는다
const DONT_KNOW = '🤔 모르겠어요', TEST_CONFIRM = 2;
const testSize = st => Math.max(6, st.levels.length * 2), testPass = st => testSize(st) - (testSize(st) > 6 ? 2 : 1);
const tooFast = x => x.ms < (x.listen ? 2500 : 1500);
// levels: 문제를 낼 레벨들, used: 이미 낸 문항(item)·답(겹치지 않게)
function testBlock(st, n = testSize(st), levels = st.levels, used = { items: new Set(), answers: new Set() }) {
  const pools = levels.map(lv => Gen.reviewQuestions(shuffle(Gen.levelItems(lv).map(Gen.itemId)), 40)
    .filter(q => q.type === 'choice' || (q.type === 'tiles' && q.joiner === ' ')));
  const ans = q => String(Array.isArray(q.answer) ? q.answer.join(' ') : q.answer);
  const pick = [], kinds = levels.map(() => new Set()), count = levels.map(() => 0), inStage = {};
  const take = (q, k, anyKind) => {
    const kind = Gen.kindOf(q.key || '');
    if (used.items.has(q.item) || used.answers.has(ans(q)) || (!anyKind && (kinds[k].has(kind) || inStage[kind] >= 2))) return false;
    used.items.add(q.item); used.answers.add(ans(q)); kinds[k].add(kind); inStage[kind] = (inStage[kind] || 0) + 1; count[k]++; pick.push(q); return true;
  };
  // 문장 순서 맞추기 1문제 (3섬부터, 아무 레벨에서나)
  if (st.id >= 3 && n >= 6) shuffle(levels.map((_, k) => k)).some(k => pools[k].some(q => q.type === 'tiles' && take(q, k)));
  // 나머지는 문제가 가장 적은 레벨부터 한 문제씩 채운다. 같은 레벨에서는 종류가 다른 문제부터 쓰고, 모자랄 때만 종류가 겹쳐도 쓴다
  const fill = anyKind => {
    while (pick.length < n) {
      const order = levels.map((_, k) => k).sort((a, b) => count[a] - count[b] || a - b);
      if (!order.some(k => pools[k].some(q => q.type === 'choice' && take(q, k, anyKind)))) return;
    }
  };
  fill(false); fill(true);
  return shuffle(pick).map((q, k) => ({ ...q, key: `lt${st.id}-${used.items.size}-${k}`, sayAfter: null, ...(q.type === 'choice' ? { options: [...q.options, DONT_KNOW] } : {}) }));
}
Views.leveltest = el => {
  const p = Store.profile();
  el.innerHTML = `<div class="wrap sec narrow"><div class="card intro center">
    <div class="auth-logo">🧪</div><h1>우리 아이 출발 섬 찾기</h1>
    <p>섬마다 6~8문제씩, 아는 데까지 풀어요 (약 5~12분). 소리가 나오니 볼륨을 켜 주세요.</p>
    <p class="hint">🤔 모르는 문제는 찍지 말고 <b>"모르겠어요"</b>를 눌러요. 그래야 딱 맞는 레벨에서 시작해서 재미있게 배울 수 있어요.</p>
    <button class="btn btn-primary lg" data-start>테스트 시작</button>
    ${p ? '' : '<p class="fine">로그인 없이도 볼 수 있어요. 결과를 학습에 반영하려면 프로필이 필요해요.</p>'}</div></div>`;
  $('[data-start]', el).onclick = () => {
    // 테스트 중에는 레슨처럼 머리말·꼬리말을 숨긴다 (아래에 뜨는 정답 알림이 꼬리말과 겹치지 않게). 결과 화면에서 다시 보인다
    el.className = 'focus'; document.body.classList.add('in-lesson');
    el.innerHTML = '<div class="wrap lesson-wrap"></div>';
    const root = $('.lesson-wrap', el), report = [];
    const exit = () => { location.hash = p ? '#/study' : '#/'; };
    // 레벨별 결과: 찍은 것으로 보이는 정답은 틀린 것으로 센다
    const byLevel = (qs, results) => {
      const lv = {}; results.forEach((x, i) => { const L = qs.find(q => q.item === x.item)?.level || qs[i]?.level; if (!L) return; (lv[L] = lv[L] || { ok: 0, n: 0 }).n++; if (x.ok && !tooFast(x)) lv[L].ok++; });
      return lv;
    };
    const runStage = k => {
      const st = STAGES[k], used = { items: new Set(), answers: new Set() }, qs = testBlock(st, testSize(st), st.levels, used);
      Lesson.run(root, qs, {
        title: `레벨 테스트 · 섬 ${st.id} ${st.title}`, test: true, recordSpeech: false, onExit: exit,
        onDone: r => {
          const right = r.results.filter(x => x.ok), counted = right.filter(x => !tooFast(x)).length;
          const rec = { st, counted, fast: right.length - counted, total: r.total, levels: byLevel(qs, r.results) };
          report.push(rec);
          if (counted >= testPass(st)) return passed(k);
          if (counted < testPass(st) - 1) return stopAt(k);
          // 딱 하나 모자라면 확인 문제 2개: 틀린 레벨에서 내고, 둘 다 맞히면 통과
          const weak = st.levels.filter(L => rec.levels[L] && rec.levels[L].ok < rec.levels[L].n);
          const more = testBlock(st, TEST_CONFIRM, weak.length ? weak : st.levels, used);
          root.innerHTML = `<div class="result card anim-in"><h2>조금만 더 볼게요 🔍</h2>
            <p>${st.title}섬을 거의 다 알고 있어요! 확인 문제 <b>${more.length}개</b>만 더 풀어요.</p>
            <div class="row-center"><button class="btn btn-primary" data-more>확인 문제 풀기 ▶</button></div></div>`;
          $('[data-more]', root).onclick = () => Lesson.run(root, more, {
            title: `레벨 테스트 · 섬 ${st.id} 확인 문제`, test: true, recordSpeech: false, onExit: exit,
            onDone: r2 => {
              const ok2 = r2.results.filter(x => x.ok && !tooFast(x)).length, lv2 = byLevel(more, r2.results);
              rec.counted += ok2; rec.total += r2.total; rec.fast += r2.results.filter(x => x.ok && tooFast(x)).length;
              Object.entries(lv2).forEach(([L, v]) => { const t = rec.levels[L] = rec.levels[L] || { ok: 0, n: 0 }; t.ok += v.ok; t.n += v.n; });
              ok2 === more.length && more.length ? passed(k) : stopAt(k);
            },
          });
        },
      });
    };
    const passed = k => {
      const st = STAGES[k];
      report[report.length - 1].passed = true;
      if (k + 1 >= STAGES.length) return stopAt(k);
      root.innerHTML = `<div class="result card anim-in"><div class="stamp">섬 ${st.id}<br>통과</div><h2>${st.title}섬 통과! 🎉</h2>
        <p>다음은 <b>섬 ${k + 2} · ${STAGES[k + 1].title}</b> 문제예요. 모르면 "모르겠어요"를 눌러도 괜찮아요.</p>
        <div class="row-center"><button class="btn btn-ghost" data-stop>여기까지 할래요</button><button class="btn btn-primary" data-next>다음 섬 문제 ▶</button></div></div>`;
      Speech.sfx.cheer();
      $('[data-next]', root).onclick = () => runStage(k + 1);
      $('[data-stop]', root).onclick = () => result(STAGES[k + 1].levels[0]);
    };
    // 멈춘 섬 안에서 출발 레벨 정하기: 앞에서부터, 문제를 2개 이상 냈고 모두 맞힌 레벨은 건너뛴다
    const stopAt = k => {
      const st = STAGES[k], lv = report[report.length - 1].levels, mastered = L => lv[L] && lv[L].n >= 2 && lv[L].ok === lv[L].n;
      let i = 0;
      while (i < st.levels.length - 1 && mastered(st.levels[i])) i++;
      result(st.levels[i]);
    };
    const result = start => {
      el.className = ''; document.body.classList.remove('in-lesson');
      const stage = stageOf(start).id, fast = report.reduce((n, x) => n + x.fast, 0);
      const mark = x => x.passed ? '✅' : '🌱';
      root.innerHTML = `<div class="result card anim-in"><div class="stamp">추천<br>섬 ${stage}</div>
        <h2>추천 출발 레벨은 Level ${start}</h2><p>${STAGES[stage - 1].title}섬 — ${STAGES[stage - 1].desc}</p>
        <ul class="plain test-report">${report.map(x => `<li>${mark(x)} 섬 ${x.st.id} ${x.st.title} · ${x.counted}/${x.total}
          <small class="fine">${x.st.levels.filter(L => x.levels[L]).map(L => `${L} ${x.levels[L].ok}/${x.levels[L].n}`).join(' · ')}</small></li>`).join('')}</ul>
        ${fast ? `<p class="hint">⚡ 문제를 다 보기 전에 고른 정답 ${fast}개는 찍었을 수 있어서 세지 않았어요.</p>` : ''}
        ${p && stage > 1 ? '<p class="hint">처음 2번의 레슨이 어려우면(평균 60점 아래) 한 섬 앞에서 다시 시작하도록 자동으로 맞춰 드려요.</p>' : ''}
        <div class="row-center">${p ? `<button class="btn btn-ghost" data-keep>지금 레벨 유지</button><button class="btn btn-primary" data-apply>Level ${start}부터 시작</button>` : '<a class="btn btn-primary" href="#/signup">가입하고 이 레벨로 시작</a>'}</div></div>`;
      Speech.sfx.cheer(); Lesson.confetti();
      if (p) {
        $('[data-apply]', root).onclick = () => { Store.placeAt(start); App.toast(`Level ${start}부터 출발!`); location.hash = '#/study'; };
        $('[data-keep]', root).onclick = () => { Store.updateProfile({ placed: true }); location.hash = '#/study'; };
      }
    };
    runStage(0);
  };
};

/* ---------- 오답노트 ---------- */
Views.wrong = el => {
  const p = Store.profile();
  el.innerHTML = `<div class="wrap sec narrow">
    <h1 class="page-title">🔁 오답노트</h1>
    ${p.wrong.length ? `<p class="sec-desc left">틀린 문제 ${p.wrong.length}개. 다시 풀어 맞히면 졸업해요!</p>
      <button class="btn btn-primary lg" data-go>${Math.min(8, p.wrong.length)}문제 복습하기</button>
      <ul class="wrong-list">${p.wrong.map(w => `<li><span class="chip">${esc(w.q.title)}</span> <b>${esc(w.q.show || (w.q.say ? '🔊 ' + w.q.say : ''))}</b> → ${esc(w.q.type === 'tiles' ? w.q.answer.join(w.q.joiner) : w.q.answer)}</li>`).join('')}</ul>`
      : UI.empty('🎉', '오답노트가 비어 있어요. 모두 맞혔어요!', '<a class="btn btn-primary" href="#/study">모험하러 가기</a>')}
  </div>`;
  const go = $('[data-go]', el);
  if (go) go.onclick = () => {
    const qs = p.wrong.slice(0, 8).map(w => ({ ...w.q, options: w.q.options ? shuffle(w.q.options) : undefined, tiles: w.q.tiles ? shuffle(w.q.tiles) : undefined }));
    el.innerHTML = '<div class="wrap lesson-wrap"></div>';
    const root = $('.lesson-wrap', el);
    const results = [];
    const wrap = name => { const o = Lesson.renderers[name]; Lesson.renderers[name] = (b, q, d) => o(b, q, (ok, qq, x) => { results.push({ key: qq.key, ok }); d(ok, qq, x); }); return () => (Lesson.renderers[name] = o); };
    const undo = [wrap('choice'), wrap('tiles'), wrap('type')];
    const restore = () => undo.forEach(f => f());
    Lesson.run(root, qs, {
      title: '오답 복습', onExit: () => { restore(); location.hash = '#/wrong'; },
      onDone: r => {
        restore();
        const solved = results.filter(x => x.ok); solved.forEach(x => Store.clearWrong(x.key));
        Store.addMinutes(r.seconds); Store.bumpDaily('review');
        const got = Store.addStars(solved.length ? 1 : 0, 'review', 3);
        Views.result(root, { score: Math.round(r.correct / r.total * 100), ...r, stars: got, again: '#/wrong', next: null });
        $('p', root).textContent = `${solved.length}문제가 오답노트에서 졸업했어요!${got ? ' ⭐ +1' : ''}`;
      },
    });
  };
};

/* ---------- 별 상점 / 스티커북 ---------- */
Views.shop = el => {
  const p = Store.profile();
  // 입어 보기: 아직 사지 않은 꾸미기를 부위마다 하나씩 잠깐 입혀 본다 (저장하지 않음)
  let tryWear = {};
  const draw = () => {
    const tries = Object.values(tryWear).map(id => SHOP.find(x => x.id === id)), pv = tries.length ? { ...p, wear: { ...p.wear, ...tryWear } } : p;
    const need = tries.reduce((n, i) => n + i.cost, 0);
    el.innerHTML = `<div class="wrap sec">
      <h1 class="page-title">🛍️ 별 상점</h1>
      <div class="two-col top">
        <div class="card star-bank"><a class="shop-ava ava-link" href="#/room" aria-label="${esc(p.name)}의 미니룸 가기" title="내 미니룸">${roomAvatar(pv, 'shop')}${Store.worn(pv).filter(w => w.slot === 'pet').map(w => `<span class="shop-pet">${accArt(w)}</span>`).join('')}</a><b class="star-count">⭐ ${p.stars || 0}</b><p>${esc(p.name)}가 모은 별</p><a class="btn btn-primary sm" href="#/room">🏠 내 미니룸 가기</a></div>
        <div class="card"><h3>별은 이렇게 모아요</h3>${UI.starsInfo()}</div>
      </div>
      <h2 class="sec-sub">아바타 꾸미기 <small>부위마다 하나씩, 여러 개를 함께 입을 수 있어요</small></h2>
      ${ACC_SLOTS.map(([slot, label]) => `<h3 class="acc-slot-title">${label}</h3><div class="shop-grid">${SHOP.filter(i => i.kind === 'acc' && i.slot === slot).map(item).join('')}</div>`).join('')}
      <h2 class="sec-sub">🏠 미니룸 꾸미기 <small>산 가구는 미니룸의 '방 꾸미기'에서 놓고 옮길 수 있어요</small></h2>
      ${[['paper', '벽지'], ['floor', '가구·소품'], ['wall', '벽 장식']].map(([slot, label]) => `<h3 class="acc-slot-title">${label}</h3><div class="shop-grid">${SHOP.filter(i => i.kind === 'room' && i.slot === slot).map(item).join('')}</div>`).join('')}
      <h2 class="sec-sub">스티커</h2>
      <div class="shop-grid">${SHOP.filter(i => i.kind === 'sticker').map(item).join('')}</div>
      <h2 class="sec-sub">🏅 레벨 배지 <small>${Object.keys(p.badges || {}).length}/${ALL_LEVELS.length} · 레벨 마지막 날(복습)을 70% 이상으로 통과하면 받아요</small></h2>
      <div class="badge-book">${ALL_LEVELS.map(lv => `<span class="bslot ${p.badges && p.badges[lv] ? 'got' : ''}" style="--c:${stageOf(lv).color}" title="Level ${lv}">${p.badges && p.badges[lv] ? '🏅' : ''}<b>${lv}</b></span>`).join('')}</div>
      <h2 class="sec-sub">📒 내 스티커북 <small>${p.owned.filter(id => id.startsWith('st-')).length}/${SHOP.filter(i => i.kind === 'sticker').length}</small></h2>
      <div class="sticker-book">${SHOP.filter(i => i.kind === 'sticker').map(i => `<span class="slot ${p.owned.includes(i.id) ? 'got' : ''}" title="${i.name}">${p.owned.includes(i.id) ? i.emoji : '?'}</span>`).join('')}</div>
    </div>
    ${tries.length ? `<div class="try-ava card" role="region" aria-label="입어 본 모습"><div class="shop-ava">${roomAvatar(pv, 'shop')}${Store.worn(pv).filter(w => w.slot === 'pet').map(w => `<span class="shop-pet">${accArt(w)}</span>`).join('')}</div>
      <div class="try-ava-btns"><button class="btn btn-primary sm" data-try-buy ${p.stars < need ? 'aria-disabled="true"' : ''}>⭐ ${need} 사기</button><button class="btn btn-ghost sm" data-try-clear aria-label="원래대로">✕</button></div></div>` : ''}`;
    $$('[data-try-acc]', el).forEach(b => b.onclick = () => { const it = SHOP.find(x => x.id === b.dataset.tryAcc); if (tryWear[it.slot] === it.id) delete tryWear[it.slot]; else tryWear[it.slot] = it.id; Speech.sfx.tap(); draw(); });
    const tc = $('[data-try-clear]', el); if (tc) tc.onclick = () => { tryWear = {}; Speech.sfx.tap(); draw(); };
    const tb = $('[data-try-buy]', el); if (tb) tb.onclick = () => {
      if (p.stars < need) { Speech.sfx.wrong(); return App.toast(`별이 ${need - p.stars}개 더 필요해요.`); }
      try { tries.forEach(i => { Store.buy(i.id); if (!Store.isWorn(i.id, p)) Store.equip(i.id); }); tryWear = {}; Speech.sfx.cheer(); Lesson.confetti(); App.toast('새 아이템을 얻었어요! 🎉'); draw(); App.refreshHeader(); }
      catch (x) { Speech.sfx.wrong(); App.toast(x.message); }
    };
    $$('[data-buy]', el).forEach(b => b.onclick = () => {
      const id = b.dataset.buy, it = SHOP.find(x => x.id === id), tried = it && tryWear[it.slot] === id;
      try { if (Store.buy(id)) { if (tried) { delete tryWear[it.slot]; if (!Store.isWorn(id, p)) Store.equip(id); } Speech.sfx.cheer(); Lesson.confetti(); App.toast('새 아이템을 얻었어요! 🎉'); draw(); App.refreshHeader(); } }
      catch (x) { Speech.sfx.wrong(); App.toast(x.message); }
    });
    $$('[data-try-room]', el).forEach(b => b.onclick = () => { try { sessionStorage.setItem('mr-try', b.dataset.tryRoom); } catch (x) { /* ignore */ } });
    $$('[data-equip]', el).forEach(b => b.onclick = () => { Store.equip(b.dataset.equip); Speech.sfx.tap(); draw(); App.refreshHeader(); });
  };
  const item = i => {
    const own = p.owned.includes(i.id), on = Store.isWorn(i.id, p), tried = tryWear[i.slot] === i.id;
    return `<div class="shop-item ${own ? 'own' : ''} ${on || tried ? 'worn' : ''}"><span class="si-emoji ${i.kind === 'room' ? 'si-room ' + i.slot : ''}">${i.kind === 'room' ? `<img src="${i.img}" alt="" draggable="false">` : i.kind === 'acc' && PICS.x[i.emoji] ? accArt(i) : i.emoji}</span><b>${i.name}</b>
      ${own ? (i.kind === 'room' ? '<a class="btn btn-ghost sm" href="#/room">방에 놓기</a>' : i.kind === 'acc' ? `<button class="btn btn-ghost sm" data-equip="${i.id}" aria-pressed="${on}">${on ? '벗기' : '착용'}</button>` : '<span class="chip">모음 ✅</span>') : `<button class="btn btn-primary sm" data-buy="${i.id}" ${p.stars < i.cost ? 'aria-disabled="true"' : ''}>⭐ ${i.cost}</button>${i.kind === 'room' ? `<a class="btn btn-ghost sm" href="#/room" data-try-room="${i.id}">👀 놓아 보기</a>` : i.kind === 'acc' ? `<button class="btn btn-ghost sm" data-try-acc="${i.id}" aria-pressed="${tried}">${tried ? '👀 벗어 보기' : '👀 입어 보기'}</button>` : ''}`}</div>`;
  };
  draw();
};

/* ---------- 워크시트 (인쇄용) ---------- */
Views.worksheet = (el, lv) => {
  if (!ALL_LEVELS.includes(lv)) return (location.hash = '#/study');
  const s = stageOf(lv), items = Gen.levelItems(lv).slice(0, 6), p = Store.profile();
  const trace = items.map(it => it.letter ? `${it.letter} ${it.letter.toLowerCase()} ${it.word}` : it.en ? it.en.replace(/[.?!]/g, '') : it.a);
  const pics = items.filter(it => it.emoji).slice(0, 5);
  const sentences = items.map(it => it.en || it.a).filter(x => x && x.includes(' ')).slice(0, 3);
  el.innerHTML = `<div class="wrap sec narrow worksheet-wrap">
    <div class="no-print row"><a class="link-btn" href="#/study">← 모험 지도</a><button class="btn btn-primary" data-print>🖨️ 인쇄 / PDF 저장</button></div>
    <article class="worksheet">
      <header><b><img class="logo-inline" src="img/logo.svg" alt=""> 새싹스쿨 · 새싹영어 워크시트</b><span>Level ${lv} · ${s.title}섬</span><span>이름: ${p ? esc(p.name) : '________'} &nbsp; 날짜: ________</span></header>
      <h3>1. 따라 써 보세요</h3>
      ${trace.map(t => `<div class="ws-trace"><span class="dotted">${esc(t)}</span><span class="line"></span></div>`).join('')}
      ${pics.length >= 3 ? `<h3>2. 그림과 단어를 선으로 이어요</h3><div class="ws-match"><div>${pics.map(it => `<span>${it.emoji} ●</span>`).join('')}</div><div>${shuffle(pics).map(it => `<span>● ${esc(it.word || it.en)}</span>`).join('')}</div></div>` : ''}
      ${sentences.length ? `<h3>${pics.length >= 3 ? 3 : 2}. 단어를 바르게 늘어놓아 문장을 써요</h3>${sentences.map(t => `<div class="ws-order"><span>${shuffle(words(t)).map(esc).join(' / ')}</span><span class="line"></span></div>`).join('')}` : ''}
      <footer>참 잘했어요! 스티커를 붙여요 → ☐</footer>
    </article></div>`;
  $('[data-print]', el).onclick = () => { if (Store.user()) Store.markWorksheet(lv); window.print(); };
};

/* ---------- 부모페이지 ---------- */
Views.parent = (el, tab) => {
  const u = Store.user();
  if (u.settings.pin && !App.pinOk && !Store.isAdmin()) {
    el.innerHTML = `<div class="wrap sec narrow"><form class="card auth-card center"><div class="auth-logo">🔐</div><h1>부모페이지</h1><p>보호자 PIN 4자리를 입력해 주세요.</p>
      <input class="pin" name="pin" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="PIN"><p class="form-err" role="alert"></p><button class="btn btn-primary full">확인</button></form></div>`;
    const f = $('form', el); f.pin.focus();
    f.onsubmit = async e => { e.preventDefault(); if (await Store.hash(f.pin.value) === u.settings.pin) { App.pinOk = true; Views.parent(el, tab); } else { $('.form-err', el).textContent = 'PIN이 맞지 않아요.'; f.pin.value = ''; } };
    return;
  }
  const tabs = { report: '📊 리포트', alerts: '🔔 학습알림', member: '🧾 멤버십', coupons: '🎟️ 쿠폰함', friends: '👫 친구·추천', worksheets: '🖨️ 워크시트', settings: '⚙️ 설정' };
  tab = tabs[tab] ? tab : 'report';
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">부모페이지 <small>${esc(u.parentName)}님 · ${u.providers.map(x => ({ email: '이메일', kakao: '카카오', naver: '네이버', google: 'Google', apple: 'Apple' }[x])).join(', ')} 로그인</small></h1>
    <nav class="tabs">${Object.entries(tabs).map(([k, v]) => `<a href="#/parent/${k}" class="${k === tab ? 'on' : ''}">${v}${k === 'alerts' && u.notifications.some(n => !n.read) ? ' <i class="dot"></i>' : ''}</a>`).join('')}</nav>
    <div class="tab-body"></div></div>`;
  ParentTabs[tab]($('.tab-body', el), u);
};

const ParentTabs = {
  report(el, u) {
    if (!u.profiles.length) { el.innerHTML = UI.empty('👶', '아직 아이 프로필이 없어요.', '<a class="btn btn-primary" href="#/profiles">프로필 만들기</a>'); return; }
    let p = Store.profile() || u.profiles[0];
    const draw = () => {
      const days = [...Array(7)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - 6 + k); return Store.today(d); });
      const mins = days.map(d => p.minutes[d] || 0), maxM = Math.max(10, ...mins);
      const lessons = ALL_LEVELS.reduce((s, lv) => s + Store.lessonsDone(lv, p), 0);
      const acc = p.stats.answered ? Math.round(p.stats.correct / p.stats.answered * 100) : 0;
      const sp = p.speaking.slice(0, 20); const spAvg = sp.length ? Math.round(sp.reduce((s, x) => s + x.score, 0) / sp.length) : '-';
      const now = new Date(), y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
      el.innerHTML = `
        ${u.profiles.length > 1 ? `<div class="chips">${u.profiles.map(x => `<button class="chip ${x.id === p.id ? 'on' : ''}" data-pid="${x.id}">${x.avatar} ${esc(x.name)}</button>`).join('')}</div>` : ''}
        <div class="kpis">
          <div class="kpi"><small>연속 학습일</small><b>${Store.streak(p)}일</b></div>
          <div class="kpi"><small>이번 주 학습</small><b>${mins.reduce((a, b) => a + b, 0)}분</b></div>
          <div class="kpi"><small>완료 레슨</small><b>${lessons}개</b></div>
          <div class="kpi"><small>정답률</small><b>${acc}%</b></div>
          <div class="kpi"><small>평균 발음</small><b>${spAvg}${sp.length ? '점' : ''}</b></div>
          <div class="kpi"><small>모은 별 · 배지</small><b>⭐${p.stars || 0} · 🏅${Object.keys(p.badges || {}).length}</b></div>
        </div>
        ${lessons >= 5 && !UI.reviewAsked() ? `<div class="card notice review-ask"><b>💌 ${esc(p.name)}의 레슨 ${lessons}개, 써 보니 어떠셨나요?</b>
          <p>새싹스쿨은 막 시작한 서비스라 부모님의 솔직한 후기가 다른 부모님께 큰 도움이 돼요. 아쉬운 점도 좋아요. 받은 의견은 개선에 반영할게요.</p>
          <div class="row"><a class="btn btn-primary sm" href="#/reviews">✍️ 후기 남기기</a><button class="btn btn-ghost sm" data-rv-later>다음에</button></div></div>` : ''}
        ${u.settings.voice === undefined ? `<div class="card notice voice-ask"><b>🎤 말하기 연습 음성 인식이 꺼져 있어요</b>
          <p>아이 목소리를 알아듣고 발음 점수를 주려면 보호자 동의가 필요해요. 아이가 말한 소리는 알아듣는 데만 쓰고 저장하지 않아요. 동의하지 않아도 듣고 따라 말하기로 연습할 수 있어요. <a href="privacy.html#voice" target="_blank">자세히</a></p>
          <div class="row"><button class="btn btn-primary sm" data-voice-yes>동의하고 켜기</button><button class="btn btn-ghost sm" data-voice-no>지금은 끄고 쓰기</button></div></div>` : ''}
        ${UI.canDoReport(p)}
        ${UI.skillReport(p)}
        <div class="two-col top">
          <div class="card"><h3>최근 7일 학습 시간</h3><div class="bars">${days.map((d, k) => `<div class="bar-col"><span class="bv">${mins[k] || ''}</span><i style="height:${mins[k] / maxM * 100}%"></i><small>${['일', '월', '화', '수', '목', '금', '토'][new Date(d).getDay()]}</small></div>`).join('')}</div></div>
          <div class="card"><h3>${m + 1}월 학습 도장</h3><div class="cal">${['일', '월', '화', '수', '목', '금', '토'].map(w => `<b>${w}</b>`).join('')}${'<span></span>'.repeat(first)}${[...Array(dim)].map((_, k) => { const d = Store.today(new Date(y, m, k + 1)); const n = p.stamps[d] || 0; return `<span class="${n ? 'stamped' : ''} ${d === Store.today() ? 'today' : ''}" title="${n}개">${n ? '🌱' : k + 1}</span>`; }).join('')}</div></div>
        </div>
        <div class="card"><h3>섬별 진도 <small>(출발 레벨 ${p.startLevel} · 난이도 ${{ auto: '자동', easy: '쉬움', normal: '보통', hard: '도전' }[p.difficulty || 'auto']})</small></h3>${STAGES.map(s => { const done = s.levels.reduce((a, lv) => a + Store.lessonsDone(lv, p), 0), tot = s.levels.length * LESSONS_PER_LEVEL; return `<div class="prog-row"><span>섬${s.id} ${s.title}</span><div class="rb-bar"><i style="width:${done / tot * 100}%;background:${s.color}"></i></div><small>${done}/${tot}</small></div>`; }).join('')}</div>
        <div class="two-col top">
          ${UI.boostReport(p)}
          <div class="card"><h3>최근 말하기</h3>${sp.length ? `<ul class="hist">${sp.slice(0, 6).map(r => `<li><span>${esc(r.text)}</span><b class="score-pill small ${scoreClass(r.score)}">${r.score}</b></li>`).join('')}</ul>` : '<p>아직 기록이 없어요.</p>'}</div>
        </div>`;
      $$('[data-pid]', el).forEach(b => b.onclick = () => { p = u.profiles.find(x => x.id === b.dataset.pid); draw(); });
      const later = $('[data-rv-later]', el); if (later) later.onclick = () => { UI.reviewAsked(true); draw(); };
      // 말하기 연습 동의 (예전에 가입해서 동의 기록이 없는 보호자에게 한 번 묻는다)
      $$('[data-voice-yes], [data-voice-no]', el).forEach(b => b.onclick = () => {
        u.settings.voice = b.hasAttribute('data-voice-yes'); Store.persist();
        App.toast(u.settings.voice ? '🎤 말하기 연습을 켰어요.' : '말하기는 듣고 따라 말하기로 연습해요. 설정에서 언제든 켤 수 있어요.'); draw();
      });
    };
    draw();
  },
  alerts(el, u) {
    el.innerHTML = `<div class="card"><div class="sw-head"><h3>학습알림 ${u.notifications.length}건</h3></div>
      <p class="fine">카톡 연동 없이 여기에서 모든 알림을 볼 수 있어요. 브라우저 알림은 설정 탭에서 켜요.</p>
      ${u.notifications.length ? `<ul class="noti-list">${u.notifications.map(n => `<li class="${n.read ? '' : 'unread'}"><p>${esc(n.text)}</p><small>${fmtDate(n.at)}</small></li>`).join('')}</ul>` : UI.empty('🔕', '아직 알림이 없어요.')}</div>`;
    Store.markAllRead(); App.refreshHeader();
  },
  member(el, u) {
    const a = Store.access(), m = u.membership;
    el.innerHTML = `<div class="card status-card">${statusText(a, u)}</div>
      ${m ? `<div class="card sub-card"><h3>내 멤버십</h3><dl class="summary">
        <dt>상품</dt><dd>플러스 ${m.months}개월${m.kids === 'two' ? ' · 형제·자매' : ''}${m.granted ? ' (관리자 지급)' : ''}</dd>
        <dt>이용 기간</dt><dd>${fmtDay(m.since)} ~ ${fmtDay(m.until)}</dd>
        ${m.autoRenew ? `<dt>자동갱신</dt><dd>켜짐 · 다음 결제 ${fmtDay(m.until)} · ${won(m.nextAmount != null ? m.nextAmount : planMonthly(Store.kidsPlan(), m.months) * m.months)}</dd>` : m.granted ? '' : `<dt>결제</dt><dd>한 번만 결제한 이용권 · 자동결제 없음 · ${fmtDay(m.until)} 3일 전에 알려 드려요</dd>`}
        ${m.card ? `<dt>결제수단</dt><dd>${m.payWith === 'kakao' ? '카카오페이' : '등록된 카드 (토스페이먼츠)'}</dd>` : ''}</dl>
        <div class="row">${!m.granted && m.autoRenew ? '<button class="btn btn-ghost" data-renew="0">🛑 자동갱신 해지</button>' : ''}
        ${Store.canRefund() ? '<button class="btn btn-ghost danger" data-refund>↩️ 전액 환불 (결제 7일 이내 · 플러스 학습 전)</button>' : ''}</div>
        ${m.refund && !m.refund.self ? `<p class="fine">결제 후 플러스 학습을 시작했거나 7일이 지나서 바로 환불은 안 돼요. 고객센터(010-5117-1247, support@saessakschool.co.kr, <a href="${KAKAO_CHANNEL.chat}" target="_blank" rel="noopener">카카오톡 채널</a>)로 신청하면 이용한 ${m.refund.usedMonths}개월을 빼고 남은 ${m.refund.leftMonths}개월치 ${won(m.refund.amount)}을 환불해 드려요.</p>` : ''}</div>` : ''}
      <div class="card"><h3>결제 내역</h3>${u.payments.length ? `<table class="table"><thead><tr><th>날짜</th><th>내용</th><th>쿠폰</th><th>금액</th><th>상태</th></tr></thead><tbody>${u.payments.map(p => `<tr><td>${fmtDay(p.at)}</td><td>${esc(p.desc)}</td><td>${esc(p.coupon || '-')}</td><td>${won(p.amount)}</td><td>${p.status}</td></tr>`).join('')}</tbody></table>` : '<p class="fine">결제 내역이 없어요.</p>'}</div>
      ${m && !m.granted && m.autoRenew && m.kids !== Store.kidsPlan() ? `<div class="card notice">등록한 아이 수가 바뀌어서 다음 결제부터 월 ${won(planMonthly(Store.kidsPlan(), m.months))}${Store.kidsPlan() === 'two' ? ' (형제·자매 요금)' : ''}으로 바뀌어요. 쿠폰을 쓰면 달라질 수 있어요.</div>` : ''}
      ${a.kind === 'admin' ? '' : UI.plans()}`;
    if (a.kind !== 'admin') UI.wirePlans($('.plans', el));
    $$('[data-renew]', el).forEach(b => b.onclick = async () => {
      if (b.dataset.renew === '0' && !confirm('자동갱신을 해지할까요? 남은 기간은 그대로 이용할 수 있어요.')) return;
      try { await Store.setAutoRenew(b.dataset.renew === '1'); App.toast(b.dataset.renew === '1' ? '자동갱신을 켰어요.' : '자동갱신을 해지했어요.'); App.route(); } catch (x) { App.toast(x.message); }
    });
    const rf = $('[data-refund]', el);
    if (rf) rf.onclick = async () => { if (confirm('결제 금액을 전액 환불할까요? 이번 결제로 늘어난 기간이 바로 없어지고, 쓴 쿠폰은 돌려드려요.')) { try { await Store.refund(); App.toast('환불이 완료되었어요.'); App.route(); } catch (x) { App.toast(x.message); } } };
  },
  coupons(el, u) {
    el.innerHTML = `<div class="coupon-list">${u.coupons.map(c => { const exp = c.expires < Date.now(); return `
      <div class="coupon ${c.used || exp ? 'off' : ''}"><div class="c-rate">${Math.round((c.welcome ? WELCOME_RATE : c.rate) * 100)}%</div><div class="c-info"><b>${esc(c.name)}</b>
      <small>${c.welcome ? '플러스 첫 결제 · 1·3·6·12개월 모든 상품' : '모든 상품'}</small><small>${c.used ? '사용 완료' : exp ? '기간 만료' : `${fmtDay(c.expires)}까지 · D-${Math.ceil((c.expires - Date.now()) / 86400000)}`}</small></div></div>`; }).join('')}</div>
      <p class="fine">구매 시 할인율이 가장 높은 쿠폰 1장이 자동 적용돼요.</p><a class="btn btn-primary" href="#/pricing">요금·할인 보기</a>`;
  },
  worksheets(el, u) {
    el.innerHTML = `<div class="card"><h3>레벨별 워크시트</h3><p class="fine">눌러서 미리 보고 인쇄하거나 PDF로 저장해요. 인쇄한 날짜가 기록돼요.</p>
      <div class="ws-grid">${ALL_LEVELS.map(lv => `<a class="ws-item" href="#/worksheet/${lv}" style="--c:${stageOf(lv).color}"><b>${lv}</b><small>${u.worksheets && u.worksheets[lv] ? '🖨️ ' + fmtDay(u.worksheets[lv]) : '미인쇄'}</small></a>`).join('')}</div></div>`;
  },
  settings(el, u) {
    const p = Store.profile(), v = Speech.volume;
    el.innerHTML = `<form class="card settings">
      <h3>🔊 소리</h3>
      <label>목소리(낭독·문제) 볼륨 <input type="range" name="vvol" min="0" max="1" step="0.1" value="${v.voice}"></label>
      <label>효과음 볼륨 <input type="range" name="sfx" min="0" max="1" step="0.1" value="${v.sfx}"></label>
      <label>읽어주는 목소리 <small class="fine">(이 기기에 저장돼요)</small>
        <div class="row voice-row"><select name="voice">${voiceOptions()}</select><button type="button" class="btn btn-ghost sm" data-preview>▶ 들어보기</button></div></label>
      <p class="fine voice-help">${Speech.neuralAvailable ? '🌟 또렷한 학습 목소리를 쓸 수 있어요. 가장 자연스러운 목소리예요.' : '★ 표시가 이 기기에서 가장 자연스러운 목소리예요. Edge 브라우저의 "Natural" 목소리나, iPhone·Mac의 설정 › 손쉬운 사용 › 읽기 및 말하기에서 받은 "고품질" 목소리가 가장 좋아요.'}</p>
      <label>읽어주기 속도<select name="rate"><option value="0.7">천천히</option><option value="0.85">보통</option><option value="1">빠르게</option></select></label>
      <h3>📚 학습</h3>
      ${p ? `<label>${esc(p.name)}의 하루 목표 레슨 수<select name="goal">${[1, 2, 3, 4, 5].map(n => `<option ${n === p.dailyGoal ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>난이도<select name="diff">${[['auto', '자동 (정답률에 맞춰)'], ['easy', '쉬움 (보기 2개 + 힌트)'], ['normal', '보통'], ['hard', '도전 (보기 4개)']].map(([k, t]) => `<option value="${k}" ${k === (p.difficulty || 'auto') ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}
      <label class="check"><input type="checkbox" name="voiceok" ${u.settings.voice ? 'checked' : ''}> 말하기 연습 음성 인식 사용 (보호자 동의 · 아이가 말한 소리를 알아듣는 데만 쓰고 저장하지 않아요. <a href="privacy.html#voice" target="_blank">자세히</a>)</label>
      <label class="check"><input type="checkbox" name="gentle" ${u.settings.gentle !== false ? 'checked' : ''}> 아이 목소리 너그럽게 채점 (통과 점수 45점)</label>
      <h3>🎈 놀이터</h3>
      <label class="check"><input type="checkbox" name="playlesson" ${u.settings.playAfterLesson !== false ? 'checked' : ''}> 오늘 레슨 1개를 마친 뒤에 놀이터 열기</label>
      <label>하루 놀이터 시간<select name="playmin">${[[0, '제한 없음'], [10, '10분'], [15, '15분'], [20, '20분'], [30, '30분']].map(([v, t]) => `<option value="${v}" ${(+u.settings.playMinutes || 0) === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <h3>🔔 알림</h3>
      <label class="check"><input type="checkbox" name="notify" ${u.settings.notify ? 'checked' : ''}> 학습알림 받기</label>
      <label>매일 리마인더 시간<input type="time" name="remind" value="${u.settings.remindTime}"></label>
      ${u.email ? `<label class="check"><input type="checkbox" name="weekly" ${u.settings.weeklyMail !== false ? 'checked' : ''}> 주간 리포트 메일 받기 (일요일 저녁, 아이별 한 주 학습 기록)</label>` : ''}
      <label class="check"><input type="checkbox" name="mkt" ${u.settings.marketing ? 'checked' : ''}> 학습 소식·혜택 알림 받기 (마케팅 수신 동의, 끄면 바로 철회돼요)</label>
      <p class="fine">시간을 바꾸면 아래 <b>저장</b>을 눌러 주세요.</p>
      <div class="push-box" data-push></div>
      <h3>🔐 보안</h3>
      <label>부모페이지 PIN (숫자 4자리, 비우면 그대로)<input name="pin" inputmode="numeric" maxlength="4" placeholder="${u.settings.pin ? '설정됨 · 새 PIN 입력' : '미설정'}"></label>
      ${u.settings.pin ? '<label class="check"><input type="checkbox" name="unpin"> PIN 잠금 해제</label>' : ''}
      <button class="btn btn-primary">저장</button>
    </form>
    <div class="card"><h3>프로필 관리</h3><ul class="plain">${u.profiles.map(x => `<li>${x.avatar} ${esc(x.name)} (${x.age}살) · 출발 Level ${x.startLevel} <button class="link-btn danger" data-del="${x.id}">삭제</button></li>`).join('')}</ul><a class="btn btn-ghost" href="#/profiles">프로필 추가</a></div>
    <div class="card"><h3>데이터 · 계정</h3><p class="fine">모든 기록은 이 브라우저에만 저장돼요. 다른 기기로 옮기려면 내보내기 파일을 쓰세요.</p>
      <div class="row"><button class="btn btn-ghost" data-export>학습 기록 내보내기</button><label class="btn btn-ghost">불러오기<input type="file" accept="application/json" hidden data-import></label>
      <button class="btn btn-ghost danger" data-leave>회원 탈퇴</button></div></div>`;
    const f = $('form', el);
    f.rate.value = String(App.rate || 0.85);
    f.vvol.oninput = () => Speech.setVolume('voice', +f.vvol.value);
    f.vvol.onchange = () => Speech.speak('Hello!');
    f.voice.value = Speech.voiceChoice;
    const preview = () => Speech.speak('Hello! A is for apple. I like to read books with you.');
    f.voice.onchange = () => { Speech.setVoice(f.voice.value); preview(); };
    $('[data-preview]', el).onclick = preview;
    f.sfx.oninput = () => { Speech.setVolume('sfx', +f.sfx.value); Speech.sfx.tap(); };
    f.onsubmit = async e => {
      e.preventDefault();
      if (p) { p.dailyGoal = +f.goal.value; p.difficulty = f.diff.value; }
      App.rate = +f.rate.value; Speech.setRate(App.rate); try { localStorage.setItem('sprout-rate', App.rate); } catch (x) { /* ignore */ }
      u.settings.notify = f.notify.checked; u.settings.remindTime = f.remind.value || '19:00'; u.settings.gentle = f.gentle.checked; u.settings.marketing = f.mkt.checked; u.settings.voice = f.voiceok.checked; u.settings.playAfterLesson = f.playlesson.checked; u.settings.playMinutes = +f.playmin.value; if (f.weekly) u.settings.weeklyMail = f.weekly.checked;
      if (f.pin.value) { if (!/^\d{4}$/.test(f.pin.value)) return App.toast('PIN은 숫자 4자리예요.'); u.settings.pin = await Store.hash(f.pin.value); App.pinOk = true; }
      else if (f.unpin && f.unpin.checked) u.settings.pin = '';
      Store.persist(); App.toast('저장했어요.'); App.route();
    };
    Push.render($('[data-push]', el));
    if (API.on) $('[data-export]', el).insertAdjacentHTML('afterend', '<span class="fine">학습 기록은 서버에 자동 저장돼요.</span>');
    $$('[data-del]', el).forEach(b => b.onclick = () => { const x = u.profiles.find(q => q.id === b.dataset.del); if (confirm(`${x.name} 프로필과 학습 기록을 삭제할까요? 되돌릴 수 없어요.`)) { Store.removeProfile(x.id); App.refreshHeader(); App.route(); } });
    $('[data-export]', el).onclick = () => App.download(`sprout-english-${Store.today()}.json`, Store.exportData());
    $('[data-import]', el).onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { Store.importData(await file.text()); App.toast('불러오기 완료!'); App.refreshHeader(); App.route(); } catch (x) { App.toast(x.message); }
    };
    $('[data-leave]', el).onclick = async () => { if (prompt('탈퇴하면 모든 학습 기록이 삭제돼요. 결제 기록은 법에 따라 5년 동안 따로 보관돼요. 계속하려면 "탈퇴"를 입력하세요.') === '탈퇴') { try { await Store.deleteAccount(); } catch (x) { return App.toast(x.message); } App.refreshHeader(); location.hash = '#/'; App.toast('탈퇴했어요. 그동안 고마웠어요.'); } };
  },
};

/* ---------- 관리자 콘솔 ---------- */
Views.admin = async (el, tab) => {
  const tabs = { users: '👥 회원', outcomes: '📈 성과', reviews: '💬 후기', content: '📚 콘텐츠', system: '🖥️ 시스템' };
  tab = tabs[tab] ? tab : 'users';
  el.innerHTML = `<div class="wrap sec"><h1 class="page-title">🛠️ 관리자 콘솔</h1><p class="fine">불러오는 중…</p></div>`;
  let users, stats;
  try { [users, stats] = await Promise.all([Store.Admin.load(), Store.Admin.stats()]); }
  catch (x) { el.innerHTML = `<div class="wrap sec">${UI.empty('⚠️', esc(x.message))}</div>`; return; }
  const members = users.filter(u => Store.access(u).kind === 'member').length;
  const revenue = stats ? stats.revenue : users.flatMap(u => u.payments || []).filter(p => p.status === '결제완료').reduce((s, p) => s + p.amount, 0);
  el.innerHTML = `<div class="wrap sec">
    <h1 class="page-title">🛠️ 관리자 콘솔 <small>${API.on ? '서버 모드' : '로컬 데모 모드'}</small></h1>
    <div class="kpis">
      <div class="kpi"><small>전체 회원</small><b>${users.length}</b></div>
      <div class="kpi"><small>멤버십</small><b>${members}</b></div>
      <div class="kpi"><small>체험 중</small><b>${users.filter(u => Store.access(u).kind === 'trial').length}</b></div>
      <div class="kpi"><small>아이 프로필</small><b>${users.reduce((s, u) => s + u.profiles.length, 0)}</b></div>
      <div class="kpi"><small>결제 합계</small><b>${won(revenue)}</b></div>
      <div class="kpi"><small>후기</small><b>${Store.reviews().length}</b></div>
    </div>
    <nav class="tabs">${Object.entries(tabs).map(([k, v]) => `<a href="#/admin/${k}" class="${k === tab ? 'on' : ''}">${v}</a>`).join('')}</nav>
    <div class="tab-body"></div></div>`;
  AdminTabs[tab]($('.tab-body', el), users, stats);
};
const AdminTabs = {
  // 📈 성과: 아이마다 매주 남긴 누적 기록으로 '첫 기록 → 지금' 변화를 본다 (실제 성과 숫자를 모으려고, 2026-11-26)
  async outcomes(el) {
    if (!API.on) { el.innerHTML = '<p class="fine">서버 모드에서만 볼 수 있어요.</p>'; return; }
    const draw = async now => {
      const o = await API.req('GET', 'api/admin/outcomes' + (now ? '?now=1' : ''));
      const rows = Object.values(o).filter(l => l.length).map(l => ({ first: l[0], last: l[l.length - 1], n: l.length })).sort((a, b) => b.last.lessons - a.last.lessons);
      const d = (a, b, k) => (b[k] ?? 0) - (a[k] ?? 0);
      el.innerHTML = `<div class="card"><h3>📈 아이별 성과 <small>매주 일요일 19시 기록 · 첫 기록과 최근 기록 비교</small></h3>
        <div class="row"><button class="btn btn-ghost sm" data-now>지금 한 번 기록하기</button></div>
        ${rows.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>아이</th><th>기간</th><th>레슨</th><th>마친 레벨</th><th>배운 단어·문장</th><th>완전히 익힘</th><th>최근 7일 정답률</th><th>말하기 점수</th><th>학습 시간</th></tr></thead><tbody>
        ${rows.map(({ first: a, last: b, n }) => `<tr><th>${esc(b.name || '')}</th><td>${a.day} → ${b.day} (${n}번)</td><td>${b.lessons} <small>(+${d(a, b, 'lessons')})</small></td><td>${b.levels} <small>(+${d(a, b, 'levels')})</small></td><td>${b.words} <small>(+${d(a, b, 'words')})</small></td><td>${b.mastered} <small>(+${d(a, b, 'mastered')})</small></td><td>${b.avg ?? '-'}%</td><td>${b.speak ?? '-'}</td><td>${b.minutes}분 <small>(+${d(a, b, 'minutes')})</small></td></tr>`).join('')}</tbody></table></div>` : '<p class="fine">아직 기록이 없어요. [지금 한 번 기록하기]를 누르면 출발점이 생겨요.</p>'}
        <p class="fine">4주 뒤 "배운 단어·문장"과 "완전히 익힘"이 늘어난 숫자를 실제 후기·첫 화면 문구에 쓸 수 있어요. 보호자 동의 없이 아이 이름을 밖에 쓰지 마세요.</p></div>`;
      $('[data-now]', el).onclick = () => draw(true);
    };
    await draw(false);
  },
  users(el, users) {
    const prov = { email: '📧', kakao: '💬', naver: 'N', google: 'G', apple: '🍎' };
    // 가입 경로별 가입 수 (마케팅 링크의 utm_source, 없으면 들어온 사이트). 2026-11-07 전에 가입한 회원은 기록이 없다
    const SRC = { blog: '블로그', instagram: '인스타그램', cafe: '카페', kakao: '카카오톡', threads: '스레드', daangn: '당근', 'naver.com': '네이버 검색', 'google.com': '구글 검색', 'google.co.kr': '구글 검색' };
    const srcName = v => (v ? SRC[v] || v : '바로 들어옴·기록 없음');
    const since = d => Date.now() - d * 864e5, bySrc = {};
    users.forEach(u => { const r = bySrc[u.source || ''] ||= { d7: 0, d30: 0, all: 0 }; r.all++; if (u.createdAt > since(30)) r.d30++; if (u.createdAt > since(7)) r.d7++; });
    const srcRows = Object.entries(bySrc).sort((a, b) => b[1].d30 - a[1].d30 || b[1].all - a[1].all);
    el.innerHTML = `<div class="card"><h3>가입 경로</h3><p class="fine">홍보 링크에 붙인 utm_source로 셉니다 (예: ?utm_source=blog). 링크 없이 들어오면 들어온 사이트 이름이 남아요.</p>
      <div class="table-wrap"><table class="table"><thead><tr><th>경로</th><th>최근 7일</th><th>최근 30일</th><th>전체</th></tr></thead><tbody>
      ${srcRows.map(([k, r]) => `<tr><td>${esc(srcName(k))}</td><td>${r.d7}</td><td>${r.d30}</td><td>${r.all}</td></tr>`).join('')}</tbody></table></div></div>
      <input class="search" type="search" placeholder="이메일·이름·회원번호로 검색" aria-label="회원 검색">
      <div class="table-wrap"><table class="table"><thead><tr><th>회원</th><th>로그인</th><th>권한</th><th>상태</th><th>아이</th><th>가입일</th><th>경로</th><th></th></tr></thead><tbody class="user-rows"></tbody></table></div>
      <div class="card" id="userDetail" hidden></div>`;
    const tbody = $('.user-rows', el);
    const draw = q => {
      const list = users.filter(u => !q || ((u.email || '') + u.parentName + (u.memberNo || '')).toLowerCase().includes(q.toLowerCase()));
      tbody.innerHTML = list.map(u => { const a = Store.access(u); return `<tr><td><b>${esc(u.parentName)}</b><br><small>${esc(u.email || '(이메일 없음)')}${u.memberNo ? ` · №${esc(u.memberNo)}` : ''}${u.referrals ? ` · 추천 ${u.referrals}명` : ''}</small></td><td>${u.providers.map(p => prov[p] || p).join(' ')}</td>
        <td>${u.role === 'admin' ? '<span class="chip on">관리자</span>' : '보호자'}</td><td>${a.kind === 'member' ? `💎 ${a.daysLeft}일` : a.kind === 'trial' ? `${a.beta ? '🧪 베타' : '🎁 체험'} ${a.daysLeft}일` : a.kind === 'admin' ? '전체 이용' : '🌱 무료'}</td>
        <td>${u.profiles.map(p => p.avatar).join('') || '-'}</td><td>${fmtDay(u.createdAt)}</td><td><small>${u.source ? esc(srcName(u.source)) : '-'}</small></td><td><button class="btn btn-ghost sm" data-u="${esc(u.id)}">관리</button></td></tr>`; }).join('') || '<tr><td colspan="8">회원이 없어요.</td></tr>';
      $$('[data-u]', tbody).forEach(b => b.onclick = () => detail(b.dataset.u));
    };
    const detail = key => {
      const u = Store.Admin.get(key), box = $('#userDetail', el); if (!u) return;
      const self = key === Store.user().id;
      box.hidden = false;
      box.innerHTML = `<h3>${esc(u.parentName)} <small>${esc(u.email || '')}</small></h3>
        <p class="fine">최근 로그인 ${fmtDate(u.lastLogin)} · 결제 ${u.payments.length}건 · 쿠폰 ${u.coupons.filter(c => !c.used).length}장 · 아이: ${u.profiles.map(p => `${p.avatar}${esc(p.name)}(Lv ${Store.currentLevel(p)}, ⭐${p.stars || 0})`).join(', ') || '없음'}</p>
        ${u.payments.length ? `<div class="table-wrap"><table class="table"><tbody>${u.payments.slice(0, 5).map(p => `<tr><td>${fmtDay(p.at)}</td><td>${esc(p.desc)}</td><td>${won(p.amount)}</td><td>${p.status}</td></tr>`).join('')}</tbody></table></div>` : ''}
        <div class="admin-actions">
          <button class="btn btn-ghost sm" data-act="grant" data-months="1">💎 1개월 지급</button><button class="btn btn-ghost sm" data-act="grant" data-months="12">💎 12개월 지급</button>
          ${u.membership && u.membership.refund ? `<button class="btn btn-ghost sm danger" data-act="refund">↩️ 환불 ${u.membership.refund.full ? '(전액)' : `(${u.membership.refund.usedMonths}개월 빼고)`} ${won(u.membership.refund.amount)}</button>` : ''}<button class="btn btn-ghost sm" data-act="revoke">멤버십 회수</button><button class="btn btn-ghost sm" data-act="trial">⏳ 체험 +7일</button>
          <button class="btn btn-ghost sm" data-act="coupon">🎟️ 50% 쿠폰 발급</button><button class="btn btn-ghost sm" data-act="stars">⭐ 별 +10</button>
          ${self ? '' : `<button class="btn btn-ghost sm" data-act="role">${u.role === 'admin' ? '관리자 해제' : '관리자로 지정'}</button><button class="btn btn-ghost sm danger" data-act="delete">회원 삭제</button>`}
        </div>`;
      $$('[data-act]', box).forEach(b => b.onclick = async () => {
        const act = b.dataset.act, A = Store.Admin;
        try {
          if (act === 'refund' && !confirm(`${u.email || u.parentName} 회원에게 ${won(u.membership.refund.amount)}을 환불할까요? 결제사로 바로 취소 요청이 가요.`)) return;
          if (act === 'delete') { if (!confirm(`${u.email || u.parentName} 회원과 모든 기록을 삭제할까요? 되돌릴 수 없어요.`)) return; await A.deleteUser(key); }
          else await A.act(key, act, { months: +b.dataset.months || 1, days: 7, rate: 0.5, n: 10, role: u.role === 'admin' ? 'parent' : 'admin' });
          App.toast('처리했어요.'); App.route();
        } catch (x) { App.toast(x.message); }
      });
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    $('.search', el).oninput = e => draw(e.target.value.trim());
    draw('');
  },
  reviews(el) {
    const list = Store.reviews();
    el.innerHTML = `<div class="review-grid">${list.map(r => UI.reviewCard(r, true)).join('') || UI.empty('📝', '후기가 없어요.')}</div>`;
    $$('[data-delrev]', el).forEach(b => b.onclick = async () => { if (confirm('이 후기를 삭제할까요?')) { await Store.deleteReview(b.dataset.delrev).catch(x => App.toast(x.message)); App.route(); } });
  },
  content(el) {
    el.innerHTML = `<div class="card"><h3>레벨별 콘텐츠</h3><p class="fine">관리자는 모든 레벨·스토리·게임이 열려 있어요. 체험 레슨과 워크시트로 바로 검수하세요.</p>
      <div class="table-wrap"><table class="table"><thead><tr><th>레벨</th><th>단계</th><th>학습 항목</th><th>검수</th></tr></thead><tbody>
      ${ALL_LEVELS.map(lv => `<tr><td><span class="level-box sm" style="--c:${stageOf(lv).color}">${lv}</span></td><td>${stageOf(lv).id}. ${stageOf(lv).title}</td><td>${Gen.levelItems(lv).length}개</td>
        <td><a class="link-btn" href="#/sample/${lv}">체험</a> <a class="link-btn" href="#/worksheet/${lv}">워크시트</a></td></tr>`).join('')}</tbody></table></div></div>
      <div class="card"><h3>스토리북</h3><ul class="plain">${STORIES.map(s => `<li><span class="cover-mini">${bookCover(s)}</span> ${esc(s.title)} (${s.stage}단계, ${s.pages.length}쪽)</li>`).join('')}</ul></div>`;
  },
  system(el, users, stats) {
    const ok = v => v ? '✅ 설정됨' : '⚠️ 미설정';
    el.innerHTML = API.on ? `
      <div class="card"><h3>서버 상태</h3><dl class="summary">
        <dt>공개 주소</dt><dd>${esc(stats.setup.publicUrl)}</dd>
        <dt>Node.js</dt><dd>${esc(stats.server.node)} · 가동 ${stats.server.uptimeMin}분 · 부하 ${stats.server.load}</dd>
        <dt>남은 메모리</dt><dd>${stats.server.freeMemMB}MB</dd><dt>DB 크기</dt><dd>${stats.server.dbSizeKB}KB</dd></dl></div>
      <div class="card"><h3>연동 설정 <small>서버의 .env에서 바꿔요</small></h3><dl class="summary">
        <dt>인증코드 메일(SMTP)</dt><dd>${ok(stats.setup.mail)}</dd>
        <dt>휴대폰 인증</dt><dd>${stats.setup.phone ? `✅ ${stats.setup.phone === 'alimtalk' ? '카카오 알림톡 + 문자' : '문자'}` : '⚠️ 꺼짐'}</dd>
        ${Object.entries(stats.setup.providers).map(([k, v]) => `<dt>${k} 로그인</dt><dd>${ok(v)}</dd>`).join('')}
        <dt>결제</dt><dd>${(stats.setup.payMethods || []).length ? '✅ ' + stats.setup.payMethods.map(k => ({ card: '토스페이먼츠(카드)', kakao: '카카오페이' }[k])).join(' · ') : { demo: '🧪 데모 결제', off: '⚠️ 꺼짐' }[stats.setup.payments] || '⚠️ 꺼짐'}</dd>
        <dt>AI 음성</dt><dd>${stats.setup.tts.provider ? `✅ ${esc(stats.setup.tts.provider)} (${esc(stats.setup.tts.voice)}) · 저장된 음성 ${stats.setup.tts.files}개, ${stats.setup.tts.sizeKB}KB` : '⚠️ 미설정 (기기 목소리 사용)'}</dd></dl></div>
      <div class="card"><h3>데이터</h3><p class="fine">매일 새벽 자동 백업돼요 (서버 data/backups). 지금 바로 받을 수도 있어요.</p>
        <div class="row"><a class="btn btn-ghost" href="api/admin/backup">💾 DB 백업 받기</a><a class="btn btn-ghost" href="api/admin/export">📄 전체 데이터 JSON</a></div></div>`
    : `<div class="card"><h3>로컬 데모 모드</h3><p class="fine">서버 없이 실행 중이라 데이터가 이 브라우저(localStorage)에만 있어요. 서버로 실행하면 회원·결제가 서버 DB에 저장돼요. (deploy/DEPLOY.md 참고)</p>
      <div class="row"><button class="btn btn-ghost" data-export>전체 데이터 내보내기</button><button class="btn btn-ghost danger" data-reset>전체 초기화</button></div></div>`;
    if (API.on) return;
    $('[data-export]', el).onclick = () => App.download(`sprout-english-db-${Store.today()}.json`, Store.Admin.exportAll());
    $('[data-reset]', el).onclick = () => { if (prompt('모든 회원과 기록이 삭제돼요. "초기화"를 입력하세요.') === '초기화') { Store.Admin.resetAll(); App.refreshHeader(); location.hash = '#/'; App.toast('초기화했어요.'); } };
  },
};

/* ---------- 이용권 만료 ---------- */
Views.paywall = el => {
  el.innerHTML = `<div class="wrap sec narrow center"><div class="card intro">${UI.mascot('체험 기간이 끝났어! 그동안 모은 별과 기록은 그대로 있어. 다시 만나자!', '🥺')}
    <h1>${FREE().plusFrom}부터는 플러스예요</h1><p>${FREE().range}는 평생 무료로 계속할 수 있어요. 플러스는 월 ${won(lowestMonthly())}부터예요.</p>
    <a class="btn btn-primary lg" href="#/pricing">요금·할인 보기</a></div></div>`;
};

/* ---------- 친구·응원 쪽지·추천 ---------- */
// 쪽지는 정해진 문구·스티커만 보낸다 (서버 social.js의 MESSAGE_CODES와 같은 번호)
const CHEERS = {
  c1: '오늘도 화이팅! 💪', c2: '레벨 올린 거 축하해! 🎉', c3: '같이 공부하자! 📚', c4: '스토리북 재밌었어! 📖', c5: '나도 오늘 공부했어! ✅',
  c6: '별 많이 모았네! ⭐', c7: '내일 또 만나! 👋', c8: '영어 실력 최고야! 👍', c9: 'Good job! 🌟', c10: 'You can do it! 🚀',
  s1: '🌟', s2: '👏', s3: '🎈', s4: '🐣', s5: '🌈', s6: '🍀', s7: '🏆', s8: '💖',
};
const inviteUrl = no => `${location.origin}${location.pathname}?ref=${no}`;
async function copyText(text, msg = '복사했어요.') {
  try { await navigator.clipboard.writeText(text); App.toast(msg); } catch { prompt('아래 내용을 복사해 주세요.', text); }
}
// 친구 아이 카드에 보여 줄 레벨·연속 학습일·이번 주 학습일
function friendStats(k) {
  const p = { startLevel: k.startLevel || 'A', progress: k.progress || {}, stamps: k.stamps || {} };
  const lv = Store.currentLevel(p), st = stageOf(lv === 'Z' ? ALL_LEVELS[ALL_LEVELS.length - 1] : lv);
  const week = [...Array(7)].filter((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return p.stamps[Store.today(d)]; }).length;
  return { lv: lv === 'Z' ? '완주' : `Level ${lv}`, stage: `${st.id}단계 ${st.title}`, streak: Store.streak(p), week };
}
const kidChip = k => `<span class="fr-ava">${avatarHtml({ avatar: k.avatar, wear: k.wear || {} }, 'sm')}</span>`;

Views.friends = async el => {
  if (!API.on) { el.innerHTML = `<div class="wrap sec narrow">${UI.empty('👫', '친구 기능은 새싹스쿨 사이트에 로그인하면 쓸 수 있어요.')}</div>`; return; }
  const u = Store.user(), me = Store.profile();
  el.innerHTML = `<div class="wrap sec narrow"><h1 class="page-title">👫 ${esc(me.name)}의 친구</h1><p class="fine">불러오는 중…</p></div>`;
  let S;
  try { S = await Store.Social.load(); } catch (x) { el.innerHTML = `<div class="wrap sec narrow">${UI.empty('⚠️', esc(x.message))}</div>`; return; }
  const parentOnly = !!u.settings.friendApproval;
  const mine = list => list.filter(f => f.myKid === me.id);
  const friends = mine(S.friends), incoming = mine(S.incoming), outgoing = mine(S.outgoing);
  const inbox = S.messages.filter(m => m.toKid === me.id).slice(0, 20);
  el.innerHTML = `<div class="wrap sec narrow friends-page">
    <h1 class="page-title">👫 ${esc(me.name)}의 친구</h1>
    <div class="card fr-mine"><div><small>우리 집 회원번호</small><b class="fr-no">${esc(S.memberNo)}</b><small>친구에게 이 번호를 알려 주면 친구 신청을 받을 수 있어요.</small></div>
      <button class="btn btn-ghost sm" data-copy>번호 복사</button></div>
    ${inbox.length ? `<div class="card"><h3>💌 받은 응원</h3><ul class="fr-inbox">${inbox.map(m => `<li class="${m.read ? '' : 'new'}">${kidChip(m.from)}<b>${esc(m.from.name)}</b><span class="fr-msg">${esc(CHEERS[m.code] || '')}</span><small>${fmtDate(m.at)}</small></li>`).join('')}</ul></div>` : ''}
    ${incoming.length ? `<div class="card"><h3>📮 친구 신청이 왔어요</h3>${incoming.map(f => `<div class="fr-row">${kidChip(f.kid)}<b>${esc(f.kid.name)}</b>
      ${parentOnly ? '<small class="fine">부모님이 부모페이지에서 수락해요</small>' : `<button class="btn btn-primary sm" data-act="accept" data-id="${f.id}">수락</button><button class="btn btn-ghost sm" data-act="remove" data-id="${f.id}">거절</button>`}</div>`).join('')}</div>` : ''}
    <div class="card"><h3>🌟 내 친구 ${friends.length ? `<small>${friends.length}명</small>` : ''}</h3>
      ${friends.length ? `<div class="fr-grid">${friends.map(f => { const s = friendStats(f.kid); return `<div class="fr-card">${kidChip(f.kid)}<b>${esc(f.kid.name)}</b>
        <span class="chip">${s.lv}</span><small>${esc(s.stage)}</small><small>⭐${f.kid.stars} · 🔥연속 ${s.streak}일 · 이번 주 ${s.week}일 · 📖${f.kid.stories}권</small>
        <button class="btn btn-ghost sm" data-cheer="${f.id}">💌 응원 보내기</button></div>`; }).join('')}</div>` : '<p class="fine">아직 친구가 없어요. 아래에서 친구의 회원번호로 신청해 보세요.</p>'}</div>
    <div class="card"><h3>➕ 친구 추가</h3><form class="fr-add" novalidate><input name="no" inputmode="numeric" maxlength="7" placeholder="친구네 회원번호 7자리" aria-label="친구네 회원번호"><button class="btn btn-primary sm">찾기</button></form>
      <div class="fr-found"></div>
      ${outgoing.length ? `<p class="fine">수락을 기다리는 신청: ${outgoing.map(f => `${esc(f.kid.name)} <button class="link-btn" data-act="remove" data-id="${f.id}">취소</button>`).join(' · ')}</p>` : ''}
      <p class="fine">회원번호를 직접 주고받은 친구만 신청할 수 있어요. 친구에게는 이름·캐릭터·레벨·별·학습일만 보여요.</p></div>
    <dialog class="fr-dialog"><h3>💌 응원 보내기</h3>${['c', 's'].map(t => `<div class="cheer-grid ${t === 's' ? 'stickers' : ''}">${Object.entries(CHEERS).filter(([k]) => k[0] === t).map(([k, v]) => `<button class="cheer ${t === 's' ? 'sticker' : ''}" data-code="${k}">${esc(v)}</button>`).join('')}</div>`).join('')}
      <button class="btn btn-ghost full" data-close>닫기</button></dialog>
  </div>`;
  if (inbox.some(m => !m.read)) Store.Social.read(me.id).catch(() => {});
  $('[data-copy]', el).onclick = () => copyText(S.memberNo, '회원번호를 복사했어요.');
  const act = async (id, action) => { try { await Store.Social.respond(id, action); App.toast(action === 'accept' ? '친구가 되었어요! 🎉' : '처리했어요.'); Views.friends(el); } catch (x) { App.toast(x.message); } };
  $$('[data-act]', el).forEach(b => b.onclick = () => act(b.dataset.id, b.dataset.act));
  const dlg = $('.fr-dialog', el); let target = null;
  $$('[data-cheer]', el).forEach(b => b.onclick = () => { target = b.dataset.cheer; dlg.showModal(); });
  $('[data-close]', dlg).onclick = () => dlg.close();
  $$('[data-code]', dlg).forEach(b => b.onclick = async () => {
    try { await Store.Social.message(target, me.id, b.dataset.code); dlg.close(); App.toast('응원을 보냈어요! 💌'); } catch (x) { App.toast(x.message); }
  });
  const f = $('.fr-add', el), found = $('.fr-found', el);
  f.onsubmit = async e => {
    e.preventDefault();
    const no = f.no.value.replace(/\D/g, '');
    if (no.length !== 7) { found.innerHTML = '<p class="form-err">회원번호는 숫자 7자리예요.</p>'; return; }
    if (no === S.memberNo) { found.innerHTML = '<p class="form-err">우리 집 번호예요. 친구네 번호를 넣어 주세요.</p>'; return; }
    try {
      const { kids } = await Store.Social.lookup(no);
      found.innerHTML = `<p>누구와 친구가 될까요?</p><div class="fr-pick">${kids.map(k => `<button class="btn btn-ghost" data-kid="${esc(k.id)}">${avaFace(k.avatar)} ${esc(k.name)}</button>`).join('')}</div>`;
      $$('[data-kid]', found).forEach(b => b.onclick = async () => {
        try { await Store.Social.request(me.id, no, b.dataset.kid); App.toast('친구 신청을 보냈어요!'); Views.friends(el); } catch (x) { App.toast(x.message); }
      });
    } catch (x) { found.innerHTML = `<p class="form-err">${esc(x.message)}</p>`; }
  };
};

ParentTabs.friends = async (el, u) => {
  if (!API.on) { el.innerHTML = UI.empty('👫', '친구·추천은 새싹스쿨 사이트에 로그인하면 쓸 수 있어요.'); return; }
  el.innerHTML = '<p class="fine">불러오는 중…</p>';
  let S;
  try { S = await Store.Social.load(); } catch (x) { el.innerHTML = UI.empty('⚠️', esc(x.message)); return; }
  const R = S.referral, left = R.per - (R.count % R.per);
  const kidName = id => esc((u.profiles.find(p => p.id === id) || {}).name || '');
  const row = (f, btns) => `<div class="fr-row">${kidChip(f.kid)}<b>${esc(f.kid.name)}</b><small>↔ ${kidName(f.myKid)}</small>${btns}</div>`;
  el.innerHTML = `
    <div class="card fr-mine"><div><small>우리 집 회원번호</small><b class="fr-no">${esc(S.memberNo)}</b>
      <small>친구 추가와 추천인 코드로 써요. 아래 초대 링크로 가입하면 추천인 칸에 이 번호가 자동으로 들어가요.</small></div>
      <div class="fr-btns"><button class="btn btn-ghost sm" data-copy-no>번호 복사</button><button class="btn btn-primary sm" data-invite>초대 링크 보내기</button></div></div>
    <div class="card"><h3>🎁 추천 현황</h3>
      <div class="kpis"><div class="kpi"><small>내가 추천한 회원</small><b>${R.count}명</b></div><div class="kpi"><small>받은 보상</small><b>${R.rewards}개월</b></div></div>
      <div class="rb-bar"><i style="width:${(R.count % R.per) / R.per * 100}%"></i></div>
      <p>${R.count % R.per}/${R.per}명 · <b>${left}명</b> 더 추천받으면 이용 기간이 <b>1개월</b> 늘어나요.</p>
      ${R.pending ? `<p class="hint">쌓인 보상 ${R.pending}개월이 있어요. 플러스를 결제하면 바로 더해져요.</p>` : ''}
      <p class="fine">추천 보상은 플러스 결제 회원에게 드려요. 새 회원이 가입할 때 추천인 칸에 우리 집 회원번호를 넣으면 1명으로 세요.</p></div>
    <div class="card"><h3>👫 아이 친구 관리</h3>
      <label class="check"><input type="checkbox" name="approval" ${u.settings.friendApproval ? 'checked' : ''}> 친구 신청은 부모가 수락해요 <small class="fine">(켜면 아이 화면에서는 수락할 수 없어요)</small></label>
      ${S.incoming.length ? `<h4>📮 받은 친구 신청</h4>${S.incoming.map(f => row(f, `<button class="btn btn-primary sm" data-act="accept" data-id="${f.id}">수락</button><button class="btn btn-ghost sm" data-act="remove" data-id="${f.id}">거절</button><button class="btn btn-ghost sm danger" data-act="block" data-id="${f.id}">차단</button>`)).join('')}` : ''}
      <h4>친구 목록</h4>${S.friends.length ? S.friends.map(f => row(f, `<small>${friendStats(f.kid).lv}</small><button class="btn btn-ghost sm" data-act="remove" data-id="${f.id}">삭제</button><button class="btn btn-ghost sm danger" data-act="block" data-id="${f.id}">차단</button>`)).join('') : '<p class="fine">아직 친구가 없어요.</p>'}
      ${S.outgoing.length ? `<h4>보낸 신청</h4>${S.outgoing.map(f => row(f, `<button class="btn btn-ghost sm" data-act="remove" data-id="${f.id}">취소</button>`)).join('')}` : ''}
      ${S.blocked.length ? `<h4>차단한 친구</h4>${S.blocked.map(f => row(f, `<button class="btn btn-ghost sm" data-act="unblock" data-id="${f.id}">차단 풀기</button>`)).join('')}` : ''}
      <p class="fine">친구끼리는 정해진 응원 문구와 스티커만 주고받아요. 직접 쓴 글은 보낼 수 없어요. 차단하면 서로 신청과 쪽지를 보낼 수 없어요.</p></div>`;
  $('[data-copy-no]', el).onclick = () => copyText(S.memberNo, '회원번호를 복사했어요.');
  $('[data-invite]', el).onclick = async () => {
    const text = `새싹스쿨에서 아이랑 영어 공부해요! 가입할 때 추천인 번호 ${S.memberNo}을 넣어 주세요.`, url = inviteUrl(S.memberNo);
    if (navigator.share) { try { await navigator.share({ title: '새싹스쿨', text, url }); return; } catch (x) { if (x.name === 'AbortError') return; } }
    copyText(`${text}\n${url}`, '초대 링크를 복사했어요.');
  };
  $('[name=approval]', el).onchange = e => { u.settings.friendApproval = e.target.checked; Store.persist(); App.toast(e.target.checked ? '이제 부모가 친구 신청을 수락해요.' : '아이도 친구 신청을 수락할 수 있어요.'); };
  $$('[data-act]', el).forEach(b => b.onclick = async () => {
    if (b.dataset.act === 'block' && !confirm('차단하면 서로 친구 신청과 쪽지를 보낼 수 없어요. 차단할까요?')) return;
    try { await Store.Social.respond(b.dataset.id, b.dataset.act); App.toast('처리했어요.'); ParentTabs.friends(el, u); } catch (x) { App.toast(x.message); }
  });
};

/* ---------- 미니룸 (시험): 빈 방을 별 상점 아이템으로 꾸미고, 꾸민 캐릭터가 방 안을 돌아다닌다 ---------- */
// 방 그림(벽지마다 한 장, 모두 같은 구도)의 걸어 다닐 바닥과 벽 아래 선 (방 그림에 대한 비율)
const MR_FLOOR = [[.5, .53], [.08, .86], [.1, .96], [.9, .96], [.92, .87]];
const mrBase = x => .47 + Math.abs(x - .5) * .76; // 그 x에서 벽과 바닥이 만나는 높이
// 처음 놓는 자리 (바닥 아이템은 아래 가운데, 벽 아이템은 가운데)
const MR_SPOT = { bed: [.76, .83], shelf: [.42, .62], rug: [.5, .84], plant: [.14, .84], toybox: [.3, .92], desk: [.62, .64], sofa: [.24, .74], lamp: [.88, .84], tent: [.72, .93],
  window: [.25, .36], frame: [.74, .38], clock: [.62, .2], bunting: [.38, .14] };
const mrItem = id => SHOP.find(x => x.id === id);
// 따라다니는 친구 그림: 앞(f)·옆(s, 오른쪽을 봄)·뒤(b) × 서 있기(0)·걷기 두 장(a, b). ar = 그림 가로/세로 (모두 같은 캔버스)
const MR_PET = { '🐥': ['1f425', .89], '🐢': ['1f422', 1.76], '🐶': ['1f436', 1.445], '🐹': ['1f439', 1.575], '🐙': ['1f419', 1.055], '🦔': ['1f994', 1.245], '🦋': ['1f98b', 1.325] };
const mrPetImg = (emoji, key) => `img/room/pet/${MR_PET[emoji][0]}-${key}.webp?v=1126`;
const mrRoom = p => { const r = p.room || {}; return { paper: r.paper || null, items: (r.items || []).filter(o => mrItem(o.id) && p.owned.includes(o.id)) }; };

Views.room = el => {
  const p = Store.profile(); if (!p) return App.go('/profiles');
  const pet = Store.worn(p).find(w => w.slot === 'pet');
  let room = mrRoom(p), edit = false, sel = null;
  const SAY = ['Hello!', 'Hi!', "I'm happy!", "Let's play!", 'I love my room!', 'Look at me!', 'Yay!'];
  const EMOTE = ['💖', '🎵', '✨', '😊', '⭐'];
  // 미리보기: 아직 사지 않은 가구(try)와 벽지(tryPaper)를 방에 놓아 볼 수 있다. 저장하지 않고, 꾸미기를 마치면 치운다
  const paperImg = () => { const id = room.tryPaper || room.paper; return (id && mrItem(id)?.img) || 'img/room/paper-base.jpg?v=2'; };
  el.innerHTML = `<section class="wrap mr-page">
    <div class="mr-head"><h1>🏠 ${esc(p.name)}의 미니룸</h1>
      <div class="row"><button class="btn btn-primary sm" data-mr-edit>🛋️ 방 꾸미기</button><a class="btn btn-ghost sm" href="#/shop">🛍️ 별 상점</a></div></div>
    <div class="mr-stage" aria-label="${esc(p.name)}의 방. 바닥을 누르면 캐릭터가 그쪽으로 걸어가요">
      <img class="mr-bg" src="${paperImg()}" alt="" draggable="false">
      <div class="mr-furn"></div>
      <div class="mr-actor mr-char"><div class="mr-say" hidden></div><div class="mr-flip"><div class="mr-bob">${roomAvatar(p)}</div></div><i class="mr-shadow"></i></div>
      ${pet ? `<div class="mr-actor mr-pet" style="--ar:${MR_PET[pet.emoji]?.[1] || 1}"><div class="mr-flip"><div class="mr-bob">${MR_PET[pet.emoji] ? `<img class="mr-pet-img" src="${mrPetImg(pet.emoji, 'f0')}" alt="" draggable="false">` : accArt(pet)}</div></div><i class="mr-shadow"></i></div>` : ''}
    </div>
    <p class="mr-tip">👆 바닥을 누르면 그쪽으로 걸어가요 · 캐릭터를 누르면 인사해요</p>
    <div class="mr-tray card" hidden></div>
  </section>`;
  const stage = $('.mr-stage', el), bg = $('.mr-bg', el), furn = $('.mr-furn', el), tray = $('.mr-tray', el), cEl = $('.mr-char', el), pEl = $('.mr-pet', el), say = $('.mr-say', el);
  const body = MR_BODY[p.avatar] || MR_BODY['🐰'], cImg = $('.mr-img', cEl);
  Object.values(body.img).forEach(src => { const im = new Image(); im.src = src; }); // 걸음 그림을 미리 받아 둔다
  // 말풍선은 모자·머리 장식 위로 (가장 높이 올라온 꾸미기를 잰다)
  const lift = () => { const r = cEl.getBoundingClientRect(); if (!r.height) return; const top = Math.min(r.top, ...$$('.acc:not(.acc-hand):not(.acc-fx)', cEl).map(a => a.getBoundingClientRect().top)); say.style.setProperty('--lift', `${((r.top - top) / r.height * 100).toFixed(1)}%`); };
  cImg.addEventListener('load', lift, { once: true }); setTimeout(lift, 400);
  const inside = (x, y) => { let c = false; for (let i = 0, j = MR_FLOOR.length - 1; i < MR_FLOOR.length; j = i++) { const [xi, yi] = MR_FLOOR[i], [xj, yj] = MR_FLOOR[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const Y0 = .53, Y1 = .96;
  const depth = y => .6 + .4 * Math.max(0, Math.min(1, (y - Y0) / (Y1 - Y0))); // 멀리 있을수록 작게
  const toFloor = (x, y) => { for (let k = 0; k < 40 && !inside(x, y); k++) { x += (.5 - x) * .12; y += (.82 - y) * .12; } return [x, y]; };
  // 가구가 바닥에서 차지하는 자리 (앞뒤 깊이, 방 높이에 대한 비율). 캐릭터는 이 자리를 피해서 걷는다. 러그·벽 장식은 밟거나 지나가도 된다
  //   [그림 높이/너비, 그림 높이 중 바닥에 닿는 깊이의 비율]. 방 그림은 가로:세로 = 1024:640
  const FOOT = { bed: [.85, .6], shelf: [.85, .28], desk: [1.19, .42], sofa: [.68, .5], toybox: [.99, .45], tent: [1.04, .55], plant: [1.25, .25], lamp: [1.73, .12] };
  let BL = [];
  const blocks = () => { BL = room.items.filter(o => FOOT[o.id.slice(5)]).map(o => { const [ar, fd] = FOOT[o.id.slice(5)], w = mrItem(o.id).w * depth(o.y) * (o.k || 1), d = w * ar * 1.6 * fd; return [o.x - w / 2 - .025, o.y - d - .015, o.x + w / 2 + .025, o.y + .025]; }); };
  const free = (x, y) => inside(x, y) && !BL.some(([a, b, c, d]) => x > a && x < c && y > b && y < d);
  const randPt = () => { for (let k = 0; k < 300; k++) { const x = .08 + Math.random() * .84, y = Y0 + Math.random() * (Y1 - Y0); if (free(x, y)) return [x, y]; } return [.5, .9]; };
  // 길 찾기: 바닥을 칸으로 나눠 가구를 돌아가는 길을 찾고, 곧장 갈 수 있는 곳은 건너뛴다
  const GX = 40, GY = 24, cell = (i, j) => [.04 + i * .92 / (GX - 1), Y0 + j * (Y1 - Y0) / (GY - 1)];
  const ci = x => Math.max(0, Math.min(GX - 1, Math.round((x - .04) / .92 * (GX - 1)))), cj = y => Math.max(0, Math.min(GY - 1, Math.round((y - Y0) / (Y1 - Y0) * (GY - 1))));
  const clear = (a, b) => { for (let t = .02; t <= 1; t += .02) if (!free(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return false; return true; };
  const route = (x0, y0, x1, y1) => {
    const ok = (i, j) => i >= 0 && j >= 0 && i < GX && j < GY && free(...cell(i, j)), key = (i, j) => j * GX + i;
    let gi = ci(x1), gj = cj(y1), exact = free(x1, y1);
    if (!ok(gi, gj)) { let best = null; for (let i = 0; i < GX; i++) for (let j = 0; j < GY; j++) if (ok(i, j)) { const d = (i - gi) ** 2 + ((j - gj) * 1.6) ** 2; if (!best || d < best[0]) best = [d, i, j]; } if (!best) return null; [, gi, gj] = best; exact = false; }
    const si = ci(x0), sj = cj(y0), prev = new Map([[key(si, sj), -1]]), q = [[si, sj]];
    while (q.length) {
      const [i, j] = q.shift(); if (i === gi && j === gj) break;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const ni = i + di, nj = j + dj, k = key(ni, nj); if (!prev.has(k) && ok(ni, nj)) { prev.set(k, key(i, j)); q.push([ni, nj]); } }
    }
    if (!prev.has(key(gi, gj))) return null;
    const pts = []; for (let k = key(gi, gj); k !== -1 && k !== key(si, sj); k = prev.get(k)) pts.unshift(cell(k % GX, Math.floor(k / GX)));
    if (exact) pts.push([x1, y1]); if (!pts.length) return null;
    const out = []; let cur = [x0, y0], i = 0;
    while (i < pts.length) { let j = pts.length - 1; while (j > i && !clear(cur, pts[j])) j--; out.push(pts[j]); cur = pts[j]; i = j + 1; }
    return out;
  };
  // 가구: 바닥 것은 아래 가운데가 자리, 벽 것은 가운데가 자리이고 벽 기울기에 맞춰 비튼다. k는 아이가 고른 크기
  const save = () => Store.updateProfile({ room: { paper: room.paper, items: room.items.filter(o => !o.try).map(o => ({ id: o.id, x: +o.x.toFixed(3), y: +o.y.toFixed(3), ...(o.k && o.k !== 1 ? { k: o.k } : {}), ...(o.f ? { f: 1 } : {}) })) } });
  // 방향: 그림이 어느 쪽 벽에 맞게 그려졌는지(L 왼쪽 벽, R 오른쪽 벽). 놓은 쪽 벽에 맞게 좌우를 뒤집는다. 정면 그림(책장·소파)은 그쪽 벽을 따라 살짝 비튼다. 🔄로 반대로 돌릴 수 있다
  const FACE = { bed: 'L', toybox: 'L', desk: 'R' }, LEAN = { shelf: 1, sofa: .6 };
  const look = o => { const k = o.id.slice(5), side = o.x < .5 ? 'L' : 'R'; let flip = FACE[k] ? FACE[k] !== side : false; if (o.f) flip = !flip; const lean = LEAN[k] ? (side === 'L' ? -1 : 1) * 10 * LEAN[k] * (o.f ? -1 : 1) : 0; return `--fx:${flip ? -1 : 1};--lean:${lean}deg`; };
  const drawFurn = () => {
    blocks();
    furn.innerHTML = room.items.map((o, i) => {
      const it = mrItem(o.id), wall = it.slot === 'wall', flat = it.id === 'room-rug';
      const z = flat ? 1 : wall ? 2 : Math.round(o.y * 1000), s = wall ? 1 : depth(o.y), skew = wall ? (o.x < .5 ? -24 : 24) : 0;
      const tools = edit && sel === i ? `<span class="mr-tools">${o.try ? `<span class="buy" data-buyi aria-label="${it.name} 사기">⭐ ${it.cost}</span>` : ''}<span data-size="-1" aria-label="작게">➖</span><span data-size="1" aria-label="크게">➕</span>${wall || flat ? '' : '<span data-flip aria-label="방향 바꾸기">🔄</span>'}<span class="del" data-del aria-label="치우기">✕</span></span>` : '';
      return `<button class="mr-f ${wall ? 'wall' : 'floor'} ${flat ? 'flat' : ''} ${sel === i ? 'sel' : ''} ${o.try ? 'try' : ''}" data-i="${i}" style="left:${o.x * 100}%;top:${o.y * 100}%;width:${it.w * (o.k || 1) * 100}%;z-index:${sel === i ? 4000 : z};--s:${s};--skew:${skew}deg;${wall ? '' : look(o)}" aria-label="${it.name}${o.try ? ' (미리보기)' : ''}" ${edit ? '' : 'tabindex="-1"'}><img src="${it.img}" alt="" draggable="false">${o.try ? '' : ''}${tools}</button>`;
    }).join('');
  };
  const drawTray = () => {
    // 가진 것은 앞에, 아직 안 산 것은 뒤에 별 값과 함께 (눌러서 방에 놓아 보는 미리보기)
    const all = SHOP.filter(i => i.kind === 'room'), own = i => p.owned.includes(i.id);
    const sorted = list => [...list.filter(own), ...list.filter(i => !own(i))];
    const papers = sorted(all.filter(i => i.slot === 'paper')), things = sorted(all.filter(i => i.slot !== 'paper'));
    const shown = room.tryPaper || room.paper, cost = i => own(i) ? '' : `<small class="mr-cost">⭐ ${i.cost}</small>`;
    const tries = [...(room.tryPaper ? [room.tryPaper] : []), ...new Set(room.items.filter(o => o.try).map(o => o.id))].map(mrItem);
    const total = tries.reduce((n, i) => n + i.cost, 0);
    tray.innerHTML = `<div class="mr-tray-head"><b>🛋️ 방 꾸미기</b><small>아이템을 누르면 방에 놓이고, 방 안에서 끌어서 옮겨요</small><b class="mr-stars">⭐ ${p.stars || 0}</b><button class="btn btn-primary sm" data-mr-done>다 했어요</button></div>
      ${tries.length ? `<div class="mr-trybar"><div class="mr-tries">${tries.map(i => `<span class="mr-tryi"><img src="${i.img}" alt="">${i.name}<button class="btn btn-primary sm" data-buy-try="${i.id}" ${p.stars < i.cost ? 'aria-disabled="true"' : ''}>⭐ ${i.cost} 사기</button><button class="btn btn-ghost sm" data-untry="${i.id}" aria-label="${i.name} 치우기">✕</button></span>`).join('')}</div>${tries.length > 1 ? `<button class="btn btn-primary sm" data-buy-all ${p.stars < total ? 'aria-disabled="true"' : ''}>모두 사기 ⭐ ${total}</button>` : ''}</div>` : ''}
      <h4>벽지</h4><div class="mr-row"><button class="mr-pick ${!shown ? 'on' : ''}" data-paper=""><img src="img/room/paper-base.jpg?v=2" alt=""><span>기본 방</span></button>${papers.map(i => `<button class="mr-pick ${own(i) ? '' : 'locked'} ${shown === i.id ? 'on' : ''}" data-paper="${i.id}"><img src="${i.img}" alt=""><span>${i.name}</span>${cost(i)}</button>`).join('')}</div>
      <h4>가구·소품</h4><div class="mr-row">${things.map(i => `<button class="mr-pick ${own(i) ? '' : 'locked'} ${room.items.some(o => o.id === i.id) ? 'on' : ''}" data-put="${i.id}"><img src="${i.img}" alt=""><span>${i.name}</span>${cost(i)}</button>`).join('')}</div>
      <p class="fine"><a href="#/shop">🛍️ 별 상점 가기</a></p>`;
    $$('[data-paper]', tray).forEach(b => b.onclick = () => {
      const id = b.dataset.paper || null;
      if (!id || p.owned.includes(id)) { room.paper = id; room.tryPaper = null; save(); } else room.tryPaper = room.tryPaper === id ? null : id;
      bg.src = paperImg(); drawTray(); Speech.sfx.tap();
    });
    $$('[data-put]', tray).forEach(b => b.onclick = () => {
      const id = b.dataset.put, k = room.items.findIndex(o => o.id === id);
      if (k >= 0) { room.items.splice(k, 1); sel = null; } else { const [x, y] = MR_SPOT[id.slice(5)] || [.5, .8]; room.items.push({ id, x, y, ...(p.owned.includes(id) ? {} : { try: true }) }); sel = room.items.length - 1; }
      save(); drawFurn(); drawTray(); Speech.sfx.tap();
    });
    $$('[data-buy-try]', tray).forEach(b => b.onclick = () => buyTry([b.dataset.buyTry]));
    $$('[data-untry]', tray).forEach(b => b.onclick = () => { const id = b.dataset.untry; if (room.tryPaper === id) { room.tryPaper = null; bg.src = paperImg(); } room.items = room.items.filter(o => o.id !== id || !o.try); sel = null; drawFurn(); drawTray(); Speech.sfx.tap(); });
    const all2 = $('[data-buy-all]', tray); if (all2) all2.onclick = () => buyTry(tries.map(i => i.id));
    $('[data-mr-done]', tray).onclick = () => setEdit(false);
  };
  // 미리보기한 것을 별로 산다. 산 것은 그 자리에 그대로 남는다
  const buyTry = ids => {
    const need = ids.reduce((n, id) => n + (p.owned.includes(id) ? 0 : mrItem(id).cost), 0);
    if ((p.stars || 0) < need) { Speech.sfx.wrong(); return App.toast(`별이 ${need - (p.stars || 0)}개 더 필요해요.`); }
    try {
      ids.forEach(id => { Store.buy(id); room.items.forEach(o => { if (o.id === id) delete o.try; }); if (room.tryPaper === id) { room.paper = id; room.tryPaper = null; } });
      save(); drawFurn(); drawTray(); App.refreshHeader(); Speech.sfx.cheer(); Lesson.confetti(); App.toast('새 아이템을 얻었어요! 방에 그대로 둘게요 🎉');
    } catch (x) { Speech.sfx.wrong(); App.toast(x.message); }
  };
  const setEdit = on => {
    if (!on && (room.tryPaper || room.items.some(o => o.try))) { room.tryPaper = null; room.items = room.items.filter(o => !o.try); bg.src = paperImg(); }
    edit = on; sel = null; stage.classList.toggle('editing', on); tray.hidden = !on; if (on) drawTray(); drawFurn(); $('[data-mr-edit]', el).hidden = on; if (on) tray.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  $('[data-mr-edit]', el).onclick = () => setEdit(true);
  // 별 상점의 '방에서 미리보기'로 왔으면 그 아이템을 놓아 둔 채로 꾸미기를 연다
  let tryId = null; try { tryId = sessionStorage.getItem('mr-try'); sessionStorage.removeItem('mr-try'); } catch (x) { /* ignore */ }
  const tryIt = tryId && mrItem(tryId);
  if (tryIt && tryIt.kind === 'room') {
    setEdit(true);
    if (tryIt.slot === 'paper') { if (p.owned.includes(tryId)) { room.paper = tryId; save(); } else room.tryPaper = tryId; bg.src = paperImg(); }
    else if (!room.items.some(o => o.id === tryId)) { const [x, y] = MR_SPOT[tryId.slice(5)] || [.5, .8]; room.items.push({ id: tryId, x, y, ...(p.owned.includes(tryId) ? {} : { try: true }) }); sel = room.items.length - 1; drawFurn(); }
    drawTray();
  }
  // 꾸미기 중: 가구를 끌어서 옮긴다 (바닥 것은 바닥 안, 벽 것은 벽 안)
  let drag = null;
  furn.addEventListener('pointerdown', ev => {
    if (!edit) return; const b = ev.target.closest('.mr-f'); if (!b) return;
    if (ev.target.closest('[data-del]')) { room.items.splice(+b.dataset.i, 1); sel = null; save(); drawFurn(); drawTray(); return; }
    if (ev.target.closest('[data-buyi]')) { buyTry([room.items[+b.dataset.i].id]); ev.preventDefault(); return; }
    if (ev.target.closest('[data-flip]')) { const o = room.items[+b.dataset.i]; o.f = !o.f; save(); drawFurn(); Speech.sfx.tap(); ev.preventDefault(); return; }
    const sz = ev.target.closest('[data-size]');
    if (sz) { const o = room.items[+b.dataset.i]; o.k = Math.max(.6, Math.min(1.6, Math.round(((o.k || 1) + .15 * sz.dataset.size) * 100) / 100)); save(); drawFurn(); Speech.sfx.tap(); ev.preventDefault(); return; }
    sel = +b.dataset.i; drawFurn(); drag = { i: sel, moved: false }; ev.preventDefault();
  });
  window.addEventListener('pointermove', ev => {
    if (!drag || !document.body.contains(stage)) return; const o = room.items[drag.i], it = mrItem(o.id), r = bg.getBoundingClientRect();
    let x = Math.max(.04, Math.min(.96, (ev.clientX - r.left) / r.width)), y = (ev.clientY - r.top) / r.height;
    if (it.slot === 'wall') y = Math.max(.08, Math.min(mrBase(x) - .14, y)); else [x, y] = toFloor(x, Math.max(Y0, Math.min(Y1 + .02, y)));
    o.x = x; o.y = y; drag.moved = true;
    const b = furn.querySelector(`[data-i="${drag.i}"]`); if (b) { b.style.left = `${x * 100}%`; b.style.top = `${y * 100}%`; if (it.slot !== 'wall') { b.style.setProperty('--s', depth(y)); b.style.cssText += ';' + look(o); if (it.id !== 'room-rug') b.style.zIndex = Math.round(y * 1000); } else b.style.setProperty('--skew', `${x < .5 ? -24 : 24}deg`); }
  });
  window.addEventListener('pointerup', () => { if (drag) { drag = null; save(); drawFurn(); } });
  // 캐릭터
  blocks(); const [sx, sy] = randPt();
  const me = { el: cEl, x: sx, y: sy, path: [], dir: 1, walk: false, wait: 1.2, speed: .11 };
  const fr = pEl && { el: pEl, x: sx - .05, y: Math.min(Y1, sy + .01), dir: 1, walk: false, speed: .16 };
  const place = a => {
    a.el.style.left = `${a.x * 100}%`; a.el.style.top = `${a.y * 100}%`; a.el.style.zIndex = Math.round(a.y * 1000) + 1;
    a.el.style.setProperty('--s', depth(a.y).toFixed(3)); const v = a === me ? me.view : a.view; a.el.style.setProperty('--dir', v === 's' || (a !== me && !v) ? a.dir : 1); // 옆모습 그림만 가는 쪽으로 뒤집는다
    a.el.classList.toggle('walking', a.walk);
    if (a === me) cEl.classList.toggle('near', me.view === 's' && me.dir < 0); // 왼쪽을 보고 걸으면 아이템을 든 손이 앞쪽에 온다
  };
  // 걷는 쪽에 따라 앞·옆·뒷모습. 앞·뒤는 한 발 → 모음 → 다른 발 → 모음. 옆은 다리를 교차하며: 가까운 다리 앞(b) → 두 다리 스침(a) → 먼 다리 앞(c) → 스침(a).
  // 두 다리가 스칠 때(발을 모을 때) 몸이 살짝 올라간다. 멈추면 앞을 보고 선다. 친구는 옆걸음 두 장을 번갈아
  const CYCLE = { f: ['a', '0', 'b', '0'], b: ['a', '0', 'b', '0'], s: ['b', 'a', 'c', 'a'] }, PET_CYCLE = { ...CYCLE, s: ['a', 'b'] };
  const pose = now => {
    let key = 'f0', up = 0;
    if (me.walk && me.mvx !== undefined) {
      const v = Math.abs(me.mvy) > Math.abs(me.mvx) * 1.1 ? (me.mvy < 0 ? 'b' : 'f') : 's';
      if (v === 's' && body.img.s1) {
        // 옆걸음 8장(s1~s8)이 있는 캐릭터: 몸통은 그대로, 다리만 흔든다. 그림에 몸이 내려간 만큼이 들어 있어서 머리 자리 차이만큼 되돌린다
        const F = MR_FRAMES[p.avatar]; key = 's' + (Math.floor(now / 95) % 8 + 1); up = F.sb[1] - F[key][1];
      } else { const c = CYCLE[v], f = c[Math.floor(now / 150) % c.length]; key = v + f; up = (f === '0' || (v === 's' && f === 'a')) ? .018 : 0; }
    }
    if (key !== me.frame || up !== me.up) { me.frame = key; me.up = up; me.view = key[0]; mrFrame(cEl, p.avatar, key, up); }
  };
  // 친구도 걷는 쪽에 따라 앞·옆·뒷모습과 걸음 그림을 바꾼다. 멈추면 앞을 본다
  const petImg = pEl && MR_PET[pet.emoji] && pEl.querySelector('.mr-pet-img');
  if (petImg) Object.keys({ f0: 1, fa: 1, fb: 1, s0: 1, sa: 1, sb: 1, b0: 1, ba: 1, bb: 1 }).forEach(k => { const im = new Image(); im.src = mrPetImg(pet.emoji, k); });
  const petPose = now => {
    if (!petImg) return;
    let key = 'f0';
    if (fr.walk && fr.mvx !== undefined) { const v = Math.abs(fr.mvy) > Math.abs(fr.mvx) * 1.1 ? (fr.mvy < 0 ? 'b' : 'f') : 's', c = PET_CYCLE[v]; key = v + c[Math.floor(now / (v === 's' ? 160 : 130)) % c.length]; }
    fr.view = key[0]; if (key !== fr.frame) { fr.frame = key; petImg.src = mrPetImg(pet.emoji, key); }
  };
  let sayT = null;
  const speak = (text, voice) => {
    say.textContent = text; say.hidden = false; say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
    clearTimeout(sayT); sayT = setTimeout(() => { say.hidden = true; }, 1800);
    if (voice && window.Speech) Speech.speak(text);
  };
  const hop = () => { cEl.classList.remove('hop'); void cEl.offsetWidth; cEl.classList.add('hop'); };
  stage.addEventListener('click', ev => {
    if (edit) { if (!ev.target.closest('.mr-f')) { sel = null; drawFurn(); } return; }
    if (ev.target.closest('.mr-char')) { me.walk = false; me.wait = 2.2; hop(); speak(SAY[Math.floor(Math.random() * SAY.length)], true); return; }
    const r = bg.getBoundingClientRect(), [x, y] = toFloor((ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height);
    walkTo(x, y);
  });
  const walkTo = (x, y) => { const path = route(me.x, me.y, x, y); if (path) { me.path = path; me.walk = true; } };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = (a, tx, ty, dt) => {
    const dx = tx - a.x, dy = (ty - a.y) * 1.6, d = Math.hypot(dx, dy); // 세로는 원근 때문에 조금 더 멀게 친다
    if (d < .006) return true;
    const v = a.speed * depth(a.y) * (reduced ? .7 : 1) * dt, k = Math.min(1, v / d);
    a.x += dx * k; a.y += (ty - a.y) * k; if (Math.abs(dx) > .002) a.dir = dx > 0 ? 1 : -1; a.mvx = dx; a.mvy = dy;
    return false;
  };
  let last = performance.now();
  const tick = now => {
    if (!document.body.contains(stage)) return; // 다른 화면으로 가면 멈춘다
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (me.walk) {
      const [tx, ty] = me.path[0];
      if (step(me, tx, ty, dt)) { me.path.shift(); if (!me.path.length) { me.walk = false; me.wait = 1.5 + Math.random() * 3; if (Math.random() < .45) { if (Math.random() < .5) hop(); speak(EMOTE[Math.floor(Math.random() * EMOTE.length)]); } } }
    } else if ((me.wait -= dt) <= 0) { if (Math.random() < .25) { me.dir *= -1; me.wait = 1 + Math.random() * 1.5; } else { walkTo(...randPt()); me.wait = .5; } }
    pose(now); place(me);
    if (fr) { // 친구는 캐릭터 뒤쪽을 졸졸 따라온다
      const [gx, gy] = toFloor(me.x - me.dir * .05, Math.min(Y1, me.y + .01)), far = Math.hypot(gx - fr.x, (gy - fr.y) * 1.6);
      fr.walk = far > .02 && (fr.walk || far > .05); if (fr.walk) { const px = fr.x, py = fr.y; if (step(fr, gx, gy, dt)) fr.walk = false; if (!free(fr.x, fr.y) && free(px, py)) { fr.x = px; fr.y = py; fr.walk = false; } } // 친구도 가구 안으로는 들어가지 않는다
      if (!fr.walk) fr.dir = me.x > fr.x ? 1 : -1;
      petPose(now); place(fr);
    }
    requestAnimationFrame(tick);
  };
  drawFurn(); pose(performance.now()); place(me); if (fr) place(fr); requestAnimationFrame(tick);
  setTimeout(() => speak(`Hi, ${p.name}!`), 600);
};
