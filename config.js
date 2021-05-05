import firebase from "firebase";
require ("@firebase/firestore");

var firebaseConfig = {
  apiKey: "AIzaSyD7AQpIkWHir7FP-z4gJR5nnPoExDd8lt4",
  authDomain: "book-santa-62945.firebaseapp.com",
  projectId: "book-santa-62945",
  storageBucket: "book-santa-62945.appspot.com",
  messagingSenderId: "906977055406",
  appId: "1:906977055406:web:572b8fb2c35f391113533f"
};

  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();