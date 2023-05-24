import { REACT_APP_URL } from '@env';

export const getExercises = async (user) => {
    console.log("fetching exercises");

    console.log(user);
    try {
        console.log(REACT_APP_URL);
        const response = await fetch(REACT_APP_URL + '/exercise/' + user);
        const json = await response.json();
        return json;
    }
    
    catch (error) {
        console.error(error)
    }
};