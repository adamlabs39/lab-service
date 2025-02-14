import OrderLabRepository from "../repositories/order-lab-repository.js";

const generateregistrationNumber = async (prefix) => {
    if(prefix.length !== 3) {
        throw new Error('Prefix must be 3 characters long');
    }

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDate = `${year}${month}${day}`;

    const latestOrder = await OrderLabRepository.findLatest();

    let sequence = 1;

    if(latestOrder) {
        const latestOrderDate = latestOrder.noreg.slice(0, 6);
        if(todayDate === latestOrderDate) {
            sequence = parseInt(latestOrder.noreg.slice(-3)) + 1;
        }
    }

    const sequenceString = String(sequence).padStart(3, '0');

    const newRegistrationNumber = `${prefix}${todayDate}${sequenceString}`;
    return newRegistrationNumber;
}

export default generateregistrationNumber