import { getDatabase, ref, onValue, set, child, push, remove, update } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export const getAllExercises = async (userId) => {
  const db = getDatabase()
  let allExercises = useAllExercises()

  const exercises = ref(db, `users/${userId}/exercises`)

  onValue(exercises, (snapshot) => {
    const data = snapshot.val()

    if (data) {
      allExercises.value = []
      Object.keys(data).forEach((key) => {
        const exercise = data[key]
        allExercises.value.push({
          name: exercise.name,
          id: key
        })
      })
    }
  })
}

export const createExercise = async (name) => {
  const auth = getAuth()
  const db = getDatabase()

  const newExercise = {
    name: name
  }

  const newExerciseKey = push(child(ref(db), 'exercises')).key

  await set(ref(db, `users/${auth.currentUser.uid}/exercises/${newExerciseKey}`), newExercise)
}

export const removeExercise = async (id) => {
  const auth = getAuth()
  const db = getDatabase()

  remove(ref(db, `users/${auth.currentUser.uid}/exercises/${id}`))
}

export const updateExercise = async (id, name) => {
  const auth = getAuth()
  const db = getDatabase()

  const newExercise = {
    name: name
  }

  update(ref(db,  `users/${auth.currentUser.uid}/exercises/${id}`), newExercise);
}