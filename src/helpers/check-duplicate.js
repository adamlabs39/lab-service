import ConflictException from "../exception/conflict-exception.js";

const checkDuplicate = (data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
        if (values[i] === values[j]) {
            throw ConflictException(`${keys[i]} telah digunakan`);
        }
        }
    }
    
    return false;
}

export default checkDuplicate;