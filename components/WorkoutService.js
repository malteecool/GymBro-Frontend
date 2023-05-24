import { REACT_APP_URL } from '@env';

export const postWorkoutExercise = async (exerciseId, workoutId) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    };
    const response = await fetch(`${REACT_APP_URL}/Workouts/${workoutId}/addexercise?exerciseId=${exerciseId}`, requestOptions);
    console.log(REACT_APP_URL);
    console.log(response.status);
    const json = await response.json();
    return json;
}
