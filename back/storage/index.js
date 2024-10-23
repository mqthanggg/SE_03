const express = require('express');
const app = express();

const fs_extra = require('fs-extra')
const cors = require('cors')
const fs = require('fs')
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const { default: countPages } = require('page-count');
const PORT = 4000;
const moment = require('moment');

const temp_storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const printer_path = path.join(__dirname, `/temp_file`);
        fs.mkdir(printer_path, {recursive: true}, (err) => {
            if (err) return callback(err);
        })
        callback(null, printer_path);
    },
    filename: (req,file,callback) => {
        callback(null, file.originalname);
    }
})

const temp_files = multer({storage: temp_storage});

app.use(express.json(), cors(), express.static(path.join(__dirname, '/users_info')));

app.get('/',(req, res) => {
    const defaultConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '/specs_info/default_pages.json')));
    const {defaultPages, defaultDate, added} = defaultConfig;    
    if (moment().format("YYYY-MM-DD") !== defaultDate) {
        if (added){
            fs.writeFileSync(path.join(__dirname, '/specs_info/default_pages.json'), JSON.stringify({defaultPages: defaultPages, defaultDate: defaultDate, added: false},null,4));
            res.send({status: 200});
        }
        else res.send({status: 200});
    }
    else {
        if (!added){
            let users = JSON.parse(fs.readFileSync(path.join(__dirname, '/users_info/users.json')));
            users.forEach((user) => {
                if (user.role === "student") user.papers += defaultPages;
            })
            fs.writeFileSync(path.join(__dirname, "/users_info/users.json"),JSON.stringify(users,null,4));
            added = true;
            fs.writeFileSync(path.join(__dirname, '/specs_info/default_pages.json'), JSON.stringify({defaultPages, defaultDate, added},null,4));
            res.send({status: 200});
        }
    }
})

app.post('/printing-request', (req, res) => {
    console.log(req.body);

    let printers_file = fs.readFileSync(path.join(__dirname, '/printers_info/printer_storage.json'));
    
    let printers_info = JSON.parse(printers_file);
    
    if (printers_info.find((printer) => {
        return printer.id === Number(req.body.printer_id);
    }).status !== "enabled"){
        return res.send({
            status: 0
        })
    }

    let users_file = fs.readFileSync(path.join(__dirname, '/users_info/users.json'))
    let users_info = JSON.parse(users_file);

    let currentUserSession = users_info.find((user) => {
        return user.userID === req.body.user_id;
    });
    if (currentUserSession === undefined) throw new Error("Undefined user!");
    
    currentUserSession.papers -= Number(req.body.req_papers);
    fs.writeFileSync(path.join(__dirname, '/users_info/users.json'), JSON.stringify(users_info, null, 4));

    let logs_json = fs.readFileSync(path.join(__dirname, '/logs_info/logs.json'));
    let logs = JSON.parse(logs_json);
    const date = (new Date()).toDateString();
    let newLog = {
        userID: currentUserSession.userID,
        printerID: req.body.printer_id,
        printing_date: date,
        copies: req.body.req_copies,
        size: req.body.req_size,
        papers_used: req.body.req_papers,
        file_name: req.body.file_name
    };
    logs.push(newLog)

    fs.writeFileSync(path.join(__dirname, '/logs_info/logs.json'), JSON.stringify(logs, null, 4));

    printers_info.forEach((printer) => {
        if (printer.id === Number(req.body.printer_id)){
            printer.logs.push(newLog)
        }
    })

    users_info.forEach((user) => {
        if (user.userID === req.body.user_id) {
            user.logs.push({
                userID: currentUserSession.userID,
                printerID: req.body.printer_id,
                file: req.body.file_name,
                printing_date: date,
                copies: req.body.req_copies,
                papers_used: req.body.req_papers,
                size: req.body.req_size
            })
        }
    })

    fs.writeFileSync(path.join(__dirname, '/users_info/users.json'), JSON.stringify(users_info, null, 4));

    fs.writeFileSync(path.join(__dirname, '/printers_info/printer_storage.json'), JSON.stringify(printers_info, null, 4));

    if (fs.existsSync(path.join(__dirname, `/printers_info/${req.body.printer_id}/${req.body.file_name}`)))
        fs.unlinkSync(path.join(__dirname, `/printers_info/${req.body.printer_id}/${req.body.file_name}`));
    fs_extra.move(path.join(__dirname, `temp_file/${req.body.file_name}`), path.join(__dirname, `printers_info/${req.body.printer_id}/${req.body.file_name}`));

    console.log(`Printing response: ${JSON.stringify({
        res_userID: currentUserSession.userID,
        res_file_name: req.body.file_name,
        res_printer_id: req.body.printer_id,
        res_copies: req.body.req_copies,
        res_papers: req.body.req_papers,
        res_size: req.body.req_size,
        res_mode: req.body.req_mode,
        status: 200
    }, null, 4)}`);

    res.send({
        res_userID: currentUserSession.userID,
        res_file_name: req.body.file_name,
        res_printer_id: req.body.printer_id,
        res_copies: req.body.req_copies,
        res_papers: req.body.req_papers,
        res_size: req.body.req_size,
        res_mode: req.body.req_mode,
        status: 200
    })
})

