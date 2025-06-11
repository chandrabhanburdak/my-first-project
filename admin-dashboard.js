import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDW0YGvrq4xNJjlUYkquwtaqvJkrbgszFw",
  authDomain: "travelvista-f1f40.firebaseapp.com",
  projectId: "travelvista-f1f40",
  storageBucket: "travelvista-f1f40.appspot.com",
  messagingSenderId: "3932841473",
  appId: "1:3932841473:web:685453147f8675eac2c200"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Auth check
onAuthStateChanged(auth, (user) => {
  if (user && user.email === "travel@gmail.com") {
    updateTotalBookings();
    updateTotalUsers();
    loadAllBookings();
    loadAllUsers();
  } else {
    alert("Unauthorized access!");
    window.location.href = "login.html";
  }
});


async function updateTotalBookings() {
  const snapshot = await getDocs(collection(db, "bookings"));
  document.getElementById("totalBookings").innerText = snapshot.size;
}

async function updateTotalUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  document.getElementById("totalUsers").innerText = snapshot.size;
}


async function loadAllBookings() {
  const container = document.getElementById("adminBookingsContainer");


  const snapshot = await getDocs(collection(db, "bookings"));
  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<p>No bookings found.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const b = docSnap.data();
    const card = document.createElement("div");
    card.className = "data-card";
    card.innerHTML = `
      <h4>📍 Booking Details</h4>
      <p><strong>Name:</strong> ${b.name}</p>
      <p><strong>Email:</strong> ${b.email || "N/A"}</p>
      <p><strong>City:</strong> ${b.city}</p>
      <p><strong>Members:</strong> ${b.member}</p>
      <p><strong>Start Date:</strong> ${b.startdate}</p>
      <p><strong>Price:</strong> ₹${parseFloat(b.price).toLocaleString("en-IN")}</p>
      <p><strong>User ID:</strong> ${b.userId}</p>
      <button class="btn-delete" data-id="${docSnap.id}">Cancel Booking</button>
    `;
    container.appendChild(card);
  });


  container.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      await deleteDoc(doc(db, "bookings", id));
      e.target.closest(".data-card").remove();
      updateTotalBookings();
    }
  });
}


async function loadAllUsers() {
  const container = document.getElementById("adminUsersContainer");


  const snapshot = await getDocs(collection(db, "users"));
  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<p>No users found.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const u = docSnap.data();
    const card = document.createElement("div");
    card.className = "data-card user-card";
    card.innerHTML = `
      <h4>👤 User</h4>
      <p><strong>Name:</strong> ${u.name || "N/A"}</p>
      <p><strong>Email:</strong> ${u.email}</p>
      <p><strong>Login Type:</strong> ${u.provider || "Google"}</p>
      <button class="btn-delete" data-id="${docSnap.id}"> Remove User</button>
    `;
    container.appendChild(card);
  });


  container.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      await deleteDoc(doc(db, "users", id));
      e.target.closest(".data-card").remove();
      updateTotalUsers();
    }
  });
}
