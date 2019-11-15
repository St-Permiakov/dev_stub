const path = require('path');
const fs = require('fs');

const paths = {
    html: '/../../public',
    stubs: '/../../stubs',
};

const getStubNamesFromDir = (dirPath) => fs.readdirSync(dirPath, (err, files) => files);

const readFiles = (dirname) => new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, filenames) => {
        if (err) reject(err);

        const fileReaders = filenames.map((filename) => new Promise((resolve, reject) => {
            fs.readFile(`${dirname}/${filename}`, 'utf-8', (err, content) => {
                if (err) reject(err);

                resolve({ filename, content: content ? JSON.parse(content) : null });
            });
        }));


        Promise.all(fileReaders).then((files) => {
            resolve(files);
        });
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
        readFiles(dirPath).then((files) => {
            res.json({
                success: true,
                data: {
                    files
                }
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
