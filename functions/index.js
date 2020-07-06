const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./permission.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://node-test-b7812.firebaseio.com"
});
const db = admin.firestore();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({origin: true}));

app.get('/', (req, res, next) => {
    res.status(200).send('It\'s working fine!');
    next();
});

app.post('/api/create', (req, res, next) => {
    (async () => {
        try {
            const item = await db.collection('items').doc('/' + req.body.id + '/')
                .create({item: req.body.item});
            return res.status(201).send(item);
        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    })();
})

app.get('/api/read/:id', (req, res, next) => {
    (async () => {
       try {
           const document = db.collection('items').doc(req.params.id);
           let item = document.get();
           let response = item.data();
           return res.send(response);
       } catch (e) {
           console.log(e);
           return res.status(500).send(e);
       }
    })();
});

app.get('/api/read', (req, res, next) => {
    (async () => {
        try {
            let query = db.collection('items');
            let response = [];
            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        id: doc.id,
                        item: doc.data().item
                    };
                    response.push(selectedItem);
                }
            });
            return res.send(response);
        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    })();
});

app.put('api/update/:id', (req, res, next) => {
    (async () => {
        try {
            const document = db.collection('items').doc(req.params.id);
            await document.update({
                item: req.body.item
            });
            return res.send({message: 'Item updated'});
        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    })();
});

app.delete('/api/delete/:id', (req, res, next) => {
    (async () => {
        try {
            const document = db.collection('items').doc(req.params.id);
            await document.delete();
            return res.send({message: 'Item deleted'});
        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    })()
})

exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
