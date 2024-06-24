const validateNIK = (NIK) =>{
    return !NIK.match(
        /^\d{16}$/,
    );
};

const validatePassword = (password) => {
    return !password.match(
        // The password must be between 8-16 characters and contain numbers
        /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
    );
}
const validateUsername = (username) => {
    return !username.match(
      /^[a-zA-Z0-9_]{3,16}$/
    );
 };
  

module.exports = {
    validateNIK,
    validatePassword,
    validateUsername
}