app.post('/login-request', (req, res) => {
    let file = fs.readFileSync(path.join(__dirname, '/users_info/users.json'))
    let users_info = JSON.parse(file);

    let currentUserSession = users_info.find((user) => {
        return user.mail === req.body.mail && user.password === req.body.password;
    });
    if (currentUserSession !== undefined) {
        console.log(`Login response: ${
            currentUserSession.role === "student" ? 
            JSON.stringify(
                {
                    isLoggedIn: true, 
                    papers: currentUserSession.papers,
                }, null, 4) : 
            JSON.stringify(
                {
                    isLoggedIn: true,
                    role: "officer"
                })
        }`);
    
        
        return res.send(
            currentUserSession.role === "student" ? 
            {
                isLoggedIn: true, 
                role: "student",
                papers: currentUserSession.papers, 
                userID: currentUserSession.userID
            } :
            {
                isLoggedIn: true,
                role: "officer"
            }
        );
    }
    else res.send({isLoggedIn: false});
})

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
})

app.get('/printer-storage', (req, res) => {
    let printers_json = fs.readFileSync(path.join(__dirname, '/printers_info/printer_storage.json'));
    let listOfPrinters = JSON.parse(printers_json);
    res.send({
        listOfPrinters: listOfPrinters,
        status: 200
    })
})

app.post('/printer_storage', (req, res) => {
    let printers_json = fs.readFileSync(path.join(__dirname, '/printers_info/printer_storage.json'));
    let listOfPrinters = JSON.parse(printers_json);
    listOfPrinters.push(req.body);
    listOfPrinters.sort(
        (printerA, printerB) => {
            return printerA.id - printerB.id;
        }
    )
    fs.writeFileSync(path.join(__dirname, '/printers_info/printer_storage.json'), JSON.stringify(listOfPrinters, null, 4));
    res.send({
        status: 200
    })
})

app.put('/printer_storage/:idx', (req, res) => {
    let printers_json = fs.readFileSync(path.join(__dirname, '/printers_info/printer_storage.json'));
    let listOfPrinters = JSON.parse(printers_json);
    Object.assign(listOfPrinters[req.params.idx], req.body);
    fs.writeFileSync(path.join(__dirname, '/printers_info/printer_storage.json'), JSON.stringify(listOfPrinters, null, 4));
    res.send({
        status: 200
    })
})

app.delete('/printer_storage/:idx', (req, res) => {
    let printers_json = fs.readFileSync(path.join(__dirname, '/printers_info/printer_storage.json'));
    let listOfPrinters = JSON.parse(printers_json);
    listOfPrinters.splice(req.params.idx,1);
    fs.writeFileSync(path.join(__dirname, '/printers_info/printer_storage.json'), JSON.stringify(listOfPrinters, null, 4));
    res.send({
        status: 200
    })
})

app.get('/types/:type', (req, res) =>{
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/specs_info/valid_types.json')));
    switch (req.params.type) {
        case "full":
            return res.send({
                status: 200,
                data: data
            })
        case "partial":
            return res.send({
                listOfTypes: data.map((type) => {
                    if (type.allowed) return type.type;
                }),
                status: 200
            })
        default:
            return res.send({
                status: 404
            })
    }
})

app.put('/types', (req, res) => {
    fs.writeFileSync(path.join(__dirname, "/specs_info/valid_types.json"), JSON.stringify(req.body.data, null, 4));
    res.send({
        status: 200
    })
})

app.get('/paper-size', (req, res) => {
    let sizes_json = fs.readFileSync(path.join(__dirname, '/specs_info/paper_size.json'));
    let listOfSizes = JSON.parse(sizes_json);
    res.send({
        listOfSizes: listOfSizes,
        status: 200
    })
})

let avatar_storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const ava_path = path.join(__dirname, `/users_info/users_avatar/${req.body.userID}`);
        fs.mkdir(ava_path, {recursive: true}, (err) => {
            if (err) return callback(err);
        })
        callback(null, ava_path);
    },
    filename: (req, file, callback) => {
        callback(null, req.body.userID.toString() + path.extname(file.originalname));
    }
})

