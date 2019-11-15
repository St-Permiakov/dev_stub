/**
 * Init function on DOM-ready
 * @param {function} fn - function to init
 */
const ready = (fn) => {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

const request = ({ url, method, data }, cb = () => {}) => {
    const req = new XMLHttpRequest();
    req.addEventListener('load', () => {
        cb(JSON.parse(req.response));
    });
    req.open(method, url, true);
    req.setRequestHeader('Content-type', 'application/json');
    req.send(JSON.stringify(data));

    return req;
};

const toggleErr = (err) => {
    const errField = document.querySelector('.js-error');

    if (err) {
        errField.removeAttribute('hidden');
        errField.innerText = err;
    } else {
        errField.setAttribute('hidden', true);
    }
};

ready(() => {
    // set nodes
    const form = document.querySelector('.js-form');
    const responseNode = document.querySelector('.js-response');
    const stubNameInput = document.querySelector('input#stub-name');
    const urlInput = document.querySelector('input#url');

    const checkErrors = () => {
        const inputs = [];
        form.querySelectorAll('input').forEach((input) => {
            inputs.push({ name: input.name, valid: input.checkValidity() });
        });

        form.reportValidity();
        if (inputs.some(input => !input.valid)) return false;
        return true;
    };

    // set body editor
    const editor = window.ace.edit('body', {
        minLines: 4,
        maxLines: 30,
        theme: 'ace/theme/twilight',
        mode: 'ace/mode/json'
    });

    // set response editor
    const responseViewer = window.ace.edit('response', {
        theme: 'ace/theme/twilight',
        mode: 'ace/mode/json',
        readOnly: true
    });

    // create stub func
    const createStub = () => {
        const cb = (res) => {
            if (res.data && res.data.error) {
                toggleErr(res.data.error.text);
            }
        };

        if (checkErrors()) {
            request(
                {
                    url: '/create-stub',
                    method: 'post',
                    data: {
                        name: stubNameInput.value,
                        content: editor.getValue()
                    }
                },
                cb
            );
        }
    };

    // get stub list func
    const getStubList = () => {
        const cb = (res) => {
            if (res.success) {
                responseViewer.setValue(JSON.stringify(res.data.files));
            }
        };

        request({ url: '/get-stub-list', method: 'get' }, cb);
    };

    const getUrlsList = () => {
        const cb = (res) => {
            if (res.success) {
                responseViewer.setValue(JSON.stringify(res.data, null, '\t'));
            }
        };
        request({ url: '/get-urls-list', method: 'get' }, cb);
    };

    // set listeners
    document.querySelector('.js-create-stub').addEventListener('click', createStub);
    document.querySelector('.js-get-stub-list').addEventListener('click', getStubList);
    document.querySelector('.js-get-urls-list').addEventListener('click', getUrlsList);
    document.querySelector('.js-clear-results').addEventListener('click', () => responseViewer.setValue(''));
});
