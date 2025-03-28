const generateStringOfDigits = (length) => {
    let random_string = '';

    for (let i = 0; i < length; i++) {
        const randomNumber = Math.floor(Math.random() * 10); 
        random_string += randomNumber.toString();
    }
    
    return random_string;
}

module.exports = generateStringOfDigits;