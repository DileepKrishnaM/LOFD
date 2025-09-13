// Sample items
const items = [
  { title: "Lost Wallet", desc: "Black leather wallet near Central Park.", img: "https://placekitten.com/400/200" },
  { title: "Found Keys", desc: "Bunch of keys found outside metro station.", img: "https://placebear.com/400/200" },
  { title: "Lost Backpack", desc: "Blue backpack lost in college canteen.", img: "https://picsum.photos/400/200?random=1" },
  { title: "Found Dog", desc: "Golden retriever found wandering near mall.", img: "https://placedog.net/400/200" }
];

// Redirect
function goToPage(url) {
  window.location.href = url;
}

// Fill Recent Items (index.html)
if (document.getElementById("recent-items")) {
  const container = document.getElementById("recent-items");
  items.slice(0,3).forEach(i => {
    container.innerHTML += `
      <div class="card">
        <img src="${i.img}" alt="${i.title}">
        <div class="card-body">
          <h4>${i.title}</h4>
          <p>${i.desc}</p>
        </div>
      </div>`;
  });
}

// Fill All Items (list.html)
if (document.getElementById("all-items")) {
  const container = document.getElementById("all-items");
  items.forEach(i => {
    container.innerHTML += `
      <div class="card">
        <img src="${i.img}" alt="${i.title}">
        <div class="card-body">
          <h4>${i.title}</h4>
          <p>${i.desc}</p>
        </div>
      </div>`;
  });
}

// Handle Report Form
if (document.getElementById("report-form")) {
  const form = document.getElementById("report-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("✅ Your item has been submitted! (Demo only - will connect to Firebase later)");
    window.location.href = "list.html";
  });
}
