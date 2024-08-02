 const { Telegraf, Scenes, Markup, session } = require('telegraf');
const tokens = require("./base/tokens.json");
const tbot = new Telegraf(tokens.tgtoken);
const fs = require("fs"); 
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(640, 360);
const ctx = canvas.getContext('2d');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./base/base.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
});
 
const whoadm = 'no';//тег админа сюда
const whobot = 'no';//тег бота сюда
const whodrop = '2200000000000000'//сс сюда 

////////// сцена ввода города //////////
//////////
const goGorod = new Scenes.WizardScene(
  'goGorod',
  (message) => {
    message.replyWithMarkdown(`Привет, ${message.from.first_name}.\nОператор: @${whoadm}\n\nПожалуйста, напишите свой город`);
    return message.wizard.next();
  },
  (message) => {
    if(message.message == undefined) {message.reply('попробуй еще раз').catch((error) => {}); return message.scene.leave();}
    if(message.message.text == undefined) {return message.scene.leave();}

    const matchingWord = spisokGorodov.find(word => word === message.message.text.toLowerCase());

  if (matchingWord) {
    let query1 = `UPDATE mmnt SET gorod = '${message.message.text}' WHERE tg=${message.from.id}`;
    db.run(query1, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
    message.reply(`Город "${message.message.text}" выбран.`,  {
      reply_markup: {
         inline_keyboard: [
      [{ text: 'меню', callback_data: `menu` }]
    ]
      }
    });
    message.scene.leave();
  });
  } else {
    // Ищем ближайшее слово
    const closestWord = findClosestWord(message.message.text, spisokGorodov);
    message.replyWithMarkdown(`Город "${message.message.text}" не найден. Возможно вы имели ввиду: ${closestWord}`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Да', callback_data: `gorodyes ${closestWord}` },
          { text: 'Нет, ввести заново', callback_data: 'gorodno' }
        ]
      ],
      resize_keyboard: true
    },
    disable_web_page_preview: true
  });
  }
