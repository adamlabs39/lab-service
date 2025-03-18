import fs from 'fs';

const deletefile = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
        console.error(err)
        return
        }
    })
}

export default deletefile;