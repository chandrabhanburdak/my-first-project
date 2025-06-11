
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

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


onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("userName").textContent = user.displayName || "No Name";
        document.getElementById("userEmail").textContent = user.email;

        
        document.getElementById("login-btn").style.display = "none";  
        document.getElementById("logout-btn").style.display = "block"; 
    } else {
      
        document.getElementById("login-btn").style.display = "block"; 
        document.getElementById("logout-btn").style.display = "none";  
    }
});



const userIcon = document.getElementById("user");
const userMenu = document.getElementById("userMenu");
if (userIcon && userMenu) {
    userIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        userMenu.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (!userMenu.contains(event.target) && !userIcon.contains(event.target)) {
            userMenu.classList.remove("show");
        }
    });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        auth.signOut().then(() => {
            
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
}


const bookButtons = document.querySelectorAll(".book-now");
const loginPopup = document.querySelector(".popup3");
const bookingPopup = document.querySelector(".book");
const closeBookingForm = document.getElementById("close-form");

bookButtons.forEach(button => {
    button.addEventListener("click", function () {
        const user = auth.currentUser;
        if (user) {
            console.log("✅ User Logged In");
            bookingPopup.style.display = "block";

            
            document.getElementById("city").value = button.getAttribute("data-city");
            document.getElementById("city").setAttribute("readonly", true);

            
            let basePrice = parseFloat(button.getAttribute("data-price")); 
            console.log("Base Price:", basePrice);

            if (isNaN(basePrice)) {
                alert("Error: Price is NaN! Check data-price attribute.");
                return;
            }

            document.getElementById("price").textContent = basePrice.toFixed(2); 
            document.getElementById("price").setAttribute("data-base-price", basePrice);
        } else {
            console.log("❌ User Not Logged In");
            loginPopup.style.display = "flex";
            setTimeout(() => {
                loginPopup.style.display = "none";
            }, 2000);
        }
    });
});



if (closeBookingForm) {
    closeBookingForm.addEventListener("click", function (event) {
        event.preventDefault();
        bookingPopup.style.display = "none";
    });
}


const memberInput = document.getElementById("member");
const priceDisplay = document.getElementById("price");

if (memberInput) {
    memberInput.addEventListener("input", function () {
        let basePrice = parseFloat(priceDisplay.getAttribute("data-base-price")); 
        let members = parseInt(memberInput.value) || 1; 

        console.log("Members:", members, "Base Price:", basePrice); 

        if (isNaN(basePrice) || isNaN(members)) {
            alert("Error: Price calculation failed!");
            return;
        }

        let totalPrice = basePrice * members;
        priceDisplay.textContent = totalPrice.toFixed(2); 
    });
}



const bookingFormSubmit = document.getElementById("myForm");
bookingFormSubmit.addEventListener("submit", async function (event) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const name = document.querySelector('input[placeholder="Enter your name"]').value;
    const city = document.querySelector('#city').value;
    const member = parseInt(document.querySelector('#member').value) || 1;
    const startDate = document.querySelector('#startDate').value;
    
    const price = parseFloat(document.querySelector('#price').textContent.replace(/,/g, '')); 

    console.log("Final Price to be saved:", price); 

    if (isNaN(price)) {
        alert("Error: Final price is NaN. Check your calculations.");
        return;
    }

    try {
        await addDoc(collection(db, "bookings"), {
            userId: user.uid,
            name: name,
            city: city,
            member: member,
            startdate: startDate,
            price: price 
        });
        this.reset();
        document.getElementById('popup').style.display = 'flex';
    } catch (error) {
        console.error("❌ Error adding document: ", error);
    }
});



window.cancelBooking = function (bookingId) {
   
    const popup4 = document.getElementById("popup4");
    popup4.style.display = "flex";

   
    document.getElementById("confirmCancel").onclick = async function () {
        try {
            await deleteDoc(doc(db, "bookings", bookingId));
            popup4.style.display = "none"; 
            document.getElementById("myBookings").click(); 
        } catch (error) {
            console.error("❌ Error deleting booking: ", error);
        }
    };

    document.getElementById("closePopup4").onclick = function () {
        popup4.style.display = "none";
    };
};


document.getElementById('myBookings').addEventListener('click', async function (event) {
    event.preventDefault();
    const bookingsContainer = document.querySelector('.bookings-container');
    bookingsContainer.innerHTML = '';

    const user = auth.currentUser;
    if (!user) {
        alert("Please login first!");
        return;
    }

    try {
        const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            bookingsContainer.innerHTML = `<p style="text-align: center; font-size: 18px;">No bookings found!</p>`;
        } else {
            querySnapshot.forEach((doc) => {
                renderBooking(doc);
            });
        }

        document.getElementById('myBookingsPopup').style.display = 'flex';
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
});



function renderBooking(doc) {
    const bookingsContainer = document.querySelector('.bookings-container');
    let bookingCard = document.createElement('div');
    bookingCard.classList.add('booking-card');

    let formattedPrice = parseFloat(doc.data().price).toLocaleString("en-IN");

    bookingCard.innerHTML = `
        <h3>${doc.data().city}</h3>
        <p><strong>Name:</strong> ${doc.data().name}</p>
        <p><strong>Members:</strong> ${doc.data().member}</p>
        <p><strong>Start Date:</strong> ${doc.data().startdate}</p>
     
        <p><strong>Price:</strong> ₹${formattedPrice}</p> 
        <button class="cancel-booking" data-id="${doc.id}" onclick="cancelBooking('${doc.id}')">Cancel Booking</button>
    `;
    bookingsContainer.appendChild(bookingCard);
}



document.getElementById('closeMyBookings').addEventListener('click', function () {
    document.getElementById('myBookingsPopup').style.display = 'none';
});


const bookNowButtons = document.querySelectorAll(".book-now"); 
const popup3 = document.querySelector(".popup3"); 
const bookingForm = document.querySelector(".book"); 
const closeButton = document.getElementById("close-form");

bookNowButtons.forEach(button => {
    button.addEventListener("click", function () {
        const user = auth.currentUser;
        
        if (user) {
            console.log("✅ User Logged In");
            bookingForm.style.display = "block"; 
        } else {
            console.log("❌ User Not Logged In");
            popup3.style.display = "flex"; 

            
            setTimeout(() => {
                popup3.style.display = "none"; 
            }, 2000);
        }
    });
    closeButton.addEventListener("click", function (event) {
        event.preventDefault(); // 
        bookingForm.style.display = "none";
    });

});

document.getElementById("email").addEventListener("input", function () {
    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let email = this.value;
    let errorSpan = document.getElementById("email-error");

    if (!emailPattern.test(email)) {
        errorSpan.textContent = "Invalid email format!";
    } else {
        errorSpan.textContent = "";
    }
});


document.addEventListener("DOMContentLoaded", function () {
    let startDate = document.getElementById("startDate");

   
    let today = new Date().toISOString().split("T")[0];

   
    startDate.setAttribute("min", today);
});
