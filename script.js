// Фаъол кардани иконкаҳои Lucide
document.addEventListener("DOMContentLoaded", function() {
  lucide.createIcons();
});

// Функсияи гузариш байни саҳифаҳо (Tabs)
function showTab(tabId, btnElement) {
  // Сипос кардани ҳамаи саҳифаҳо
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Гирифтани ранги фаъол аз тугмаҳои поёнӣ
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  // Нишон додани саҳифаи интихобшуда
  document.getElementById(tabId).classList.add('active');
  btnElement.classList.add('active');
}