return message.scene.leave();
  }
);
const prods = {
  '1': {
    prname: 'товар 1',
    p1: '1шт - 650р',
    p2: '2шт - 1100р',
    p3: '3шт - 1500р'
  },
  '2': {
    prname: 'товар 2',
    p1: '1шт - 650р',
    p2: '2шт - 1100р',
    p3: '3шт - 1500р'
  },
  '3': {
    prname: 'товар 3',
    p1: '1шт - 650р',
    p2: '2шт - 1100р',
    p3: '3шт - 1500р'
  }
}
const goBuy = new Scenes.WizardScene(
  'goBuy',
  (message) => {
    message.deleteMessage(message.callbackQuery.message.message_id);
    let query1 = `SELECT * FROM mmnt WHERE tg = '${message.from.id}'`;
  db.all(query1, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
    let user = result;
    let prod = message.match[1];
    message.replyWithMarkdown(`Вы выбрали ${prods[prod].prname} - ${user[0].gorod}\nТеперь выберите количество:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: `${prods[prod].p1}`, callback_data: `${prod}/p1/${user[0].gorod}` }],
            [{ text: `${prods[prod].p2}`, callback_data: `${prod}/p2/${user[0].gorod}` }],
            [{ text: `${prods[prod].p3}`, callback_data: `${prod}/p3/${user[0].gorod}` }]
        ],
        resize_keyboard: true
      },
      disable_web_page_preview: true
    });
    return message.wizard.next();
  });
  },
  (message) => {
    message.deleteMessage(message.callbackQuery.message.message_id);
    if(message.update == undefined) {message.reply('попробуй еще раз').catch((error) => {}); return message.scene.leave();}
    if(message.update.callback_query.data == undefined) {return message.scene.leave();}
    var fin = message.update.callback_query.data.split("/");
    message.replyWithMarkdown(`Вы выбрали ${prods[fin[0]].prname} - ${fin[2]}\n${prods[fin[0]][fin[1]]}\n\nДля оплаты переведите на карту\n\nКарта: ${whodrop}\n\nКоментарий: ${message.from.id}\n\n*После оплаты отправьте квитанцию нажав на кнопку ниже*`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: `Подтвердить оплату`, url: `t.me/${whoadm}` }],
            [{ text: `Выбрать другой товар`, callback_data: `menu` }],
            [{ text: `Выбрать другой город`, callback_data: `gorodno` }]
        ],
        resize_keyboard: true
      },
      disable_web_page_preview: true
    });
return message.scene.leave();
  }
);

const stage = new Scenes.Stage([goGorod, goBuy]);
tbot.use(session());
tbot.use(stage.middleware());
////////// обработка кнопок города //////////
//////////
tbot.action(/^(?:gorodyes)\s(.*)$/i, (message) => {
  if(message.chat.type != "private") return;
   dltstart(message, 'city').then((user) => {
      if(user == "error") return;
      if (typeof user !== "object") return message.reply(user);
      let query1 = `UPDATE mmnt SET gorod = '${message.match[1]}' WHERE tg=${message.from.id}`;
      db.run(query1, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
      return message.reply(`Город "${message.match[1]}" выбран.`,  {
      reply_markup: {
         inline_keyboard: [
      [{ text: 'меню', callback_data: `menu` }]
    ]
      }
    });
              });
    });
  });
  
    tbot.action('gorodno', (message) => {
      dltstart(message, 'city').then((user) => {
        if(user == "error") return;
        if (typeof user !== "object") return message.reply(user);
        return message.scene.enter('goGorod').catch((error) => {});
    });
    });
////////// проверяет тег тг, если меняется - обновляет его в бд //////////
//////////
function checkntg(message) {
  return new Promise((resolve) => {
  if(message.from.username == ''|message.from.username == undefined){
    let query35 = `UPDATE mmnt SET ntg = NULL WHERE tg=${message.from.id}`;
    db.run(query35, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
      resolve(result);
    });
  }else{
  let query33 = `SELECT * FROM mmnt WHERE ntg = '${message.from.username}'`;
  db.all(query33, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
    if(result.length > 0){
      let query34 = `UPDATE mmnt SET ntg = NULL WHERE ntg = '${message.from.username}'`;
      db.run(query34, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
      let query35 = `UPDATE mmnt SET ntg = '${message.from.username}' WHERE tg=${message.from.id}`;
      db.run(query35, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
        resolve(result);
      });
      });
        }else{
          let query35 = `UPDATE mmnt SET ntg = '${message.from.username}' WHERE tg=${message.from.id}`;
          db.run(query35, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
            resolve(result);
          });
        }
  });
}
});
}

////////// выбор города //////////
//////////
const spisokGorodov = ['москва', 'воронеж', 'норильск', 'томск', 'краснодар', 'красноярск', 'иркутск', 'улан-удэ', 'бийск', 'борисоглебцк', 'пермь', 'екатеринбург', 'сургут', 'сочи', 'ханты-мантийск', 'луганск', 'оренбург', 'нижний новгород'];
//поиск ближайшего слова
function findClosestWord(inputWord, words) {
  let minDistance = Infinity;
  let closestWord = '';

  for (const word of words) {
    const distance = levenshteinDistance(inputWord, word);
    if (distance < minDistance) {
      minDistance = distance;
      closestWord = word;
    }
  }
  return closestWord;
}

//расчет расстояния Левенштейна (определяет ближайшее по написанию название города)
function levenshteinDistance(word1, word2) {
  const dp = [];
  for (let i = 0; i <= word1.length; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= word2.length; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= word1.length; i++) {
    for (let j = 1; j <= word2.length; j++) {
      const cost = word1[i - 1] === word2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[word1.length][word2.length];
}


function msgGorod(message) { 

return message.scene.enter('goGorod').catch((error) => {});
}
////////// селект из бд и прочее //////////
//////////
function dltstart(message, whatcmd) {
  return new Promise((resolve) => {
    if(message.chat.type != "private") {
      message.reply('используй бота в лс').catch((error) => {});
      return resolve("error");
    }

    let query = `SELECT * FROM mmnt WHERE tg=${message.from.id}`;
    db.all(query, (err, result) => { if (err) {
            tbot.telegram.sendMessage(message.chat.id, `попробуй позже`).catch((error) => {});
            return resolve("error");
             }
      if (err) {
        console.log(err);
        tbot.telegram.sendMessage(message.chat.id, `попробуй позже`).catch((error) => {});
        return resolve("error");
      }else{
        let user = result;
        if (user.length === 0) {
          tbot.telegram.sendMessage(message.chat.id, `для начала используй «/start»`).catch((error) => {});
          return resolve("error");
        }else{
          if(user[0].gorod == null && whatcmd != 'city'){ 
          	return msgGorod(message);}
          if(message.from.username !== user[0].ntg) {
            checkntg(message).then(() => {
            let query1 = `SELECT * FROM mmnt WHERE tg=${message.from.id}`;
            conn.query(query1, (err, result) => {
            if (err) {
            tbot.telegram.sendMessage(message.chat.id, `попробуй позже`).catch((error) => {});
            return resolve("error");
             } else {
            let user = result;
            if (user.length === 0) {
            tbot.telegram.sendMessage(message.chat.id, `для начала используй «/start»`).catch((error) => {});
            return resolve("error");
            } else {
          resolve(user);
        }
      }
    });
    }).catch(error => {
    tbot.telegram.sendMessage(message.chat.id, `попробуй позже`).catch((error) => {});
    return resolve("error");
  });
          }else{
          resolve(user);
        }
        }
      }
    });
  });
}

////////// команды //////////
//////////
tbot.start((message) => {
  if(message.chat.type != "private") return  message.reply('используй бота в лс');
  let query7 = `SELECT * FROM mmnt WHERE tg=${message.from.id}`;
  db.all(query7, (err, result) =>{ if (err){ console.log(err); return message.reply("попробуй позже");}
      let usertg = result;
      if(usertg.length > 0){
          return message.reply("у тебя уже есть аккаунт\nиспользуй: /menu");
      }
    if(message.startPayload.includes('shop')){
    let worker = message.startPayload.replace(/(shop)/i, '');
      let query1 = `INSERT INTO mmnt(tg, invited) VALUES(${message.from.id}, ${worker})`;
      db.run(query1, (err, result) =>{ if (err){ console.log(err); return  message.reply("попробуй позже");}
    checkntg(message);
    msgGorod(message);
    let query1 = `UPDATE users SET ref = ref + 1 WHERE tg='${worker}'`;
    db.run(query1, (err, result) =>{ if (err){ console.log(err); return  message.reply("попробуй позже");}});
      });
          tbot.telegram.sendMessage(worker, `${message.from.first_name} перешёл по твоей ссылке`).catch((error) => {});
    }else{
      let query1 = `INSERT INTO mmnt(tg) VALUES(${message.from.id})`;
      db.run(query1, (err, result) =>{ if (err){ console.log(err); return  message.reply("попробуй позже");}
    checkntg(message);
    msgGorod(message);
      });
    }
});
});

function menuMain(message, user) {
  return message.replyWithMarkdown(`Выбери интересующий тебя товар`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'товар 1', callback_data: `buy 1` }],
          [{ text: 'товар 2', callback_data: 'buy 2' }],
          [{ text: 'товар 3', callback_data: 'buy 3' }]
      ],
      resize_keyboard: true
    },
    disable_web_page_preview: true
  });
}

tbot.action(/^(?:buy)\s(.*)$/i, (message) => {
  if(message.chat.type != "private") return;
   dltstart(message).then((user) => {
      if(user == "error") return;
      if (typeof user !== "object") return message.reply(user);
      return message.scene.enter('goBuy').catch((error) => {});
              });
    });

tbot.hears(/^(?:меню||\/menu)$/i, (message) => {
  dltstart(message).then((user) => {
    if(user == "error") return;
    if (typeof user !== "object") return message.reply(user);
    return menuMain(message, user);

});
});

tbot.action('menu', (message) => {
  dltstart(message).then((user) => {
    if(user == "error") return;
    if (typeof user !== "object") return message.reply(user);
    return menuMain(message, user);
});
});

async function menuAdm(message, user) {
  let fmsg = (attach) => {
    return message.replyWithPhoto({ source: attach }, {
      parse_mode: 'HTML',
      caption: `💼 Профиль @${user[0].ntg}\n\nID: ${user[0].tg}\nНик в выплатах: Виден\n\n🤵🏻‍♂️ Должность: Воркер\n┣ Переходов по ссылке: ${user[0].ref}\n┗ Общий профит: ${user[0].balance}₽\n\nТвоя ссылка: t.me/${whobot}?start=shop${user[0].tg}`,
      reply_markup: {
        keyboard: [
      ['профиль'],
      ['🤖боты', '🗂мануалы'],
        ],
        resize_keyboard: true
      }
    }).catch((error) => {return message.reply("попробуй позже").catch((error) => {});});
  }
  try {
    const userProfilePhotos = await tbot.telegram.getUserProfilePhotos(message.from.id, { limit: 1 });
    let image1 = await loadImage(`./base/default.jpg`);
    ctx.drawImage(image1, 0, 0, 640, 360);
    ctx.font = "bold 20px Arial";
    ctx.textAlign = 'center';
    ctx.fillStyle = "#ffffff";
    let wname = 'Воркер';
    if(user[0].adm > 1){
      wname = 'Админ';
    }
    ctx.fillText(wname, 530, 65);
    ctx.fillText(`${user[0].balance}₽`, 510, 302);
    let whattime = user[0].time.replace(/( )/i, '\n');
      ctx.fillText(`${whattime}`, 312, 200);
    if (userProfilePhotos.photos.length > 0) {
      const fileId = userProfilePhotos.photos[0][0].file_id;
      const file = await tbot.telegram.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${tokens.tgtoken}/${file.file_path}`;
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      const image = await loadImage(imageBuffer);
      ctx.drawImage(image, 50, 100, 170, 170);
      const attach = canvas.toBuffer('image/png');
      return fmsg(attach);
    } else {
      const attach = canvas.toBuffer('image/png');
      return fmsg(attach);
    }
  } catch (err) {
    console.log(err);
    return message.reply('попробуй позже');
  }

}

tbot.hears(/^(?:\/adm|профиль)$/i, (message) => {
  dltstart(message).then((user) => {
    if(user == "error") return;
    if (typeof user !== "object") return message.reply(user);
    let query1 = `SELECT * FROM users WHERE tg = ${message.from.id}`;
    db.all(query1, (err, result) =>{ if (err){ console.log(err); return;}
    let user = result;
    let query2 = `SELECT COUNT(*) AS total FROM mmnt WHERE invited = ${message.from.id}`;
    db.all(query2, async(err, result) =>{ if (err){ console.log(err); return;}
    let totalrefs = result[0].total;
    if(user.length > 0){
      menuAdm(message, user);
    }
      });
});
});
});

tbot.hears(/^(?:боты|🤖боты)$/i, (message) => {
  dltstart(message).then((user) => {
    if(user == "error") return;
    if (typeof user !== "object") return message.reply(user);
    let query1 = `SELECT * FROM users WHERE tg = ${message.from.id}`;
    db.all(query1, (err, result) =>{ if (err){ console.log(err); return;}
    let user = result;
    if(user.length > 0){
          return message.reply(`Наши боты:`);
    }

});
});
});

tbot.hears(/^(?:мануалы|🗂мануалы)$/i, (message) => {
  dltstart(message).then((user) => {
    if(user == "error") return;
    if (typeof user !== "object") return message.reply(user);
    let query1 = `SELECT * FROM users WHERE tg = ${message.from.id}`;
    db.all(query1, (err, result) =>{ if (err){ console.log(err); return;}
    let user = result;
    if(user.length > 0){
          return message.replyWithMarkdown(`Наши мануалы:`);
    }
});
});
});

tbot.hears(/^(?:newadm)\s(.*)$/i, (message) => {
   dltstart(message).then((user) => {
      if(user == "error") return;
      if (typeof user !== "object") return message.reply(user);
      var timestamp = Number(new Date());
      var date = new Date(timestamp);
      let query1 = `INSERT INTO users(tg, balance, ref, time) VALUES(${message.match[1]}, 0, 0, '${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}')`;
      db.run(query1, (err, result) =>{ if (err){ console.log(err); return  message.reply("попробуй позже");}
      return message.reply("готово");
              });
    });
  });

tbot.catch((error) => {
  console.log('error:', error);
});

tbot.launch()
console.log('BOT WORK');
