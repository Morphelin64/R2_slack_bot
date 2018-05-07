# R2_slack_bot
Bot ( api slack )
You need to create config json file for credentials tokens and api urls: touch app_settings.json 
* Sample : ``` [
    {
        "weatherMapApi": {
            "url":"http://api.openweathermap.org/data/2.5/forecast?id=ur_app_id"
        },
        "yandexKey" : "ur_yandex_api_key_for_translation",
        "slackApi" : {
            "token" :"oAUth slack api token",
            "webHook":"webhook url"
        }
    }
]```

**TODO** : Clean code ( dry specially for sending messages and checking historics ) 
