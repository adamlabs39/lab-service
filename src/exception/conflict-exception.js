export default class ConflictException extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.code = 409;
    }
}