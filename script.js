document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("toggle-btn");
  const candle = document.querySelector(".candle");
  const durInputs = ["dur-hrs", "dur-mins", "dur-secs"].map((id) => document.getElementById(id));
  let burnTimer, dyingTimer, countdown, savedValues;

  durInputs.forEach(function (input) {
    input.addEventListener("wheel", function (e) {
      e.preventDefault(); // กันหน้าเลื่อนตอนหมุนบนช่องตัวเลข
      if (input.disabled) return;
      e.deltaY < 0 ? input.stepUp() : input.stepDown();
    }, { passive: false });
  });

  function showRemaining(t) {
    durInputs[0].value = Math.floor(t / 3600);
    durInputs[1].value = Math.floor(t / 60) % 60;
    durInputs[2].value = t % 60;
  }

  toggleBtn.addEventListener("click", function () {
    const isLit = document.body.classList.toggle("lit");
    toggleBtn.textContent = isLit ? "ดับไฟ" : "จุดเทียน";

    clearTimeout(burnTimer);
    clearTimeout(dyingTimer);
    clearInterval(countdown);
    document.body.classList.remove("timed", "dying");

    if (!isLit) {
      // ดับแล้ว: คืนค่าที่ผู้ใช้ตั้งไว้ให้แก้ต่อได้
      if (savedValues) durInputs.forEach((input, i) => (input.value = savedValues[i]));
      durInputs.forEach((input) => (input.disabled = false));
      savedValues = null;
      return;
    }

    const timedMode = document.querySelector('input[name="mode"]:checked').value === "timed";
    if (!timedMode) return;

    const total = durInputs.reduce((sum, input) => sum * 60 + (Number(input.value) || 0), 0);
    const secs = total ? Math.min(86400, total) : 60; // ทั้งหมดเป็น 0 → ใช้ค่าเริ่มต้น 1 นาที

    document.body.classList.add("timed");
    candle.style.animationDuration = secs + "s";
    burnTimer = setTimeout(() => toggleBtn.click(), secs * 1000);

    // ช่วงไฟตีบ: 20% สุดท้ายของเวลา แต่ไม่ต่ำกว่า 2 วิ ไม่เกิน 8 วิ
    const dyingMs = Math.min(8000, Math.max(2000, secs * 200));
    dyingTimer = setTimeout(() => document.body.classList.add("dying"), secs * 1000 - dyingMs);

    // ช่องตั้งเวลากลายเป็นตัวนับถอยหลังจนกว่าจะดับ
    savedValues = durInputs.map((input) => input.value);
    durInputs.forEach((input) => (input.disabled = true));
    let remaining = secs;
    showRemaining(remaining);
    countdown = setInterval(function () {
      remaining--;
      if (remaining >= 0) showRemaining(remaining);
    }, 1000);
  });
});
