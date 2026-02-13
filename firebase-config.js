(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyB81eBY1MS5MyTgb1ocCDqtbPDaDboNf_4",
    authDomain: "un-enterprises.firebaseapp.com",
    projectId: "un-enterprises",
    storageBucket: "un-enterprises.firebasestorage.app",
    messagingSenderId: "1083661598291",
       appId: "1:1083661598291:web:98a54861b83146e2c490a6",
    measurementId: "G-3K6XF0ZLWK"
  };

  if (!window.firebase) {
    console.error("Firebase SDK failed to load.");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

 const services = {
    auth: firebase.auth(),
    db: firebase.firestore()
  };

   if (typeof firebase.analytics === "function") {
    services.analytics = firebase.analytics();
  }

  window.firebaseServices = services;
  console.log("Firebase connected successfully");
})();
