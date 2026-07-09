function parseTime(t) {
  const [h, m, s] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, s, 0);
  return d;
}

function formatTime(d) {
  return d.toTimeString().slice(0, 8);
}

function comment(min) {
  if (min <= 5) return "あきらめろ";
  if (min <= 8) return "走れハシ";
  if (min <= 10) return "ギリギリ";
  if (min <= 15) return "ちょうどいい";
  if (min <= 20) return "余裕で間に合うヨユウマア";
  return "そろそろ支度するシタク";
}

function update() {
  const now = new Date();
  document.getElementById("now").textContent = formatTime(now);

  const upcoming = SCHEDULE
    .map(x => {
      const dep = parseTime(x.company);
      const diff = Math.round((dep - now) / 60000);
      return { ...x, diff };
    })
    .filter(x => x.diff >= 0)
    .sort((a, b) => a.diff - b.diff);

  const next = upcoming[0];
  const nextDiv = document.getElementById("next");

  if (!next) {
    nextDiv.textContent = "本日のダイヤは終了しました";
  } else {
    nextDiv.innerHTML = `
      <div class="highlight">
        <div>
          <span class="badge ${next.mode === "バス" ? "bus" : "walk"}">${next.mode}</span>
          <span class="badge">${next.type}</span>
          <span class="badge">${next.dest}</span>
        </div>
        <div>会社発: ${next.company}</div>
        <div>重原発: ${next.shige}</div>
        <div>知立発: ${next.chiryu}</div>
        <div>美合着: ${next.miai}</div>
        <div>残り時間: ${next.diff} 分</div>
        <div>${comment(next.diff)}</div>
      </div>
    `;
  }

  const listDiv = document.getElementById("list");
  listDiv.innerHTML = upcoming.slice(0, 10).map(x => `
    <div style="margin-bottom:8px;">
      <span class="badge ${x.mode === "バス" ? "bus" : "walk"}">${x.mode}</span>
      <span class="badge">${x.type}</span>
      <span class="badge">${x.dest}</span>
      <div>会社発: ${x.company} / 残り ${x.diff} 分 (${comment(x.diff)})</div>
    </div>
  `).join("");
}

setInterval(update, 1000);
update();
