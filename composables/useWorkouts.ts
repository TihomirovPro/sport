import { onData } from './firebaseInit'
import type { TypeWorkout } from "./types"

export const getWorkouts = (exercisesId:string) => {
  const workoutStore = useWorkoutStore()

  onData(`workout/${exercisesId}`, (snapshot:any) => {
    const data = snapshot.val()

    if (data) {
      workoutStore.workouts = []
      Object.keys(data).forEach((key) => {
        const workout:TypeWorkout = data[key]
          workoutStore.workouts.push({
            id: key,
            exercisesId: workout.exercisesId,
            date: workout.date,
            interval: workout.interval,
            ease: workout.ease,
            rubber: workout.rubber,
            approach: workout.approach,
            weight: workout.weight,
            desc: workout.desc,
            res: workout.res,
            resWeigth: workout.weight ? workout.weight.reduce((acc:number, item:number, index:number):number => acc + +item, 0) : 0
          })
      })

      workoutStore.workouts.sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)) return 1
        if (new Date(a.date) > new Date(b.date)) return -1
        return 0
      })

      workoutStore.filteredWorkouts = [...workoutStore.workouts]
    } else {
      workoutStore.workouts = []
      workoutStore.filteredWorkouts = []
    }
  })
}
