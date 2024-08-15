const { MET_Firestore_Database } = require('my-easy-firestore');

const configs = {
    apiKey: "YOUR FIREBASE API KEY",
    authDomain: "YOUR FIREBASE AUTH DOMAIN",
    databaseURL: "YOUR FIREBASE DATABASE URL",
    projectId: "YOUR FIREBASE PROJECT ID",
    storageBucket: "YOUR FIREBASE STORAGE BUCKET",
    messagingSenderId: "YOUR FIREBASE MESSAGING SENDER ID",
    appId: "YOUR FIREBASE APP ID",
    measurementId: "YOUR FIREBASE MEASUREMENT ID"
};

(async () => {
    try {
        const met = new MET_Firestore_Database(configs);

        await met.createCollection("testCollection");
        await met.deleteCollection("testCollection");

        await met.createDocument("testCollection", "testDocument", { field1: "value1", field2: "value2" });
        await met.deleteDocument("testCollection", "testDocument");

        await met.addFieldToDocument("testCollection", "testDocument", "field3", "value3");
        await met.updateFieldInDocument("testCollection", "testDocument", "field3", "newValue3");
        await met.deleteFieldFromDocument("testCollection", "testDocument", "field2");

        await met.addToArrayField("testCollection", "testDocument", "arrayField", "element1");
        await met.removeFromArrayField("testCollection", "testDocument", "arrayField", "element1");

        await met.deleteAllFieldsFromDocument("testCollection", "testDocument");

        const docId = await met.getDocumentIdByFieldValue("testCollection", "field1", "value1");
        console.log(`Document ID with field value: ${docId}`);

        const document = await met.getDocument("testCollection", "testDocument");
        console.log('Document data:', document);

        const allDocuments = await met.getAllDocuments("testCollection");
        console.log('All documents in collection:', allDocuments);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();