
const { IncomingWebhook, WebClient } = require("@slack/client"); // slack api webclient with webhook
const system = require('shelljs');
const fileSystem = require('fs');
const https = require('https'); 
const fetch = require('node-fetch'); // for fetching requests
const Entity = require('html-entities').AllHtmlEntities; // used with Chuck Norris fact api
const languages= ['fr','en'];
const Promise = require('promise');
const translator = require('translate');



const loadJson = (_fileName) => {
    console.log('loading file : ', _fileName)
    return new Promise((resolve, reject) => {
        fileSystem.readFile( _fileName, 'utf8', (error, resp) => {
            if (error) {
                console.log('err : ', error);
                reject(error);
            }
            console.log(resp);
            resolve(resp);
            
        });
    })
}

loadJson('app_settings.json').then(resp => { init(JSON.parse(resp));})

const getMeteo = (ApiRequest) => {
    return new Promise((resolve, reject) => {
        fetch(ApiRequest).then(resp => {
        return resp.json();
        }).then( json => {
            // console.log('meteo loaded', json);
            resolve(json);
        }).catch( error => {
            reject(error);
        })
    });
}
const init = (config) => {

    const meteoUrl = config[0].weatherMapApi.url + config[0].weatherMapApi.key + "&q=Mouguerre,fr";
    console.log('meteo :', meteoUrl);
    const yandexKey = config[0].yandexKey;
    console.log('yandex :', yandexKey);
    const r2Token = config[0].slackApi.token;
    console.log('r2Token :', r2Token);
    const web = new WebClient(r2Token);
    console.log(web);
    const timeNotification = new IncomingWebhook(config[0].slackApi.webHook);
    console.log('webclient : ', config[0].slackApi.webHook);

    const currentTime = new Date().toTimeString();
    console.log(currentTime);
    const birthdays = [
        {lex : { user:"Lex",date:19, month:4, year:1979 }},
        {ange : { user:"Ange",date: 24, month:3, year: 1987 }},
        {anr : { user:"Anr",date:11, month:1, year:1978}},
        {R2 : { user:"R2",date:25, month:3, year:1977}}
    ];
    console.log('bd :', birthdays);
    let codeactivePasswords = [];
    let firstTime;
    let talkalone = true;
    let morphChannel;
    let secret = '-PMOFF';
    console.log('translator : ', translator);
    translator.engine='yandex';
    translator.key = yandexKey;
    console.log(translator.key);
    translator.from = 'fr';
    let random_state = "";
    const lexUser = 'U9E7MLM17';
    let users ="";
    let maxime;
    let agenda = 'BAA95TT4J'
    const starwarsRoom = 'GA1EVUNSG';
    const itChannel = 'GA0UGL5ME';
    let notificationsAgendas = [];

    console.log('strating initR2');


    


    let old_mp;
    let manager = [];

    const watchBirthdays = (now = new Date()) => {
        birthdays.forEach((user, index) => {
                if (user.date === now.getDate() && user.month === now.getMonth()){
                    web.chat.postMessage({channel:morphChannel, text:"", attachments: [
                        {
                            fallback: "Happy birthday "+ user.user + " !",
                            color: "#ff9307",
                            pretext: "Joyeux anniversaire"+ user.user + " : ",
                            author_name: "R2",
                            title: 'Déjà '+(now.getFullYear() - user.year)+' ans !',
                            // title_link: element.link,
                            text: ':birthday: Félicitations !!!!',
                            mrkdwn_in:true
                        }
                    ]
                    });
                }
            }, true
        );
    }

    const pinCodeactiveAccess = () => {
        web.im.open({user:'USLACKBOT'}).then(
            resp => {
                return new Promise((resolve, reject)=> {
                        resolve(resp.channel.id);
                    }
                )
            }
        ).then(channelId => {
            console.log('listening to slackbot pm')
            web.im.history({channel:channelId, count:1}).then(
                resp => {
                    console.log(resp);
                    if(resp.messages[0].subtype == 'file_share' && resp.messages[0].text.includes('changement_de_mot_passe')){
                        
                        console.log(resp.messages[0].file.plain_text);
                        let content = resp.messages[0].file.preview.split(' ');
                        // console.log('content : ', content);
                        let img;
                        content.forEach((el, index)=> {
                            if(el.includes('src=') && !el.includes('logo_sans_fond')&& !el.includes('attachments')) {
                                img = el.replace('src="','<');
                                // img = el.replace('src="','<');
                                img = img.substr(0,img.length-1) + ">"
                                console.log(img);
                            }
                        })
                        if( !codeactivePasswords.includes(img) ){
                            codeactivePasswords.push[img];
                            send_pm( 'Changement de mot de passe pour acces externe :', starwarsRoom );
                            send_pm( img, starwarsRoom);
                            send_pm( 'Changement de mot de passe pour acces externe :', itChannel );
                            send_pm( img, itChannel);
                        }
                    }
                }
            );
        }
        );
    }

    const saveDataInFile = (file, data) => {
        return new Promise((resolve,reject) => {
        fileSystem.writeFile(file, data, (err) => {
            if (err) reject(err);
            resolve("fileSaved");
        })
        }
    )};

    const agendaNotifSave = (evenements) => {
        const events = JSON.parse(evenements);
        if (events) {
            for (let element in events) {
                notificationsAgendas.push(events[element]);
            };
        }
    }

    const send_message = (r2_answer) => {

        if (r2_answer != "" && talkalone){
            timeNotification.send(r2_answer, (error, resp) => {
                if (error) {
                return console.error(error);
                }
            });
        }   
    }
    const send_pm = (_answer, _channel, attachments = false) => {

        if (_answer != "" && talkalone){
            if(!attachments) {
                web.chat.postMessage({ channel : _channel, text: _answer,markdw: true});
            } else {
                web.chat.postMessage({ channel : _channel, text:'', attachments: JSON.stringify(_answer.attachments)});
            }
        }   
    }
    const get_r2_temperature = () => {
        let temp_data = "";
        temp_data = system.cat('/sys/class/thermal/thermal_zone0/temp');
        // //console.log(temp_data.stdout.replace('\n', '').substr(0,2) + ' °C');
        return temp_data.stdout.replace('\n', '').substr(0,2) + ' °C'
    }

    const answers_fr = {
        "hello": {
            "0":"Bip Bip ... initialisation en cours ... Que la force soit avec vous jeune padawan...",
            "1":"... sallllllllllllllllllut !!! ... bip",
            "2":"Yo ! Bip ... Bien ou quoi ?... bip ..."
        },
        "areUok": {
            "0":"Etat mémoire ... Ok_\n... Vérification CPU ... Ok_\n... Batterie ... ",
            "1":"Température du CPU... "
        },
        "jedi": {
            "0":"Que la force soit avec vous !",
            "1":"Attention ! L'empire contre-attaque !!!... ",
            "2":"Luke ! Je suis ton père !!!... ... ... Nooooooooooooooooooooooooooon ..."
        },
        "tech":{
            "0":"Il n'y a pas bug ! Que des solutions ..."
        }
    }
    const answers_en = {
        "hello": {
            "0":"Bip Bip ... booting ... May the force be with you ! Young padawan...",
            "1":"... hellllllllllllllllllo !!! ... bip",
            "2":"Yo ! Bip ... Check mate ! ... bip ..."
        },
        "areUok": {
            "0":"Checking memory ... Ok_\n... Checking cpu ... Ok_\n... Checking battery... ",
            "1":"Checking CPU temperature... "
        },
        "jedi": {
            "0":"May the force be with you !",
            "1":"Watch out ! Empire strikes back !!!... ",
            "2":"Luke ! I am your father !!!... ... ... Nooooooooooooooooooooooooooo ...",
        },
        "tech":{
            "0":"There are no technical issues without solutions ..."
        }
    }

    const get_r2_answer = (answer_type, lang="fr", key ="") => {
        let answers = {};
        answers = (lang=="fr")? answers_fr:answers_en;
        if(key == ""){
        key = Math.floor(Math.random()*Object.keys(answers[answer_type]).length);
        } 
        let val = answers[answer_type][String(key)];
        if (answer_type =="areUok") {
            val += (key == 1) ? get_r2_temperature() : String(Math.round(Math.random()*100)) + ' %';
        }
        return val;
    }

    const answer = (message, _user="") => {
        let r2_answer = "";
        let lang = "fr";
        const secondTime = new Date();
        message = message.toLowerCase();
        if (!_user.includes('U99FWNMDE-PM')){
            if(message.includes('anglais') || message.includes('english') || message.includes('usa')) lang = 'en';
            // //console.log('Message cleaned: |' + message + '|');
            // //console.log('includes bonjour :', message.includes('bonjour'));
            if (message.includes('bonjour') || message.includes('salut') || message.includes('hello') || message.includes('yo') || message.includes('hey') || message.includes('coucou') ){
                    r2_answer =get_r2_answer('hello',lang);
            } else if(message.includes('bug') || message.includes('probleme') || message.includes('plante')) {
                    r2_answer =get_r2_answer('tech', lang);
            } else if(message.includes('force')){
                    r2_answer ="Bip ... " + get_r2_answer('jedi', lang);
            } else if(message.includes('ca va') || message.includes('ça va') || message.includes('temper')){
                if (message.includes('temper')) {
                    r2_answer =get_r2_answer('areUok', lang,'1');
                } else {
                    r2_answer =get_r2_answer('areUok', lang);
                }
            }
            send_message(r2_answer);
        } else {
            secret = talkalone ? '-PMON': '-PMOFF';
            if(message.includes('shut up') && _user=='U99FWNMDE-PMON'){
                secret = '-PMOFF';
                send_message('...Turning System Off')
                talkalone = false;
            } else if(message.includes('wake up')&& _user=='U99FWNMDE-PMOFF'){
                secret = '-PMON';
                talkalone = true;
                r2_answer ='...System ready_';
                send_message(r2_answer);
            } else if (message.includes('imp_on')){
                firstTime = new Date();
                send_message('Import en cours sur la prod... PAS DE MAJ PROD !!!');
            } else if (message.includes('imp_off')){
                send_message('Import sur la prod terminé ! ( durée: '+ String(Math.round(secondTime.getTime()/1000 - firstTime.getTime()/1000))+ ' s )');
            }
            send_pm('All right Master !', morphChannel);
        }
        
    }
    const get_cn_fact = () => {
        const urlReq = 'https://www.chucknorrisfacts.fr/api/get?data=tri:alea;type:txt;nb:1';
        let phrase ="";
        fetch(urlReq).then(resp => {
            return resp.json()
        }).then(jsonResp => {
            let he = new Entity();
            send_message(he.decode(jsonResp[0].fact).replace('<br />', ''));
            send_pm(he.decode(jsonResp[0].fact).replace('<br />', ''), _channel=old_mp);
        });
        
    }
    const initR2 = () => {
        console.log('...initR2')
        fileSystem.readFile('agenda.json','utf8',(err, data) => {
            if (err) console.log('Error :', err);
            let notifs = "";
            if (!err && data) {
                notifs = data;
                if(notifs != "" && notifs.length > 0){
                    agendaNotifSave(notifs);
                    saveDataInFile('agenda.json',JSON.stringify(notificationsAgendas)).then(resp => {
                        //console.log('resp : ', resp);
                        listenToChannels();
                    }).catch(reason => { console.log('error reason :', reason)});
                } else 
                {
                    listenToChannels();
                }
                
            
            }
        });
    }
    console.log('just before');
    initR2();
    const get_day = (day) => {
        const regex = /(\d)/g;
        let matches = []
        let _day = ""
        while ((m = regex.exec(day)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            
            m.forEach((match, groupIndex) => {
                matches.push(match);
            });
            
                
            
        }
        if (matches.length > 0) { 
            _day += matches[0];
            if( matches.length >2) {
                _day += matches[2];
            }
        }
        return Number(_day);
    }
    const notificationsManager = () => {
        let notifs = [];
        notificationsAgendas.forEach((cell, index) => {
            date_evt_infos = cell.text.split(' ');
            date_evt = Date.parse(date_evt_infos[0]+ ' ' + String(get_day(date_evt_infos[1])) + ', ' + date_evt_infos[date_evt_infos.length-1]);
            oneWeek = 7 * 24 * 3600 * 1000;
            date_prev = date_evt - oneWeek;
            const evt = { title: cell.title, texte : cell.text, date: new Date(date_prev), posted : false , link:cell.title_link};
            notifs.push(evt);
        }, true);
        return notifs
    }

    const checkForNotification = () => {
        if (manager.length > 0) {
            // //console.log(manager.length)
            manager.forEach((element, index) => {
                const now = new Date();
                if (! element.posted && (now.getDate() == element.date.getDate() && now.getMonth() == element.date.getMonth() && now.getFullYear() == element.date.getFullYear())) {
                    const notifMessage = {
                        text:"essai",
                        attachments: [
                            {
                                fallback: "Event notification.",
                                color: "#36a64f",
                                pretext: "Notification d'évènement à venir : ",
                                author_name: "Google Agenda",
                                title: element.title,
                                title_link: element.link,
                                text: ':beach_with_umbrella: ' + element.texte,
                                mrkdwn_in:true
                            }
                        ]
                    }
                   
                    send_pm(notifMessage,morphChannel,true);
                    element.posted= true;
                }
            }, true);
        }
    }

    const listenToChannels = ()  => {
        


        web.users.list().then(resp => {
            // console.log(resp.members);
            users = resp.members;
            for(let user in users ){
                // //console.log(users[user]);
                if (users[user].name =='m.arnold'){
                    maxime = users[user].id;
                }
            }
            web.im.open({user: maxime}).then(resp => {
                old_mp = resp.channel.id;
            });
        });


        pinCodeactiveAccess();
        
        web.im.open({user:'U99FWNMDE'})
        .then( resp => {
                //console.log(resp);
                morphChannel = resp.channel.id;
                watchBirthdays();
                getMeteo(meteoUrl).then(resp => {
                    let messageMeteo = "Météo: \n";
                    resp.list.forEach((element, index) =>{
                        console.log(element);
                        const dateMeteo = new Date(element.dt_txt);
                        const today = new Date();
                        console.log('dates meteo :' + dateMeteo + ' VS ' + today);
                        if (dateMeteo.getDate() == today.getDate() && dateMeteo.getMonth() == today.getMonth() && dateMeteo.getFullYear() == today.getFullYear()){
                            messageMeteo += '```' +  element.dt_txt.split(" ")[1] +'``` :' + element.weather[0].icon +  ': *Températures* : ' + String(Math.round(Number(element.main.temp) - 273)) + '°C\n';
                            console.log('messagemeteo : ', messageMeteo);
                        }   
                    },true);
                    send_pm(messageMeteo, 'GA1EVUNSG');
                });
                
                web.im.history({channel:morphChannel}).then(
                    resp => {
                        const messages = resp.messages; 
                        messages.forEach((message, index) => {
                            if (message.bot_id && message.bot_id == 'BAA95TT4J') {
                                //console.log('attachments : ', message.attachments);
                                if (message.attachments) {
                                    let already_exists = false;
                                    if (notificationsAgendas.length > 0) {
                                        notificationsAgendas.forEach((mesEvent, index) => {
                                            if(message.attachments[0].title_link == mesEvent.title_link){
                                                already_exists = true;
                                            }
                                        }, true);
                                        if (!already_exists) notificationsAgendas.push(message.attachments[0]);
                                    }
                                    
                                    saveDataInFile('agenda.json', JSON.stringify(notificationsAgendas)).then(resp => {
                                        manager = [];
                                        manager = notificationsManager();
                                    })
                                }
                            } 
                        }, true);

                        
                    }
                );
                
            }
        );

        

        setInterval(
            () => {
                
                checkForNotification();
                
                
                web.im.history({channel:morphChannel, count:1})
                .then( resp => {
                        if (resp.messages[0].user == undefined && resp.messages[0].bot_id == agenda){
                            const events = resp.messages;                            
                        }
                        answer(resp.messages[0].text.toLowerCase().replace('r2', ''), _user=resp.messages[0].user+secret);
                    }
                );

                web.im.history({channel:old_mp, count:1})
                .then( resp => {
                        if (resp.messages[0].user == undefined && resp.messages[0].bot_id == agenda){
                            const events = resp.messages;
                            
                        }
                        answer(resp.messages[0].text.toLowerCase().replace('r2', ''), _user=maxime);
                    }
                );
                web.groups.history({channel : 'GA1EVUNSG', count:1})
                .then(resp => {
                    let user = resp.messages[0].user;
                    let inc = resp.messages[0].text;
                    if (inc.toLowerCase().includes('r2')) {
                        answer(inc.toLowerCase().replace('r2', ''), _user=user);
                    } 
                    else
                    {
                        if (inc.toLowerCase().includes('-traduction-') || inc.toLowerCase().includes('-translation-') || inc.toLowerCase().includes('-trad-') || inc.toLowerCase().includes('-trans-') || inc.toLowerCase().includes('-t-')){
                            chaine = inc.toLowerCase().replace('-t-', '').replace('-traduction-', '').replace('-translation-', '').replace('-trad-', '').replace('-trans-', '')
                            translator(chaine, { to:'en' }).then(text => {
                                send_message(text);
                            });
                        }
                    }
                }
            )},
            1200
        );
        
    }
}
