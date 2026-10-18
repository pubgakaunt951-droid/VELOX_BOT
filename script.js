document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");
  const pages = document.querySelectorAll(".page");

  // Функсия барои гузариш байни саҳифаҳо
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // 1. Бардоштани класси active аз ҳама тугмаҳо
      navItems.forEach((nav) => nav.classList.remove("active"));
      
      // 2. Илова кардани класси active ба тугмаи пахшшуда
      item.classList.add("active");

      // 3. Пинҳон кардани ҳама саҳифаҳо
      pages.forEach((page) => page.classList.remove("active-page"));

      // 4. Намоиши саҳифаи интихобшуда
      const pageId = item.getAttribute("data-page");
      const selectedPage = document.getElementById(pageId);
      
      if (selectedPage) {
        selectedPage.classList.add("active-page");
      }
    });
  });
});
