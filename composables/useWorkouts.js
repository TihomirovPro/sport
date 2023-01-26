import { getDatabase, ref, onValue, set, child, push } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export const createWorkout = async (exercisesId, date, interval, desc, approach) => {
    const auth = getAuth()
    const db = getDatabase()

    const res = approach.split(' ').reduce((sum, current) => {
        return +sum + +current;
    })

    const newWorkout = {
        exercisesId: exercisesId,
        date: date,
        interval: interval,
        desc: desc,
        approach: approach,
        res: res
    }

    const newWorkoutKey = push(child(ref(db), 'workout')).key

    await set(ref(db, `users/${auth.currentUser.uid}/workout/${newWorkoutKey}`), newWorkout)
}

export const getWorkouts = async (userId, exercisesId) => {
    const db = getDatabase()
    const allworkouts = useWorkouts()
    let sortingWorkouts = []
    const workouts = ref(db, `users/${userId}/workout`)

    onValue(workouts, (snapshot) => {
        const data = snapshot.val()

        if (data) {
            allworkouts.value = []
            sortingWorkouts = []
            Object.keys(data).forEach((key) => {
                const workout = data[key]
                if (exercisesId === workout.exercisesId) {
                    sortingWorkouts.push({
                        exercisesId: workout.exercisesId,
                        date: workout.date,
                        interval: workout.interval,
                        desc: workout.desc,
                        approach: workout.approach,
                        res: workout.res,
                        id: key
                    })
                }
            })

            sortingWorkouts.sort((a, b)=> {
                if (new Date(a.date) < new Date(b.date) ) return 1
                if (new Date(a.date) > new Date(b.date) ) return -1
                return 0
            })

            allworkouts.value = sortingWorkouts
        }
    })
}