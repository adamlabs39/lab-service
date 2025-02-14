const generateCode = (initialCode = "")=>{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 4; i++) {
        initialCode += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return initialCode
}

export default generateCode;