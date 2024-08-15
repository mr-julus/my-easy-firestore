const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, deleteDoc, updateDoc, deleteField, arrayUnion, arrayRemove, getDocs, query, where, getDoc } = require('firebase/firestore');

class MET_Firestore_Database {
  constructor(configs) {
    this.validateConfigs(configs);

    this.firebaseConfig = {
      apiKey: configs.apiKey,
      authDomain: configs.authDomain,
      databaseURL: configs.databaseURL,
      projectId: configs.projectId,
      storageBucket: configs.storageBucket,
      messagingSenderId: configs.messagingSenderId,
      appId: configs.appId,
      measurementId: configs.measurementId
    };

    // Initialize Firebase
    const app = initializeApp(this.firebaseConfig);
    this.db = getFirestore(app);
  }

  validateConfigs(configs) {
    const requiredConfigs = [
      'apiKey',
      'authDomain',
      'databaseURL',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
      'measurementId'
    ];

    for (const config of requiredConfigs) {
      if (!configs[config]) {
        throw new Error(`Configuration error: ${config} is required.`);
      }
    }
  }

  async collectionExists(collectionName) {
    const collRef = collection(this.db, collectionName);
    const docs = await getDocs(collRef);
    return !docs.empty; // If there are any documents, the collection exists
  }

  async createCollection(collectionName) {
    if (await this.collectionExists(collectionName)) {
      throw new Error(`Collection ${collectionName} already exists.`);
    }
    // Create a dummy document to create the collection
    const collRef = collection(this.db, collectionName);
    await setDoc(doc(collRef), {});
    console.log(`Collection ${collectionName} created.`);
  }

  async deleteCollection(collectionName) {
    if (await this.collectionExists(collectionName)) {
        const collRef = collection(this.db, collectionName);
        const docs = await getDocs(collRef);
        docs.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        console.log(`Collection ${collectionName} deleted.`);
    } else {
        throw new Error(`Collection ${collectionName} doesn't exists.`);
    }
  }

  async createDocument(collectionName, docId = null, content = {}) {
    const collRef = collection(this.db, collectionName);
    if (!docId) {
      docId = this.generateId();
    }
    const docRef = doc(collRef, docId);
    await setDoc(docRef, content);
    console.log(`Document ${docId} created in collection ${collectionName}.`);
  }

  async deleteDocument(collectionName, docId) {
    const docRef = doc(collection(this.db, collectionName), docId);
    await deleteDoc(docRef);
    console.log(`Document ${docId} deleted from collection ${collectionName}.`);
  }

  async addFieldToDocument(collectionName, docId, fieldName, fieldValue) {
    const docRef = doc(collection(this.db, collectionName), docId);
    await updateDoc(docRef, { [fieldName]: fieldValue });
    console.log(`Field ${fieldName} added to document ${docId} in collection ${collectionName}.`);
  }

  async updateFieldInDocument(collectionName, docId, fieldName, fieldValue) {
    await this.addFieldToDocument(collectionName, docId, fieldName, fieldValue);
    console.log(`Field ${fieldName} in document ${docId} updated to ${fieldValue} in collection ${collectionName}.`);
  }

  async deleteFieldFromDocument(collectionName, docId, fieldName) {
    const docRef = doc(collection(this.db, collectionName), docId);
    await updateDoc(docRef, { [fieldName]: deleteField() });
    console.log(`Field ${fieldName} deleted from document ${docId} in collection ${collectionName}.`);
  }

  async addToArrayField(collectionName, docId, fieldName, element) {
    const docRef = doc(collection(this.db, collectionName), docId);
    await updateDoc(docRef, { [fieldName]: arrayUnion(element) });
    console.log(`Element added to array field ${fieldName} in document ${docId} in collection ${collectionName}.`);
  }

  async removeFromArrayField(collectionName, docId, fieldName, element) {
    const docRef = doc(collection(this.db, collectionName), docId);
    await updateDoc(docRef, { [fieldName]: arrayRemove(element) });
    console.log(`Element removed from array field ${fieldName} in document ${docId} in collection ${collectionName}.`);
  }

  async deleteAllDocuments(collectionName) {
    await this.deleteCollection(collectionName);
    await this.createCollection(collectionName);
    console.log(`All documents deleted from collection ${collectionName}.`);
  }

  async deleteAllFieldsFromDocument(collectionName, docId) {
    const docRef = doc(collection(this.db, collectionName), docId);
    const document = await getDoc(docRef);
    if (document.exists()) {
      const data = document.data();
      const updates = {};
      Object.keys(data).forEach(key => {
        updates[key] = deleteField();
      });
      await updateDoc(docRef, updates);
      console.log(`All fields deleted from document ${docId} in collection ${collectionName}.`);
    } else {
      console.log(`Document ${docId} does not exist in collection ${collectionName}.`);
    }
  }

  async getDocumentIdByFieldValue(collectionName, fieldName, value) {
    const collRef = collection(this.db, collectionName);
    const q = query(collRef, where(fieldName, "==", value));
    const querySnapshot = await getDocs(q);
    let docId = null;
    querySnapshot.forEach((doc) => {
      docId = doc.id;
    });
    return docId;
  }

  async getDocument(collectionName, docId) {
    const docRef = doc(collection(this.db, collectionName), docId);
    const document = await getDoc(docRef);
    if (document.exists()) {
      return document.data();
    } else {
      console.log(`Document ${docId} does not exist in collection ${collectionName}.`);
      return null;
    }
  }

  async getAllDocuments(collectionName) {
    const collRef = collection(this.db, collectionName);
    const querySnapshot = await getDocs(collRef);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  }

  generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = MET_Firestore_Database;