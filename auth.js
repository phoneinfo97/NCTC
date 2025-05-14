// auth.js
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
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("signup-status").innerText = "Account created!";
    })
    .catch(err => {
      document.getElementById("signup-status").innerText = err.message;
    });
}

function signIn() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("login-status").innerText = "Logged in!";
    })
    .catch(err => {
      document.getElementById("login-status").innerText = err.message;
    });
}
