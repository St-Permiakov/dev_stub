const path = require('path');
const fs = require('fs');

const paths = {
    html: '/../../public',
    stubs: '/../../stubs',
};

const getStubNamesFromDir = (dirPath) => fs.readdirSync(dirPath, (err, files) => files);

const readFiles = (dirname, onFileContent = () => {}, onError = () => {}) => new Promise((resolve) => {
    fs.readdir(dirname, (err, filenames) => {
        if (err) {
            onError(err);
            return;
        }

        const fileData = {};

        filenames.forEach((filename) => {
            // fs.readFile(`${dirname}/${filename}`, 'utf-8', (err, content) => {
            //     if (err) {
            //         onError(err);
            //         return;
            //     }
            //     console.log(content);
            //     fileData[filename] = content ? JSON.parse(content) : null;
            //     onFileContent(filename, content);
            // });
            fileData[filename] = fs.readFileSync(`${dirname}/${filename}`, 'utf-8');
        });

        resolve(fileData);
    });
});

const createStub = (name, filePath, content) => new Promise((resolve, reject) => {
    /** @type {Array<String>} */
    const files = getStubNamesFromDir(`${__dirname}${paths.stubs}`);

    if (files.some(file => file.includes(name))) {
        reject('File exists');
    } else {
        fs.writeFile(`${filePath}/${name}`, JSON.stringify(content), (err) => {
            if (err) reject(err);
            console.log(`Stub ${name} created`);
        });
        resolve();
    }

});

module.exports = (app, db = {}) => {
    app.get('/', (req, res) => {
        res.sendFile(path.join(`${__dirname}${paths.html}/index.html`));
    });

    app.get('/get-stub-list', (req, res) => {
        res.json({
            success: true,
            data: {
                files: getStubNamesFromDir(path.join(`${__dirname}${paths.stubs}`))
            }
        });
    });

    app.get('/get-urls-list', (req, res) => {
        const dirPath = path.join(`${__dirname}${paths.stubs}`);
        readFiles(dirPath).then((data) => {
            res.json({
                success: true,
                data
            });
        });
    });

    app.post('/create-stub', (req, res) => {
        const { name, content } = req.body;
        createStub(`${name}.json`, path.join(`${__dirname}${paths.stubs}`), content)
            .then(() => {
                res.json({ success: true });
            })
            .catch((err) => {
                console.log(err);
                res.json({
                    success: false,
                    data: {
                        error: {
                            text: err
                        }
                    }
                });
            });
    });

    app.post('/stubs', (req, res) => {
        res.send('All stubs');
    });
};
