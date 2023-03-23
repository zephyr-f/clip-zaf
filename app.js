if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log(
          'Service worker registration successful, scope: ',
          registration.scope
        );
      })
      .catch(error => {
        console.error('Service worker registration failed', error);
      });
  });
}

// Initialize Firebase
const firebaseConfig = {
  // Replace with your Firebase SDK configuration details
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// Check if the user is logged in or not
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log(`Logged in as ${user.uid}`);
  } else {
    // If user is not logged in, sign in anonymously
    firebase.auth().signInAnonymously();
  }
});

const shareBtn = document.getElementById('share');

shareBtn.addEventListener('click', () => {
  const text = document.getElementById('text').value;

  // Save the text to Firebase
  db.collection('texts')
    .add({
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log('Text saved to Firebase');
    })
    .catch(error => {
      console.error('Error saving text to Firebase', error);
    });
});

// Retrieve the saved text from Firebase
db.collection('texts')
  .orderBy('createdAt', 'desc')
  .limit(1)
  .onSnapshot(querySnapshot => {
    querySnapshot.forEach(doc => {
      const text = doc.data().text;

      // Update the textarea with the retrieved text
      document.getElementById('text').value = text;
    });
  });

// Handle the shared text
if (navigator.share) {
  navigator.shareTarget.addEventListener('share', event => {
    event.preventDefault();
    const text = event.data.text;

    // Save the shared text to Firebase
    db.collection('texts')
      .add({
        text: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        console.log('Shared text saved to Firebase');
        event.target.complete();
      })
      .catch(error => {
        console.error('Error saving shared text to Firebase', error);
        event.target.complete();
      });
  });
}
