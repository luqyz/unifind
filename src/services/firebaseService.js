import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { uploadImageToCloudinary } from '../utils/uploadImage'

const sanitizeText = (value) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .trim()

export async function createUserProfile(uid, data = {}) {
  const userRef = doc(db, 'users', uid)
  const privateRef = doc(db, 'users', uid, 'private', 'data')

  // Public profile — safe for anyone to read (displayName, avatar, etc.)
  await setDoc(
    userRef,
    {
      uid,
      displayName: data.displayName ?? '',
      photoURL: data.photoURL ?? null,
      provider: data.provider ?? 'email',
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  // Private profile — email, role, ban status. Only the owner or an
  // admin can ever read this (see firestore.rules).
  const privateSnap = await getDoc(privateRef)
  if (!privateSnap.exists()) {
    // First time this user has ever signed in — create with defaults.
    await setDoc(privateRef, {
      email: data.email ?? '',
      role: 'user',
      isBanned: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } else {
    // Returning user — refresh email only. Never touch role/isBanned here,
    // so an already-promoted admin (or a banned user) never gets silently
    // reset back to defaults on their next login.
    await setDoc(
      privateRef,
      { email: data.email ?? privateSnap.data().email, updatedAt: serverTimestamp() },
      { merge: true },
    )
  }
}

export async function signUpWithEmail({ email, password, displayName }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  if (displayName) {
    await updateProfile(userCredential.user, { displayName })
  }

  await createUserProfile(userCredential.user.uid, {
    email: userCredential.user.email,
    displayName,
    photoURL: userCredential.user.photoURL,
    provider: 'email',
  })
  return userCredential.user
}

export async function signInWithEmail({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)

  await createUserProfile(result.user.uid, {
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    provider: 'google',
  })

  return result.user
}

export async function logOut() {
  await signOut(auth)
}

export async function uploadItemImage(file) {
  if (!file) return ''
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WEBP images are allowed.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be under 5MB.')
  }

  return uploadImageToCloudinary(file)
}

export async function uploadItemImages(files) {
  if (!files || files.length === 0) return []
  return Promise.all(files.map((file) => uploadItemImage(file)))
}

export async function createItem({
  userId,
  title,
  description,
  privateDetails,
  category,
  type,
  location,
  landmark,
  dateOccurred,
  imageFiles,
  contact,
  hasReward,
  rewardAmount,
  rewardNote,
}) {
  const cleaned = {
    userId,
    title: sanitizeText(title),
    description: sanitizeText(description),
    category: sanitizeText(category),
    type,
    location: sanitizeText(location),
    dateOccurred: dateOccurred ? new Date(dateOccurred).toISOString() : null,
    status: 'open',
    isDeleted: false,
    isHidden: false,
    flaggedCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    contact: {
      preferredMethod: contact?.preferredMethod ?? 'inApp',
      maskedEmail: contact?.maskedEmail ?? null,
      maskedPhone: contact?.maskedPhone ?? null,
    },
  }

  if (landmark) {
    cleaned.landmark = sanitizeText(landmark)
  }

  if (type === 'found' && privateDetails) {
    cleaned.privateDetails = sanitizeText(privateDetails)
  }

  if (type === 'lost' && hasReward) {
    cleaned.hasReward = true
    cleaned.rewardAmount = sanitizeText(rewardAmount)
    cleaned.rewardNote = sanitizeText(rewardNote)
  } else {
    cleaned.hasReward = false
  }

  if (imageFiles && imageFiles.length > 0) {
    const imageUrls = await uploadItemImages(imageFiles)
    cleaned.imageUrls = imageUrls
    cleaned.imageUrl = imageUrls[0] // kept for older UI that only reads a single image
  }

  const docRef = await addDoc(collection(db, 'items'), cleaned)
  return docRef.id
}

export async function getPublicItems() {
  const q = query(collection(db, 'items'), where('isHidden', '==', false), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

export async function getItemById(itemId) {
  const itemRef = doc(db, 'items', itemId)
  const snapshot = await getDoc(itemRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

export async function updateItemStatus(itemId, status) {
  const itemRef = doc(db, 'items', itemId)
  await updateDoc(itemRef, {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteItem(itemId) {
  const itemRef = doc(db, 'items', itemId)
  await deleteDoc(itemRef)
}

export async function updateItem(itemId, {
  title,
  description,
  privateDetails,
  category,
  type,
  location,
  landmark,
  dateOccurred,
  imageFiles,
  existingImageUrls,
  contact,
  hasReward,
  rewardAmount,
  rewardNote,
}) {
  const updates = {
    title: sanitizeText(title),
    description: sanitizeText(description),
    category: sanitizeText(category),
    location: sanitizeText(location),
    landmark: landmark ? sanitizeText(landmark) : '',
    dateOccurred: dateOccurred ? new Date(dateOccurred).toISOString() : null,
    updatedAt: serverTimestamp(),
    contact: {
      preferredMethod: contact?.preferredMethod ?? 'inApp',
      maskedEmail: contact?.maskedEmail ?? null,
      maskedPhone: contact?.maskedPhone ?? null,
    },
  }

  if (type === 'found' && privateDetails) {
    updates.privateDetails = sanitizeText(privateDetails)
  }

  if (type === 'lost' && hasReward) {
    updates.hasReward = true
    updates.rewardAmount = sanitizeText(rewardAmount)
    updates.rewardNote = sanitizeText(rewardNote)
  } else {
    updates.hasReward = false
    updates.rewardAmount = ''
    updates.rewardNote = ''
  }

  if (existingImageUrls !== undefined || (imageFiles && imageFiles.length > 0)) {
    const kept = existingImageUrls || []
    const newlyUploaded = await uploadItemImages(imageFiles || [])
    const combined = [...kept, ...newlyUploaded]
    updates.imageUrls = combined
    updates.imageUrl = combined[0] || ''
  }

  const itemRef = doc(db, 'items', itemId)
  await updateDoc(itemRef, updates)
}

export async function createReport({ itemId, reporterUid, reportedUserUid, reason, details }) {
  await addDoc(collection(db, 'reports'), {
    itemId,
    reporterUid,
    reportedUserUid,
    reason: sanitizeText(reason),
    details: sanitizeText(details),
    status: 'open',
    createdAt: serverTimestamp(),
    reviewedBy: null,
    resolution: null,
  })
}

export async function getUserProfile(uid) {
  const userRef = doc(db, 'users', uid)
  const snapshot = await getDoc(userRef)
  if (!snapshot.exists()) return null

  const publicData = { id: snapshot.id, ...snapshot.data() }

  // Private fields (email, role, isBanned) only load successfully if the
  // caller is this user themselves or an admin — anyone else gets a
  // permission error here, which we treat as "not visible" and ignore.
  try {
    const privateSnap = await getDoc(doc(db, 'users', uid, 'private', 'data'))
    if (privateSnap.exists()) {
      return { ...publicData, ...privateSnap.data() }
    }
  } catch {
    // Not the owner/admin — private fields simply aren't included.
  }

  return publicData
}

export async function getUserItems(uid) {
  const q = query(collection(db, 'items'), where('userId', '==', uid), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

export async function sendMessage({ itemId, senderId, receiverId, text }) {
  if (!itemId) {
    throw new Error('This conversation is missing its listing reference and can\u2019t receive new replies. Please start a new conversation from the item page.')
  }

  const trimmed = sanitizeText(text)
  if (!trimmed) throw new Error('Message cannot be empty.')

  await addDoc(collection(db, 'items', itemId, 'messages'), {
    itemId,
    senderId,
    receiverId,
    participants: [senderId, receiverId],
    text: trimmed,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToMessages(itemId, uid, onUpdate, onError) {
  const q = query(
    collection(db, 'items', itemId, 'messages'),
    where('participants', 'array-contains', uid),
    orderBy('createdAt', 'asc'),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      onUpdate(messages)
    },
    (err) => {
      if (onError) onError(err)
    },
  )
}

// Powers the DM-style inbox: listens across every item's messages subcollection
// at once and returns all messages the current user is a participant in.
export function subscribeToAllConversations(uid, onUpdate, onError) {
  const q = query(
    collectionGroup(db, 'messages'),
    where('participants', 'array-contains', uid),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      onUpdate(messages)
    },
    (err) => {
      if (onError) onError(err)
    },
  )
}

// ===== Admin dashboard =====
// Every function below relies on Firestore rules' isAdmin() check — a
// non-admin caller will simply get a permission-denied error.

export async function getAllReports() {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

export async function updateReportStatus(reportId, status) {
  const reportRef = doc(db, 'reports', reportId)
  await updateDoc(reportRef, { status, resolution: status })
}

export async function getAllUsersForAdmin() {
  // Public profile docs (displayName, photoURL, etc.)
  const usersSnap = await getDocs(collection(db, 'users'))
  const publicByUid = {}
  usersSnap.docs.forEach((docSnap) => {
    publicByUid[docSnap.id] = { id: docSnap.id, ...docSnap.data() }
  })

  // Private docs (email, role, isBanned) — only readable by an admin,
  // fetched here via a collection group query across every user's
  // private/data document.
  const privateSnap = await getDocs(collectionGroup(db, 'private'))
  privateSnap.docs.forEach((docSnap) => {
    const uid = docSnap.ref.parent.parent.id
    if (publicByUid[uid]) {
      Object.assign(publicByUid[uid], docSnap.data())
    }
  })

  return Object.values(publicByUid)
}

export async function setUserBanStatus(uid, isBanned) {
  const privateRef = doc(db, 'users', uid, 'private', 'data')
  await updateDoc(privateRef, { isBanned, updatedAt: serverTimestamp() })
}

export async function setUserRole(uid, role) {
  const privateRef = doc(db, 'users', uid, 'private', 'data')
  await updateDoc(privateRef, { role, updatedAt: serverTimestamp() })
}

export async function getAllItemsForAdmin() {
  const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

export async function setItemHidden(itemId, isHidden) {
  const itemRef = doc(db, 'items', itemId)
  await updateDoc(itemRef, { isHidden, updatedAt: serverTimestamp() })
}

export async function adminDeleteItem(itemId) {
  await deleteItem(itemId)
}