const line = require('@line/bot-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const axios = require('axios').default;
const dotenv = require('dotenv');

const env = dotenv.config().parsed;
const app = express();
const port = 3000

const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
};

// create client
const client = new line.Client(lineConfig);

let roundRobin = 0;
const agentHook_urls = [
    'https://dialogflow.cloud.google.com/v1/integrations/line/webhook/9631574a-6d16-4c03-afcf-26053eab6313'
];

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const body = req.body;
    if (++roundRobin >= agentHook_urls.length) roundRobin = 0;

    const agent_url = agentHook_urls[roundRobin];

    // await fetch(agent_url, {
    //     method: 'post',
    //     body: JSON.stringify(body),
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // })
    // .then(res => res.json())
    // .then(json => {
    //     console.log(json);
    //     res.send(json);
    // })
    await axios.post(agent_url, body, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then()
    .catch(err => {
        console.log(err);
    })
    
});

// app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
//     try {
//         const events = req.body.events
//         return events.length > 0 ? await events.map(item => handleEvent(item)) : res.status(200).send("OK");
    
//     } catch (error) {
//         res.status(500).end();
//     }
// });

const handleEvent = async (event) => {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return null;
    } else if (event.type === 'message') {
        return client.replyMessage(event.replyToken, { 
            type: 'text',
            text: event.message.text
        });
    }
};

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});