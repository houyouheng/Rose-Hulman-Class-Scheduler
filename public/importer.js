// In your index.js
 
const firestoreService = require('firestore-export-import');
const serviceAccount = require('./JSON/rose-hulman-class-scheduler-firebase-adminsdk-orblp-e5a15f32e0.json');
 
// Initiate Firebase App
firestoreService.initializeApp(serviceAccount, "firebase-adminsdk-orblp@rose-hulman-class-scheduler.iam.gserviceaccount.com");
 
// Start importing your data
// The array of date and location fields are optional
firestoreService.restore('./JSON/Classes.json');