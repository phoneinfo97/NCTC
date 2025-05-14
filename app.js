// app.js

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBDj--t-NNxTrnzuUaYbvomZKJFblKWK34",
  authDomain: "nctc-cf63f.firebaseapp.com",
  projectId: "nctc-cf63f",
  storageBucket: "nctc-cf63f.firebasestorage.app",
  messagingSenderId: "565995085762",
  appId: "1:565995085762:web:4752a8757f1f805d58c05b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = firebase.auth();

function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      document.getElementById("user-status").innerText = "Signed up successfully!";
    })
    .catch(error => {
      alert(error.message);
    });
}

function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      document.getElementById("user-status").innerText = "Logged in as: " + email;
    })
    .catch(error => {
      alert(error.message);
    });
}

function signOut() {
  auth.signOut().then(() => {
    document.getElementById("user-status").innerText = "Logged out.";
  });
}
