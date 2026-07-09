function parseTime(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number); // ★ 秒を完全に無視
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// ★ 現在時刻は「時:分:秒」表示
function formatTime(d) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ★ 発着時刻は「時:分」だけ表示
function formatShortTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  return `${h}:${m}`;
}

// ★ 60分以上なら「1時間◯分」表記
function formatDiff(min) {
  if (min < 60) {
    return `${min}分`;
  } else {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}時間${m}分`;
  }
}

// ★ コメント修正済み
function comment(min) {
  if (min <= 5) return "あきらめろ";
  if (min <= 8) return "走れ";
  if (min <= 10) return "ギリギリ";
  if (min <= 15) return "ちょうどいい";
  if (min <= 20) return "余裕で間に合う";
  return "そろそろ支度する";
}

function update() {
  const now = new Date();
  document.getElementById("now").textContent = formatTime(now);

  // 今日のダイヤ
  let upcoming = SCHEDULE
    .map(x => {
      const dep = parseTime(x.company);
      if (!dep) return null;
      const diff = Math.round((dep - now) / 60000);
      return { ...x, diff };
    })
    .filter(x => x && x.diff >= 0)
    .sort((a, b) => a.diff - b.diff);

  // ★ 今日のダイヤが終わったら翌日の始発を使う
  if (upcoming.length === 0) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    upcoming = SCHEDULE
      .map(x => {
        const dep = parseTime(x.company);
        if (!dep) return null;
        dep.setDate(tomorrow.getDate());
        const diff = Math.round((dep - now) / 60000);
        return { ...x, diff };
      })
      .filter(x => x && x.diff >= 0)
      .sort((a, b) => a.diff - b.diff);
  }

  const nextDiv = document.getElementById("next");
  const listDiv = document.getElementById("list");

  if (upcoming.length === 0) {
    nextDiv.textContent = "ダイヤ情報がありません";
    listDiv.textContent = "";
    return;
  }

  // ★ 次に乗れる候補（最も近い1件）
  const next = upcoming[0];
  nextDiv.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; gap:10px; flex-wrap:wrap; font-size:16px;">
        <div><strong>残り:</strong> ${formatDiff(next.diff)}</div>
        <div><strong>移動:</strong> ${next.mode}</div>
        <div><strong>バス発:</strong> ${next.mode === "バス" ? formatShortTime(next.company) : ""}</div>
        <div><strong>重原発:</strong> ${formatShortTime(next.shige)}</div>
        <div><strong>知立発:</strong> ${formatShortTime(next.chiryu)}</div>
        <div><strong>美合着:</strong> ${formatShortTime(next.miai)}</div>
        <div><strong>行先:</strong> ${next.dest}</div>
      </div>
      <div style="font-size:18px; margin-top:4px;">
        ${comment(next.diff)}
      </div>
    </div>
  `;

  // ★ ダイヤ一覧（近い順3件）＝ 2〜4番目
  const nextThree = upcoming.slice(1, 4);

  if (nextThree.length === 0) {
    listDiv.textContent = "次の便はありません";
  } else {
    listDiv.innerHTML = nextThree.map(x => `
      <div style="margin-bottom:10px; padding:6px; background:#f0f0f0; border-radius:6px;">
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <div><strong>残り:</strong> ${formatDiff(x.diff)}</div>
          <div><strong>移動:</strong> ${x.mode}</div>
          <div><strong>重原発:</strong> ${formatShortTime(x.shige)}</div>
          <div><strong>知立発:</strong> ${formatShortTime(x.chiryu)}</div>
          <div><strong>美合着:</strong> ${formatShortTime(x.miai)}</div>
          <div><strong>行先:</strong> ${x.dest}</div>
        </div>
        <div>${comment(x.diff)}</div>
      </div>
    `).join("");
  }
}

setInterval(update, 1000);
update();