let avatar_files_req = multer({storage: avatar_storage})

app.post('/sign-up', avatar_files_req.single('avatar_file'),(req, res) => {
    let users_json = fs.readFileSync(path.join(__dirname, '/users_info/users.json'));
    let listOfUsers = JSON.parse(users_json);
    let default_json = fs.readFileSync(path.join(__dirname, '/specs_info/default_pages.json'));
    let default_papers = JSON.parse(default_json).defaultPages;
    listOfUsers.push({
        mail: req.body.mail,
        password: req.body.password,
        userID: req.body.userID,
        papers: default_papers,
        role: "student",
        logs: []
    })
    fs.writeFileSync(path.join(__dirname, '/users_info/users.json'), JSON.stringify(listOfUsers, null, 4));
    console.log(`Sign up request: ${JSON.stringify(listOfUsers, null, 4)}`);
    
    res.send({
        status: 200
    })
})

app.post('/check-user', (req, res) => {
    let users_json = fs.readFileSync(path.join(__dirname, '/users_info/users.json'));
    let listOfUsers = JSON.parse(users_json);
    if (listOfUsers.find((user) => {
        return (user.mail === req.body.mail) || (user.userID === req.body.userID);
    }) !== undefined) {
        return res.send({
            isAvailable: true
        })
    }
    else return res.send({
        isAvailable: false
    })
})

app.get('/user-avatar/:userID', (req, res) => {
    const ava_path = path.join(__dirname, `/users_info/users_avatar/${req.params.userID}`);
    let listOfFiles;
    try {
        listOfFiles = fs.readdirSync(ava_path);
    } catch (error) {
        console.log(`Avatar response: ${JSON.stringify({
            avatar_src: `default_ava.png`
        }, null, 4)}`);
        return res.send({
            avatar_src: `default_ava.png`
        });
    }
    
    if (listOfFiles.length === 1){
        console.log(`Avatar response: ${JSON.stringify({
            avatar_src: `http://localhost:4000/users_avatar/${req.params.userID}/${listOfFiles[0]}`
        }, null, 4)}`);
        
        return res.send({
            avatar_src: `http://localhost:4000/users_avatar/${req.params.userID}/${listOfFiles[0]}`
        })
    }
})

app.post('/file-submit',temp_files.single('file'), async (req, res) => {
    if (req.body.submitted_file !== req.file.originalname && req.body.submitted_file !== "") 
        fs.unlinkSync(path.join(__dirname, `/temp_file/${req.body.submitted_file}`))
    let data = null;
    if (
        path.extname(req.file.originalname) === ".docx" ||
        path.extname(req.file.originalname) === ".pdf" ||
        path.extname(req.file.originalname) === ".pptx"
    )
        data = await countPages(fs.readFileSync(path.join(__dirname, `/temp_file/${req.file.originalname}`)), path.extname(req.file.originalname).substring(1))
    res.send({
        file_pages: data
    })    
})

app.get('/user-log/:id', (req, res) => {
    let users = JSON.parse(fs.readFileSync(path.join(__dirname, '/users_info/users.json')));
    let userLogs = users.find((user) => {
        return user.userID === req.params.id;
    }).logs;
    res.send({
        status: 200,
        logs: userLogs
    })
})

app.get('/dashboard', (req, res) => {
    let users = JSON.parse(fs.readFileSync(path.join(__dirname, '/users_info/users.json')));
    users = users.filter((user) => {
        return user.role === "student";
    })
    let printers = JSON.parse(fs.readFileSync(path.join(__dirname, '/printers_info/printer_storage.json')));
    let logs = JSON.parse(fs.readFileSync(path.join(__dirname, '/logs_info/logs.json')));
    res.send({
        users: users.length,
        printers: printers.length,
        logs: logs.length,
        status: 200
    })
}) 



app.get('/default-pages', (req, res) => {
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/specs_info/default_pages.json')));
    res.send({
        status: 200,
        data: data
    })
})

app.post('/default-pages', (req, res)=>{
    fs.writeFileSync(path.join(__dirname, "/specs_info/default_pages.json"), JSON.stringify(req.body.data,null,4));
    res.send({
        status: 200
    })
})

app.get('/student-logs', (req, res) => {
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/users_info/users.json')));
    let res_data = data.filter((student) => {
        return student.role === "student"
    }).map((student) => {
        return {
            studentID: student.userID,
            logs: student.logs
        }
    })
    res.send({
        status: 200,
        data:  res_data
    })
})